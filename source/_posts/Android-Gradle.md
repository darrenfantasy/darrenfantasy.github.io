---
title: Android-Gradle
date: 2016-10-17 15:54:36
tags: [Android]
---
Android build.gradle笔记

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