---
title: SDK开发学习小结
date: 2017-01-18 16:08:39
tags: [Android,Java]
---
以下为做表情云SDK开发时的一些小结
 

- 什么是SDK?

  SDK(SoftWare Development Kit)软件开发工具包。通常为辅助某软件而编写的特定软件包，框架集合等，一般包含相关文档，范例及工具。

  SDK主要包含Framework,API及Library这三部分。

  Framework定义了SDK整体的可重用设计，规定了SDK各功能模块的职责及依赖关系。

  各个功能模块体现为Library。

  API则是进行模块间内部通信和SDK对外提供服务的接口。

- SDK整体架构设计

  a.模块化开发

  b.组件化开发

  c.插件化开发


- SDK需实现的目标

  a.简洁易用

  b.稳定

  c.轻量

  d.高效

- API设计

  a.方法名能表明用途

  b.方法要明确其单一功能

  c.方法异常问题

  d.方法权限控制

  e.参数合法性校验

  f.避免参数过长

  g.避免直接返回NULL

  h.谨慎使用方法重载

  ​