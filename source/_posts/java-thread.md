---
title: Java线程相关知识点巩固
date: 2017-06-13 23:23:49
tags: [Java]
---

### 1.开启线程的方式

1.继承Thread 2.实现Runnable接口 3.实现Callable接口

**采用实现Runnable、Callable接口的方式创见多线程时，优势是：**

线程类只是实现了Runnable接口或Callable接口，还可以继承其他类。

在这种方式下，多个线程可以共享同一个target对象，所以非常适合多个相同线程来处理同一份资源的情况，从而可以将CPU、代码和数据分开，形成清晰的模型，较好地体现了面向对象的思想。

### 2.线程与进程的区别

进程是资源分配的基本单位，线程是处理器调度的基本单位。

进程拥有独立的地址空间，线程没有独立的地址空间，同一个进程内多个线程共享其资源。

线程划分尺度更小，所以多线程程序并发性更高。

一个程序至少有一个进程，一个进程至少有一个线程。

线程是属于进程的，当进程退出时该进程所产生的线程都会被强制退出并清除。

线程占用的资源要少于进程所占用的资源。

### 3.Java线程池

##### 线程池的优势

①降低系统资源消耗，通过重用已存在的线程，降低线程创建和销毁造成的消耗；

②提高系统响应速度，当有任务到达时，无需等待新线程的创建便能立即执行；

③方便线程并发数的管控，线程若是无限制的创建，不仅会额外消耗大量系统资源，更是占用过多资源而阻塞系统或oom等状况，从而降低系统的稳定性。线程池能有效管控线程，统一分配、调优，提供资源使用率；

④更强大的功能，线程池提供了定时、定期以及可控线程数等功能的线程池，使用方便简单。

**ThreadPoolExecutor**

我们可以通过ThreadPoolExecutor来创建一个线程池。

```Java
ExecutorService service = new ThreadPoolExecutor(....);
```

下面我们就来看一下ThreadPoolExecutor中的一个构造方法。

```Java
 public ThreadPoolExecutor(int corePoolSize,
 	int maximumPoolSize,
 	long keepAliveTime,
 	TimeUnit unit,
 	BlockingQueue<Runnable> workQueue,
 	ThreadFactory threadFactory,
 	RejectedExecutionHandler handler) 
```

##### ThreadPoolExecutor参数含义

**1. corePoolSize**

线程池中的核心线程数，默认情况下，核心线程一直存活在线程池中，即便他们在线程池中处于闲置状态。除非我们将ThreadPoolExecutor的allowCoreThreadTimeOut属性设为true的时候，这时候处于闲置的核心线程在等待新任务到来时会有超时策略，这个超时时间由keepAliveTime来指定。一旦超过所设置的超时时间，闲置的核心线程就会被终止。

**2. maximumPoolSize**

线程池中所容纳的最大线程数，如果活动的线程达到这个数值以后，后续的新任务将会被阻塞。包含核心线程数+非核心线程数。

**3. keepAliveTime**

非核心线程闲置时的超时时长，对于非核心线程，闲置时间超过这个时间，非核心线程就会被回收。只有对ThreadPoolExecutor的allowCoreThreadTimeOut属性设为true的时候，这个超时时间才会对核心线程产生效果。

**4. unit**

用于指定keepAliveTime参数的时间单位。他是一个枚举，可以使用的单位有天（TimeUnit.DAYS），小时（TimeUnit.HOURS），分钟（TimeUnit.MINUTES），毫秒(TimeUnit.MILLISECONDS)，微秒(TimeUnit.MICROSECONDS, 千分之一毫秒)和毫微秒(TimeUnit.NANOSECONDS, 千分之一微秒);

**5. workQueue**

线程池中保存等待执行的任务的阻塞队列。通过线程池中的execute方法提交的Runable对象都会存储在该队列中。我们可以选择下面几个阻塞队列。

| 阻塞队列                  | 说明                                       |
| --------------------- | ---------------------------------------- |
| ArrayBlockingQueue    | 基于数组实现的有界的阻塞队列,该队列按照FIFO（先进先出）原则对队列中的元素进行排序。 |
| LinkedBlockingQueue   | 基于链表实现的阻塞队列，该队列按照FIFO（先进先出）原则对队列中的元素进行排序。 |
| SynchronousQueue      | 内部没有任何容量的阻塞队列。在它内部没有任何的缓存空间。对于SynchronousQueue中的数据元素只有当我们试着取走的时候才可能存在。 |
| PriorityBlockingQueue | 具有优先级的无限阻塞队列。                            |

