package com.leadzen;

import android.util.Log;
import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class FloatingOverlayPackage implements ReactPackage {

    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        return Collections.emptyList();
    }

    @Override
    public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
        Log.d("FloatingOverlay", "🏭 CREATE_NATIVE_MODULES CALLED");
        Log.d("FloatingOverlay", "🏭 React context: " + (reactContext != null ? "OK" : "NULL"));
        List<NativeModule> modules = new ArrayList<>();
        
        try {
            // Add simple test module first
            Log.d("FloatingOverlay", "🏭 Creating SimpleFloatingModule...");
            modules.add(new SimpleFloatingModule(reactContext));
            Log.d("FloatingOverlay", "✅ SimpleFloatingModule added successfully");
            
            // Add main floating overlay module
            Log.d("FloatingOverlay", "🏭 Creating FloatingOverlayModule...");
            modules.add(new FloatingOverlayModule(reactContext));
            Log.d("FloatingOverlay", "✅ FloatingOverlayModule added successfully");
            
            Log.d("FloatingOverlay", "🏭 Total modules created: " + modules.size());
        } catch (Exception e) {
            Log.e("FloatingOverlay", "❌ ERROR creating modules: " + e.getMessage());
            e.printStackTrace();
        }
        
        return modules;
    }
}