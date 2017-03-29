---
title: Python实现爬虫要掌握的基本知识
date: 2017-02-22 14:19:14
tags: [python,crawler]
---

最近在用python爬取一些网站的图片，学习期间遇到一些问题，也收获了一些知识，现在整理下有关内容。



- **Python基础知识的学习**

  这里就简单整理了我爬虫中使用到的，并且与Java语法不同的地方。

  1. 首先，python文件开头都会有一个

     ```python
     #!/usr/bin/python
     ```

     这是用来指定用什么解释器运行脚步以及解释器所在的位置。

  ​

  2. Python2.X中默认编码是ASSCII格式，在没有修改编码格式时读取中文会出错。需要在头部指定编码。

     ```python
     #coding:utf-8
     ```

     Python3.X源码文件默认使用utf-8编码，所以可以正常解析中文，无需指定utf-8。

     ​

  3. Python中变量赋值不需要类型声明

     ```python
     name = "darrenFantasy"
     ```

     ​

  4. Python字符串

     ```python
     #!/usr/bin/python
     #coding:utf-8
     name = "darrenFantasy"
     print name[0] #输出字符串中第一个字符
     print name[2:5] #输出字符串中第三个至第五个之间的字符串
     print name[6:] #输出从第七个字符开始的字符串
     print name * 2 #输出字符串两次
     print name[-2:]#输出最后两位
     print name.find("a")#找第一个a字符的位置
     print name.rfind("a")#找最后一个a字符的位置
     print name.strip("darren")
     print name.rstrip("tasy")
     ```

     结果：

     ```python
     d
     rre
     Fantasy
     darrenFantasydarrenFantasy
     sy
     1
     10
     fantasy
     darrenfan
     ```

     strip函数

     声明：s为字符串，rm为要删除的字符序列

     s.strip(rm)        删除s字符串中开头、结尾处，位于 rm删除序列的字符

     s.lstrip(rm)       删除s字符串中开头处，位于 rm删除序列的字符

     s.rstrip(rm)      删除s字符串中结尾处，位于 rm删除序列的字符

     1. 当rm为空时，默认删除空白符（包括'\n', '\r',  '\t',  ' ')

     2. 这里的rm删除序列是只要边（开头或结尾）上的字符在删除序列内，就删除掉。

        ```python
        name = "darrenfantasy"
        print name.strip("adrrn")
        print name.rstrip("tasy")
        ```

        ```python
        enfantasy
        darrenfan
        ```

     ​

     Java里可以直接String+int

     ```java
     int i = 1;
     String name = "darrenFantasy";
     System.out.print(name + i);
     ```

     但是Python不能这样，Python必须使用str()函数把int转成String，才能拼接字符串。

     ​

  5. Python条件语句

     ```python
     if 判断条件:
     	pass #do something
     else:
         pass #do something
     ```

     ​

  6. Python循环语句

     ```python
     for x in range(10):
     	print x
     ```

     ```python
     0
     1
     2
     3
     4
     5
     6
     7
     8
     9
     ```

     ​

     for循环 1到10

     ```python
     for x in range(1,10+1):
     	print x
     ```

     range(start,stop,step)，step默认1。

     ​

     遍历某个list

     ```python
     List = ["1","2","3","4","5"]
     for x in xrange(len(List)):
        print List[x]
     ```

     range和xrange的区别（python2x）

     1. range()返回整个list,xrange()返回的是一个xrange object,且这个对象是一个iterable。
     2. xrange的性能更好。

     ​

  7. Python函数

     ```python
     def function(parameters):
     	pass #do something
     ```

     ​

  8. Python文件操作

     创建文件：

     ```python
     file = open('f.txt','w') #直接打开一个文件，如果文件不存在则创建文件
     ```

     通常，文件使用模式 'r','w','a' 来打开，分别代表，读取，写入，追加。

     'r' 模式打开已经存在的文件。

     'w' 模式打开的文件若存在则首先清空，再加入内容。

     'a' 这个模式是追加内容到文件中。

     另一种创建文件的方法

     ```python
     import os
     os.system("touch test.txt") 
     ```

     读取文件：

     read() 一次读取全部的文件内容。

     readline() 每次读取文件的一行。

     readlines() 读取文件的所有行，返回一个字符串列表。

     最后，使用完记得关闭文件 file.close();

     ​

