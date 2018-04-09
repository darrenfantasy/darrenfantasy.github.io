---
title: Android四大组件
date: 2016-11-19 14:48:26
tags: [Android]
---

### 1.四大组件的运行状态

Android四大组件除了BoardcastReceiver以外，其他三个组件都必须在AndroidManifest中注册，对于BoardcastReceiver而言，既可在AndroidManifest中注册，也可以通过代码来注册。在调用方式上，Activity、Service和BroadcastReceiver需要借助Intent，而ContentProvider则无需借助Intent。

**Activity**

Activity是一种展示型组件，向用户直接展示一个界面。Activity的启动由Intent触发，其中Intent可分为显式和隐式，显式Intent可以明确的指向一个Activity组件，隐式Intent则指向一个或多个目标Activity组件。

**Service**

Service是一种计算型组件，用于在后台执行一系列计算任务。Service有两种状态：启动状态和绑定状态。尽管Service组件是用于后台计算的，但它本身是运行在主线程的，因此耗时的后台计算仍需要在单独的线程中去完成。

**BroadcastReceiver**

BroadcastReceiver是一种消息型组件，用于不同组件乃至不同应用之间传递消息。有两种注册方式分别为静态注册和动态注册。静态注册是指在AndroidManifest中注册广播，这种广播在应用安装时会被系统解析，而且不需要应用启动就可以收到相应的广播。动态注册需要Context.registerReceiver()来实现，在不需要的时候需要通过Context.unRegisterReceiver()来解除广播。这种广播必须要应用启动才能注册并接收广播。发送和接收过程的匹配是通过广播接收者的<intent-filter>来描述的。

**ContentProvider**

ContentProvider是一种数据共享型组件，用于向其他组件乃至其他应用共享数据。它的内部需要实现增删改查这四个操作，在它内部维护着一份数据集合，可以是通过数据库来实现，也可以采用其他类型如List 和Map。



### 2.Activity

#### 1.启动模式

* standard 标准模式

  系统默认启动模式，被启动的Activity会自动添加到启动它的Activity的任务栈里，因此用ApplicationContext启动standard模式的Activity时会报错(Context没有所谓的任务栈)

* singleTask 栈内复用原则

  种模式下只要被启动的Activity位于栈内,那么无论它是否位于栈顶都不会重新创建新的Activity实例,而是直接将其调回到栈顶并回调其onNewIntent方法,如果在其上有其他Activity的时候会将这些Activity进行出栈处理

* singleTop 栈顶复用原则

  新启动的Activity已经位于任务栈的栈顶,那么此Activity将不会被重建,而是会回调其onNewIntent方法,如果新启动的Activity不是位于栈顶,此时将重新创建新的Activity实例并添加到栈顶.

* singleInstance 单实例模式

  这是一种加强的singleTask模式,除了具有singleTask的特点外还加了一点,具体此模式的Activity会单独位于一个独立的任务栈，以后的请求均不会创建新的Activity直至这个任务栈被销毁.

#### 2.状态保存与恢复

当系统内存不足时，系统会强制结束一些不可见的Activity以节省内存资源。在某些情况下，当被强制结束的Activity再次显示时会出现一些问题。

所以Activity类中还提供了onSaveInstanceState() 和 onRestoreInstanceState() 2个方法可以用来解决这个问题。

**1、onSaveInstanceState() **
onSaveInstanceState() 方法用来在Activity被强制销毁之前保存数据，onSaveInstanceState()方法会携带一个 Bundle类型的参数，Bundle提供了一系列的方法用于保存数据，比如可以使用 putString()方法保存字符串，使用 putInt()方法保存整型数据。每个保存方法需要传入两个参数，第一个参数是键，第二个参数是真正要保存的内容。

**2、onRestoreInstanceState()**
onSaveInstanceState() 方法用来取得之前在onSaveInstanceState() 保存的值。
另外，除了onRestoreInstanceState()可以取得onSaveInstanceState() 保存的值之外，onCreate()函数也可以取得保存的值，这些值就存在onCreate()函数的参数savedInstanceState里，在哪个函数取出这些值就要看具体的需求了。



