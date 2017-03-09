---
title: 单例模式
date: 2016-10-18 15:56:19
tags: [Android,Java]
---

---


1.懒汉式
----
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

对于懒汉式，会延迟加载，在第一次调用的时候才会初始化。如果不需要同步的情况下，效率比较低。


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
  private static Singleton mInstance;
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

在JDK1.5之后，这种方法才能达到单例效果。


4.静态内部类
----
```java
public class Singleton{
  private Singleton(){
  }
  public static Singleton getInstance(){
    return SingletonHolder.mInstance;
  }
  private static class SingletonHolder(){
    private static final Singleton mInstance = new Singleton();
  }
}
```