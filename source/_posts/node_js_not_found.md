---
title: node.js was not found
date: 2017-02-20 11:25:57
tags: [Node.js]
---

Node.js was not found in the default path. Please specify the location.

周末在家里用Sublime Text 2使用 HTML/CSS/JS Prettify 插件格式化代码时就报以下错误：
Node.js was not found in the default path. Please specify the location.
HTMLPrettify.sublime-settings中
<pre><code>
"node_path": {
    "windows": "C:/Program Files/nodejs/node.exe",
    "linux": "/usr/bin/node",
    "osx": "/usr/local/bin/node"
  }
</code></pre>
可是使用命令 "which node"发现node就存在"/usr/local/bin/node"里
后来不知怎么的重启sublime就可以使用格式化插件了，也没报错了。

今天在公司想使用 HTML/CSS/JS Prettify 又出现了同样的问题。
但是这次的原因是因为我要格式化的html文件里包含了中文路径而导致的，把中文路径改成英文路径即可使用。
