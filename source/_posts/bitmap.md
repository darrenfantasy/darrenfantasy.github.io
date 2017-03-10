---
title: bitmap
date: 2016-09-27 15:44:20
tags: [Android]
---
整理了一些在学习和开发中遇到的关于bitmap相关的知识。



### inBitmap（2016-09-13）



最近公司需要开发一个可以播放动画的imageView,为了节约内存，每次内存里只存一个bitmap,但是发现memory波动还是比较大，后来研究发现inBitmap可以实现内存块的复用。以下为整理后的知识点。

BitmapFactory.Options 里的inBitmap属性可以实现复用内存块，不需要给这个bitmap重新申请新的内存块，避免了一次内存的分配和回收，从而提高了运行效率。


inBitmap只能在3.0以后使用。


使用inBitmap,在4.4之前（SDK 11- 18），只能重用大小相同的bitmap内存区域。4.4之后可以重用任何bitmap区域内存，只要这个内存比将要分配的bitmap内存大即可。



### Bitmap占用内存计算（2016-09-27）



Bitmap占用内存决定因素

－**图片的像素点个数**

－**单位像素占用的字节数**

bitmap大小＝图片长度(像素)＊图片宽度(像素)＊单位像素占用的字节数


单位像素所占的字节数与图片的解码方式有关。


**ALPHA_8 **只存储透明度信息而无颜色值。

**ARGB_8888** 把每个像素点的透明度，R，G，B色值都用一个byte表示。所以需要4个字节的空间来存储一个像素点。

**RGB_565 **不存储像素点的透明度，而且用5bit表示R值，6bit表示G值，5bit表示B值，即共16bit，也就是2个字节的空间来存储一个像素点。

所以对同一张图片进行解码时，使用RGB_565的方式解码所占内存空间仅仅是ARGB_8888的50%。



### 如何优雅的展示Bitmap大图 (2016-10-10)



我们在开发应用时经常会遇到展示图片的需求，大多数情况下，这些图片都会大于我们程序所需的大小，比如拍摄的照片的分辨率通常会比我们手机屏幕分辨率高的多。但是我们的应用程序的内存大小都是有限制的，程序占用过高内存会造成OOM。所以我们在展示高分辨率的内存时，最好将图片压缩成和我们用来展示图片的控件大小差不多。

BitmapFactory这个类提供了多种方法来创建Bitmap对象。

网络中的图片可以通过**decodeStream**方法来创建；SD卡里的图片可以通过**decodeFile**方法来创建；资源文件里的图片可以使用**decodeResource**方法来创建。

以上三种方法会为已经构建的bitmap分配内存，这样会容易导致OOM，为此每种解析方法都提供了可选择的**BitmapFactory.Options**参数，把这个参数的**isJustDecodeBounds**属性设为true就可以让解析方法不为bitmap分配内存了。返回值也就不在是一个Bitmap对象了，而是null。但是BitmapFactory.Options的outWidth和outHeight属性都会被赋值。我们获取到图片的长宽后就可以对图片进行压缩了。

```java
BitmapFactory.Options options = new BitmapFactory.Options();  
options.inJustDecodeBounds = true;  
BitmapFactory.decodeResource(getResources(), R.id.example_img, options);  
int imageHeight = options.outHeight;  
int imageWidth = options.outWidth; 
```



图片压缩可以通过**BitmapFactory.inSampleSize**来实现。

比如有一张1024＊1024像素的图，我们把inSampleSize设成4，就可以把图片压缩成256*256像素了。

以下函数根据传入的宽高，就可以计算出合适的inSampleSize:

```java
public static int calculateInSampleSize(BitmapFactory.Options options, int reqWidth, int reqHeight) {  
    // 源图片的高度和宽度  
    final int height = options.outHeight;  
    final int width = options.outWidth;  
    int inSampleSize = 1;  
    if (height > reqHeight || width > reqWidth) {  
        // 计算出实际宽高和目标宽高的比率  
        final int heightRatio = Math.round((float) height / (float) reqHeight);  
        final int widthRatio = Math.round((float) width / (float) reqWidth);  
        // 选择宽和高中最小的比率作为inSampleSize的值，这样可以保证最终图片的宽和高  
        // 一定都会大于等于目标的宽和高。  
        inSampleSize = heightRatio < widthRatio ? heightRatio : widthRatio;  
    }  
    return inSampleSize;  
} 
```

使用这个方法，首先你要将BitmapFactory.Options的inJustDecodeBounds属性设置为true，解析一次图片。然后将BitmapFactory.Options连同期望的宽度和高度一起传递到到calculateInSampleSize方法中，就可以得到合适的inSampleSize值了。之后再解析一次图片，使用新获取到的inSampleSize值，并把inJustDecodeBounds设置为false，就可以得到压缩后的图片了。

```java
public static Bitmap decodeSampledBitmapFromResource(Resources res, int resId, int reqWidth, int reqHeight) {  
    // 第一次解析将inJustDecodeBounds设置为true，来获取图片大小  
    final BitmapFactory.Options options = new BitmapFactory.Options();  
    options.inJustDecodeBounds = true;  
    BitmapFactory.decodeResource(res, resId, options);  
    // 调用上面定义的方法计算inSampleSize值  
    options.inSampleSize = calculateInSampleSize(options, reqWidth, reqHeight);  
    // 使用获取到的inSampleSize值再次解析图片  
    options.inJustDecodeBounds = false;  
    return BitmapFactory.decodeResource(res, resId, options);  
}  
```

最后，只要这样使用以下代码就可以将任意图片压缩成256*256了。

```
bitmap = decodeSampledBitmapFromResource(getResources(), R.id.example_img, 256, 256);
```