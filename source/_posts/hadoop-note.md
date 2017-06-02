---
title: Hadoop学习笔记
date: 2017-05-31 18:23:39
tags: [Hadoop]
---

1.查看Hadoop安装目录

```
$HADOOP_HOME
```

2.启动Hadoop

```
cd $HADOOP_HOME
sh sbin/start-all.sh
```

3.关闭Hadoop

```
cd $HADOOP_HOME
sh sbin/stop-all.sh
```

#### HDFS

* 解决Call to localhost/127.0.0.1:9000 failed on connection exception错误

  ```
  hadoop namenode -format
  进入Hadoop安装目录后执行 sbin/start-dfs.sh
  ```


* hdfs上新建文件夹

  ```
  hadoop dfs -mkdir /darren
  ```


* hdfs上删除文件夹 

  ```
  hadoop dfs -rm /darren
  ```


* 本地文件推送到hadoop目录中

  ```
  hadoop dfs -put /Users/darrenfantasy/work/log /darren
  ```

* 合并某个文件夹里的全部文件

  ```
  hadoop dfs -getmerge /darren/log /Users/darrenfantasy/work/result.txt
  ```



​	==============分析日志时用到的相关命令=============

* 将search.txt中包含“/gifs/search”，“/emojis/net/search”，“/stickers/search”的所在行筛选出来到result.txt中

  ```
  grep -E '/gifs/search|/emojis/net/search|/stickers/search' search.txt >result.txt
  ```


* 批量解压gz文件

  ```
  for i in $(ls *.gz);do gzip -d $i;done
  ```

* 去除解压后文件里的脏数据（如含”哈哈“和”呵呵“的都视为脏数据）

  ```
  for i in $(ls *);do grep -v '呵呵' $i | grep -v '哈哈' > $i.txt;done
  ```

#### MapReduce

MapReduce是一种编程模型，用于大规模数据集的并行运算。概念“Map（映射）”和“Reduce（归约）”是它们的主要思想。