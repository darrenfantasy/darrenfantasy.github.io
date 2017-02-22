---
title: 用Python实现爬虫需要掌握的基本知识
date: 2017-02-22 14:19:14
tags: [python,crawler]
---

最近在用python爬取一些网站的图片，学习期间遇到一些问题，也收获了一些知识，现在整理下有关内容。



- Python基础知识的学习

  整理中。。。

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

  ​