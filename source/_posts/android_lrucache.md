---
title: Android之LruCache
date: 2017-04-20 18:17:45
tags: [Android]
---

LruCache是Android提供的缓存工具类，其算法是最近最少使用算法。它把最近使用的对象用“强引用”存储在LinkedHashMap中，并且把最近最少使用对象在缓存值达到预设定值前就从内存中移除。

### 1.使用方法

```java
// use 1/8 of available heap size
mLruCache = new LruCache<String, Bitmap>((int) (Runtime.getRuntime().maxMemory() / 8)) {
     @Override
     protected int sizeOf(String key, Bitmap value) {
         return value.getRowBytes() * value.getHeight();
     }
              
     @Override
     protected void entryRemoved(boolean evicted, String key,
     		Bitmap oldValue, Bitmap newValue) {
         // TODO Auto-generated method stub
         super.entryRemoved(evicted, key, oldValue, newValue);
     }
 };
```

* 需要提供一个缓存容量作为构造参数。（必填）
* 覆写sizeOf()方法，自定义设计一条数据存入的容量计算，如果不覆写就无法预知数据的容量，不能保证缓存容量限定在最大容量内。（必填）
* 覆写entryRemoved()方法，如果你cache的某个值要明确释放，这个方法会在元素被put或者remove时调用。（选填）

### 2.源码分析

LruCache利用LinkedHashMap的基于访问顺序（accessOrder = true）再加上对其数据操作加锁实现缓存策略的。

```java
public LruCache(int maxSize) {
    if (maxSize <= 0) {
            throw new IllegalArgumentException("maxSize <= 0");
    }
    this.maxSize = maxSize;
    this.map = new LinkedHashMap<K, V>(0, 0.75f, true);
}
```

```java
    /**
     * Constructs a new {@code LinkedHashMap} instance with the specified
     * capacity, load factor and a flag specifying the ordering behavior.
     *
     * @param initialCapacity
     *            the initial capacity of this hash map.
     * @param loadFactor
     *            the initial load factor.
     * @param accessOrder
     *            {@code true} if the ordering should be done based on the last
     *            access (from least-recently accessed to most-recently
     *            accessed), and {@code false} if the ordering should be the
     *            order in which the entries were inserted.
     * @throws IllegalArgumentException
     *             when the capacity is less than zero or the load factor is
     *             less or equal to zero.
     */
    public LinkedHashMap(
            int initialCapacity, float loadFactor, boolean accessOrder) {
        super(initialCapacity, loadFactor);
        init();
        this.accessOrder = accessOrder;
    }
```

第一个参数 `initialCapacity` 用于初始化该 LinkedHashMap 的大小。

先简单介绍一下 第二个参数 `loadFactor`，这个其实的 HashMap 里的构造参数，涉及到**扩容问题**，比如 HashMap 的最大容量是100，那么这里设置0.75f的话，到75容量的时候就会扩容。

主要是第三个参数 `accessOrder=true` ，这样的话 LinkedHashMap 数据排序就会基于数据的访问顺序，从而实现了 LruCache 核心工作原理。

```java
/**
 * Returns the value for {@code key} if it exists in the cache or can be
 * created by {@code #create}. If a value was returned, it is moved to the
 * head of the queue. This returns null if a value is not cached and cannot
 * be created.
 */
public final V get(K key) {
    if (key == null) {
        throw new NullPointerException("key == null");
    }

    V mapValue;
    synchronized (this) {
        mapValue = map.get(key);
        if (mapValue != null) {
            hitCount++;
            return mapValue;
        }
        missCount++;
    }

    /*
     * Attempt to create a value. This may take a long time, and the map
     * may be different when create() returns. If a conflicting value was
     * added to the map while create() was working, we leave that value in
     * the map and release the created value.
     */

    V createdValue = create(key);
    if (createdValue == null) {
        return null;
    }

    synchronized (this) {
        createCount++;
        mapValue = map.put(key, createdValue);

        if (mapValue != null) {
            // There was a conflict so undo that last put
            map.put(key, mapValue);
        } else {
            size += safeSizeOf(key, createdValue);
        }
    }

    if (mapValue != null) {
        entryRemoved(false, key, createdValue, mapValue);
        return mapValue;
    } else {
        trimToSize(maxSize);
        return createdValue;
    }
}
```

