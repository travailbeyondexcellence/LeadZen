# 📦 APK Publishing Guide - LeadZen Mobile App

This guide provides step-by-step instructions for generating a signed release APK for distribution.

## 🔐 Prerequisites

- Android SDK and build tools installed
- Java/JDK configured
- React Native project built successfully in debug mode

## 📋 Step-by-Step Process

### Step 1: Generate Signing Key (First Time Only)

Navigate to the app directory and generate a keystore:

```bash
cd Frontend/Web/Mobile/android/app
keytool -genkeypair -v -storetype PKCS12 -keystore leadzen-release-key.keystore -alias leadzen-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

**You'll be prompted for:**
- **Keystore password** - Choose a strong password and remember it!
- **Key password** - Can be the same as keystore password
- **Your details:**
  - First and last name
  - Organizational unit
  - Organization name
  - City or locality
  - State or province
  - Two-letter country code

**⚠️ IMPORTANT:** Keep your keystore file and passwords safe! You'll need them for all future app updates.

### Step 2: Configure Gradle for Release Signing

Edit the file: `Frontend/Web/Mobile/android/app/build.gradle`

Find the `android` section and add the signing configuration:

```gradle
android {
    ...
    signingConfigs {
        release {
            if (project.hasProperty('LEADZEN_UPLOAD_STORE_FILE')) {
                storeFile file(LEADZEN_UPLOAD_STORE_FILE)
                storePassword LEADZEN_UPLOAD_STORE_PASSWORD
                keyAlias LEADZEN_UPLOAD_KEY_ALIAS
                keyPassword LEADZEN_UPLOAD_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        release {
            ...
            signingConfig signingConfigs.release
            minifyEnabled enableProguardInReleaseBuilds
            proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
        }
    }
}
```

### Step 3: Create Gradle Properties File

Create or edit: `Frontend/Web/Mobile/android/gradle.properties`

Add these properties (replace with your actual passwords):

```properties
# Signing Configuration
LEADZEN_UPLOAD_STORE_FILE=leadzen-release-key.keystore
LEADZEN_UPLOAD_KEY_ALIAS=leadzen-key-alias
LEADZEN_UPLOAD_STORE_PASSWORD=your_keystore_password_here
LEADZEN_UPLOAD_KEY_PASSWORD=your_key_password_here

# Build Optimization
org.gradle.jvmargs=-Xmx2048m -XX:MaxPermSize=512m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8
org.gradle.parallel=true
org.gradle.configureondemand=true
org.gradle.daemon=true

# Android Build Settings
android.useAndroidX=true
android.enableJetifier=true
```

### Step 4: Generate Release APK

Clean and build the release APK:

```bash
cd Frontend/Web/Mobile/android
./gradlew clean
./gradlew assembleRelease
```

**Alternative single command:**
```bash
cd Frontend/Web/Mobile/android && ./gradlew clean && ./gradlew assembleRelease
```

### Step 5: Locate Your APK

The signed release APK will be generated at:
```
Frontend/Web/Mobile/android/app/build/outputs/apk/release/app-release.apk
```

## 🚀 Quick Reference Commands

```bash
# Navigate to project root
cd Frontend/Web/Mobile

# Generate keystore (first time only)
cd android/app
keytool -genkeypair -v -storetype PKCS12 -keystore leadzen-release-key.keystore -alias leadzen-key-alias -keyalg RSA -keysize 2048 -validity 10000

# Return to android directory
cd ..

# Clean and build release APK
./gradlew clean && ./gradlew assembleRelease

# Your APK location:
# android/app/build/outputs/apk/release/app-release.apk
```

## 📱 Distribution Options

### Option 1: Direct Installation
1. Transfer APK to Android device
2. Enable "Install from Unknown Sources" in device settings
3. Open APK file to install

### Option 2: File Sharing
- **Email**: Attach APK file
- **Cloud Storage**: Upload to Google Drive, Dropbox, etc.
- **File Transfer**: Use ADB, USB, or wireless transfer

### Option 3: Internal Distribution
- **Firebase App Distribution**: For team testing
- **TestFlight equivalent**: For internal testing
- **QR Code**: Generate QR codes for easy download

### Option 4: Play Store Publishing
1. Create Google Play Developer account
2. Upload APK to Google Play Console
3. Complete store listing and compliance
4. Submit for review

## 🔧 Troubleshooting

### Common Issues:

**Issue**: `Keystore file not found`
```bash
# Solution: Ensure keystore is in correct location
ls android/app/leadzen-release-key.keystore
```

**Issue**: `Signing config not found`
```bash
# Solution: Check gradle.properties file exists and has correct values
cat android/gradle.properties
```

**Issue**: `Build failed - ProGuard errors`
```bash
# Solution: Disable ProGuard temporarily
# In build.gradle, set: minifyEnabled false
```

**Issue**: `Out of memory during build`
```bash
# Solution: Increase heap size in gradle.properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=1024m
```

## 📋 Release Checklist

Before distributing your APK:

- [ ] Test APK on multiple devices
- [ ] Verify all features work correctly
- [ ] Check app icons and splash screens
- [ ] Ensure no debug logs in production
- [ ] Test app permissions and overlays
- [ ] Verify floating overlay functionality
- [ ] Test call detection features
- [ ] Confirm app runs without Metro bundler
- [ ] Check app version and build number
- [ ] Backup keystore file safely

## 🔒 Security Notes

1. **Never commit keystore files to version control**
2. **Store passwords securely** (password manager recommended)
3. **Keep keystore backup** in secure location
4. **Use different signing for debug vs release**
5. **Regularly update dependencies** for security patches

## 📝 Version Management

Update version for each release in:
```
Frontend/Web/Mobile/android/app/build.gradle
```

```gradle
android {
    ...
    defaultConfig {
        ...
        versionCode 1          // Increment for each release
        versionName "1.0.0"    // User-facing version number
    }
}
```

## 🎯 Success Indicators

Your APK is ready when:
- ✅ Build completes without errors
- ✅ APK file exists in outputs directory
- ✅ APK installs successfully on test device
- ✅ All app features work correctly
- ✅ No debug indicators visible
- ✅ App launches without Metro dependency

---

**Created:** $(date)  
**Project:** LeadZen Mobile Application  
**Platform:** React Native Android