# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# React Native
-keep,allowobfuscation @interface com.facebook.proguard.annotations.DoNotStrip
-keep @com.facebook.proguard.annotations.DoNotStrip class *
-keepclassmembers class * {
    @com.facebook.proguard.annotations.DoNotStrip *;
}
-keep class * extends com.facebook.react.bridge.JavaScriptModule { *; }
-keep class * extends com.facebook.react.bridge.NativeModule { *; }
-keepclassmembers,includedescriptorclasses class * { native <methods>; }
-keepclassmembers class *  { @com.facebook.react.uimanager.annotations.ReactProp <methods>; }
-keepclassmembers class *  { @com.facebook.react.uimanager.annotations.ReactPropGroup <methods>; }
-keep,includedescriptorclasses class com.facebook.react.bridge.** { *; }

# Hermes
-keep class com.facebook.jni.** { *; }
-keep class com.facebook.hermes.** { *; }

# Kotlin + coroutines
-dontwarn kotlin.**
-dontwarn javax.annotation.**
-dontwarn org.jetbrains.annotations.**
-keepclassmembers class kotlin.Metadata { *; }

# Firebase / Play Services
-dontwarn com.google.firebase.**
-dontwarn com.google.android.gms.**

# OkHttp / Okio
-dontwarn okhttp3.**
-dontwarn okio.**

# Lottie
-dontwarn com.airbnb.lottie.**
-keep class com.airbnb.lottie.** { *; }

# SVG
-dontwarn com.horcrux.svg.**
-keep class com.horcrux.svg.** { *; }

# Fresco (react-native-image)
-dontwarn com.facebook.common.**
-dontwarn com.facebook.imagepipeline.**
-keep class com.facebook.common.** { *; }
-keep class com.facebook.imagepipeline.** { *; }

# Razorpay
-keep class com.razorpay.** { *; }
-dontwarn com.razorpay.**

# Notifee
-keep class io.invertase.notifee.** { *; }
-dontwarn io.invertase.notifee.**

# Jail-Monkey / Native modules
-dontwarn com.gant.**
-keep class com.gant.** { *; }

# Reanimated
-dontwarn com.swmansion.**
-keep class com.swmansion.** { *; }

# WebView
-dontwarn android.webkit.**
-dontwarn com.oney.WebRTCAndroid.**
