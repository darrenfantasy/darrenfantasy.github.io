---
title: Java垃圾回收机制学习
date: 2018-01-27 22:26:18
tags: [JVM,Java]
---

通过这次学习，希望能掌握GC是在什么时候，对什么东西，做了什么事情？

在学习之前，我的概念里就是GC是由系统自身决定，不可预测的。对不再使用的对象进行内存回收和清理。

To Naive。

先来学习下垃圾回收都有哪些算法

### 垃圾回收算法

**1.引用计数法 2.标记清除法 3.复制算法 4.标记压缩算法 5.分代算法 6.分区算法**

#### 1.引用计数法

引用计数法是指对对于一个对象A，任何一个对象引用了A，那么A的引用计数就+1。当A的引用计数是0的时候，那么就表示A是可以被回收的对象。

但是这个算法会出现两个问题

a.无法处理循环引用的问题

b.引用计数在每次被引用和消除时会伴随一个加法和减法操作，会对系统性能有一定影响。

#### 2.标记清除法

标记清除法是指**从GC Root节点开始，标记所有根节点开始的可达对象。那么未被标记的对象就是未被引用的垃圾对象了。**

标记清除算法会产生的问题就是空间碎片。回收后的内存空间不再连续。尤其是大内存的分配，不连续内存空间的工作效率要低于连续的。空间碎片太多可能会导致当程序在以后的运行过程中需要分配较大对象的时候无法找到足够的连续内存而不得不触发另一次垃圾收集动作。

**哪些对象可以作为GC Roots？**
虚拟机栈（栈帧中的本地变量表）中的引用的对象
方法区中的类静态属性引用的对象
方法区中的常量引用的对象
本地方法栈中JNI（Native方法）的引用对象

#### 3.复制算法

**将原有的内存空间分为两个大小相同的存储空间，每次只使用一块，在垃圾回收时，将正在使用的内存块中存活的对象复制到另一个内存空间中。之后清理正在使用的内存块中的所有对象。**

这个算法要求复制的存活对象比较少（适用场景）。因为是被回收到另一个内存空间里，所以可以确保不会出现空间碎片。

但是这个算法的代价是系统内存空间减半，如果内存空间里的垃圾对象比较少，那么复制对象也是比较耗时的。

注：复制算法比较适用于新生代。因为在新生代中，垃圾对象通常会多于存活对象，算法的效果会比较好。

#### 4.标记压缩法

和标记清除算法一样，标记压缩算法也首先从根节点开始，对所有可达的对象做一次标记。

但之后，它并不是简单的清理未标记的对象，而是**将所有的存活对象压缩到内存空间的一端，之后，清理边界外所有的空间。**

这样做避免的碎片的产生，又不需要两块相同的内存空间，因此性价比高。

#### 5.分代算法

前几种算法都各有特点和优势，没有一种可以替代其他的算法，因此需要根据垃圾对象选择合适的回收算法。

分代算法思想：**将内存空间根据对象的特点不同进行划分，选择合适的垃圾回收算法，以提高垃圾回收的效率。**

【**新生代对象**】：存放年轻对象的堆空间，年轻对象指刚刚创建，或者经历垃圾回收次数不多的对象。

新生代的特点是：对象朝生夕灭，大约90%的对象会很快回收，因此，新生代比较适合使用复制算法。

【**老年代对象**】：存放老年对象的堆空间。即为经历多次垃圾回收依然存活的对象。

#### 6.分区算法

算法思想：分区算法将整个堆空间划分为连续的不同小区间，每一个小区间都独立使用，独立回收。

算法优点是：可以控制一次回收多少个小区间。

通常，相同的条件下，堆空间越大，一次GC所需的时间就越长，从而产生的停顿时间就越长。为了更好的控制GC产生的停顿时间，将一块大的内存区域分割成多个小块，根据目标的停顿时间，每次合理的回收若干个小区间，而不是整个堆空间，从而减少一个GC的停顿时间。



### JVM内存管理

JVM将堆分成了 二个大区  Young 和 Old。

而Young 区又分为 **Eden、Survivor1、Survivor2**, 两个**Survivor 区相对地作为为From 和 To 逻辑区域, 当Survivor1作为 From 时 ， Survivor2 就作为 To, 反之亦然。**

