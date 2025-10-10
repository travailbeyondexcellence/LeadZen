
npm run android
$ npm run android

> leadzen-mobile@0.0.1 android
> react-native run-android

warn Package react-native-sqlite-storage contains invalid configuration: "de
pendency.platforms.ios.project" is not allowed. Please verify it's properly linked using "npx react-native config" command and contact the package maintainers about this.                                                          info A dev server is already running for this project on port 8081.
info Installing the app...

> Task :react-native-async-storage_async-storage:processDebugManifest
> package="com.reactnativecommunity.asyncstorage" found in source AndroidManif
> est.xml: C:\Users\Zen\ZenCo\LeadZen\Frontend\Web\Mobile\node_modules\@react-native-async-storage\async-storage\android\src\main\AndroidManifest.xml.    Setting the namespace via the package attribute in the source AndroidManifes
> t.xml is no longer supported, and the value is ignored.                     Recommendation: remove package="com.reactnativecommunity.asyncstorage" from
> the source AndroidManifest.xml: C:\Users\Zen\ZenCo\LeadZen\Frontend\Web\Mobile\node_modules\@react-native-async-storage\async-storage\android\src\main\AndroidManifest.xml.
> Task :react-native-call-detection:processDebugManifest
> package="com.pritesh.calldetection" found in source AndroidManifest.xml: C:
> Users\Zen\ZenCo\LeadZen\Frontend\Web\Mobile\node_modules\react-native-call-detection\android\src\main\AndroidManifest.xml.                              Setting the namespace via the package attribute in the source AndroidManifes
> t.xml is no longer supported, and the value is ignored.                     Recommendation: remove package="com.pritesh.calldetection" from the source A
> ndroidManifest.xml: C:\Users\Zen\ZenCo\LeadZen\Frontend\Web\Mobile\node_modules\react-native-call-detection\android\src\main\AndroidManifest.xml.
> Task :react-native-safe-area-context:processDebugManifest
> package="com.th3rdwave.safeareacontext" found in source AndroidManifest.xml:
> C:\Users\Zen\ZenCo\LeadZen\Frontend\Web\Mobile\node_modules\react-native-safe-area-context\android\src\main\AndroidManifest.xml.                       Setting the namespace via the package attribute in the source AndroidManifes
> t.xml is no longer supported, and the value is ignored.                     Recommendation: remove package="com.th3rdwave.safeareacontext" from the sour
> ce AndroidManifest.xml: C:\Users\Zen\ZenCo\LeadZen\Frontend\Web\Mobile\node_modules\react-native-safe-area-context\android\src\main\AndroidManifest.xml.
> Task :app:processDebugMainManifest FAILED

See https://developer.android.com/r/studio-ui/build/manifest-merger for more
 information about the manifest merger.

Deprecated Gradle features were used in this build, making it incompatible w
ith Gradle 9.0.
You can use '--warning-mode all' to show the individual deprecation warnings
 and determine if they come from your own scripts or plugins.
For more on this, please refer to https://docs.gradle.org/8.3/userguide/comm
and_line_interface.html#sec:command_line_warnings in the Gradle documentation.                                                                          51 actionable tasks: 46 executed, 5 up-to-date

info 💡 Tip: Make sure that you have set up your development environment cor
rectly, by running npx react-native doctor. To read more about doctor command visit: https://github.com/react-native-community/cli/blob/main/packages/cli-doctor/README.md#doctorC:\Users\Zen\ZenCo\LeadZen\Frontend\Web\Mobile\android\app\src\main\AndroidM
anifest.xml:26:7-34 Error:                                                          Attribute application@allowBackup value=(false) from AndroidManifest
.xml:26:7-34                                                                        is also present at [:react-native-call-detection] AndroidManifest.xm
l:10:9-35 value=(true).                                                             Suggestion: add 'tools:replace="android:allowBackup"' to `<applicatio
n>` element at AndroidManifest.xml:21:5-42:19 to override.FAILURE: Build failed with an exception.

* What went wrong:
  Execution failed for task ':app:processDebugMainManifest'.

> Manifest merger failed : Attribute application@allowBackup value=(false) f
> rom AndroidManifest.xml:26:7-34                                                     is also present at [:react-native-call-detection] AndroidManifest.xm
> l:10:9-35 value=(true).                                                             Suggestion: add 'tools:replace="android:allowBackup"' to `<applicatio
> n>` element at AndroidManifest.xml:21:5-42:19 to override.

* Try:

> Run with --stacktrace option to get the stack trace.
> Run with --info or --debug option to get more log output.
> Run with --scan to get full insights.
> Get more help at https://help.gradle.org.

BUILD FAILED in 2m 10s
error Failed to install the app. Command failed with exit code 1: gradlew.ba
t app:installDebug -PreactNativeDevServerPort=8081                          C:\Users\Zen\ZenCo\LeadZen\Frontend\Web\Mobile\android\app\src\main\AndroidM
anifest.xml:26:7-34 Error: Attribute application@allowBackup value=(false) from AndroidManifest.xml:26:7-34 is also present at [:react-native-call-detection] AndroidManifest.xml:10:9-35 value=(true). Suggestion: add 'tools:replace="android:allowBackup"' to `<application>` element at AndroidManifest.xml:21:5-42:19 to override. FAILURE: Build failed with an exception. * What went wrong: Execution failed for task ':app:processDebugMainManifest'. > Manifest merger failed : Attribute application@allowBackup value=(false) from AndroidManifest.xml:26:7-34 is also present at [:react-native-call-detection] AndroidManifest.xml:10:9-35 value=(true). Suggestion: add 'tools:replace="android:allowBackup"' to `<application>` element at AndroidManifest.xml:21:5-42:19 to override. * Try: > Run with --stacktrace option to get the stack trace. > Run with --info or --debug option to get more log output. > Run with --scan to get full insights. > Get more help at https://help.gradle.org. BUILD FAILED in 2m 10s.                                                                npm error Lifecycle script `android` failed with error:
npm error code 1
npm error path C:\Users\Zen\ZenCo\LeadZen\frontend\web\mobile
npm error workspace leadzen-mobile@0.0.1
npm error location C:\Users\Zen\ZenCo\LeadZen\frontend\web\mobile
npm error command failed
npm error command C:\WINDOWS\system32\cmd.exe /d /s /c react-native run-andr
oid
