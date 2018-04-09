---
title: Android动画学习
date: 2017-02-26 14:47:00
tags: [Android]
---

Android动画主要分为以下3种

1.帧动画

2.补间动画（View动画）

3.属性动画

### 1.帧动画

帧动画是通过播放一组预先定义好的图片来实现的。系统提供了一个类AnimationDrawable来使用帧动画。

```xml
//res/drawable/frame_anim1
<?xml version="1.0" encoding="utf-8"?>
<animation-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item
        android:drawable="@drawable/a_0"
        android:duration="100" />
    <item
        android:drawable="@drawable/a_1"
        android:duration="100" />
    <item
        android:drawable="@drawable/a_2"
        android:duration="100" />
</animation-list>
```

```java
ImageView animationImg1 = (ImageView) findViewById(R.id.animation1);
animationImg1.setImageResource(R.drawable.frame_anim1);
AnimationDrawable animationDrawable1 = (AnimationDrawable) animationImg1.getDrawable();
animationDrawable1.start();
```

使用起来很方便，但是比较容易引起OOM。所以要尽量避免使用过多的大尺寸图片。

### 2.补间动画（View动画）

View动画作用对象是View,它支持四种效果，分别是 **alpha（透明度），translate（平移），scale（缩放），rotate（旋转）**。

```xml
<?xml version="1.0" encoding="utf-8"?>
<set xmlns:android="http://schemas.android.com/apk/res/android"
    android:interpolator="@[package:]anim/interpolator_resource"
    android:shareInterpolator=["true" | "false"] >
    <alpha
        android:fromAlpha="float"
        android:toAlpha="float" />
    <scale
        android:fromXScale="float"
        android:toXScale="float"
        android:fromYScale="float"
        android:toYScale="float"
        android:pivotX="float"
        android:pivotY="float" />
    <translate
        android:fromXDelta="float"
        android:toXDelta="float"
        android:fromYDelta="float"
        android:toYDelta="float" />
    <rotate
        android:fromDegrees="float"
        android:toDegrees="float"
        android:pivotX="float"
        android:pivotY="float" />
    <set>
        ...
    </set>
</set>
```

可以使用set 标签将多个动画组合

它的两个属性的含义

**Interpolator** 主要作用是可以控制动画的变化速率 ，就是动画进行的快慢节奏。

Android 系统已经为我们提供了一些Interpolator ，比如 accelerate_decelerate_interpolator，accelerate_interpolator等。

**shareInterpolator **表示集合中的动画是否和集合共享一个插值器，如果集合不指定插值器，那么子动画就要单独指定插值器或者使用默认插值器。

当然它也可以用代码实现啦。

### 3.属性动画

属性动画是API 11加入的特性，和View动画不同，它对作用对象进行了扩展，属性动画可以对任何对象做动画。

repeatCount:动画循环次数，默认0，-1表示无限循环。

repeatMode:动画循环模式，restart表示连续重复，reverse表情逆向重复。

```Java
ObjectAnimator alphaAnim = ObjectAnimator.ofFloat(myView, "alpha", 1.0f, 0.5f, 0.8f, 1.0f);
ObjectAnimator scaleXAnim = ObjectAnimator.ofFloat(myView, "scaleX", 0.0f, 1.0f);
ObjectAnimator scaleYAnim = ObjectAnimator.ofFloat(myView, "scaleY", 0.0f, 2.0f);
ObjectAnimator rotateAnim = ObjectAnimator.ofFloat(myView, "rotation", 0, 360);
ObjectAnimator transXAnim = ObjectAnimator.ofFloat(myView, "translationX", 100, 400);
ObjectAnimator transYAnim = ObjectAnimator.ofFloat(myView, "tranlsationY", 100, 750);
AnimatorSet set = new AnimatorSet();
set.playTogether(alphaAnim, scaleXAnim, scaleYAnim, rotateAnim, transXAnim, transYAnim);
//set.playSequentially(alphaAnim, scaleXAnim, scaleYAnim, rotateAnim, transXAnim, transYAnim);
set.setDuration(3000);
set.start();
```

这些动画可以同时播放，或者是按序播放。

使用方式：

1. 如果是自定义控件，需要添加 `setter` / `getter` 方法；
2. 用 `ObjectAnimator.ofXXX()` 创建 `ObjectAnimator` 对象；
3. 用 `start()` 方法执行动画。

```java
public class SportsView extends View {  
    float progress = 0;

    ......

    // 创建 getter 方法
    public float getProgress() {
        return progress;
    }

    // 创建 setter 方法
    public void setProgress(float progress) {
        this.progress = progress;
        invalidate();
    }

    @Override
    public void onDraw(Canvas canvas) {
        super.onDraw(canvas);

        ......

        canvas.drawArc(arcRectF, 135, progress * 2.7f, false, paint);

        ......
    }
}

......

// 创建 ObjectAnimator 对象
ObjectAnimator animator = ObjectAnimator.ofFloat(view, "progress", 0, 65);  
// 执行动画
animator.start();  

```

