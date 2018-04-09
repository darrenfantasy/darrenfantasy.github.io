---
title: Java多态的理解
date: 2017-05-18 21:09:29
tags: [Java]
---

多态可以理解为：事物在运行中存在不同的状态。

多态存在的3个前提条件:

**1.要有继承关系。**

**2.子类要重写父类方法。**

**3.父类的引用指向子类对象。**

弊端就是：不能使用子类特有的成员属性和子类特有的成员方法。如果非要用到不可，可以强制类型转换。

下面以具体代码来说明

```Java
public class Animal {
    int num = 1;
    static int age = 2;

    public void eat() {
        System.out.println("动物吃饭");
    }

    public static void run() {
        System.out.println("动物在奔跑");
    }

}
```

```Java
public class Dog extends Animal {
    int num = 100;
    static int age = 101;
    String name = "HotDog";

    @Override
    public void eat() {
        System.out.println("狗啃骨头");
    }

    public static void run() {
        System.out.println("狗在奔跑");
    }

    public void drink() {
        System.out.println("狗在喝水");
    }
}
```

```Java
public class Test {
    public static void main(String[] args) {
        Animal animal = new Dog();
        animal.eat();
        animal.run();
        System.out.println(animal.num);
        System.out.println(animal.age);
        
//        animal.drink();//注释，一会说明
//        System.out.println(animal.name);//注释，一会说明
    }
}
```

运行结果：

```
狗啃骨头
动物在奔跑
1
2
```

从运行结果可以总结多态成员访问特点：

成员变量

编译看左边（父类），运行看左边（父类）；

成员方法

编译看左边（父类），运行看右边（子类）；动态绑定。

静态方法

编译看左边（父类），运行看左边（父类）；（静态和类相关，算不上重写，所以还是访问左边）

**只有非静态的成员方法,编译看左边,运行看右边。**



接下来看多态的弊端 ：**不能使用子类特有的属性和方法。**

可以通过代码得知子类Dog有一个特有属性 **String name = "HotDog";**

并且还有一个**drink()**方法，但是在测试类中调用子类的方法和输出子类特有的变量就会报错。

如果我们想使用子类的特有方法，那么就必须把这个父类指向子类的对象强转成子类的类型。

```Java
public class Test {
    public static void main(String[] args) {
        Animal animal = new Dog();
        animal.eat();
        animal.run();
        System.out.println(animal.num);
        System.out.println(animal.age);

//        animal.drink();//注释，一会说明
//        System.out.println(animal.name);//注释，一会说明

        Dog dog = (Dog) animal;
        dog.drink();
        System.out.println(dog.name);

    }
}
```

执行**Dog dog = (Dog) animal;**后，dog就指向最开始在堆内存里创建的Dog对象了。多态的魅力就在于此。