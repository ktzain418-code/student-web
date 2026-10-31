// App History — Android app module build config.
// Merge these settings into android/app/build.gradle.kts after `npx cap add android`.

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.apphistory.tracker"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.apphistory.tracker"
        minSdk = 23            // Android 6.0+
        targetSdk = 34         // Android 14
        versionCode = 1
        versionName = "1.0.0"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro",
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("com.getcapacitor:core:6.2.0")
    implementation("com.getcapacitor:android:6.2.0")
}
