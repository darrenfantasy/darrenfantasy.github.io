---
title: 自定义ViewGroup实现TagFlowLayout
date: 2017-03-07 16:22:25
tags: [Android,customView]
---

## ViewGroup?

ViewGroup是一个放置View的容器。我们在用XML来写布局时，会告诉容器我们的宽(layout_width)，高(layout_height)，对齐方式(layout_gravity)等。(以layout开头的属性，都是为了告诉容器的)。

ViewGroup是给childView计算出建议的宽高和测量模式的，并且决定childView的位置。建议的宽高是因为当childView设置为wrap_content时，只有childView才能算出自己的宽高。

## View的三种测量模式

ViewGroup会为其childView设置以下三种模式。

EXACTLY：表示精确的值，一般当childView设置精确的宽高或者match_parent时。

AT_MOST：表示子布局被限制在一个最大值内，一般当childView设置其宽高为wrap_content时。

UNSPECIFIED：表示子布局想要多大就多大。

## View?

View根据测量模式和ViewGroup给出建议的宽高，计算出自己的宽高，并且在ViewGroup的指定区域内绘制自己的形态。

## API角度

View根据ViewGroup传入的测量值和模式，在onMeasure时确定自己的宽高，在onDraw时完成自己的绘制。

ViewGroup在onMeasure中计算childView的测量值及模式，以及完成计算和确定自己的宽高。在onLayout中确定所有childView的绘制区域。



## 简单实现TagFlowLayout



### onMeasure

```java
    @Override
    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
        //计算子布局的数量
        int count = getChildCount();
        //获取它的父容器为它设置的大小
        int width = MeasureSpec.getSize(widthMeasureSpec);
        int actuallyWidth = width - Margin * 2;
        int actuallyHeight = 0;
        int row = 1;
        int cHeight = 0;
        int addWidth = 0;
        //遍历子布局
        for (int i = 0; i < count; i++) {
            View child = getChildAt(i);
            child.setPadding(padding, padding, padding, padding);
            child.measure(MeasureSpec.UNSPECIFIED, MeasureSpec.UNSPECIFIED);
            //获取当前子布局的宽高
            int cWidth = child.getMeasuredWidth();
            cHeight = child.getMeasuredHeight();
            addWidth += cWidth + padding;
            if (addWidth > actuallyWidth) {
                row++;
                addWidth = cWidth;
            }
        }
        actuallyHeight = (cHeight + Margin) * row;
        //设置当前View的大小
        setMeasuredDimension(actuallyWidth, actuallyHeight);
    }
```

首先获取其父容器传入的宽高，然后遍历所有子布局，根据子布局测量出的宽高计算出自身的实际大小，然后设置自己的宽高。



### onLayout

```java
    @Override
    protected void onLayout(boolean changed, int l, int t, int r, int b) {
        int count = getChildCount();
        int actuallyWidth = r - l;
        int x = Margin;
        int y;
        int row = 1;
        for (int i = 0; i < count; i++) {
            View child = getChildAt(i);
            child.setBackgroundColor(Color.GRAY);
            int width = child.getMeasuredWidth();
            int height = child.getMeasuredHeight();
            x += width + padding;
            if (x > actuallyWidth) {
                x = width + padding;
                row++;
            }
            y = row * (height + Margin);
            //设置子布局的left,top,right,bottom
            if (i == 0)
                child.layout(x - width - padding, y - height, x - padding, y);
            else
                child.layout(x - width, y - height, x, y);
        }
    }
```

遍历所有的子布局，确定它们的绘制区域。



具体代码：<a href="https://github.com/darrenfantasy/CustomViewDemo">整个项目</a> <a href="https://github.com/darrenfantasy/CustomViewDemo/blob/master/app/src/main/java/com/fantasy/darren/customview/widget/MyWordWrapView.java">单个文件</a>