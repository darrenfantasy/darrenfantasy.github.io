---
title: 重新认识Java
date: 2017-05-03 22:09:05
tags: [Java]
---

### 1.存储在哪里

* **寄存器（Registers）**，寄存器位于处理器内部，由于个数有限，所以编译器会根据本身需求适当的分配寄存器来使用。

* **Stack（栈）**，一般位于RAM（random-access memory，随机访问内存）中，处理器经由其指针提供直接支持。一般对象的引用存在stack中。

* **Heap（堆）**，Heap是一种通用性质的内存存储空间（也存在于RAM中），用来置放所有Java对象。

* **静态存储空间（Static storage）**，这里的静态，是指在固定位置上，也在RAM上。

* **常量存储空间（Constant storage）**，因为常量不会改变，所以存在ROM（read-only memory,只读内存）上。

* **Non-RAM存储空间**，如果程序不执行，数据也能够存活，Streamed objects（串流化对象）和persistent

  objects （持久性对象） 便是主要的两个例子。如对象被存储在磁盘中。

基本类型会因为“new将对象置于heap之上”而效率不彰。因此此类对象不以new分配其空间，而是产生一种所谓的“automatic”变量。此类变量直接存放数据值，并置于stack中。

基本类型：

**byte,char,short,int,long,float,double,boolean.**

### 2.泛型

### 3.反射

### 4.集合

### 5.多线程

### 6.IO

### 7.异常

### 8.JVM相关



