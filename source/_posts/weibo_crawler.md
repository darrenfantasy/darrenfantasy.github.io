---
title: Python实现微博爬虫
date: 2017-03-29 13:44:58
tags: [python,crawler]
---

想获取某人发的所有微博信息，发现新浪微博的API里存在局限性，不仅需要申请高级接口，而且还要用户授权才能获取他发的全部微博。既然没有接口，那么就自己写个爬虫吧！

先附上项目代码地址：<a href="https://github.com/darrenfantasy/image_crawler/tree/master/SinaWeibo" target="_blank">微博爬虫源码</a>

项目的执行需要安装 selenium,requests以及BeautifulSoup库，还需要chromeDriver来配合。

首先，我们要在浏览器里打开微博去分析获取某个人的微博都需要哪些参数，以及调用了哪些请求。

分析得出结果如下：

1. 获取微博的请求都需要有一个cookie，并且cookie存在的有效时间还是比较长的。

2. 登录微博多次会需要验证码，为了避免验证码的阻碍，尽量把cookie存起来，等cookie失效了再去模拟登录获取cookie。

3. 微博的每一页可以分为3屏，首屏的接口与2，3屏接口不一致。下面4，5两点的接口用的是**MRJ台湾官方**的微博为例子。

4. 每一页的首屏接口为：http://weibo.com/mrj168?is_all=1&profile_ftype=1&page=1 page为第几页

5. 每一页的2，3屏接口为：http://weibo.com/p/aj/v6/mblog/mbloglist?ajwvr=6&domain=100505&pagebar=0&is_tag=0&is_search=0&pre_page=1&profile_ftype=1&id=1005051837498771&script_uri=%2Fmrj168&feed_type=0&__rnd=1490768727000&pl_name=Pl_Official_MyProfileFeed__22&is_all=1&domain_op=100505&page=1 需要修改的参数为pagebar,第二屏和第三屏分别为0，1。以及pre_page和page均为第几页。rnd为当前时间戳，单位是毫秒。id为100505+“微博的ID”，script_uri为“/”+“个性域名”或者"/"+"/u/"+"微博的ID"

   ​

通过以上的分析，把逻辑转换成代码。大致流程如下：

```python
result = is_valid_cookie()
print result
if result == False:
	driver = webdriver.Chrome("/Users/fantasy/Downloads/chromedriver")#打开Chrome
	driver.maximize_window()#将浏览器最大化显示
	driver.get(weibo_url)#打开微博登录页面
	time.sleep(10)#因为加载页面需要时间，所以这里延时10s来确保页面已加载完毕
	cookie = login_weibo_get_cookies()
	save_cookie(cookie)
	save_cookie_update_timestamp(get_timestamp())
else :
	cookie = get_cookie_from_txt()
for x in xrange(1,page_size+1):
	profile_html = get_object_top_weibo_by_person_site_name_and_cookie(person_site_name,cookie,x)
	image_url_list = get_img_urls_form_html(profile_html)
	write_image_urls(image_url_list)
	for y in xrange(0,2):#有两次下滑加载更多的操作
		print "pagebar:"+str(y)
		html = get_object_weibo_by_weibo_id_and_cookie(weibo_id,person_site_name,cookie,y,x)
		image_url_list = get_img_urls_form_html(html)
		write_image_urls(image_url_list)
```

首先判断本地是否存在有效的Cookie，如果Cookie不存在或者过期了，那么使用webdriver去打开微博登录并获取Cookie，然后更新本地的Cookie和更新时间。如果Cookie有效，则直接读取本地的Cookie。

有了Cookie之后，我们就可以拿着Cookie去调用上面分析出的两个接口啦！

1. 通过个性域名和Cookie及页码去请求某一页的首屏。
2. 通过微博ID和个性域名及页码和第几屏去获取某一页的第几屏。

接口返回的内容并不是json，而是HTML格式的文本，所以需要我们自己去解析。这里我使用的是BeautifulSoup来分析HTML的元素的。

以每页首屏的接口为例子：

```python
def get_object_top_weibo_by_person_site_name_and_cookie(person_site_name,cookie,page):#每一页顶部微博
	try:
		profile_url = weibo_url+person_site_name+"?"
		headers["Cookie"] = cookie
		profile_request_params["page"] = page
		response = requests.get(profile_url,headers=headers,params=profile_request_params)
		print response.url
		html = response.text
		soup = BeautifulSoup(html,"html.parser")
		script_list = soup.find_all("script")
		script_size = len(script_list)
		print "script_size:"+str(script_size)
		tag = 0
		for x in xrange(script_size):
			if "WB_feed WB_feed_v3 WB_feed_v4" in str(script_list[x]):
				tag = x
		print "tag:"+str(tag)
		# print script_list[script_size-1]
		html_start = str(script_list[tag]).find("<div")
		html_end = str(script_list[tag]).rfind("div>")
		# print str(script_list[tag])[html_start:html_end+4]
		return str(str(script_list[tag])[html_start:html_end+4])
	except Exception, e:
		print e
	finally:
		pass
```

接口返回的数据包含了很多东西，有30多个<script>标签，分析发现微博的内容在一个包含“WB_feed WB_feed_v3 WB_feed_v4”内容的<script>标签中。所以我们找到这个<script>，然后去掉头尾的无用信息，就获取到了我们想要的内容所在的script里。

接下来就是解析数据了，这里我想获取的是所发的微博里面所包含的图片。

```python
def get_img_urls_form_html(html):#从返回的html格式的字符串中获取图片
	try:
		image_url_list = []
		result_html = html.replace("\\","")
		soup = BeautifulSoup(result_html,"html.parser")
		div_list = soup.find_all("div",'media_box')
		print "div_list:"+str(len(div_list))
		for x in xrange(len(div_list)):
			image_list = div_list[x].find_all("img")
			for y in xrange(len(image_list)):
				image_url = image_list[y].get("src").replace("\\","")
				print image_url
				image_url_list.append(image_url.replace("\"",""))			
		return image_url_list
	except Exception, e:
		print e
	finally:
		pass
```

直接使用find_all来获取所有图片，再用get("src")来获取图片的url。



然后我的微博爬虫就这样实现了，好像也不难的样子。。。但是面对微博接口返回的一大堆数据，需要耐心去分析。