我们还能够通过实现BlockingQueue接口来自定义我们所需要的阻塞队列。

**6. threadFactory**

线程工厂，为线程池提供新线程的创建。ThreadFactory是一个接口，里面只有一个newThread方法。 默认为DefaultThreadFactory类。

**7. handler**

是RejectedExecutionHandler对象，而RejectedExecutionHandler是一个接口，里面只有一个rejectedExecution方法。**当任务队列已满并且线程池中的活动线程已经达到所限定的最大值或者是无法成功执行任务，这时候ThreadPoolExecutor会调用RejectedExecutionHandler中的rejectedExecution方法。在ThreadPoolExecutor中有四个内部类实现了RejectedExecutionHandler接口。在线程池中它默认是AbortPolicy，在无法处理新任务时抛出RejectedExecutionException异常**。

下面是在ThreadPoolExecutor中提供的四个可选值。

| 可选值                 | 说明                                |
| ------------------- | --------------------------------- |
| CallerRunsPolicy    | 只用调用者所在线程来运行任务。                   |
| AbortPolicy         | 直接抛出RejectedExecutionException异常。 |
| DiscardPolicy       | 丢弃掉该任务，不进行处理。                     |
| DiscardOldestPolicy | 丢弃队列里最近的一个任务，并执行当前任务。             |

我们也可以通过实现RejectedExecutionHandler接口来自定义我们自己的handler。如记录日志或持久化不能处理的任务。

##### ThreadPoolExecutor的使用

```
ExecutorService service = new ThreadPoolExecutor(5, 10, 10, TimeUnit.SECONDS, new LinkedBlockingQueue<>());
```

对于ThreadPoolExecutor有多个构造方法，对于上面的构造方法中的其他参数都采用默认值。可以通过execute和submit两种方式来向线程池提交一个任务。 **execute** 当我们使用execute来提交任务时，由于execute方法没有返回值，所以说我们也就无法判定任务是否被线程池执行成功。

```
service.execute(new Runnable() {
	public void run() {
		System.out.println("execute方式");
	}
});
```

**submit**

当我们使用submit来提交任务时,它会返回一个future,我们就可以通过这个future来判断任务是否执行成功，还可以通过future的get方法来获取返回值。如果子线程任务没有完成，get方法会阻塞住直到任务完成，而使用get(long timeout, TimeUnit unit)方法则会阻塞一段时间后立即返回，这时候有可能任务并没有执行完。

```Java
Future<Integer> future = service.submit(new Callable<Integer>() {

	@Override
	public Integer call() throws Exception {
		System.out.println("submit方式");
		return 2;
	}
});
try {
	Integer number = future.get();
} catch (ExecutionException e) {
				// TODO Auto-generated catch block
	e.printStackTrace();
}
```

##### 线程池关闭

调用线程池的`shutdown()`或`shutdownNow()`方法来关闭线程池

shutdown原理：将线程池状态设置成SHUTDOWN状态，然后中断所有没有正在执行任务的线程。

shutdownNow原理：将线程池的状态设置成STOP状态，然后中断所有任务(包括正在执行的)的线程，并返回等待执行任务的列表。

**中断采用interrupt方法，所以无法响应中断的任务可能永远无法终止。** 但调用上述的两个关闭之一，isShutdown()方法返回值为true，当所有任务都已关闭，表示线程池关闭完成，则isTerminated()方法返回值为true。当需要立刻中断所有的线程，不一定需要执行完任务，可直接调用shutdownNow()方法。

##### 线程池执行流程

①如果在线程池中的线程数量没有达到核心的线程数量，这时候就回启动一个核心线程来执行任务。

②如果线程池中的线程数量已经超过核心线程数，这时候任务就会被插入到任务队列中排队等待执行。

③由于任务队列已满，无法将任务插入到任务队列中。这个时候如果线程池中的线程数量没有达到线程池所设定的最大值，那么这时候就会立即启动一个非核心线程来执行任务。

④如果线程池中的数量达到了所规定的最大值，那么就会拒绝执行此任务，这时候就会调用RejectedExecutionHandler中的rejectedExecution方法来通知调用者。

##### 四种线程池类

