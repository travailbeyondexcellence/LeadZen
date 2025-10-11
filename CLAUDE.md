# Claude Code Instructions

## Environment Limitations - CRITICAL

**Claude is running in WSL (Windows Subsystem for Linux):**
- **Development environment is Windows-based** (React Native, Android SDK, Node.js)
- **Claude CANNOT execute Windows commands** from WSL environment
- **Cross-platform compatibility issues** prevent direct command execution
- **All build tools are installed in Windows**, not accessible from WSL

## Build Commands - STRICT RULES

- **NEVER run** `npm install` or `npm i` commands - user will run these manually
- **NEVER run** `npm run dev` commands - user will run these manually  
- **NEVER run** `npm run android` commands - user will run these manually
- **NEVER run** `npx react-native start` or any Metro bundler commands - user will run these manually
- **NEVER run** `npm start` or `npm start --reset-cache` commands - user will run these manually
- **NEVER run** `bun install` commands - user will run these manually
- **NEVER run** any package installation commands - user will run these manually
- **NEVER run** `./gradlew` commands - Android Gradle wrapper is Windows-based
- **NEVER run** `adb` commands - Android Debug Bridge requires Windows Android SDK
- **ALWAYS provide** the folder location and exact command for user to run
- **ONLY provide instructions**, never execute installation commands

## WSL Limitations

**Commands Claude CANNOT run due to WSL environment:**
- `npm run android` - Requires Windows Android SDK
- `./gradlew clean` - Windows Gradle wrapper
- `adb devices` - Windows ADB installation
- Any Android emulator commands
- Metro bundler startup commands
- React Native CLI commands that interact with Android tools

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

## Role & Boundaries

**What Claude CAN do:**
- **Code Analysis** - Read and understand files
- **Code Implementation** - Write and modify source code
- **Configuration Changes** - Update config files
- **Documentation** - Create guides and documentation
- **Troubleshooting Guidance** - Analyze errors and provide solutions
- **File Operations** - Read, write, edit files in the codebase

**What Claude CANNOT do:**
- **Execute build commands** - User must run all build/run commands
- **Install dependencies** - User must run npm/yarn commands
- **Launch applications** - User must start Metro/Android builds
- **Direct device interaction** - User must handle ADB/emulator commands

## Quick Commands (FOR USER TO RUN)

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