在上面实现属性动画的时候，我们反复的使用到了ObjectAnimator 这个类，这个类继承自ValueAnimator，使用这个类可以对任意对象的**任意属性**进行动画操作。而ValueAnimator是整个属性动画机制当中最核心的一个类。

**属性动画核心原理**

属性动画的运行机制是通过不断地对值进行操作来实现的，而初始值和结束值之间的动画过渡就是ValueAnimator这个类来负责计算的。它的内部使用一种时间循环的机制来计算值与值之间的动画过渡，我们只需要将初始值和结束值提供给ValueAnimator，并且告诉它动画所需运行的时长，那么ValueAnimator就会自动帮我们完成从初始值平滑地过渡到结束值这样的效果。除此之外，ValueAnimator还负责管理动画的播放次数、播放模式、以及对动画设置监听器等。

平滑过渡的核心 

**TypeEvaluator 决定了动画如何从初始值过渡到结束值。**

**TimeInterpolator 决定了动画从初始值过渡到结束值的节奏。**

说的通俗一点，你每天早晨出门去公司上班，TypeEvaluator决定了你是坐公交、坐地铁还是骑车；而当你决定骑车后，TimeInterpolator决定了你一路上骑行的方式，你可以匀速的一路骑到公司，你也可以前半程骑得飞快，后半程骑得慢悠悠。

常用的Interpolator介绍

#### AccelerateDecelerateInterpolator

先加速再减速。这是默认的 `Interpolator`，也就是说如果你不设置的话，那么动画将会使用这个 `Interpolator`。

#### LinearInterpolator

匀速。

#### AccelerateInterpolator

持续加速。在整个动画过程中，一直在加速，直到动画结束的一瞬间，直接停止。

#### DecelerateInterpolator

持续减速直到 0。动画开始的时候是最高速度，然后在动画过程中逐渐减速，直到动画结束的时候恰好减速到 0。

#### AnticipateInterpolator

先回拉一下再进行正常动画轨迹。效果看起来有点像投掷物体或跳跃等动作前的蓄力。

#### OvershootInterpolator

动画会超过目标值一些，然后再弹回来。效果看起来有点像你一屁股坐在沙发上后又被弹起来一点的感觉。

#### AnticipateOvershootInterpolator

上面这两个的结合版：开始前回拉，最后超过一些然后回弹。

#### BounceInterpolator

在目标值处弹跳。有点像玻璃球掉在地板上的效果。

#### CycleInterpolator

这个也是一个正弦 / 余弦曲线，不过它和 `AccelerateDecelerateInterpolator` 的区别是，它可以自定义曲线的周期，所以动画可以不到终点就结束，也可以到达终点后回弹，回弹的次数由曲线的周期决定，曲线的周期由 `CycleInterpolator()` 构造方法的参数决定。



#### 设置监听器

```Java
new Animator.AnimatorListener(){

    @Override
    public void onAnimationStart(Animator animation) {
        //当动画开始执行时，这个方法被调用。
    }

    @Override
    public void onAnimationEnd(Animator animation) {
		//当动画结束时，这个方法被调用。
    }

    @Override
    public void onAnimationCancel(Animator animation) {
		//当动画被通过 cancel() 方法取消时，这个方法被调用。需要说明一下的是，就算动画被取消，onAnimationEnd() 也会被调用。所以当动画被取消时，如果设置了 AnimatorListener，那么 onAnimationCancel() 和 onAnimationEnd() 都会被调用。onAnimationCancel() 会先于 onAnimationEnd() 被调用。
    }

    @Override
    public void onAnimationRepeat(Animator animation) {
		//当动画通过 setRepeatMode() / setRepeatCount() 或 repeat() 方法重复执行时，这个方法被调用。由于 ViewPropertyAnimator 不支持重复，所以这个方法对 ViewPropertyAnimator 相当于无效。
    }
};
```



#### 使用动画注意事项

1.OOM问题

主要出现在帧动画，当图片数量较多且图片较大时。

2.内存泄露

属性动画里有一类无限循环的动画，这个动画需要在Activity退出时及时停止，将导致Activity无法释放从而导致内存泄露。验证发现View动画不存在这个问题。

3.View动画的问题

View动画是对View的影像做动画，并不是真正的改变View的状态。所以当动画移动时，新位置无法触发点击事件。老位置可以触发点击事件。

4.硬件加速

使用动画时，开启硬件加速会提高动画的流畅性。