Java中四种具有不同功能常见的线程池。他们都是直接或者间接配置ThreadPoolExecutor来实现他们各自的功能。这四种线程池分别是newFixedThreadPool,newCachedThreadPool,newScheduledThreadPool和newSingleThreadExecutor。这四个线程池可以通过Executors类获取。

##### 1. newFixedThreadPool

通过Executors中的newFixedThreadPool方法来创建，该线程池是一种线程数量固定的线程池。

```Java
ExecutorService service = Executors.newFixedThreadPool(4);
```

在这个线程池中 **所容纳最大的线程数就是我们设置的核心线程数。** 如果线程池的线程处于空闲状态的话，它们并不会被回收，除非是这个线程池被关闭。如果所有的线程都处于活动状态的话，新任务就会处于等待状态，直到有线程空闲出来。

由于newFixedThreadPool只有核心线程，并且这些线程都不会被回收，也就是 **它能够更快速的响应外界请求** 。从下面的newFixedThreadPool方法的实现可以看出，newFixedThreadPool只有核心线程，并且不存在超时机制，采用LinkedBlockingQueue，所以对于任务队列的大小也是没有限制的。

```Java
public static ExecutorService newFixedThreadPool(int nThreads) {
	return new ThreadPoolExecutor(nThreads, nThreads,
		0L, TimeUnit.MILLISECONDS,
		new LinkedBlockingQueue<Runnable>());
}
```

##### 2. newCachedThreadPool

通过Executors中的newCachedThreadPool方法来创建。

```Java
public static ExecutorService newCachedThreadPool() {
	return new ThreadPoolExecutor(0, Integer.MAX_VALUE,
		60L, TimeUnit.SECONDS,
		new SynchronousQueue<Runnable>());
}
```

通过s上面的newCachedThreadPool方法在这里我们可以看出它的 **核心线程数为0，** 线程池的最大线程数Integer.MAX_VALUE。而Integer.MAX_VALUE是一个很大的数，也差不多可以说 **这个线程池中的最大线程数可以任意大。**

**当线程池中的线程都处于活动状态的时候，线程池就会创建一个新的线程来处理任务。该线程池中的线程超时时长为60秒，所以当线程处于闲置状态超过60秒的时候便会被回收。** 这也就意味着若是整个线程池的线程都处于闲置状态超过60秒以后，在newCachedThreadPool线程池中是不存在任何线程的，所以这时候它几乎不占用任何的系统资源。

对于newCachedThreadPool他的任务队列采用的是SynchronousQueue，上面说到在SynchronousQueue内部没有任何容量的阻塞队列。SynchronousQueue内部相当于一个空集合，我们无法将一个任务插入到SynchronousQueue中。所以说在线程池中如果现有线程无法接收任务,将会创建新的线程来执行任务。

##### 3. newScheduledThreadPool

通过Executors中的newScheduledThreadPool方法来创建。

```Java
public static ScheduledExecutorService newScheduledThreadPool(int corePoolSize) {
    return new ScheduledThreadPoolExecutor(corePoolSize);
}
public ScheduledThreadPoolExecutor(int corePoolSize) {
    super(corePoolSize, Integer.MAX_VALUE, 0, NANOSECONDS,
          new DelayedWorkQueue());
}
```

它的核心线程数是固定的，对于非核心线程几乎可以说是没有限制的，并且当非核心线程处于限制状态的时候就会立即被回收。

创建一个可定时执行或周期执行任务的线程池：

```Java
ScheduledExecutorService service = Executors.newScheduledThreadPool(4);
service.schedule(new Runnable() {
	public void run() {
		System.out.println(Thread.currentThread().getName()+"延迟三秒执行");
	}
}, 3, TimeUnit.SECONDS);
service.scheduleAtFixedRate(new Runnable() {
	public void run() {
		System.out.println(Thread.currentThread().getName()+"延迟三秒后每隔2秒执行");
	}
}, 3, 2, TimeUnit.SECONDS);
```

输出结果：

> pool-1-thread-2延迟三秒后每隔2秒执行 
> pool-1-thread-1延迟三秒执行 
> pool-1-thread-1延迟三秒后每隔2秒执行 
> pool-1-thread-2延迟三秒后每隔2秒执行 
> pool-1-thread-2延迟三秒后每隔2秒执行

`schedule(Runnable command, long delay, TimeUnit unit)`：延迟一定时间后执行Runnable任务；

`schedule(Callable callable, long delay, TimeUnit unit)`：延迟一定时间后执行Callable任务；

