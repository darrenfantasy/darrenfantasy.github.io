---
title: 读《Android开发艺术探索》笔记
date: 2017-01-12 16:07:03
tags: [Android]
---

关于《Android开发艺术探索》学习的摘录


---
### 第三章View的事件体系

View的top,left,right,bottom都是相当View的父容器而言的
Android 3.0后增加了几个参数:x,y,translationX,translationY.
x,y为左上角坐标，translationX,translationY是View左上角相对与父容器的偏移量。
x = left+translationX; y = top+translationY;
View在平移时，top和left代表代表原始左上角的坐标信息，其值不会发生变化。 

MotionEvent
getX和getY是相对于当前View左上角的坐标而言。
getRawX和getRawY是相对手机屏幕左上角而言的。