- **urllib2库的基本使用**

  urllib2是Python获取URL(Uniform Resource Locator)的一个组建。它以urlopen 函数的形式提供了一个非常简单的接口。

  urlopen函数可以传入一个简单的url，也可以传入一个request。

  1.  urlopen(url,data,timeout)

     第一个参数为URL，第二个参数data是访问URL时要传送的数据，第三个timeout是设置超时时间。

  ```python
     import urllib2
     response = urllib2.urlopen("http://darrenfantasy.com/")
     html = response.read()
  ```

     执行urlopen方法后返回一个response对象，它有一个read方法，可以返回获取到的网页内容。

  2. urlopen还能传入一个request对象

     ```python
     import urllib2
     request = urllib2.Request(url,data,headers)
     response = urllib2.urlopen(request)
     the_page = response.read()
     ```

     data是你希望发送到URL的数据。

     headers是http请求头，有些网站不希望被程序访问，会防爬。默认的urllib2把自己作为“Python-urllib/x.y”(x和y是Python主版本和次版本号,例如Python-urllib/2.5)，可能有些网站会拒绝返回信息，这就需要我们模拟浏览器操作了，修改headers信息，浏览器确认自己身份是通过User-Agent头。（期间，自己爬一个网站，伪装成浏览器，但是还是被拒绝访问，后来改用requests库结果可以了）

     ​

- **使用requests库**

  因为之前使用urllib2被网站拒绝，后来研究发现使用requests库可以获取页面内容。

  参考自 <a href="http://cn.python-requests.org/zh_CN/latest/user/quickstart.html" target="_blank">requests</a>

  1. *发送请求*

     ```python
     import requests
     response = requests.get("http://darrenfantasy.com/")
     ```

     requests发送一个post请求

     ```python
     response = requests.post("url")
     ```

  2. *给URL传递参数*

     requests允许你使用**params**关键字参数，以一个字典来提供这些参数。如下：

     ```python
     import requests
     myparams = {"key1":"value1","key2":"value2"}
     response = requests.get("http://darrenfantasy.com/",params = myparams)
     print response.url
     ```

     输出该url

     ```python
     http://darrenfantasy.com/?key2=value2&key1=value1
     ```

  3. *响应内容*

     ```python
     import requests
     response = requests.get("http://darrenfantasy.com/")
     print response.text
     ```

     requests会自动解码来自服务器的内容。请求发出后，requests会基于http头部对响应的编码作出推测。

     当你访问**response.text**时，requests会使用其推测的文本编码。你可以使用**response.encoding**属性来改变它

     ```python
     import requests
     response = requests.get("http://darrenfantasy.com/")
     response.encoding = "utf-8"
     print response.text
     ```

  4. *Json响应内容*

     requests中内置JSON解码器，可以帮助我们处理JSON数据

     ```python
     import requests
     response = requests.get("url")
     response.json()
     ```

  ​

- **Beautiful Soup的使用**

  Beautiful Soup是Python的一个库，主要功能是从网页抓取数据。

  <a href="http://beautifulsoup.readthedocs.io/zh_CN/latest/" target="_blank">官方文档</a>

  通常用来处理网页抓取数据，如下是获取一个网页里的全部 *图片标签*

  ```python
  from bs4 import BeautifulSoup
  def getImageTagsFromHtml(html):
      soup = BeautifulSoup(html, "html.parser")
      imageTagsList = soup.find_all('img')
      return imageTagsList
  ```
  获取img标签里src属性值

  ```python
  for x in xrange(len(imageTagsList)):
  	src = imageTagsList[x].get("src")
  ```

  获取某个特定的标签   

  例如 获取一个 *class="example"*   的div

  ```python
  from bs4 import BeautifulSoup
  def getImageTagsFromHtml(html):
      soup = BeautifulSoup(html, "html.parser")
      exampleDiv = soup.find('div',"example")
  ```



## update 17/03/16

(今天写爬虫时遇到了网站每隔10s更新一次cookie的问题，用PhantomJS可以获取到JS动态生成的cookie,所以就准备在每次用requests请求网页前执行一次JS文件，然后读取JS返回的cookie。)

**python模拟终端里执行的命令**

```python
import os
os.system("phantomjs test.js")//执行你想要执行的命令
```

