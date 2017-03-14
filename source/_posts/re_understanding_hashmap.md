---
title: 重新认识HashMap
date: 2017-03-13 18:12:49
tags: [Java]
---

我们在存储数据的时候经常会用到HashMap，之前只知道它是用来存储Key和对应Value的，非线程安全等基本使特性。但是对其内部实现原理却不是很清楚，今天想深入探究其实现原理。

首先对以下四个实现类的特点进行说明：

![](http://oic2oders.bkt.clouddn.com/blog_hashmap.png)

### HashMap

HashMap根据Key的hashCode值来存储数据的，大多情况下可以直接定位到它的值，因此访问速度也很快，但遍历顺序却是不确定的。HashMap最多允许一个Key为null，允许多个Value为null。是非线程安全的，即任一时刻有多个线程同时写HashMap，可能会导致数据的不一致。如果要实现线程安全，那么需要用Collections的sychronizedMap方法来使它具有线程安全，或者使用ConcurrentHashMap。

### HashTable

HashTable是遗留类，继承Dictionary类，映射的常用功能和HashMap相似，但是是线程安全的。并发行不如ConcurrentHashMap。不需要线程安全的时候可以用HashMap替换，需要线程安全时可用ConcurrentHashMap替换。

### LinkedHashMap

LinkedHashMap继承自HashMap，它保存了记录的插入顺序，在用迭代器（Iterator）遍历LinkedHashMap时，先得到的记录是先插入的，当然也可以在构造函数时带参数，按照访问次序排序。

### TreeMap

TreeMap实现SortedMap接口，能够把它保存的记录根据键排序，默认是按键值的升序排序，也可指定排序的比较器。在用迭代器遍历TreeMap时，得到的记录是排序过的。使用TreeMap时，Key必须实现Comparable接口或者在构造时传入自定义的Comparator，否则会在运行时抛出异常（java.lang.ClassCastException）



上述四种Map类型的类，要求key是不可变对象。不可变对象创建后它的哈希值不会被改变，如果对象的哈希值改变的话，那么Map对象很可能无法定位到映射的位置了。



### HashMap内部实现

HashMap是由数组＋链表＋红黑树（JDK1.8增加了红黑树）实现的。

![](http://oic2oders.bkt.clouddn.com/blog_hashmap_structure.png)

HashMap就是使用哈希表来存储的。Java中的HashMap采用**链地址法**来解决冲突。

链地址法，简而言之，就是数组加链表的结合。每个数组元素上都是一个链表结构。当Key进行Hash后，得到对应数组下标，然后把数据放在对应下标元素的链表上。

如下：

```
HashMap map = new HashMap();
map.put("darren","fantasy");
```

先把“darren”这个key进行hashCode()方法得到其hashCode值，然后再通过Hash算法的**高位运算**和**取模运算**来定位该键值对的存储位置。有时两个key会定位到相同位置，那么就表示发生了Hash碰撞。（Hash算法结果分散越均匀，Hash碰撞的概率就越小，map的存取效率也就越高。）

当哈希桶数组很大时，即使比较差的Hash算法也会比较分散，但是所需要的空间成本很大。哈希桶数组很小的时候，即使再好的Hash算法也会发生碰撞。那么如何解决这个问题呢？那么就需要好的哈希算法和扩容机制了。

在理解Hash和扩容之前，我们先了解HashMap里的几个字段。

```java
    /**
     * The default load factor. Note that this implementation ignores the
     * load factor, but cannot do away with it entirely because it's
     * mentioned in the API.
     *
     * <p>Note that this constant has no impact on the behavior of the program,
     * but it is emitted as part of the serialized form. The load factor of
     * .75 is hardwired into the program, which uses cheap shifts in place of
     * expensive division.
     */
    static final float DEFAULT_LOAD_FACTOR = .75F;//负载因子
    
       /**
     * The number of mappings in this hash map.
     */
    transient int size;//实际存在的键值对数量

    /**
     * Incremented by "structural modifications" to allow (best effort)
     * detection of concurrent modification.
     */
    transient int modCount;//记录HashMap内部结构发生变化的次数

    /**
     * The table is rehashed when its size exceeds this threshold.
     * The value of this field is generally .75 * capacity, except when
     * the capacity is zero, as described in the EMPTY_TABLE declaration
     * above.
     */
    private transient int threshold;//所能容纳键值对的临界值
```

首先，Node[] table的初始化长度length（默认值是16），**loadFactor负载因子**（默认值是0.75）**threshold**即所能容纳键值对的临界值是:threshold = length * loadFactor。当HashMap中容纳的键值对数目超过临界值时则进行扩容。扩容后的HashMap容量是之前的两倍。**size**这个字段是用来表示HashMap中实际存在的键值对数量。**modCount**是用来记录HashMap内部结构发生变化的次数。（内部结构变化是指结构发生变化，如put新的键值对，但某个键值对的value被覆盖则不属于结构变化。）



### 使用put方法进行分析

```java
    /**
     * Maps the specified key to the specified value.
     *
     * @param key
     *            the key.
     * @param value
     *            the value.
     * @return the value of any previous mapping with the specified key or
     *         {@code null} if there was no such mapping.
     */
    @Override public V put(K key, V value) {
        if (key == null) {
            return putValueForNullKey(value);
        }

        int hash = Collections.secondaryHash(key);
        HashMapEntry<K, V>[] tab = table;
        int index = hash & (tab.length - 1);//第三步：取模运算
        for (HashMapEntry<K, V> e = tab[index]; e != null; e = e.next) {
            if (e.hash == hash && key.equals(e.key)) {
                preModify(e);
                V oldValue = e.value;
                e.value = value;
                return oldValue;
            }
        }

        // No entry for (non-null) key is present; create one
        modCount++;
        if (size++ > threshold) {
            tab = doubleCapacity();
            index = hash & (tab.length - 1);
        }
        addNewEntry(key, value, hash, index);
        return null;
    }
```

```java
    public static int secondaryHash(Object key) {
        return secondaryHash(key.hashCode());//第一步：取Key的HashCode值
    }
```

```java
    private static int secondaryHash(int h) {
        // Spread bits to regularize both segment and index locations,
        // using variant of single-word Wang/Jenkins hash.
        h += (h <<  15) ^ 0xffffcd7d;
        h ^= (h >>> 10);
        h += (h <<   3);
        h ^= (h >>>  6);
        h += (h <<   2) + (h << 14);
        return h ^ (h >>> 16);//第二步：高位运算
    }
```

不管是增加，查找，删除，首先都要定位到哈希桶数组的位置。这里Hash算法采用了secondaryHash。取Key的HashCode值，高位运算，取模运算。（对应代码中的1，2，3步骤）

put方法的整个流程：

1. 如果Key为null，那么直接执行putValueForNullKey函数。（否则执行2）
2. 如果不为空，则算出Key所在哈希桶数组的位置。（接着执行3）
3. 遍历tab[index],即所在数组位置的链表，如果存在相同的Key，则覆盖value。（否则执行4）
4. 如果不存在相同的Key，那么判断实际存在的键值对数量是否超过临界值threshold，如果超过，则进行扩容。（接着执行5）
5. 将新的键值对插入对应数组下的链表中。