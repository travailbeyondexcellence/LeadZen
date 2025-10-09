# Claude Code Instructions

## Build Commands - STRICT RULES

- **NEVER run** `npm install` or `npm i` commands - user will run these manually
- **NEVER run** `npm run dev` commands - user will run these manually  
- **NEVER run** `bun install` commands - user will run these manually
- **NEVER run** any package installation commands - user will run these manually
- **ALWAYS provide** the folder location and exact command for user to run
- **ONLY provide instructions**, never execute installation commands

## Android Build - RESOLVED ✅

The React Native Android build is now working successfully after fixing:

1. **C++ Compilation Issue**: Disabled new architecture in `android/gradle.properties`:
   ```
   newArchEnabled=false
   ```
   (The new architecture requires C++ compilation and was causing `rncli.h` errors)

2. **Missing Debug Keystore**: Generated `android/app/debug.keystore`:
   ```bash
   cd Frontend/Web/Mobile/android/app
   keytool -genkey -v -keystore debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"
   ```

## Project Structure

- Frontend/Web/Mobile - React Native mobile application (✅ Working)
- Main development happens in the mobile app directory

## Current Status
- ✅ React Native 0.73.6 configured correctly
- ✅ Android build working
- ✅ App installs and runs on emulator
- ✅ Metro bundler running on port 8081

## Quick Commands

**Clean Rebuild (use after installing native dependencies):**
```bash
cd android && ./gradlew clean && cd .. && npm run android
```

**Metro Server Commands:**
```bash
npm start                    # Normal start
npm start --reset-cache      # Start with cache reset
```

**Regular Reload (for JS-only changes):**
- Press Ctrl+M in emulator → Select "Reload"