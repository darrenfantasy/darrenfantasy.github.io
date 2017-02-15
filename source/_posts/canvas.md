---
title: canvas
date: 2016-10-11 15:52:11
tags: [Android]
---

Canvas有关知识笔记

## Save   Restore 
-----

一般在重写view的onDraw方法时，onDraw方法里一般会传入一个Canvas对象，是用来绘制控件的画布。

关于save和restore方法

save 用来保存canvas的状态。save后可以对canvas进行旋转，缩放，平移等。

restore用来恢复canvas之前保存的状态。防止save后对canvas的操作对后续产生影响。

save函数会返回一个saveCount,我们可以用restoreToCount方法来还原哪一个保存操作。