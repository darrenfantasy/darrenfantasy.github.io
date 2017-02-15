---
title: adb命令
date: 2016-10-25 15:58:40
tags: [Android]
---

adb(Android Debug Bridge)是android sdk里的一个工具。

可以用来运行设备shell命令
计算机和设备之间上传和下载文件
可将apk文件安装到安卓机设备上
adb 命令

https://developer.android.com/studio/command-line/adb.html#IntentSpec




adb shell 命令

https://developer.android.com/studio/command-line/shell.html#shellcommands

adb shell 命令包括am(activity manager)和pm(package manager)

关于一些am命令的介绍：

start [options] <INTENT> ：启动activity通过指定的intent参数。具体intent参数参照官方表。

startservice [options] <INTENT> ： 启动service通过指定的intent参数。具体intent跟start命令参数相同。

force-stop <PACKAGE> ： 强制停止指定的package包应用。

kill [options] <PACKAGE> ：杀死指定package包应用进程，该命令在安全模式下杀死进程，不影响用户体验。参数选项：--user <USER_ID> | all | current: 指定user进程杀死，如果不指定默认为所有users。（关于USER_ID下面会介绍到）

kill-all ：杀死所有的后台进程。

broadcast [options] <INTENT> ：发送一个intent。具体intent参数参照start命令参数。参数选项：--user <USER_ID> | all | current: 指定user进程杀死，如果不指定默认为所有users。

instrument [options] <COMPONENT> ：测试命令，不多作介绍。

profile start <PROCESS> <FILE> ：在<PROCESS>进程中运行profile，分析结果写到<FILE>里。

profile stop <PROCESS> ：停止profile。

set-debug-app [options] <PACKAGE> ：设置package包应用为debug模式。参数选项：-w|--persistent：等待进入调试模式，保留值。

clear-debug-app ：清空之前用set-debug-app命令设置的package包应用。


接下来介绍pm命令，pm全称package manager，你能使用pm命令去模拟Android行为或者查询设备上的应用等，当你在adb shell命令下执行pm命令：

pm <command>
你也可以在adb shell前执行pm命令：
adb shell pm uninstall com.example.MyApp
关于一些pm命令的介绍：
list packages [options] <FILTER> ：打印所有包，选择性的查询包列表。参数选项：-f：查看关联文件，即应用apk的位置跟对应的包名（如：package:/system/app/MusicPlayer.apk=com.sec.android.app.music）；-d：查看disabled packages；-e：查看enable package；-s：查看系统package；-3：查看第三方package；-i：查看package的对应安装者（如：1、package:com.tencent.qqmusic  installer=null 2、package:com.tencent.qqpim  installer=com.android.vending）；-u：查看曾被卸载过的package。（卸载后又重新安装依然会被列入）；--user<USER_ID>：The user space to query。

list permission-groups ：打印所有已知的权限群组。

list permissions [options] <GROUP> ：选择性的打印权限。参数选项：

list features ：设备特性。硬件之类的性能。

list libraries ：当前设备支持的libs。

list users ：系统上所有的users。（上面提到的USER_ID查询方式，如：UserInfo{0:Primary:3}那么USER_ID为0）

path <PACKAGE> ：查询package的安装位置。

install [options] <PATH> ：安装命令。

uninstall [options] <PACKAGE> ：卸载命令。

clear <PACKAGE> ：对指定的package删除所有数据。

enable <PACKAGE_OR_COMPONENT> ：使package或component可用。（如：pm enable "package/class"）

disable <PACKAGE_OR_COMPONENT> ：使package或component不可用。（如：pm disable "package/class"）（disable了指定的package，但是getComponentEnabledSetting该package里的components依然是enable状态的。disable-user一样原理。）

disable-user [options] <PACKAGE_OR_COMPONENT> ：参数选项：--user <USER_ID>: The user to disable.
grant <PACKAGE_PERMISSION> ：授权给应用。

revoke <PACKAGE_PERMISSION> ：撤销权限。

set-install-location <LOCATION> ：设置默认的安装位置。其中0：让系统自动选择最佳的安装位置。1：安装到内部的设备存储空间。2：安装到外部的设备存储空间。（这只用于调试应用程序，使用该命令可能导致应用程序退出或者其他不适的后果）。

get-install-location ：返回当前的安装位置。返回结果同上参数选项。

set-permission-enforced <PERMISSION> [true|false] ：使指定权限生效或者失效。

create-user <USER_NAME> ：增加一个新的USER。

remove-user <USER_ID> ：删除一个USER。

adb push 本地文件 手机目录：把电脑上的文件发送到手机上

adb pull 手机文件 本地路径：把手机上的文件拷贝到电脑里

adb devices 获取当前所有online设备 serial number

adb -s <serial number> shell 对某台设备进行操作