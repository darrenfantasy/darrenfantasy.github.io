---
title: JVM类加载机制学习
date: 2018-02-22 22:58:49
tags: [JVM,Java]
---

##### 主要分为4部分来学习

1.类加载过程

2.Java ClassLoader的类型

3.双亲委托机制

4.Android ClassLoader的类型

### 1.类加载过程

首先，在代码编译后，就会生成JVM（Java虚拟机）能够识别的二进制字节流文件（*.class）。而JVM把Class文件中的类描述数据从文件加载到内存，并对数据进行校验、转换解析、初始化，使这些数据最终成为可以被JVM直接使用的Java类型，这个说来简单但实际复杂的过程叫做**JVM的类加载机制**。

**一、类的加载**

我们平常说的加载大多不是指的类加载机制，只是类加载机制中的第一步加载。在这个阶段，JVM主要完成三件事：

1、通过一个类的全限定名（包名与类名）来获取定义此类的二进制字节流（Class文件）。而获取的方式，可以通过jar包、war包、网络中获取、JSP文件生成等方式。

2、将这个字节流所代表的静态存储结构转化为方法区的运行时数据结构。这里只是转化了数据结构，并未合并数据。（方法区就是用来存放已被加载的类信息，常量，静态变量，编译后的代码的运行时内存区域）

3、在内存中生成一个代表这个类的java.lang.Class对象，作为方法区这个类的各种数据的访问入口。这个Class对象并没有规定是在Java堆内存中，它比较特殊，虽为对象，但存放在方法区中。

**二、类的连接**

类的加载过程后生成了类的java.lang.Class对象，接着会进入连接阶段，连接阶段负责将类的二进制数据合并入JRE（Java运行时环境）中。类的连接大致分三个阶段。

**1、验证：**验证被加载后的类是否有正确的结构，类数据是否会符合虚拟机的要求，确保不会危害虚拟机安全。

**2、准备：**为类的静态变量（static filed）在方法区分配内存，并赋默认初值（0值或null值）。如static int a = 100;

静态变量a就会在准备阶段被赋默认值0。

对于一般的成员变量是在类实例化时候，随对象一起分配在堆内存中。

另外，静态常量（static final filed）会在准备阶段赋程序设定的初值，如static final int a = 666;  静态常量a就会在准备阶段被直接赋值为666，对于静态变量，这个操作是在初始化阶段进行的。

**3、解析：**将类的二进制数据中的符号引用换为直接引用。

**三、类的初始化**

类初始化是类加载的最后一步，除了加载阶段，用户可以通过自定义的类加载器参与，其他阶段都完全由虚拟机主导和控制。到了初始化阶段才真正执行Java代码。

**类的初始化的主要工作**是为静态变量赋程序设定的初值。

如static int a = 100;在准备阶段，a被赋默认值0，在初始化阶段就会被赋值为100。

Java虚拟机规范中严格规定了**有且只有五种情况必须对类进行初始化**：

1、使用new字节码指令创建类的实例，或者使用getstatic、putstatic读取或设置一个静态字段的值（放入常量池中的常量除外），或者调用一个静态方法的时候，对应类必须进行过初始化。

2、通过java.lang.reflect包的方法对类进行反射调用的时候，如果类没有进行过初始化，则要首先进行初始化。

3、当初始化一个类的时候，如果发现其父类没有进行过初始化，则首先触发父类初始化。

4、当虚拟机启动时，用户需要指定一个主类（包含main()方法的类），虚拟机会首先初始化这个类。

5、使用jdk1.7的动态语言支持时，如果一个java.lang.invoke.MethodHandle实例最后的解析结果REF_getStatic、REF_putStatic、RE_invokeStatic的方法句柄，并且这个方法句柄对应的类没有进行初始化，则需要先触发其初始化。



### 2.ClassLoader的类型

#### 1.BootStrap ClassLoader  (引导类加载器)

用C/C++代码实现的加载器，用于加载指定的JDK的核心类库，比如java.lang.*、java.uti.*等这些系统类。它用来加载以下目录中的类库：

- $JAVA_HOME/jre/lib目录
- -Xbootclasspath参数指定的目录

Java虚拟机的启动就是通过引导类加载器创建一个初始类来完成的。由于类加载器是使用平台相关的底层C/C++语言实现的， 所以该加载器不能被Java代码访问到。但是我们可以查询某个类是否被引导类加载器加载过。

#### 2.Extensions ClassLoader （扩展类加载器）

用于加载 Java 的拓展类 ，用来提供除了系统类之外的额外功能。它用来加载以下目录中的类库：

- 加载$JAVA_HOME/jre/lib/ext目录
- 系统属性java.ext.dir所指定的目录。

#### 3.Appliaction ClassLoader （应用程序类加载器）

又称作System ClassLoader(系统类加载器)，这是因为这个类加载器可以通过ClassLoader的getSystemClassLoader方法获取到。它用来加载以下目录中的类库：

- 当前应用程序Classpath目录
- 系统属性java.class.path指定的目录

用户自定义加载器，则是通过继承 java.lang.ClassLoader类的方式来实现自己的类加载器。



### 3.双亲委托机制

类加载器查找Class所采用的是双亲委托模式，所谓双亲委托模式就是首先判断该Class是否已经加载，如果没有则不是自身去查找而是委托给父加载器进行查找，这样依次的进行递归，直到委托到最顶层的Bootstrap ClassLoader，如果Bootstrap ClassLoader找到了该Class，就会直接返回，如果没找到，则继续依次向下查找，如果还没找到则最后会交由自身去查找。

