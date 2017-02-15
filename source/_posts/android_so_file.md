---
title: so文件
date: 2016-10-24 15:56:31
tags: [Android]
---
.so not found cause crash

今天在小米手机上运行app出现闪退情况 看了下log，发现闪退原因是.so文件找不到。然后找了下libs包下的目录，其中有四个子目录，分别是armeabi,armeabi-v7a,arm64-v8a和x86。

之前不懂这几个目录的作用，今天查了下

arm64-v8a可以向下兼容armeabi-v7a,armeabi

armeabi-v7a向下兼容armeabi

但是假设一个cpu是arm64-v8a架构的手机，它运行app时去读取库文件，会先去查找是否存在arm64-v8a的文件夹，如果不存在，则去查找armeabi-v7a的文件夹，如果再不存在，则会去查找armeabi文件夹，如果这个文件夹也不存在则会抛出异常。

如果有arm64-v8a文件夹，那么就会去找该文件夹下的特定的.so文件。需要注意的是，如果找不到指定.so文件，那么不会再往下（armeabi-v7a）找了，而是直接抛出异常。