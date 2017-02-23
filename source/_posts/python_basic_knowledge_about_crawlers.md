---
title: 用Python实现爬虫需要掌握的基本知识
date: 2017-02-22 14:19:14
tags: [python,crawler]
---

最近在用python爬取一些网站的图片，学习期间遇到一些问题，也收获了一些知识，现在整理下有关内容。



- Python基础知识的学习

  这里就简单整理了我爬虫中使用到的，并且与Java语法不同的地方。

  1. 首先，python文件开头都会有一个

     ```
     #!/usr/bin/python
     ```

     这是用来指定用什么解释器运行脚步以及解释器所在的位置。

  ​

  2. Python2.X中默认编码是ASSCII格式，在没有修改编码格式时读取中文会出错。需要在头部指定编码。

     ```
     #coding:utf-8
     ```

     Python3.X源码文件默认使用utf-8编码，所以可以正常解析中文，无需指定utf-8。

     ​

  3. Python中变量赋值不需要类型声明

     ```
     name = "darrenFantasy"
     ```

     ​

  4. Python字符串

     ```
     #!/usr/bin/python
     #coding:utf-8
     name = "darrenFantasy"
     print name[0] #输出字符串中第一个字符
     print name[2:5] #输出字符串中第三个至第五个之间的字符串
     print name[6:] #输出从第七个字符开始的字符串
     print name * 2 #输出字符串两次
     ```

     结果：

     ```
     d
     rre
     Fantasy
     darrenFantasydarrenFantasy
     ```

     Java里可以直接String+int

     ```
     int i = 1;
     String name = "darrenFantasy";
     System.out.print(name + i);
     ```

     但是Python不能这样，Python必须使用str()函数把int转成String，才能拼接字符串。

     ​

  5. Python条件语句

     ```
     if 判断条件:
     	pass #do something
     else:
         pass #do something
     ```

     ​

  6. Python循环语句

     ```
     for iterating_var in sequence:
        statements(s)


     for x in range(1,10):
     	pass #do something
     ```

     ​

  7. Python函数

     ```
     def function(parameters):
     	pass #do something
     ```

     ​

  8. Python文件操作

     创建文件：

     ```
     file = open('f.txt','w') #直接打开一个文件，如果文件不存在则创建文件
     ```

     通常，文件使用模式 'r','w','a' 来打开，分别代表，读取，写入，追加。

     'r' 模式打开已经存在的文件。

     'w' 模式打开的文件若存在则首先清空，再加入内容。

     'a' 这个模式是追加内容到文件中。

     另一种创建文件的方法

     ```
     import os
     os.system("touch test.txt") 
     ```

     读取文件：

     read() 一次读取全部的文件内容。

     readline() 每次读取文件的一行。

     readlines() 读取文件的所有行，返回一个字符串列表。

     最后，使用完记得关闭文件 file.close();

     ​

- urllib2库的基本使用

  urllib2是Python获取URL(Uniform Resource Locator)的一个组建。它以urlopen 函数的形式提供了一个非常简单的接口。

  urlopen函数可以传入一个简单的url，也可以传入一个request。

  1.  urlopen(url,data,timeout)

     第一个参数为URL，第二个参数data是访问URL时要传送的数据，第三个timeout是设置超时时间。

     ```
     import urllib2
     response = urllib2.urlopen("http://darrenfantasy.com/")
     html = response.read()
     ```

     执行urlopen方法后返回一个response对象，它有一个read方法，可以返回获取到的网页内容。

  2. urlopen还能传入一个request对象

     ```
     import urllib2
     request = urllib2.Request(url,data,headers)
     response = urllib2.urlopen(request)
     the_page = response.read()
     ```

     data是你希望发送到URL的数据。

     headers是http请求头，有些网站不希望被程序访问，会防爬。默认的urllib2把自己作为“Python-urllib/x.y”(x和y是Python主版本和次版本号,例如Python-urllib/2.5)，可能有些网站会拒绝返回信息，这就需要我们模拟浏览器操作了，修改headers信息，浏览器确认自己身份是通过User-Agent头。（期间，自己爬一个网站，伪装成浏览器，但是还是被拒绝访问，后来改用requests库结果可以了）

     ​

- 使用requests库

  因为之前使用urllib2被网站拒绝，后来研究发现使用requests库可以获取页面内容。

  ```
  import requests
  response = requests.get("http://darrenfantasy.com/")
  print response.text
  ```

  ​

- Beautiful Soup的使用

  Beautiful Soup是Python的一个库，主要功能是从网页抓取数据。

  <a href="http://beautifulsoup.readthedocs.io/zh_CN/latest/">官方文档</a>

  通常用来处理网页抓取数据，如下是获取一个网页里的全部 *图片标签*

  ```
  from bs4 import BeautifulSoup
  def getImageTagsFromHtml(html):
      soup = BeautifulSoup(html, "html.parser")
      imageTagsList = soup.find_all('img')
      return imageTagsList
  ```