```Java
protected Class<?> More ...loadClass(String name, boolean resolve)
        throws ClassNotFoundException
    {
        synchronized (getClassLoadingLock(name)) {
            Class<?> c = findLoadedClass(name);//1
            if (c == null) {
                long t0 = System.nanoTime();
                try {
                    if (parent != null) {
                        c = parent.loadClass(name, false);//2
                    } else {
                        c = findBootstrapClassOrNull(name);//3
                    }
                } catch (ClassNotFoundException e) {            
                }
                if (c == null) {
                    // If still not found, then invoke findClass in order
                    // to find the class.
                    long t1 = System.nanoTime();
                    c = findClass(name);//4
                    // this is the defining class loader; record the stats
                    sun.misc.PerfCounter.getParentDelegationTime().addTime(t1 - t0);
                    sun.misc.PerfCounter.getFindClassTime().addElapsedTimeFrom(t1);
                    sun.misc.PerfCounter.getFindClasses().increment();
                }
            }
           if (resolve) {
                resolveClass(c);
            }
           return c;
        }
    }
```

注释1处用来检查类是否已经加载，如果已经加载则后面的代码不会执行，最后会返回该类。没有加载则会接着向下执行。
注释2处，如果父类加载器不为null，则调用父类加载器的loadClass方法。如果父类加载器为null则调用注释3处的findBootstrapClassOrNull方法，这个方法内部调用了Native方法findBootstrapClass，findBootstrapClass方法中最终会用Bootstrap Classloader来查找类。如果Bootstrap Classloader仍没有找到该类，也就说明向上委托没有找到该类，则调用注释4处的findClass方法继续向下进行查找。

#### 采取双亲委托模式主要有两点好处：

1. 避免重复加载，如果已经加载过一次Class，就不需要再次加载，而是先从缓存中直接读取。
2. 更加安全，如果不使用双亲委托模式，就可以自定义一个String类来替代系统的String类，这显然会造成安全隐患，采用双亲委托模式会使得系统的String类在Java虚拟机启动时就被加载，也就无法自定义String类来替代系统的String类，除非我们修改类加载器搜索类的默认算法。还有一点，只有两个类名一致并且被同一个类加载器加载的类，Java虚拟机才会认为它们是同一个类，想要骗过Java虚拟机显然不会那么容易。



### 4.Android ClassLoader的类型

Java中的ClassLoader可以加载jar文件和Class文件（本质是加载Class文件），这一点在Android中并不适用，因为无论是DVM还是ART它们加载的不再是Class文件，而是dex文件，这就需要重新设计ClassLoader相关类。

Android中的ClassLoader类型和Java中的ClassLoader类型类似，也分为两种类型，分别是系统ClassLoader和自定义ClassLoader。其中系统ClassLoader包括三种分别是**BootClassLoader**、**PathClassLoader**和**DexClassLoader**。

* **BootClassLoader**

  Android系统启动时会使用BootClassLoader来预加载常用类，与Java中的BootClassLoader不同，它并不是由C/C++代码实现，而是由Java实现的。BootClassLoader是ClassLoader的内部类，并继承自ClassLoader。BootClassLoader是一个单例类，需要注意的是BootClassLoader的访问修饰符是默认的，只有在同一个包中才可以访问，因此我们在应用程序中是无法直接调用的。


* **PathClassLoader**

  Android系统使用PathClassLoader来加载系统类和应用程序的类。

  ```Java
  public class PathClassLoader extends BaseDexClassLoader {
      public PathClassLoader(String dexPath, ClassLoader parent) {
          super((String)null, (File)null, (String)null, (ClassLoader)null);
          throw new RuntimeException("Stub!");
      }

      public PathClassLoader(String dexPath, String librarySearchPath, ClassLoader parent) {
          super((String)null, (File)null, (String)null, (ClassLoader)null);
          throw new RuntimeException("Stub!");
      }
  }
  ```

  PathClassLoader继承自BaseDexClassLoader，实现也都在BaseDexClassLoader中。

  PathClassLoader的构造方法中没有参数optimizedDirectory，这是因为PathClassLoader已经默认了参数optimizedDirectory的值为：/data/dalvik-cache，很显然PathClassLoader无法定义解压的dex文件存储路径，因此PathClassLoader通常用来加载已经安装的apk的dex文件(安装的apk的dex文件会存储在/data/dalvik-cache中)。

* **DexClassLoader**

  DexClassLoader可以加载dex文件以及包含dex的压缩文件（apk和jar文件），不管是加载哪种文件，最终都是要加载dex文件。

  ```Java
  public class DexClassLoader extends BaseDexClassLoader {
      public DexClassLoader(String dexPath, String optimizedDirectory, String librarySearchPath, ClassLoader parent) {
          super((String)null, (File)null, (String)null, (ClassLoader)null);
          throw new RuntimeException("Stub!");
      }
  }
  ```

  DexClassLoader的构造方法有四个参数：

  * dexPath：dex相关文件路径集合，多个路径用文件分隔符分隔，默认文件分隔符为‘：’
  * optimizedDirectory：解压的dex文件存储路径，这个路径必须是一个内部存储路径，一般情况下使用当前应用程序的私有路径：`/data/data/<Package Name>/...`。
  * librarySearchPath：包含 C/C++ 库的路径集合，多个路径用文件分隔符分隔分割，可以为null。
  * parent：父加载器。

  DexClassLoader 继承自BaseDexClassLoader ，方法实现都在BaseDexClassLoader中。