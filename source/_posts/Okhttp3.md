---
title: OkHttp3学习
date: 2017-07-14 17:43:18
tags: [Android]
---

`OkHttp`是一个快速、高效的网络请求库，它的设计和实现的首要目标便是高效，有如下特性：

1. 支持http2，使得对同一个主机发出的所有请求都可以共享相同的socket套接字连接；
2. 使用连接池来复用连接以减少延迟、提高效率；
3. 支持Gzip压缩响应体，降低传输内容的大小；
4. 支持Http缓存，避免重复请求；
5. 请求失败时会自动重试主机中的其他IP地址自动重定向；
6. 使用Okio来简化数据的访问与存储，提高性能；




以下通过具体例子来学习一下内部的实现。

```Java
    public static void registTempUser(APICallBack apiCallBack) {
        OkHttpClient okHttpClient = new OkHttpClient();
        RequestBody body = new FormBody.Builder().build();
        Request request = new Request.Builder().url(HOST + "url").post(body).build();
        okHttpClient.newCall(request).enqueue(apiCallBack);
    }
```

我们会通过OkHttpClient.newCall(request)进行execute或者enqueue操作。

```Java
@Override public Call newCall(Request request) {
  return RealCall.newRealCall(this, request, false /* for web socket */);
}
```

实际返回的是一个RealCall类，我们调用enqueue异步请求网络实际上是调用了RealCall的enqueue方法：

```Java
@Override public void enqueue(Callback responseCallback) {
  synchronized (this) {
    if (executed) throw new IllegalStateException("Already Executed");
    executed = true;
  }
  captureCallStackTrace();
  eventListener.callStart(this);
  client.dispatcher().enqueue(new AsyncCall(responseCallback));
}
```

最后通过client.dispatcher().enqueue(new AsyncCall(responseCallback))来实现的。

client.dispatcher()返回一个Dispatcher对象。

Dispatcher主要是控制并发的请求，内部维护着一个线程池。

```Java
/** 最大并发请求数*/
private int maxRequests = 64;
/** 每个主机最大请求数*/
private int maxRequestsPerHost = 5;
private @Nullable Runnable idleCallback;

/** Executes calls. Created lazily. */ 
private @Nullable ExecutorService executorService;

/** Ready async calls in the order they'll be run. */
/** 将要运行的异步请求队列 */
private final Deque<AsyncCall> readyAsyncCalls = new ArrayDeque<>();

/** Running asynchronous calls. Includes canceled calls that haven't finished yet. */
/**正在运行的异步请求队列 */
private final Deque<AsyncCall> runningAsyncCalls = new ArrayDeque<>();

/** Running synchronous calls. Includes canceled calls that haven't finished yet. */
/** 正在运行的同步请求队列 */
private final Deque<RealCall> runningSyncCalls = new ArrayDeque<>();
```

再来看enqueue方法

```Java
synchronized void enqueue(AsyncCall call) {
  if (runningAsyncCalls.size() < maxRequests && runningCallsForHost(call) < maxRequestsPerHost) {
    runningAsyncCalls.add(call);
    executorService().execute(call);
  } else {
    readyAsyncCalls.add(call);
  }
}
```

当正在运行的异步请求队列中的数量小于64并且正在运行的请求主机数小于5时则把请求加载runningAsyncCalls中并在线程池中执行，否则就再入到readyAsyncCalls中进行缓存等待。

enqueue方法中传入的AsyncCall是RealCall的内部类。AsyncCall内部实现了execute方法。

```Java
@Override protected void execute() {
  boolean signalledCallback = false;
  try {
    Response response = getResponseWithInterceptorChain();
    if (retryAndFollowUpInterceptor.isCanceled()) {
      signalledCallback = true;
      responseCallback.onFailure(RealCall.this, new IOException("Canceled"));
    } else {
      signalledCallback = true;
      responseCallback.onResponse(RealCall.this, response);
    }
  } catch (IOException e) {
    if (signalledCallback) {
      // Do not signal the callback twice!
      Platform.get().log(INFO, "Callback failure for " + toLoggableString(), e);
    } else {
      eventListener.callFailed(RealCall.this, e);
      responseCallback.onFailure(RealCall.this, e);
    }
  } finally {
    client.dispatcher().finished(this);
  }
}
```

getResponseWithInterceptorChain()方法会返回Response，那这句话应该就是在执行网络请求了。

```Java
Response getResponseWithInterceptorChain() throws IOException {
  // Build a full stack of interceptors.
  List<Interceptor> interceptors = new ArrayList<>();
  interceptors.addAll(client.interceptors());
  interceptors.add(retryAndFollowUpInterceptor);
  interceptors.add(new BridgeInterceptor(client.cookieJar()));
  interceptors.add(new CacheInterceptor(client.internalCache()));
  interceptors.add(new ConnectInterceptor(client));
  if (!forWebSocket) {
    interceptors.addAll(client.networkInterceptors());
  }
  interceptors.add(new CallServerInterceptor(forWebSocket));

  Interceptor.Chain chain = new RealInterceptorChain(interceptors, null, null, null, 0,
      originalRequest, this, eventListener, client.connectTimeoutMillis(),
      client.readTimeoutMillis(), client.writeTimeoutMillis());

  return chain.proceed(originalRequest);
}
```

