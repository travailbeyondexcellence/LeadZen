package com.leadzen;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import androidx.annotation.NonNull;
import android.util.Log;

public class SimpleFloatingModule extends ReactContextBaseJavaModule {

    public SimpleFloatingModule(ReactApplicationContext reactContext) {
        super(reactContext);
        Log.d("SimpleFloating", "SimpleFloatingModule constructor called");
    }

    @NonNull
    @Override
    public String getName() {
        Log.d("SimpleFloating", "getName() called - returning SimpleFloatingModule");
        return "SimpleFloatingModule";
    }

    @ReactMethod
    public void testMethod(Promise promise) {
        try {
            Log.d("SimpleFloating", "testMethod called - native module is working!");
            promise.resolve("Native module is working!");
        } catch (Exception e) {
            Log.e("SimpleFloating", "Error in testMethod: " + e.getMessage());
            promise.reject("ERROR", "Failed: " + e.getMessage());
        }
    }
}