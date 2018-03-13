---
title: EventBus3.0使用及原理解析
date: 2017-08-12 14:18:50
tags: [Android]
---

EventBus是Android事件发布及订阅框架，通过解耦发布者和订阅者来简化Android的事件传递。

整个流程是：事件发布者使用post()方法将Event发送到Event Bus,然后Event Bus将Event发送到多个订阅者中。

### 1.EventBus的使用

#### 1.注册

```java
EventBus.getDefault().register(this);
```

#### 2.响应事件方法

```java
@Subscribe(threadMode = ThreadMode.MAIN,sticky = true,priority = 0)
public void onEvent(String str) {
}
```

**参数解析：**

threadMode ：方法执行的线程。sticky:是否接受粘性事件。priority:优先级。String str:方法接受对象类型。

#### 3.事件发布

```java
EventBus.getDefault().post("DarrenFantasy");
```

#### 4.解除事件

```java
EventBus.getDefault().unregister(this);
```

### 2.EventBus注册原理

首先看**getDefault()**方法

```
/** Convenience singleton for apps using a process-wide EventBus instance. */
public static EventBus getDefault() {
    if (defaultInstance == null) {
        synchronized (EventBus.class) {
            if (defaultInstance == null) {
                defaultInstance = new EventBus();
            }
        }
    }
    return defaultInstance;
}
```

EventBus采用了双重校验锁实现的单例模式。默认支持一条事件总线。

然后看**register()**方法

```java
/**
 * Registers the given subscriber to receive events. Subscribers must call {@link #unregister(Object)} once they
 * are no longer interested in receiving events.
 * <p/>
 * Subscribers have event handling methods that must be annotated by {@link Subscribe}.
 * The {@link Subscribe} annotation also allows configuration like {@link
 * ThreadMode} and priority.
 */
public void register(Object subscriber) {
    Class<?> subscriberClass = subscriber.getClass();
    List<SubscriberMethod> subscriberMethods = subscriberMethodFinder.findSubscriberMethods(subscriberClass);
    synchronized (this) {
        for (SubscriberMethod subscriberMethod : subscriberMethods) {
            subscribe(subscriber, subscriberMethod);
        }
    }
}
```

可以得知先获取了订阅者的类对象。

然后我们看下**SubscriberMethod**这个类

```java
/** Used internally by EventBus and generated subscriber indexes. */
public class SubscriberMethod {
    final Method method;
    final ThreadMode threadMode;
    final Class<?> eventType;
    final int priority;
    final boolean sticky;
    /** Used for efficient comparison */
    String methodString;
    ...
}
```

SubscriberMethod实际就是subscribe的一个实体类，它保存了订阅方法信息。

再来看**findSubscriberMethods()**这个方法

```java
List<SubscriberMethod> findSubscriberMethods(Class<?> subscriberClass) {
	//从缓存里取
    List<SubscriberMethod> subscriberMethods = METHOD_CACHE.get(subscriberClass);
    if (subscriberMethods != null) {
    	//缓存里有直接返回
        return subscriberMethods;
    }
	//默认false
    if (ignoreGeneratedIndex) {
    	//利用反射来获取订阅类中的订阅方法信息
        subscriberMethods = findUsingReflection(subscriberClass);
    } else {
        subscriberMethods = findUsingInfo(subscriberClass);
    }
    if (subscriberMethods.isEmpty()) {
        throw new EventBusException("Subscriber " + subscriberClass
                + " and its super classes have no public methods with the @Subscribe annotation");
    } else {
        METHOD_CACHE.put(subscriberClass, subscriberMethods);
        return subscriberMethods;
    }
}
```

注意`subscriberMethods.isEmpty()`，如果注册了`EventBus`，但却没有使用注解`Subscribe`是会出现`EventBusException`异常的。下面跟进`findUsingInfo()`方法。

```java
private List<SubscriberMethod> findUsingInfo(Class<?> subscriberClass) {
    FindState findState = prepareFindState();
    findState.initForSubscriber(subscriberClass);
    while (findState.clazz != null) {
        findState.subscriberInfo = getSubscriberInfo(findState);
        // findState.subscriberInfo默认null
        if (findState.subscriberInfo != null) {
            SubscriberMethod[] array = findState.subscriberInfo.getSubscriberMethods();
            for (SubscriberMethod subscriberMethod : array) {
                if (findState.checkAdd(subscriberMethod.method, subscriberMethod.eventType)) {
                    findState.subscriberMethods.add(subscriberMethod);
                }
            }
        } else {
            findUsingReflectionInSingleClass(findState);
        }
        // 将findState.clazz变为改类的父类
        findState.moveToSuperclass();
    }
    return getMethodsAndRelease(findState);
}
```

