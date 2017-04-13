---
title: Android异步消息处理机制之Handler
date: 2016-12-24 16:57:23
tags: [Android,Handler]
---

本文是我学习Handler的相关知识点。主要包括Handler、Looper、Message的学习。

### 1.Looper

首先先认识下Looper

```java
  * Class used to run a message loop for a thread.  Threads by default do
  * not have a message loop associated with them; to create one, call
  * {@link #prepare} in the thread that is to run the loop, and then
  * {@link #loop} to have it process messages until the loop is stopped.
```

源码注释中提到了两个重要的方法，分别是prepare和loop。

先了解下prepare()这个方法

```java
    public static void prepare() {
        prepare(true);
    }

    private static void prepare(boolean quitAllowed) {
        if (sThreadLocal.get() != null) {
            throw new RuntimeException("Only one Looper may be created per thread");
        }
        sThreadLocal.set(new Looper(quitAllowed));
    }
```
sThreadLocal是ThreadLocal的一个对象，ThreadLocal类是用来提供线程内部的局部变量。这些变量在多线程环境下访问(通过get或set方法访问)时能保证各个线程里的变量相对独立于其他线程内的变量。可以看出先用get方法判断sThreadLocal是否为空，否则抛出异常。这表示prepare方法只能调用一次。同时也保证了一个线程里只有一个Looper实例。

Looper的构造方法

```java
private Looper(boolean quitAllowed) {
    mQueue = new MessageQueue(quitAllowed);
    mThread = Thread.currentThread();
}
```

在构造方法里创建了一个MessageQuene。

接下来是loop()方法:

```java
/**
 * Run the message queue in this thread. Be sure to call
 * {@link #quit()} to end the loop.
 */
public static void loop() {
    final Looper me = myLooper();
    if (me == null) {
        throw new RuntimeException("No Looper; Looper.prepare() wasn't called on this thread.");
    }
    final MessageQueue queue = me.mQueue;

    // Make sure the identity of this thread is that of the local process,
    // and keep track of what that identity token actually is.
    Binder.clearCallingIdentity();
    final long ident = Binder.clearCallingIdentity();

    for (;;) {
        Message msg = queue.next(); // might block
        if (msg == null) {
            // No message indicates that the message queue is quitting.
            return;
        }

        // This must be in a local variable, in case a UI event sets the logger
        final Printer logging = me.mLogging;
        if (logging != null) {
            logging.println(">>>>> Dispatching to " + msg.target + " " +
                    msg.callback + ": " + msg.what);
        }

        final long traceTag = me.mTraceTag;
        if (traceTag != 0) {
            Trace.traceBegin(traceTag, msg.target.getTraceName(msg));
        }
        try {
            msg.target.dispatchMessage(msg);
        } finally {
            if (traceTag != 0) {
                Trace.traceEnd(traceTag);
            }
        }

        if (logging != null) {
            logging.println("<<<<< Finished to " + msg.target + " " + msg.callback);
        }

        // Make sure that during the course of dispatching the
        // identity of the thread wasn't corrupted.
        final long newIdent = Binder.clearCallingIdentity();
        if (ident != newIdent) {
            Log.wtf(TAG, "Thread identity changed from 0x"
                    + Long.toHexString(ident) + " to 0x"
                    + Long.toHexString(newIdent) + " while dispatching to "
                    + msg.target.getClass().getName() + " "
                    + msg.callback + " what=" + msg.what);
        }

        msg.recycleUnchecked();
    }
}
```

```java
    /**
     * Return the Looper object associated with the current thread.  Returns
     * null if the calling thread is not associated with a Looper.
     */
    public static @Nullable Looper myLooper() {
        return sThreadLocal.get();
    }
```

myLooper()直接返回sThreadLocal里存储的Looper实例，如果不存在会直接抛出异常。所以调用loop()方法前需要先调用prepare()方法。

然后拿到looper实例里的mQueue。

接着就是一个死循环。取出messageQueue里的一个消息，没有的话会阻塞。

接着调用msg.target.dispatchMessage(msg);把消息交给target的dispatchMessage()方法去处理。可以从Message里看出target就是Handler。

最后释放消息占据的资源。



那么简单概括**Looper的主要作用**：

1. 绑定当前的线程，保证当前线程只有一个Looper的实例，同时一个实例里只存在一个MessageQueue。
2. loop()方法，不断的去MessageQueue里取消息，交给Handler的dispatchMessage()方法去处理。



### 2.Handler

先了解Handler的构造方法

