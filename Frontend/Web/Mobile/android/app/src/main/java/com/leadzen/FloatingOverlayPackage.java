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
        Log.d("FloatingOverlay", "createNativeModules called");
        List<NativeModule> modules = new ArrayList<>();
        
        // Add simple test module first
        modules.add(new SimpleFloatingModule(reactContext));
        Log.d("FloatingOverlay", "SimpleFloatingModule added");
        
        // Add main floating overlay module
        modules.add(new FloatingOverlayModule(reactContext));
        Log.d("FloatingOverlay", "FloatingOverlayModule added");
        
        return modules;
    }
}