`scheduleAtFixedRate(Runnable command, long initialDelay, long period, TimeUnit unit)`：延迟一定时间后，以间隔period时间的频率周期性地执行任务；

`scheduleWithFixedDelay(Runnable command, long initialDelay, long delay,TimeUnit unit)`:与scheduleAtFixedRate()方法很类似，但是不同的是scheduleWithFixedDelay()方法的周期时间间隔是以上一个任务执行结束到下一个任务开始执行的间隔，而scheduleAtFixedRate()方法的周期时间间隔是以上一个任务开始执行到下一个任务开始执行的间隔，也就是这一些任务系列的触发时间都是可预知的。

ScheduledExecutorService功能强大，对于定时执行的任务，建议多采用该方法。

##### 4. newSingleThreadExecutor

通过Executors中的newSingleThreadExecutor方法来创建，**在这个线程池中只有一个核心线程**，对于任务队列没有大小限制，也就意味着**这一个任务处于活动状态时，其他任务都会在任务队列中排队等候依次执行**。

newSingleThreadExecutor将所有的外界任务统一到一个线程中支持，所以在这个任务执行之间我们不需要处理线程同步的问题。

```Java
public static ExecutorService newSingleThreadExecutor() {
	return new FinalizableDelegatedExecutorService
	(new ThreadPoolExecutor(1, 1,
		0L, TimeUnit.MILLISECONDS,
		new LinkedBlockingQueue<Runnable>()));
}
```



### 4.synchronized关键字的理解

#### 线程同步问题的产生及解决方案

Java允许多线程并发控制，当多个线程同时操作一个可共享的资源变量时（如数据的增删改查），将会导致数据不准确，相互之间产生冲突。

**问题的解决：**

因此加入同步锁以避免在该线程没有完成操作之前，被其他线程的调用，从而保证了该变量的唯一性和准确性。

##### 1.synchronized简介

1. synchronized实现同步的基础：Java中每个对象都可以作为锁。当线程试图访问同步代码时，必须先获得**对象锁**，退出或抛出异常时必须释放锁。
2. Synchronzied实现同步的表现形式分为：**代码块同步** 和 **方法同步**。

##### 2.synchronized原理

JVM基于进入和退出`Monitor`对象来实现 **代码块同步** 和 **方法同步** ，两者实现细节不同。

**代码块同步：** 在编译后通过将`monitorenter`指令插入到同步代码块的开始处，将`monitorexit`指令插入到方法结束处和异常处，通过反编译字节码可以观察到。任何一个对象都有一个`monitor`与之关联，线程执行`monitorenter`指令时，会尝试获取对象对应的`monitor`的所有权，即尝试获得对象的锁。

**方法同步：** synchronized方法在`method_info结构`有`ACC_synchronized`标记，线程执行时会识别该标记，获取对应的锁，实现方法同步。

两者虽然实现细节不同，但本质上都是对一个对象的监视器（monitor）的获取。**任意一个对象都拥有自己的监视器**，当同步代码块或同步方法时，执行方法的线程必须先获得该对象的监视器才能进入同步块或同步方法，没有获取到监视器的线程将会被阻塞，并进入同步队列，状态变为`BLOCKED`。当成功获取监视器的线程释放了锁后，会唤醒阻塞在同步队列的线程，使其重新尝试对监视器的获取。

##### 3.synchronized的使用场景

**①方法同步**

```
public synchronized void method1
```

锁住的是该对象,类的其中一个实例，当该对象(仅仅是这一个对象)在不同线程中执行这个同步方法时，线程之间会形成互斥。达到同步效果，但如果不同线程同时对该类的不同对象执行这个同步方法时，则线程之间不会形成互斥，因为他们拥有的是不同的锁。

**②代码块同步**

```
synchronized(this){ //TODO }
```

描述同①

**③方法同步**

```
public synchronized static void method3
```

锁住的是该类，当所有该类的对象(多个对象)在不同线程中调用这个static同步方法时，线程之间会形成互斥，达到同步效果。

**④代码块同步**

```
synchronized(Test.class){ //TODO}

```

同③

**⑤代码块同步**

```
synchronized(o) {}

```

这里面的o可以是一个任何Object对象或数组，并不一定是它本身对象或者类，谁拥有o这个锁，谁就能够操作该块程序代码。

### 5.volatile关键字的理解

volatile可以确保可见性和有序性。但是不能保证原子性。

