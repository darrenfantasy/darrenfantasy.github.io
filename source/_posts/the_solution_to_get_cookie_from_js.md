---
title: Python＋(selenium-webdriver)破解JS加密的Cookie
date: 2017-03-24 11:18:46
tags:[python,爬虫]
---

之前抓取某个网站的时候遇到服务器返回521的问题，然后发现原因是因为网站需要cookie，并且网站的cookie是通过JS动态生成的，每隔一段时间会刷新cookie。后来研究发现可以通过phantomJS来获取JS动态生成的cookie。代码如下：(test.js)

```javascript
var page = require('webpage').create();
page.open("url", function (status) {//url是你想获取的网址
    page.evaluate(function() {
       // console.log(document.title); // => "test=test-value;"
    });
    //page.cookies就可以获取动态生成的cookies
    var cookie_value = page.cookies[0]['name']+"="+page.cookies[0]['value'];
    console.log("cookie_value:"+cookie_value);
  	//js将内容写入本地文件里
    var fs = require('fs')
	var filePath = './cookie.txt';//文件路径
    fs.write(filePath,cookie_value,'w');
    phantom.exit();
});
```

思路就是通过phantomJs来获取cookie，然后保存到本地文件，然后再用python在调取API之前去本地文件读取cookie加入到headers中。由于cookie会在一段时间内更新，所以可以间隔一段时间去调取上面这个test.js函数刷新本地存的cookie。在python中执行js,如下：

```python
import os
def get_cookie_from_txt():
	os.system("phantomjs test.js")
	f = open("./cookie.txt")
	lines = f.readlines()
	cookie = lines[0]
	print cookie
```

本来一切都运行的好好的时候，今天看了下情况发现JS代码运行报错了，Excuse me???（黑人问号）

排查发现：首次请求数据时，服务端返回动态的混淆加密过的JS，而这段JS的作用是给Cookie添加新的内容用于服务端验证，此时返回的状态码是521。浏览器带上新的Cookie再次请求，服务端验证Cookie通过返回数据。而我们的PhantomJS拿到加密的代码就不知道怎么办了。



因为对JS不是很熟悉，混淆过的加密代码也不是很懂。所以没准备破解它。

然后只能上大招了！！！用webdriver来启动浏览器然后打开你要获取cookie的网站。

我使用的是chrome浏览器。chromeDriver下载地址：https://sites.google.com/a/chromium.org/chromedriver/downloads

```python
from selenium import webdriver
driver = webdriver.Chrome("/Users/fantasy/Downloads/chromedriver")//启动chrome浏览器
driver.get(Url)//打开你想要访问的网址
cookies = driver.get_cookies()//获取cookies
```

通过以上方法就可以轻松获取到cookies了。

当cookie刷新时，你可以让浏览器刷新页面来获取最新的cookies

```python
driver.refresh()
```

当你要模拟网页中在文本框里输入内容并进行点击搜索时，可以采用下面方法

```python
driver.find_element_by_id("search_input_value").send_keys(keyword)//向指定的id控件里传值
driver.find_element_by_id("submit").click()//点击按钮
```