`findState.subscriberInfo`默认`null`，那么就进入到`findUsingReflectionInSingleClass(findState)`

```java
private void findUsingReflectionInSingleClass(FindState findState) {
    Method[] methods;
    try {
        // This is faster than getMethods, especially when subscribers are fat classes like Activities
      	//通过反射获取到订阅类中的所有方法
        methods = findState.clazz.getDeclaredMethods();
    } catch (Throwable th) {
        // Workaround for java.lang.NoClassDefFoundError, see https://github.com/greenrobot/EventBus/issues/149
        methods = findState.clazz.getMethods();
        findState.skipSuperClasses = true;
    }
    //遍历所有方法，忽略private类型，如果是公有，并且不是java编译器 生成的方法名，那么就是我们要的。
    for (Method method : methods) {
        int modifiers = method.getModifiers();
        if ((modifiers & Modifier.PUBLIC) != 0 && (modifiers & MODIFIERS_IGNORE) == 0) {
            Class<?>[] parameterTypes = method.getParameterTypes();
            if (parameterTypes.length == 1) {
              	//保证只有一个事件参数
                Subscribe subscribeAnnotation = method.getAnnotation(Subscribe.class);
                if (subscribeAnnotation != null) {
                    Class<?> eventType = parameterTypes[0];
                  	//校验是否添加该方法
                    if (findState.checkAdd(method, eventType)) {
                        ThreadMode threadMode = subscribeAnnotation.threadMode();
                        findState.subscriberMethods.add(new SubscriberMethod(method, eventType, threadMode,
                                subscribeAnnotation.priority(), subscribeAnnotation.sticky()));
                    }
                }
            } else if (strictMethodVerification && method.isAnnotationPresent(Subscribe.class)) {
                String methodName = method.getDeclaringClass().getName() + "." + method.getName();
                throw new EventBusException("@Subscribe method " + methodName +
                        "must have exactly 1 parameter but has " + parameterTypes.length);
            }
        } else if (strictMethodVerification && method.isAnnotationPresent(Subscribe.class)) {
            String methodName = method.getDeclaringClass().getName() + "." + method.getName();
            throw new EventBusException(methodName +
                    " is a illegal @Subscribe method: must be public, non-static, and non-abstract");
        }
    }
}
```

可以看到，首先会得到订阅类的class对象并通过反射获取订阅类中的所有方法信息，然后通过筛选获取到订阅方法集合。

程序执行到此我们就获取到了订阅类中的所有的订阅方法信息，接下来我们就要对订阅方法进行注册；

```java
// Must be called in synchronized block
private void subscribe(Object subscriber, SubscriberMethod subscriberMethod) {
  	//获取订阅事件的类型，即订阅方法中的唯一参数类型
    Class<?> eventType = subscriberMethod.eventType;
  	// 用订阅者和订阅方法构造一个Subscription对象
    Subscription newSubscription = new Subscription(subscriber, subscriberMethod);
  	//根据订阅的事件类型获取所有的订阅者
    CopyOnWriteArrayList<Subscription> subscriptions = subscriptionsByEventType.get(eventType);
  	//将订阅者添加到subscriptionsByEventType集合中
    if (subscriptions == null) {
        subscriptions = new CopyOnWriteArrayList<>();
        subscriptionsByEventType.put(eventType, subscriptions);
    } else {
        if (subscriptions.contains(newSubscription)) {
            throw new EventBusException("Subscriber " + subscriber.getClass() + " already registered to event "
                    + eventType);
        }
    }

    int size = subscriptions.size();
  	// 根据订阅者优先级，增加到订阅者列表subscriptions的相应位置
    for (int i = 0; i <= size; i++) {
        if (i == size || subscriberMethod.priority > subscriptions.get(i).subscriberMethod.priority) {
            subscriptions.add(i, newSubscription);
            break;
        }
    }
	// 获取订阅者所有订阅事件的列表，默认为null
    List<Class<?>> subscribedEvents = typesBySubscriber.get(subscriber);
    if (subscribedEvents == null) {
        subscribedEvents = new ArrayList<>();
        typesBySubscriber.put(subscriber, subscribedEvents);
    }
    subscribedEvents.add(eventType);
	//如果接收sticky事件,立即分发sticky事件;sticky默认false
    if (subscriberMethod.sticky) {
        if (eventInheritance) {
            // Existing sticky events of all subclasses of eventType have to be considered.
            // Note: Iterating over all events may be inefficient with lots of sticky events,
            // thus data structure should be changed to allow a more efficient lookup
            // (e.g. an additional map storing sub classes of super classes: Class -> List<Class>).
            Set<Map.Entry<Class<?>, Object>> entries = stickyEvents.entrySet();
            for (Map.Entry<Class<?>, Object> entry : entries) {
                Class<?> candidateEventType = entry.getKey();
                if (eventType.isAssignableFrom(candidateEventType)) {
                    Object stickyEvent = entry.getValue();
                    checkPostStickyEventToSubscription(newSubscription, stickyEvent);
                }
            }
        } else {
            Object stickyEvent = stickyEvents.get(eventType);
            checkPostStickyEventToSubscription(newSubscription, stickyEvent);
        }
    }
}
```