Java内存模型规定了**所有的变量都存储在主内存中**。**每条线程中还有自己的工作内存，线程的工作内存中保存了被该线程所使用到的变量（这些变量是从主内存中拷贝而来）**。**线程对变量的所有操作（读取，赋值）都必须在工作内存中进行。不同线程之间也无法直接访问对方工作内存中的变量，线程间变量值的传递均需要通过主内存来完成**。

* #### 原子性

**原子性**的理解：**即一个操作或者多个操作，要么全部执行，并且执行的过程不会被任何因素打断，要么就都不执行。**

在Java中，**对基本数据类型的变量的读取和赋值操作是原子性操作**，即这些操作是不可被中断的，要么执行，要么不执行。

```Java
x = 10;        //语句1
y = x;         //语句2
x++;           //语句3
x = x + 1;     //语句4
```

只有语句1是原子性操作，其他三个语句都不是原子性操作。

语句1是直接将数值10赋值给x，也就是说线程执行这个语句的会直接将数值10写入到工作内存中。

**语句2实际上包含2个操作，它先要去读取x的值，再将x的值写入工作内存**，虽然读取x的值以及将x的值写入工作内存，这2个操作都是原子性操作，但是合起来就不是原子性操作了。

同样的，**x++和 x = x+1包括3个操作：读取x的值，进行加1操作，写入新的值**。

* #### 可见性

  可见性是指当多个线程访问同一个变量时，一个线程修改了这个变量的值，其他线程能够立即看得到修改的值。

  Java提供了volatile关键字来保证可见性。

  **当一个共享变量被volatile修饰时，它会保证修改的值会立即被更新到主存，当有其他线程需要读取时，它会去内存中读取新值。**

  而普通的共享变量不能保证可见性，**因为普通共享变量被修改之后，什么时候被写入主存是不确定的，当其他线程去读取时，此时内存中可能还是原来的旧值，因此无法保证可见性。**

  另外，通过synchronized和Lock也能够保证可见性，synchronized和Lock能保证同一时刻只有一个线程获取锁然后执行同步代码，并且**在释放锁之前会将对变量的修改刷新到主存当中**。因此可以保证可见性。

* #### 有序性

  有序性：即程序执行的顺序按照代码的先后顺序执行。

  ```Java
  int i = 0;

  boolean flag = false;

  i = 1;                //语句1
  flag = true;          //语句2
  ```

  语句1不一定会在语句2前面执行。这里可能会发生指令重排序（Instruction Reorder）。

  指令重排序，**一般来说，处理器为了提高程序运行效率，可能会对输入代码进行优化，它不保证程序中各个语句的执行先后顺序同代码中的顺序一致，但是它会保证程序最终执行结果和代码顺序执行的结果是一致的。**

  比如上面的代码中，语句1和语句2谁先执行对最终的程序结果并没有影响，那么就有可能在执行过程中，语句2先执行而语句1后执行。

  虽然重排序不会影响单个线程内程序执行的结果，但是**会影响到多线程并发执行的正确性**。

  #####volatile保证可见性

  一旦一个共享变量（类的成员变量、类的静态成员变量）被volatile修饰之后，那么就具备了两层语义：

  1）保证了**不同线程对这个变量进行操作时的可见性**，即一个线程修改了某个变量的值，这新值对其他线程来说是立即可见的。

  2）**禁止进行指令重排序。**

  volatile关键字禁止指令重排序有两层意思：

  ​	a）当程序执行到volatile变量的读操作或者写操作时，**在其前面的操作的更改肯定全部已经进行，且结果已经对后面的操作可见；在其后面的操作肯定还没有进行**；

  ​	b）在进行指令优化时，**不能将在对volatile变量的读操作或者写操作的语句放在其后面执行，也不能把volatile变量后面的语句放到其前面执行。**

### 6.死锁

一般来说，要出现死锁问题需要满足以下条件：

1. 互斥条件：一个资源每次只能被一个线程使用。
2. 请求与保持条件：一个线程因请求资源而阻塞时，对已获得的资源保持不放。
3. 不剥夺条件：线程已获得的资源，在未使用完之前，不能强行剥夺。
4. 循环等待条件：若干线程之间形成一种头尾相接的循环等待资源关系。

在JAVA编程中，有3种典型的死锁类型：
静态的锁顺序死锁，动态的锁顺序死锁，协作对象之间发生的死锁。

详细见https://github.com/LRH1993/android_interview/blob/master/java/concurrence/deadlock.md



