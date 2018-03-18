---
title: 单例模式
date: 2016-10-18 15:56:19
tags: [Android,Java,设计模式]
---

单例模式确保此类仅有一个实例，自行实例化并提供一个访问它的全局公有静态方法。

通常两种情况下需要用到单例模式：

1. 实例话某个对象要消耗过多资源，避免频繁创建和销毁对象对资源的浪费。（如：对数据库操作，访问IO,网络请求等）
2. 某种类型对象应该只存在一个，如果产生过多实例，会导致程序行为异常和结果不一致。（如：一个管理系统，缓存等）

单例模式的优缺点：

1. 优点：可以减少系统内存开支和性能开销，避免对资源的占用。
2. 缺点：不容易扩展，容易引发内存泄漏。

单例的实现方式：

1. 按加载时机来：懒汉式和饿汉式。
2. 按实现方式来：双重检查加锁，内部类，枚举等。

#### 最简单的懒汉式

```java
public class Singleton{
  private static Singleton mInstance;
  //private的构造函数，除了它本身，不会被其他类实例化
  private Singleton(){}
  //通过静态方法，提供全局获取唯一一个可用对象
  public static Singleton getInstance(){
    if(mInstance == null){
      mInstance = new Singleton();
    }
    return Singleton;
  }
}
```

这种写法只能在单线程下使用。如果是多线程，可能发生一个线程通过进入 *if(mInstance == null)* 判断语句块，但还未来得及创建新的实例时，另外一个线程也通过了这个判断，最终两个线程都进行了创建实例，导致多个实例的产生。所以多线程下不要使用这个方法。

#### 对getInstance方法加上sychronized的懒汉式

```java
public class Singleton{

  private static Singleton mInstance;

  private Singleton(){

  }

  public static synchronized Singleton getInstance(){

    if(mInstance == null){
      mInstance = new Singleton();
    }
    return mInstance;

  }

}
```

对于这种写法的懒汉式，会延迟加载，在第一次调用的时候才会初始化。如果不需要同步的情况下，效率比较低。而事实上实例创建完成后，同步就变为不必要的开销了，这样做在高并发下肯定会影响性能。


2.饿汉式
----
```java
public class Singleton{
  private static Singleton mInstance = new Singleton();
  private Singleton(){
  }
  public static Singleton getInstance{
    return mInstance;
  }
}
```

对于饿汉式，类加载的时候单例就会实例化，会浪费内存。


3.双重检查锁定（Double Check Lock）
----
```java
public class Singleton{
  //注意此处的 volatile 关键词
  private static volatile Singleton mInstance;
  private Singleton(){
  }
  public static Singleton getInstance{
    if(mInstance == null){
      Synchronized(Singleton.class){
        if(mInstance == null){
          mInstance = new Singleton();
        }
      }
    }
    return mInstance;
  }
}
```

在JDK1.5及之后，这种方法才能达到单例效果。

此方法的“Double-Check”体现在进行了两次 if (mInstance == null) 的检查，这样既同步代码块保证了线程安全，同时实例化的代码也只会执行一次，实例化后同步操作不会再被执行，从而效率提升很多。


4.静态内部类
----
```java
public class Singleton{
  private Singleton(){
  }
  public static Singleton getInstance(){
    return SingletonHolder.mInstance;
  }
  private static class SingletonHolder{
    private static final Singleton mInstance = new Singleton();
  }
}
```
静态内部类只有在第一次调用的时候才会去加载类。同时实现延迟加载和线程安全。