这里就使用到了**Interceptor拦截器**。OKHttp 内部是使用拦截器来完成请求和响应的，利用的是责任链设计模式。所以可以说，拦截器是 OKHttp 的精髓所在。

拦截器主要用来观察，修改以及可能短路的请求输出和响应的回来。通常情况下拦截器用来添加，移除或者转换请求或者响应的头部信息。比如将域名替换为ip地址，将请求头中添加host属性，也可以添加我们应用中的一些公共参数，比如设备id、版本号等等。

**说明下各种拦截器：**

在配置 OkHttpClient 时设置的 interceptors；

负责失败重试以及重定向的 RetryAndFollowUpInterceptor；

负责把用户构造的请求转换为发送到服务器的请求、把服务器返回的响应转换为用户友好的响应的BridgeInterceptor；

负责读取缓存直接返回、更新缓存的 CacheInterceptor；

负责和服务器建立连接的 ConnectInterceptor；

配置 OkHttpClient 时设置的 networkInterceptors；

负责向服务器发送请求数据、从服务器读取响应数据的 CallServerInterceptor。

其实 Interceptor 的设计也是一种分层的思想，每个 Interceptor 就是一层。为什么要套这么多层呢？分层的思想在 TCP/IP 协议中就体现得淋漓尽致，分层简化了每一层的逻辑，每层只需要关注自己的责任（单一原则思想也在此体现），而各层之间通过约定的接口/协议进行合作，共同完成复杂的任务。



下面来看下缓存拦截器都做了什么

```Java
@Override public Response intercept(Chain chain) throws IOException {
  Response cacheCandidate = cache != null
      ? cache.get(chain.request())
      : null;

  long now = System.currentTimeMillis();

  CacheStrategy strategy = new CacheStrategy.Factory(now, chain.request(), cacheCandidate).get();
  Request networkRequest = strategy.networkRequest;
  Response cacheResponse = strategy.cacheResponse;

  if (cache != null) {
    cache.trackResponse(strategy);
  }

  if (cacheCandidate != null && cacheResponse == null) {
    closeQuietly(cacheCandidate.body()); // The cache candidate wasn't applicable. Close it.
  }

  // If we're forbidden from using the network and the cache is insufficient, fail.
  if (networkRequest == null && cacheResponse == null) {
    return new Response.Builder()
        .request(chain.request())
        .protocol(Protocol.HTTP_1_1)
        .code(504)
        .message("Unsatisfiable Request (only-if-cached)")
        .body(Util.EMPTY_RESPONSE)
        .sentRequestAtMillis(-1L)
        .receivedResponseAtMillis(System.currentTimeMillis())
        .build();
  }

  // If we don't need the network, we're done.
  if (networkRequest == null) {
    return cacheResponse.newBuilder()
        .cacheResponse(stripBody(cacheResponse))
        .build();
  }

  Response networkResponse = null;
  try {
    networkResponse = chain.proceed(networkRequest);
  } finally {
    // If we're crashing on I/O or otherwise, don't leak the cache body.
    if (networkResponse == null && cacheCandidate != null) {
      closeQuietly(cacheCandidate.body());
    }
  }

  // If we have a cache response too, then we're doing a conditional get.
  if (cacheResponse != null) {
    if (networkResponse.code() == HTTP_NOT_MODIFIED) {
      Response response = cacheResponse.newBuilder()
          .headers(combine(cacheResponse.headers(), networkResponse.headers()))
          .sentRequestAtMillis(networkResponse.sentRequestAtMillis())
          .receivedResponseAtMillis(networkResponse.receivedResponseAtMillis())
          .cacheResponse(stripBody(cacheResponse))
          .networkResponse(stripBody(networkResponse))
          .build();
      networkResponse.body().close();

      // Update the cache after combining headers but before stripping the
      // Content-Encoding header (as performed by initContentStream()).
      cache.trackConditionalCacheHit();
      cache.update(cacheResponse, response);
      return response;
    } else {
      closeQuietly(cacheResponse.body());
    }
  }

  Response response = networkResponse.newBuilder()
      .cacheResponse(stripBody(cacheResponse))
      .networkResponse(stripBody(networkResponse))
      .build();

  if (cache != null) {
    if (HttpHeaders.hasBody(response) && CacheStrategy.isCacheable(response, networkRequest)) {
      // Offer this request to the cache.
      CacheRequest cacheRequest = cache.put(response);
      return cacheWritingResponse(cacheRequest, response);
    }

    if (HttpMethod.invalidatesCache(networkRequest.method())) {
      try {
        cache.remove(networkRequest);
      } catch (IOException ignored) {
        // The cache cannot be written.
      }
    }
  }

  return response;
}
```

cacheCandidate是上次与服务器交互缓存的Response，这里的缓存都是基于Map，key是请求中url的md5，value是在文件中查询到的缓存，页面置换基于LRU算法，我们现在只需要知道它是一个可以读取缓存Header的Response即可。根据cacheStrategy的处理得到了networkRequest和cacheResponse这两个值，根据这两个值的数据是否为null来进行进一步的处理，当networkRequest和cacheResponse都为null的情况也就是不进行网络请求并且缓存不存在或者过期，这时候则返回504错误；当networkRequest 为null时也就是不进行网络请求，而且缓存可以使用时则直接返回缓存；其他的情况则请求网络。