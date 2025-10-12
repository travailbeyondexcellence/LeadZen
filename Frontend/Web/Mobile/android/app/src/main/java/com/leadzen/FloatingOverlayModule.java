package com.leadzen;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.util.Log;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import androidx.annotation.NonNull;

public class FloatingOverlayModule extends ReactContextBaseJavaModule {
    private ReactApplicationContext reactContext;
    private BroadcastReceiver overlayReceiver;

    public FloatingOverlayModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        Log.d("FloatingOverlay", "FloatingOverlayModule constructor called");
        setupBroadcastReceiver();
    }

    @NonNull
    @Override
    public String getName() {
        Log.d("FloatingOverlay", "getName() called - returning FloatingOverlayModule");
        return "FloatingOverlayModule";
    }

    private void setupBroadcastReceiver() {
        try {
            overlayReceiver = new BroadcastReceiver() {
                @Override
                public void onReceive(Context context, Intent intent) {
                    if ("FLOATING_OVERLAY_CLICKED".equals(intent.getAction())) {
                        sendEvent("FloatingOverlayClicked", null);
                    }
                }
            };

            IntentFilter filter = new IntentFilter("FLOATING_OVERLAY_CLICKED");
            reactContext.registerReceiver(overlayReceiver, filter);
            Log.d("FloatingOverlay", "Broadcast receiver setup successfully");
        } catch (Exception e) {
            Log.e("FloatingOverlay", "Error setting up broadcast receiver: " + e.getMessage());
        }
    }

    private void sendEvent(String eventName, Object data) {
        try {
            if (reactContext.hasActiveCatalystInstance()) {
                reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit(eventName, data);
            }
        } catch (Exception e) {
            Log.e("FloatingOverlay", "Error sending event: " + e.getMessage());
        }
    }

    @ReactMethod
    public void showFloatingOverlay(String phoneNumber, String leadName, Promise promise) {
        try {
            Intent serviceIntent = new Intent(reactContext, FloatingOverlayService.class);
            serviceIntent.putExtra("action", "SHOW_OVERLAY");
            serviceIntent.putExtra("phoneNumber", phoneNumber);
            serviceIntent.putExtra("leadName", leadName);
            
            reactContext.startService(serviceIntent);
            promise.resolve("Overlay shown successfully");
        } catch (Exception e) {
            promise.reject("ERROR", "Failed to show overlay: " + e.getMessage());
        }
    }

    @ReactMethod
    public void hideFloatingOverlay(Promise promise) {
        try {
            Intent serviceIntent = new Intent(reactContext, FloatingOverlayService.class);
            serviceIntent.putExtra("action", "HIDE_OVERLAY");
            
            reactContext.startService(serviceIntent);
            promise.resolve("Overlay hidden successfully");
        } catch (Exception e) {
            promise.reject("ERROR", "Failed to hide overlay: " + e.getMessage());
        }
    }

    @ReactMethod
    public void stopFloatingOverlay(Promise promise) {
        try {
            Intent serviceIntent = new Intent(reactContext, FloatingOverlayService.class);
            reactContext.stopService(serviceIntent);
            promise.resolve("Overlay service stopped");
        } catch (Exception e) {
            promise.reject("ERROR", "Failed to stop overlay service: " + e.getMessage());
        }
    }

    @Override
    public void onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy();
        if (overlayReceiver != null) {
            try {
                reactContext.unregisterReceiver(overlayReceiver);
            } catch (Exception e) {
                // Receiver already unregistered
            }
        }
    }
}