package com.leadzen;

import android.app.Application;
import android.util.Log;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.facebook.react.PackageList;
import java.util.List;



public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      @SuppressWarnings("UnnecessaryLocalVariable")
      List<ReactPackage> packages = new PackageList(this).getPackages();
      
      // Packages that cannot be autolinked yet can be added manually here
      // SQLite package should be auto-linked by React Native
      
      // Add FloatingOverlay package
      Log.d("FloatingOverlay", "🚀 MAIN_APPLICATION: Adding FloatingOverlayPackage to packages");
      try {
        FloatingOverlayPackage overlayPackage = new FloatingOverlayPackage();
        packages.add(overlayPackage);
        Log.d("FloatingOverlay", "✅ MAIN_APPLICATION: FloatingOverlayPackage added successfully");
        Log.d("FloatingOverlay", "✅ MAIN_APPLICATION: Total packages: " + packages.size());
      } catch (Exception e) {
        Log.e("FloatingOverlay", "❌ MAIN_APPLICATION: Error adding FloatingOverlayPackage: " + e.getMessage());
        e.printStackTrace();
      }
      
      return packages;
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, false);
  }
}