### 3.Service

#### 1.两种启动方式

1. startService()启动方式：主要用于执行后台计算

   Service的生命周期：onCreate() --> onStartCommand() -> onDestroy()

   停止服务：service.stopService()

   1.onCreate()：该方法在整个生命周期中只会在创建Service时调用一次！ 
   2.onDestory()：该方法只会当Service被关闭时会回调一次！ 
   3.onStartCommand(intent,flag,startId)：当客户端调用startService(Intent)方法时会回调，可多次调用StartService方法， 但不会再创建新的Service对象，而是继续复用前面产生的Service对象，但会继续回调 onStartCommand()方法！

2. bindService()启动方式：主要用于和其它组件的交互 

   说明：这两种状态是可以共存的，即一个Service既可以处于启动状态，也可以同时处于绑定状态。

   Service的生命周期 onCreate() --> onBind()  --> onUnBind() --> onDestroy()

   停止服务：UnbindService()

   1. 首先系统会在调用bindService之后实例化一个Service并绑定，然后紧接着调用onCreate和onBind()方法。
   2. 然后调用者就可以通过IBinder和Service进行交互了,此后如果再次使用bindService绑定Service,系统不会创建新的Sevice实例,也不会再调用onBind()方法,只会直接把IBinder对象传递给其他后来增加的客户端!
   3. 调用unbindService(),此时若只有一个客户端绑定了此服务，那么onUnbind和onDestory方法将会被调用!若是多个客户端绑定同一个Service的话,情况如下 当一个客户完成和service之间的互动后，它调用 unbindService() 方法来解除绑定。当所有的客户端都和service解除绑定后，系统会销毁service。
   4. 绑定模式下的Service和调用者共存亡

#### 2.Activity和Service进行数据交互

（第1步）老规矩，还是先继承Service。完成里面的onBind，返回一个自己重写的Binder
毫无疑问，同时需要在Service里面写好public set/get方法，为后面的Activity访问做好基本set/get操作。
（第2步）在Activity里面bindService。bindService是为了将Activity和Service绑定在一起，大有不求同年同月				生，但求同年同月死的味道。
在bindService的时候，需要传递一个ServiceConnection，ServiceConnection像一个桥梁，建立了Activity和Service之间的桥接。事实上也就是为了从ServiceConnection的回调方法onServiceConnected中的获得后台的Service句柄。只要获得Service的句柄，那么什么都好办了。
（第3步）在Activity中拿到Service的句柄后，就可以像操作一个普通的Java类一样传参、取值了。 

还可以通过广播来传递。//TODO 

#### 3.如何保证Service在后台不被Kill

1、Service设置成START_STICKY（onStartCommand方法中），kill 后会被重启（等待5秒左右），重传Intent，保持与重启前一样

2、通过 startForeground将进程设置为前台进程，做前台服务，优先级和前台应用一个级别，除非在系统内存非常缺，否则此进程不会被 kill.具体实现方式为在service中创建一个notification，再调用void android.app.Service.startForeground(int id,Notificationnotification)方法运行在前台即可。

3、双进程Service：让2个进程互相保护，其中一个Service被清理后，另外没被清理的进程可以立即重启进程

4、AlarmManager不断启动service。该方式原理是通过定时警报来不断启动service，这样就算service被杀死，也能再启动。同时也可以监听网络切换、开锁屏等广播来启动service。

5、QQ黑科技:在应用退到后台后，另起一个只有 1 像素的页面停留在桌面上，让自己保持前台状态，保护自己不被后台清理工具杀死



### 4.BroadcastReceiver

#### 1.广播注册的两种方式及区别

1)静态注册：在AndroidManifest.xml注册，android不能自动销毁广播接收器，也就是说当应用程序关闭后，还是会接收广播。 
2)动态注册：在代码中通过registerReceiver()手工注册.当程序关闭时,该接收器也会随之销毁。当然，也可手工调用unregisterReceiver()进行销毁。