所以**Register()**方法做了3件事。

1.查找订阅者的所有订阅事件

2.将订阅事件作为key,把所有订阅该事件的订阅者作为value存放到**subscriptionsByEventType**

3.将订阅者作为key,把订阅者的所有订阅事件作为value放到**typesBySubscriber**

### 3.EventPus中的Post流程

EventBus.getDefault().post("DarrenFantasy");

```java
/** Posts the given event to the event bus. */
public void post(Object event) {
  	//获取当前线程的postingState
    PostingThreadState postingState = currentPostingThreadState.get();
  	//取得当前线程的事件队列
    List<Object> eventQueue = postingState.eventQueue;
  	//将该事件添加到当前的事件队列中等待分发
    eventQueue.add(event);

    if (!postingState.isPosting) {
      	//判断是否是在主线程
        postingState.isMainThread = isMainThread();
        postingState.isPosting = true;
        if (postingState.canceled) {
            throw new EventBusException("Internal error. Abort state was not reset");
        }
        try {
            while (!eventQueue.isEmpty()) {
              	//分发事件
                postSingleEvent(eventQueue.remove(0), postingState);
            }
        } finally {
            postingState.isPosting = false;
            postingState.isMainThread = false;
        }
    }
}
```

关于**PostingThreadState**

```java
/** For ThreadLocal, much faster to set (and get multiple values). */
final static class PostingThreadState {
    final List<Object> eventQueue = new ArrayList<>();//当前线程的事件队列
    boolean isPosting;//是否有事件正在分发
    boolean isMainThread;//post的线程是否是主线程
    Subscription subscription;//订阅者
    Object event;//订阅事件
    boolean canceled;//是否取消
}
```

**postSingleEvent**

```java
private void postSingleEvent(Object event, PostingThreadState postingState) throws Error {
  	// 获取event的类型
    Class<?> eventClass = event.getClass();
    boolean subscriptionFound = false;
    if (eventInheritance) {
       	// 依据订阅事件类型，将订阅事件类型及所有父类添加进eventTypes
        List<Class<?>> eventTypes = lookupAllEventTypes(eventClass);
        int countTypes = eventTypes.size();
        for (int h = 0; h < countTypes; h++) {
            Class<?> clazz = eventTypes.get(h);
          	// 遍历countTypes，通过调用postSingleEventForEventType()方法通知所有订阅者
            subscriptionFound |= postSingleEventForEventType(event, postingState, clazz);
        }
    } else {
        subscriptionFound = postSingleEventForEventType(event, postingState, eventClass);
    }
    if (!subscriptionFound) {
        if (logNoSubscriberMessages) {
            logger.log(Level.FINE, "No subscribers registered for event " + eventClass);
        }
        if (sendNoSubscriberEvent && eventClass != NoSubscriberEvent.class &&
                eventClass != SubscriberExceptionEvent.class) {
            post(new NoSubscriberEvent(this, event));
        }
    }
}
```

可以发现，实际分发事件是通过**postSingleEventForEventType()**来实现的

```java
private boolean postSingleEventForEventType(Object event, PostingThreadState postingState, Class<?> eventClass) {
    CopyOnWriteArrayList<Subscription> subscriptions;
    synchronized (this) {
      	// 根据订阅事件查找所有已经注册过的订阅者
        subscriptions = subscriptionsByEventType.get(eventClass);
    }
  	//向每个订阅者分发事件
    if (subscriptions != null && !subscriptions.isEmpty()) {
        for (Subscription subscription : subscriptions) {
            postingState.event = event;
            postingState.subscription = subscription;
            boolean aborted = false;
            try {
                postToSubscription(subscription, event, postingState.isMainThread);
                aborted = postingState.canceled;
            } finally {
                postingState.event = null;
                postingState.subscription = null;
                postingState.canceled = false;
            }
            if (aborted) {
                break;
            }
        }
        return true;
    }
    return false;
}
```

可以看到首先根据事件类型获取到所有的订阅者，然后循环向每个订阅者发送事件，通过

**postToSubscription(subscription, event, postingState.isMainThread)**发送出去。

