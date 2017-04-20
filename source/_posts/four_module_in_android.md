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