```java
public Handler() {
    this(null, false);
}

public Handler(Callback callback, boolean async) {
    if (FIND_POTENTIAL_LEAKS) {
            final Class<? extends Handler> klass = getClass();
            if ((klass.isAnonymousClass() || klass.isMemberClass() || klass.isLocalClass()) &&
                    (klass.getModifiers() & Modifier.STATIC) == 0) {
                Log.w(TAG, "The following Handler class should be static or leaks might occur: " +
                    klass.getCanonicalName());
            }
        }

    mLooper = Looper.myLooper();
    if (mLooper == null) {
            throw new RuntimeException(
                "Can't create handler inside thread that has not called Looper.prepare()");
        }
        mQueue = mLooper.mQueue;
        mCallback = callback;
        mAsynchronous = async;
    }
```

先是通过Looper.myLooper()来获取当前线程的looper实例，然后通过mLooper.mQueue来获取这个Looper实例中保存的MessageQueue对象。

然后看最常用的sendMessage()方法

```java
public final boolean sendMessage(Message msg)
{
    return sendMessageDelayed(msg, 0);
}
```

```java
public final boolean sendMessageDelayed(Message msg, long delayMillis)
{
    if (delayMillis < 0) {
        delayMillis = 0;
    }
    return sendMessageAtTime(msg, SystemClock.uptimeMillis() + delayMillis);
}
```

```java
public boolean sendMessageAtTime(Message msg, long uptimeMillis) {
    MessageQueue queue = mQueue;
    if (queue == null) {
        RuntimeException e = new RuntimeException(
                this + " sendMessageAtTime() called with no mQueue");
        Log.w("Looper", e.getMessage(), e);
        return false;
    }
    return enqueueMessage(queue, msg, uptimeMillis);
}
```

最后调用了enqueueMessage()方法。

```java
private boolean enqueueMessage(MessageQueue queue, Message msg, long uptimeMillis) {
    msg.target = this;
    if (mAsynchronous) {
        msg.setAsynchronous(true);
    }
    return queue.enqueueMessage(msg, uptimeMillis);
}
```

enqueueMessage中首先为msg.target赋值为this，也就是把当前的handler作为msg的target属性。所以handler发出的消息，最终会保存到消息队列中。

再看看dispathMessage()方法

```java
/**
 * Subclasses must implement this to receive messages.
 */
public void handleMessage(Message msg) {
}

/**
 * Handle system messages here.
 */
public void dispatchMessage(Message msg) {
    if (msg.callback != null) {
        handleCallback(msg);
    } else {
        if (mCallback != null) {
            if (mCallback.handleMessage(msg)) {
                return;
            }
        }
        handleMessage(msg);
    }
}
```

调用了handleMessage()方法。而这个方法就是我们创建handler复写的方法，用来处理消息。



### 3.Message

产生一个Message对象，可以通过new，也可以使用Message.obtain()方法。

```java
/**
 * Return a new Message instance from the global pool. Allows us to
 * avoid allocating new objects in many cases.
 */
public static Message obtain() {
    synchronized (sPoolSync) {
        if (sPool != null) {
            Message m = sPool;
            sPool = m.next;
            m.next = null;
            m.flags = 0; // clear in-use flag
            sPoolSize--;
            return m;
        }
    }
    return new Message();
}
```

建议使用Messge.obtain()方法，因为Message内部维护了一个Message池用于Message的复用，避免使用new重新分配内存。

### 小结

1、首先Looper.prepare()在本线程中保存一个Looper实例，然后该实例中保存一个MessageQueue对象；因为Looper.prepare()在一个线程中只能调用一次，所以MessageQueue在一个线程中只会存在一个。

2、Looper.loop()会让当前线程进入一个无限循环，不断从MessageQueue的实例中读取消息，然后回调msg.target.dispatchMessage(msg)方法。

3、Handler的构造方法，会首先得到当前线程中保存的Looper实例，进而与Looper实例中的MessageQueue相关联。

4、Handler的sendMessage方法，会给msg的target赋值为handler自身，然后加入MessageQueue中。

5、在构造Handler实例时，我们会重写handleMessage方法，也就是msg.target.dispatchMessage(msg)最终调用的方法。

6、在Activity中，我们并没有显示的调用Looper.prepare()和Looper.loop()方法，为啥Handler可以成功创建呢，这是因为在Activity的启动代码中，已经在当前UI线程调用了Looper.prepare()和Looper.loop()方法。

7、Handler不仅可以更新UI,而且可以在子线程中创建一个Handler，然后用这个Handler实例在其他线程中发送消息，最终你可以在创建Handler的那个线程中处理消息。