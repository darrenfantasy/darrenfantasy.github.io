---
title: mac终端下实现翻墙
date: 2017-08-16 20:45:25
tags: [tools]
---

最近使用Shadowsocks翻墙时，发现了一个问题，在浏览器上可以翻墙，但是我想在mac终端上翻墙，一直访问不了，后来在终端里查了ip发现还是实际的IP，并不是代理的IP。

```
darrenfantasydeMacBook-Pro:~ darrenfantasy$ curl ip.cn
当前 IP：101.81.*.* 来自：上海市 电信
```

感到非常疑惑，我明明是选的全局代理模式啊！！！

查了原因才知道，**Shadowsocks在Mac OS下只支持sockets代理，无法使用http代理，导致我们只能浏览网页而无法在终端，AS等工具上使用http代理达到翻墙的目的，但是我们可以借助polipo工具实现socket数据转http的方式达到翻墙的目的。**

具体步骤：

首先需要安装polipo

```shell
brew install polipo
```

修改 .bash_profile文件

```shell
open -t ~/.bash_profile
```

添加如下内容

```shell
#proxy 
POLIPO='127.0.0.1:8123'
defp='127.0.0.1:1080'

# No Proxy
function noproxy
{
    unset http_proxy HTTP_PROXY https_proxy HTTPS_PROXY all_proxy ALL_PROXY ftp_proxy FTP_PROXY dns_proxy DNS_PROXY JAVA_OPTS GRADLE_OPTS MAVEN_OPTS
    echo "clear proxy done"
}

function setproxy
{
    if [ $# -eq 0 ]
    then
        inArg=$defp
    else
        inArg=$1
    fi
    HOST=$(echo $inArg |cut -d: -f1)
    PORT=$(echo $inArg |cut -d: -f2)
    http_proxy=http://$HOST:$PORT
    HTTP_PROXY=$http_proxy
    all_proxy=$http_proxy
    ALL_PROXY=$http_proxy
    ftp_proxy=$http_proxy
    FTP_PROXY=$http_proxy
    dns_proxy=$http_proxy
    DNS_PROXY=$http_proxy
    https_proxy=$http_proxy
    HTTPS_PROXY=$https_proxy
    JAVA_OPTS="-Dhttp.proxyHost=$HOST -Dhttp.proxyPort=$PORT -Dhttps.proxyHost=$HOST -Dhttps.proxyPort=$PORT"
    GRADLE_OPTS="-Dgradle.user.home=$HOME/.gradle"
    MAVEN_OPTS=$JAVA_OPTS
    no_proxy="localhost,127.0.0.1,localaddress,.localdomain.com,.coding.net,192.168.99.100,.ruby-china.org"
    echo "current proxy is ${http_proxy}"
    export no_proxy http_proxy HTTP_PROXY https_proxy HTTPS_PROXY all_proxy ALL_PROXY ftp_proxy FTP_PROXY dns_proxy DNS_PROXY JAVA_OPTS GRADLE_OPTS MAVEN_OPTS
}

```

然后执行

```
source .bash_profile 
```

source 命令通常用于重新执行刚修改的初始化文件。

然后执行

```
 polipo socksParentProxy=localhost:1080 &
```

会出现

```
 Established listening socket on port 8123.
```

最后执行

```
setproxy localhost:8123
```

我们再来试一下

```
darrenfantasydeMacBook-Pro:~ darrenfantasy$ curl ip.cn
当前 IP：172.96.*.* 来自：美国 
```

**大功告成！！！**