为什么要这样区分Young（将Young区分为Eden、Survivor1、Survivor2以及相对的From和To ），这要牵涉到上面关于JVM的垃圾回收算法的讨论。
1）因为引用计数法无法解决循环引用问题，JVM并没有采用这种算法来判断对象是否存活。
2）JVM一般采用GCRoots的方法，只要从任何一个GCRoots的对象可达，就是不被回收的对象
3）标记-清除算法，先标记那些要被回收的对象，然后进行清理，简单可行，但是①标记清除效率低，因为要一个一个标记和清除②造成大量不连续的内存碎片，空间碎片太多可能会导致当程序在以后的运行过程中需要分配较大对象的时候无法找到足够的连续内存而不得不触发另一次垃圾收集动作。
4）采用复制收集算法：将可用内存按照容量分为大小相等的两块，每次只是使用其中的一块。当这一块的内存用完了，就将可用内存中存活的对象复制到另一块上面，然后把已使用的内存空间一次性清理掉。

5) 复制算法的代价是将内存缩小一半，这样影响太大。而且IBM的专门研究表明，新生代中98%的对象都是朝生夕死的，所以不需要按照1:1来划分内存空间，而是将内存分为一块比较大的Eden空间和两个较小的Survivor空间，每次使用Eden区和其中一个Survivor，当回收的时候，把Eden和Survivor里存活的对象复制到另一块Survivor空间上，最后清理掉Eden和刚用过的Survivor。HotSpot虚拟机默认Eden和Survivor的比例为8:1，这样每次只有10%的内存空间浪费掉。当然，98%可回收是一般的场景数据，我们没办法保证每次回收都不超过10%的对象存活，所以当Survivor空间不足时，需要依赖其他内存（这里指老年代）进行分配担保。

6）之所以要分两个Survivor，而不是直接从Survivor直接移到old区域，原因是old区域内的对象都是经过若干次yong GC之后存活下来的对象，并不是每一次yong GC存活下来的对象都需要移动到old区域内，所以需要Survivor1和Survivor2来保证Yong内存中的复制算法的实行，提高清除效率。

老年代的存活率是很高的，如果依然使用复制算法回收老年代，将需要复制大量的对象。这种做法是不可取的，根据分代的思想，对老年代的回收使用标记清除或者标记压缩算法可以提高垃圾回收效率。



#### 最后再回到一开始提出的问题上，GC是在什么时候，对什么东西，做了什么事情？

目前主流的JVM（HotSpot）采用的是分代收集算法。采用的是类似于树形结构的**可达性分析法**来判断对象是否还存在引用。即：从gc root开始，把所有可以搜索得到的对象标记为存活对象。

第一：“什么时候”即就是GC触发的条件。GC触发的条件有两种。（1）程序调用System.gc时可以触发；（2）系统自身来决定GC触发的时机。

系统判断GC触发的依据：根据Eden区和From Space区的内存大小来决定。当内存大小不足时，则会启动GC线程并停止应用线程。

第二：“对什么东西”笼统的认为是Java对象并没有错。但是准确来讲，GC操作的对象分为：通过可达性分析法无法搜索到的对象和可以搜索到的对象。对于搜索不到的方法进行标记。

第三：“做了什么”最浅显的理解为释放对象。但是从GC的底层机制可以看出，对于可以搜索到的对象进行复制操作，对于搜索不到的对象，调用finalize()方法进行释放。

具体过程：当GC线程启动时，会通过可达性分析法把Eden区和From Space区的存活对象复制到To Space区，然后把Eden Space和From Space区的对象释放掉。当GC轮训扫描To Space区一定次数后，把依然存活的对象复制到老年代，然后释放To Space区的对象。

#### Minor GC ，Full GC 触发条件

Minor GC触发条件：当Eden区满时，触发Minor GC。

Full GC触发条件：

（1）调用System.gc时，系统建议执行Full GC，但是不必然执行

（2）老年代空间不足

（3）方法区空间不足

（4）通过Minor GC后进入老年代的平均大小大于老年代的可用内存

（5）由Eden区、From Space区向To Space区复制时，对象大小大于To Space可用内存，则把该对象转存到老年 代，且老年代的可用内存小于该对象大小