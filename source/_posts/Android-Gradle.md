---
title: Android-Gradle学习
date: 2016-10-17 15:54:36
tags: [Android]
---
我们用 Android Studio 新创建一个项目时，会自动生成 3 个 Gradle 文件

**1.setting.gradle **

**2.根目录下的build.gradle**

**3.模块下的build.gradle**

### 1. setting.gradle

setting.gradle 文件在 **初始化过程中**被执行，构建器通过 setting.gradle 文件中的内容了解哪些模块将被 build，下面的内容表明当前项目中除了 app 模块还有另外一个叫做 “mylibrary” 的依赖模块：

include ‘:app’, ‘:mylibrary’

注意：单模块项目不一定需要有 setting 文件，但一旦有多个模块，必须要有 setting 文件，同时也要写明所有要构建的模块，否则 gradle 不会 build 不包括的模块。



### 2.根目录下的 build.gradle

根目录下的 build.gradle 文件是最顶层的构建文件，这里配置所有模块通用的配置信息。

默认的顶层 build.gradle 文件中包括两个代码块 (buildscript 和 allprojects):

```java
// Top-level build file where you can add configuration options common to all sub-projects/modules.
buildscript {
    repositories {
        jcenter()
        google()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:3.0.1'
    }
}

allprojects {
    repositories {
        jcenter()
        google()
    }
}
```

**buildscript** 
从名字就可以看出来，buildscript 是所有项目的构建脚本配置，主要包括依赖的仓库和依赖的 gradle 版本。

上图中 repositories 代码块将 jcenter 配置为一个仓库，jcenter 是一个很有名的 Maven 仓库。确定了依赖的仓库后，我们就可以在 dependencies 代码块中添加依赖的、在 jcenter 仓库中的包了。

dependencies 代码块用于配置构建过程中的依赖包，注意，这里是用于**构建过程**，因此不能把你的应用模块中需要依赖的库添加到这里。

默认情况下唯一被用于构建过程中的依赖包是 Gradle for Android 的插件。我们还可以添加一些其他用于构建的插件，比如 retrolambda, apt, freeline 等等。

**allprojects** 
allprojects 代码块用来声明将被用于所有模块的属性，注意是**所有模块**。常见的就是配置仓库地址（jcenter, 自定义 maven 仓库等），你还可以在 allprojects 中创建 tasks，这些 tasks 最终会运用到所有模块中。

### 3.模块下的 build.gradle

```java
apply plugin: 'com.android.application'

android {

    /**
     * 设置编译 sdk 和编译工具的版本
     */
    compileSdkVersion 24
    buildToolsVersion "24.0.3"
     
    /**
     * 关于签名, 请参考 google 官方文档 Sign Your App: https://developer.android.com/studio/publish/app-signing.html#debug-mode
     */
    signingConfigs {
        /**
         * As 会自动帮我们使用 debug certificate 进行签名. 这个 debug certificate 每次安装 As 都会变,
         * 因此不适合作为发布之用.
         */
        debug {
        }
     
        /**
         * 由于 Module-level Build Script(本文件) 也要放在 VCS 中管理, 所以不将密码等信息写在这里.
         * 一般的做法是: 在本机设置环境变量, 然后通过下面代码中演示的这种方式读取.
         * 当然, 最佳实践也指导我们将 `gradle.properties` 排除在 VCS 之外,
         * 此时, 也在该文件中将密码设置为变量, 然后在此读取使用.
         */
        release {
            storeFile file("$System.env.STORE_FILE")
            storePassword "$System.env.STORE_PASSWORD"
            keyAlias "$System.env.KEY_ALIAS"
            keyPassword "$System.env.KEY_PASSWORD"
        }
    }
     
    /**
     * 为所有的 build variants 设置默认的值. 关于 build variant, 我们后面会用一张图片说明
     */
    defaultConfig {
        applicationId "com.walfud.myapplication"
        minSdkVersion 23
        targetSdkVersion 24
        versionCode 1
        versionName "1.0"
        testInstrumentationRunner "android.support.test.runner.AndroidJUnitRunner"
    }
     
    /**
     * type 默认会有 debug 和 release. 不管你写不写都如此.
     * 通常, 我们在 debug 中保留默认值, release 中开启混淆, 并使用私有的签名
     */
    buildTypes {
        debug {
            // 使用默认值
        }
     
        release {
            // 混淆
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
     
            // 签名
            signingConfig signingConfigs.release
        }
    }
     
    /**
     * flavor 强调的是不同的版本, 比如付费版和免费版.
     * 在国内, 这个字段更多被用于区分不同的渠道, 即 360 渠道, 小米渠道等等.
     */
    productFlavors {
        m360 {}
        xiaomi {}
    }
     
    /**
     * 这个选项基本不用.
     * lt;a href="http://tools.android.com/tech-docs/new-build-system/user-guide/apk-splits"gt;官方说lt;/agt;: 使用 splits 可以比使用 flavor 更加有效创建多 apk.
     * 目前而言, 仅支持 Density 和 ABIs 这两个分类.
     */
    splits {
        // 按屏幕尺寸
        density {
            enable true
     
            // 默认包含全部分辨率, 这里是剔除一些我们不要的
            exclude "ldpi", "mdpi", "xxxhdpi", "400dpi", "560dpi", "tvdpi"
        }
     
        // 按架构
        abi {
            enable true
     
            // 使用 `reset()` 后, 我们就相当于不包含任何架构,
            // 这种情况下我们就可以通过 `include` 指定想要使用的架构
            reset()
     
            include 'x86', 'armeabi-v7a'
            universalApk true       // 是否同时生成一个包含全部 Architecture 的包
        }
    }

}

/**

- 这个项目的依赖
   */
  dependencies {
   /**
  - fileTree 导入 libs 目录下的所有 jar 文件
    */

    compile fileTree(dir: 'libs', include: ['*.jar'])

    /**
     * 想导入本地 aar, 首先需要指明本地 aar 的位置, 如下 `repositories` 中所示, 我们把 aar 放在了
     * Module-level 的 libs 目录下. 然后引用这个文件即可.
     */
    compile(name: 'components', ext: 'aar')

}

/**

- 配置了去哪里查找这个模块依赖文件
   */
  repositories {
   flatDir {
       dirs 'libs'
   }
  }
```

**Gradle**是一个基于Apache Ant和Apache Maven概念的项目**自动化建构**工具。它可以帮你管理项目中的差异,依赖,编译,打包,部署等,你可以定义满足自己需要的构建逻辑,写入到build.gradle中供日后复用。

### ApplicationId 与 PackageName 的区别

**package用于资源文件（R class）的命名控件和清单文件声明一些元素。**

**applicationId是google play（国内应用市场估计也是） 和android平台识别唯一app的方法。**

