---
title: 开发中遇到的坑
date: 2016-11-03 16:00:58
tags: [Android,Java]
---

---
2016-11-03关于Java中Integer的值的比较
---

今天在开发中，需要新增一个错误码的返回值，调试过程中发现


 Integer i = 40002;
 Integer j = 40002;
 i==j 返回false
 
 而之前错误码0的时候确实返回true
 Integer x = 0;
 Integer y = 0;
 x==y 返回true
 
 一时半会有点晕，打断点的时候才发现对象不一样。
 后来查资料发现
<pre><code>
 public static Integer valueOf(int i) {
        return  i >= 128 || i < -128 ? new Integer(i) : SMALL_VALUES[i + 128];
    }

    /**
     * A cache of instances used by {@link Integer#valueOf(int)} and auto-boxing
     */
    private static final Integer[] SMALL_VALUES = new Integer[256];

    static {
        for (int i = -128; i < 128; i++) {
            SMALL_VALUES[i + 128] = new Integer(i);
        }
    }
 </code></pre>
 默认Integer值在－127到128区间内，就会把i作为变量存到内存里。否则会new一个Integer对象。
 所以比较Integer值的时候，可以使用Integer.intValue()或者直接用equals()比较。
 
---
2017-01-12开发表情搜搜demo时遇到的一些问题
---

大约一周半的时间，完成了表情搜搜demo
以下记录了开发中遇到的问题

1.Intent无法传递太大数据
（业务需求：把后打开的页面里的一个图片的base64传到上一个页面，由于数据量过大，后改为把图片的url传回上个页面再去转成base64）
因为遇到要在后打开的页面传递值返回到上一个页面，所以用StartActivityForResult方法。在setResult时通过Intent来把图片的base64传回去，
但是遇到错误信息：E/JavaBinder﹕ !!! FAILED BINDER TRANSACTION !!!
查阅资料发现  https://developer.android.com/reference/android/os/TransactionTooLargeException.html
The Binder transaction buffer has a limited fixed size, currently 1Mb, which is shared by all transactions in progress for the process. Consequently this exception can be thrown when there are many transactions in progress even when most of the individual transactions are of moderate size.
Binder事务缓冲区具有有限的固定大小，目前为1Mb，由进程正在进行的所有事务共享。因此，当有许多事务正在进行时，即使大多数单独的事务大小适中，也可以抛出此异常.


2.SharedPreferences存StringSet时，不能直接操作取出的set.否则数据会丢失
(业务需求：缓存本地搜索记录，因为是要存10个字符串，所以一开始想简单点直接用StringSet，后来因为set无序，所以改用拼接字符串)
查源代码发现  *<p>Note that you <em>must not</em> modify the set instance returned
            * by this call.  The consistency of the stored data is not guaranteed
            * if you do, nor is your ability to modify the instance at all.

3.Android 防止点击事件穿透（在布局的根节点添加Android:clickable="true" 属性即可，用来获取焦点防止点击事件穿透）

4.自定义view为内部类时，没有将内部类设置为static 
导致java.lang.NoSuchMethodException: <init> [class android.content.Context, interface android.util.AttributeSet]

5.想监听一个父布局的ontouch事件时，发现用手触摸时只打印出Action.move和up.如果点击父布局里的子控件时，什么事件都无法打印出来。
回想了下之前View的事件分发机制，不能在重写OnTouchEvent方法里监听到事件，因为onTouch事件优先与OnTouchEvent执行，如果onTouch返回true将事件消费了,则onTouchEvent将不会执行。
详见 （ <a href="http://darrenfantasy.com/2016/11/08/android_event_dispatch/">Android事件分发机制</a>）