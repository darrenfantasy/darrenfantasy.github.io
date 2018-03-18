---
title: 常见排序算法总结(更新中)
date: 2018-03-18 14:55:08
tags: [算法]
---

#### 1.冒泡排序

核心思想是比较相邻的两个元素的大小和交换把小的元素换到最前面（或者把大的数交换到最后面）。冒泡排序的时间复杂度为O(n^2)。

```Java
    public static void bubbleSort(int[] array) {
        if (array == null || array.length == 0)
            return;
        for (int i = 0; i < array.length - 1; i++) {
            for (int j = 0; j < array.length - 1 - i; j++) {
                if (array[j] > array[j + 1]) {
                    swap(array, j, j + 1);
                }
            }
        }
    }

    public static void swap(int[] array, int x, int y) {
        int temp;
        temp = array[x];
        array[x] = array[y];
        array[y] = temp;
    }
```

#### 2.选择排序

选择排序核心思想和冒泡类似，都是一次排序后把最小的元素放到最前面。不同的是选择排序是在确定最小的数之后进行交换。选择排序的时间复杂度为O(n^2)

```java
public static void selectSort(int[] array) {
    if (array == null || array.length == 0)
        return;
    for (int i = 0; i < array.length - 1; i++) {
        int minIndex = i;
        for (int j = i + 1; j < array.length; j++) {
            if (array[j] < array[minIndex]) {
                minIndex = j;
            }
        }
        if (minIndex != i) {
            swap(array, i, minIndex);
        }
    }
}
```

#### 3.插入排序

插入排序不是通过交换位置而是通过比较找到合适的位置插入元素来达到排序的目的的。就如打扑克牌在分牌时可能要整理自己的牌，牌多的时候怎么整理呢？就是拿到一张牌，找到一个合适的位置插入。这个原理其实和插入排序是一样的。举个栗子，对5,3,8,6,4这个无序序列进行简单插入排序，首先假设第一个数的位置时正确的，想一下在拿到第一张牌的时候，没必要整理。然后3要插到5前面，把5后移一位，变成3,5,8,6,4.想一下整理牌的时候应该也是这样吧。然后8不用动，6插在8前面，8后移一位，4插在5前面，从5开始都向后移一位。注意在插入一个数的时候要保证这个数前面的数已经有序。简单插入排序的时间复杂度也是O(n^2)。

```java
    public static void insertSort(int[] array) {
        if (array == null || array.length == 0)
            return;
        for (int i = 1; i < array.length; i++) {
            int j = i;
            int target = array[j];//等待插入的
            //后移
            while (j > 0 && target < array[j - 1]) {
                array[j] = array[j - 1];
                j--;
            }
            //插入
            array[j] = target;
        }
    }
```

#### 4.快速排序

Todo