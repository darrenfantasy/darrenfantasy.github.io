---
title: 重新认识HashMap
date: 2017-03-13 18:12:49
tags:
---

我们在存储数据的时候经常会用到HashMap，之前只知道它是用来存储Key和对应Value的，非线程安全等基本使特性。但是对其内部实现原理却不是很清楚，今天想深入探究其实现原理。

首先对以下四个实现类进行比较：

### HashMap

HashMap根据Key的hashCode值来存储数据的，大多情况下可以直接定位到它的值，因此访问速度也很快，但遍历顺序却是不确定的。HashMap最多允许一个Key为null，允许多个Value为null。是非线程安全的，即任一时刻有多个线程同时写HashMap，可能会导致数据的不一致。如果要实现线程安全，那么需要用Collections的sychronizedMap方法来使它具有线程安全，或者使用ConcurrentHashMap。

### HashTable

HashTable是遗留类，继承Dictionary类，映射的常用功能和HashMap相似，但是是线程安全的。并发行不如ConcurrentHashMap。不需要线程安全的时候可以用HashMap替换，需要线程安全时可用ConcurrentHashMap替换。

### LinkedHashMap

LinkedHashMap继承自HashMap，它保存了记录的插入顺序，在用迭代器（Iterator）遍历LinkedHashMap时，先得到的记录是先插入的，当然也可以在构造函数时带参数，按照访问次序排序。

