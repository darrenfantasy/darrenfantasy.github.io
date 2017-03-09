---
title: Android事件分发机制
date: 2016-11-08 16:02:42
tags: [Android]
---


看了大神们的技术博客和安卓源码，总结如下
-----

1.在触摸任意一个控件的时候，都会先调用该控件的 dispatchTouchEvent() 方法。
<pre><code>
  /**
```java
 * Pass the touch screen motion event down to the target view, or this
 * view if it is the target.
 *
 * @param event The motion event to be dispatched.
 * @return True if the event was handled by the view, false otherwise.
 */
public boolean dispatchTouchEvent(MotionEvent event) {
    // If the event should be handled by accessibility focus first.
    if (event.isTargetAccessibilityFocus()) {
        // We don't have focus or no virtual descendant has it, do not handle the event.
        if (!isAccessibilityFocusedViewOrHost()) {
            return false;
        }
        // We have focus and got the event, then use normal event dispatch.
        event.setTargetAccessibilityFocus(false);
    }

    boolean result = false;

    if (mInputEventConsistencyVerifier != null) {
        mInputEventConsistencyVerifier.onTouchEvent(event, 0);
    }

    final int actionMasked = event.getActionMasked();
    if (actionMasked == MotionEvent.ACTION_DOWN) {
        // Defensive cleanup for new gesture
        stopNestedScroll();
    }

    if (onFilterTouchEventForSecurity(event)) {
        //noinspection SimplifiableIfStatement
        ListenerInfo li = mListenerInfo;
        if (li != null && li.mOnTouchListener != null
                && (mViewFlags & ENABLED_MASK) == ENABLED
                && li.mOnTouchListener.onTouch(this, event)) {
            result = true;
        }
        //可以从上面代码看出当以上条件都成立时，即也要满足当onTouch()返回true的时候，就不会执行onTouchEvent()方法了。
        if (!result && onTouchEvent(event)) {
            result = true;
        }
    }

    if (!result && mInputEventConsistencyVerifier != null) {
        mInputEventConsistencyVerifier.onUnhandledEvent(event, 0);
    }

    // Clean up after nested scrolls if this is the end of a gesture;
    // also cancel it if we tried an ACTION_DOWN but we didn't want the rest
    // of the gesture.
    if (actionMasked == MotionEvent.ACTION_UP ||
            actionMasked == MotionEvent.ACTION_CANCEL ||
            (actionMasked == MotionEvent.ACTION_DOWN && !result)) {
        stopNestedScroll();
    }

    return result;
}
```
<code></pre>

2.onTouch在onTouchEvent之前执行，如果onTouch返回true将事件消费了,则onTouchEvent将不会执行。

3.Android中事件传递按照从上到下进行层级传递，事件处理从Activity开始到ViewGroup再到View。。

4.ViewGroup可以通过onInterceptTouchEvent方法对事件传递进行拦截，onInterceptTouchEvent方法返回true表示不允许事件向子View传递，返回false代表不对事件进行拦截,默认返回false.

5.在onTouchEvent中主要处理

press ：按下时候View状态的改变，比如View的背景的drawable会变成press 状态

click/tap： 快速点击

longClick：长按

focus：跟press类似，也是View状态的改变

touchDelegate：分发这个点击事件给其他的View，这个点击事件传到其他View前会改变这个事件的点击坐标，如果在指定的Rect里面，则是View的中点坐标，否则在View之外

6.onTouch事件要先于onClick事件执行，onTouch在事件分发方法dispatchTouchEvent中调用，而onClick在事件处理方法onTouchEvent中被调用，onTouchEvent要后于dispatchTouchEvent方法的调用。

7.事件传递方法包括dispatchTouchEvent、onTouchEvent、onInterceptTouchEvent，其中前两个是View和ViewGroup都有的，最后一个是只有ViewGroup才有的方法。这三个方法的作用分别是负责事件分发、事件处理、事件拦截。