```java
private void postToSubscription(Subscription subscription, Object event, boolean isMainThread) {
    switch (subscription.subscriberMethod.threadMode) {
        case POSTING://默认的 ThreadMode，表示在执行 Post 操作的线程直接调用订阅者的事件响应方法，		              //不论该线程是否为主线程（UI 线程）。
            invokeSubscriber(subscription, event);
            break;
        case MAIN://在主线程中执行响应方法。
            if (isMainThread) {
                invokeSubscriber(subscription, event);
            } else {
                mainThreadPoster.enqueue(subscription, event);
            }
            break;
        case MAIN_ORDERED://在主线程中执行响应方法
            if (mainThreadPoster != null) {
                mainThreadPoster.enqueue(subscription, event);
            } else {
                // temporary: technically not correct as poster not decoupled from subscriber
                invokeSubscriber(subscription, event);
            }
            break;
        case BACKGROUND://在后台线程中执行响应方法。
            if (isMainThread) {
                backgroundPoster.enqueue(subscription, event);
            } else {
                invokeSubscriber(subscription, event);
            }
            break;
        case ASYNC://不论发布线程是否为主线程，都使用一个空闲线程来处理。
            asyncPoster.enqueue(subscription, event);
            break;
        default:
            throw new IllegalStateException("Unknown thread mode: " + subscription.subscriberMethod.threadMode);
    }
}
```

最后可以看到都调用了**invokeSubscriber()**方法

```java
void invokeSubscriber(Subscription subscription, Object event) {
    try {
        subscription.subscriberMethod.method.invoke(subscription.subscriber, event);
    } catch (InvocationTargetException e) {
        handleSubscriberException(subscription, event, e.getCause());
    } catch (IllegalAccessException e) {
        throw new IllegalStateException("Unexpected exception", e);
    }
}
```

最后是通过反射的方式，调用了订阅类中的订阅方法。

所以事件发布的过程包括

1、首先获取当前线程的PostingThreadState对象从而获取到当前线程的事件队列

2、通过事件类型获取到所有订阅者集合

3、通过反射执行订阅者中的订阅方法

### 4.EventBus的取消注册流程

**EventBus.getDefault().unregister(this);**

```java
/** Unregisters the given subscriber from all event classes. */
public synchronized void unregister(Object subscriber) {
  	//获取订阅者的所有订阅的事件类型
    List<Class<?>> subscribedTypes = typesBySubscriber.get(subscriber);
    if (subscribedTypes != null) {
        for (Class<?> eventType : subscribedTypes) {
          	//从事件类型的订阅者集合中移除订阅者
            unsubscribeByEventType(subscriber, eventType);
        }
        typesBySubscriber.remove(subscriber);
    } else {
        logger.log(Level.WARNING, "Subscriber to unregister was not registered before: " + subscriber.getClass());
    }
}
```

```java
/** Only updates subscriptionsByEventType, not typesBySubscriber! Caller must update typesBySubscriber. */
private void unsubscribeByEventType(Object subscriber, Class<?> eventType) {
   	//获取事件类型的所有订阅者
    List<Subscription> subscriptions = subscriptionsByEventType.get(eventType);
  	//遍历订阅者集合，将解除的订阅者移除
    if (subscriptions != null) {
        int size = subscriptions.size();
        for (int i = 0; i < size; i++) {
            Subscription subscription = subscriptions.get(i);
            if (subscription.subscriber == subscriber) {
                subscription.active = false;
                subscriptions.remove(i);
                i--;
                size--;
            }
        }
    }
}
```

**所以取消订阅的全过程：**

1、首先获取订阅者的所有订阅事件

2、遍历订阅事件，根据订阅事件获取所有的订阅了该事件的订阅者集合，将该订阅者移除

3、将步骤1中的集合中的订阅者移除



#### 最后总结整个EventBus的工作原理

**订阅逻辑**

1.通过register()注册一个订阅者。

2.获取订阅者的所有方法。

3.根据订阅者的所有事件类型，将订阅者存入到以订阅事件为key,所有订阅者为value存的map中。

4.将订阅者为key，订阅者所有订阅为value存入map中。

**事件发送逻辑**

1.获取到当前线程的事件队列，把要发送的事件添加到事件队列中。

2.根据发送事件类型获取所有的订阅者。

3.通过响应方式的执行模式，在响应的线程通过反射执行订阅者的订阅方法。

**取消逻辑**

1.通过unregister获取要取消的订阅者。

2.得到该订阅者的所有订阅事件。

3.遍历所有订阅事件，获取所有对应的订阅者集合，并从中移除该订阅者。

4.将步骤2中的集合中的订阅者移除。