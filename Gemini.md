# Gemini Instructions for LeadZen CRM

## Build and Run Commands - STRICT RULES ⚠️

### ❌ NEVER RUN THESE COMMANDS
- **NEVER run** `npm run android` - User runs this manually
- **NEVER run** `npm start` - User runs Metro bundler manually  
- **NEVER run** `npx react-native start` - User controls Metro server
- **NEVER run** `npm run dev` - User runs development server manually
- **NEVER run** `npm start --reset-cache` - User handles Metro cache
- **NEVER run** `bun run android` - User runs build commands manually
- **NEVER run** any React Native run commands - User controls execution

### ✅ ALLOWED COMMANDS
- **CAN run** `npm install` - To solve dependency issues only
- **CAN run** `npm install [package-name]` - When adding new dependencies
- **CAN run** `npm install --save-dev [package]` - For dev dependencies
- **CAN run** `yarn install` - If project uses Yarn
- **CAN run** `cd android && ./gradlew clean` - To clean Android build cache
- **CAN run** `./gradlew clean` - From android directory for build cleanup
- **CAN run** dependency troubleshooting commands

## Permitted Actions

### Installation & Dependencies ✅
```bash
# These are ALLOWED when solving dependency issues:
npm install
npm install react-native-[package-name]
npm install --save-dev [dev-package]
npm audit fix
npm update
```

### Android Build Cleanup ✅
```bash
# These are ALLOWED for cleaning build cache:
cd Frontend/Web/Mobile/android && ./gradlew clean
./gradlew clean  # When already in android directory
./gradlew cleanBuildCache  # Clean all build caches
```

**Gradle Clean Responsibilities:**
- **MUST verify** clean command success
- **MUST report** any clean failures
- **MUST ensure** proper directory navigation
- **CAN run** multiple clean attempts if needed

### Code Implementation ✅
- Implement features and components
- Fix bugs and errors in code
- Modify existing files
- Create new files and components
- Update configurations
- Solve build errors through code changes

### Analysis & Documentation ✅
- Analyze existing code
- Read and understand project structure
- Create documentation
- Provide implementation guidance
- Debug code issues

## Forbidden Actions

### Build Execution ❌
```bash
# NEVER run these - User controls execution:
npm run android          # ❌ User runs this
npm start               # ❌ User controls Metro
npx react-native start  # ❌ User starts Metro
npm run dev             # ❌ User runs development
./gradlew assembleDebug  # ❌ User runs Android builds
./gradlew build         # ❌ User controls builds
```

### Server/Emulator Control ❌
- Do not start Metro bundler
- Do not launch Android emulator  
- Do not run the application
- Do not control development servers

## Project Context

### Current Setup
- **Framework:** React Native 0.73.6
- **Platform:** Android (Primary)
- **Database:** SQLite with AsyncStorage fallback
- **Navigation:** React Navigation 6
- **State:** Local state management

### Working Directory
```
Frontend/Web/Mobile/  # Main development folder
├── src/             # Source code
├── android/         # Android-specific code
├── package.json     # Dependencies
└── ...
```

## Error Resolution Protocol

### 1. Dependency Issues
```bash
# When packages are missing:
cd Frontend/Web/Mobile
npm install [missing-package]
```

### 2. Version Conflicts
```bash
# When versions don't match:
npm install [package]@[specific-version]
```

### 3. Native Dependencies
```bash
# When native modules need linking:
npm install [react-native-package]
cd Frontend/Web/Mobile/android && ./gradlew clean  # Run this automatically
# Then provide user instructions for:
# - npm run android
```

### 4. Build Cache Issues
```bash
# When build cache causes problems:
cd Frontend/Web/Mobile/android
./gradlew clean
./gradlew cleanBuildCache  # If needed
# Verify clean success before advising user
```

## Communication Protocol

### When User Needs to Run Commands
```
✅ CORRECT: "Please run the following command:"
cd Frontend/Web/Mobile
npm run android

❌ INCORRECT: Running the command directly
```

### Installation vs Execution
```
✅ CAN DO: npm install react-native-permissions
✅ CAN DO: cd android && ./gradlew clean
❌ CANNOT DO: npm run android
❌ CANNOT DO: ./gradlew assembleDebug
✅ CAN DO: Fix code that prevents building
❌ CANNOT DO: Actually build or run the app
```

## Focus Areas

### Primary Responsibilities
1. **Feature Implementation** - Write and modify code
2. **Dependency Management** - Install required packages
3. **Bug Fixing** - Solve code-level issues
4. **Configuration** - Update configs and settings
5. **Documentation** - Create guides and documentation

### Secondary Support
1. **Code Analysis** - Understand existing codebase
2. **Architecture Guidance** - Suggest improvements
3. **Testing Preparation** - Set up testing infrastructure
4. **Performance Optimization** - Code-level improvements

## Summary

**Role:** Code implementation and dependency management assistant
**Boundaries:** No build execution, no server control, no app running
**Permissions:** Install packages, write code, fix errors, provide guidance
**Goal:** Enable user to successfully build and run the application themselves