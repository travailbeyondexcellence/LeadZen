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
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import androidx.annotation.NonNull;

public class FloatingOverlayModule extends ReactContextBaseJavaModule {
    private static final String[] SUPPORTED_EVENTS = {"FloatingOverlayClicked"};
    private ReactApplicationContext reactContext;
    private BroadcastReceiver overlayReceiver;

    public FloatingOverlayModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        Log.d("FloatingOverlay", "🚀 FLOATINGOVERLAYMODULE CONSTRUCTOR CALLED!");
        Log.d("FloatingOverlay", "🚀 React context: " + (reactContext != null ? "OK" : "NULL"));
        
        try {
            setupBroadcastReceiver();
            Log.d("FloatingOverlay", "✅ FloatingOverlayModule initialization complete");
        } catch (Exception e) {
            Log.e("FloatingOverlay", "❌ ERROR in constructor: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @NonNull
    @Override
    public String getName() {
        Log.d("FloatingOverlay", "getName() called - returning FloatingOverlayModule");
        return "FloatingOverlayModule";
    }

    private void setupBroadcastReceiver() {
        try {
            Log.d("FloatingOverlay", "🔧 Setting up broadcast receiver...");
            overlayReceiver = new BroadcastReceiver() {
                @Override
                public void onReceive(Context context, Intent intent) {
                    Log.d("FloatingOverlay", "🎯 ========================================");
                    Log.d("FloatingOverlay", "🎯 BROADCAST RECEIVED IN REACT NATIVE MODULE!");
                    Log.d("FloatingOverlay", "🎯 This means the floating icon click was detected!");
                    Log.d("FloatingOverlay", "🎯 ========================================");
                    Log.d("FloatingOverlay", "📻 Action: " + intent.getAction());
                    Log.d("FloatingOverlay", "📻 Context: " + context.getClass().getSimpleName());
                    Log.d("FloatingOverlay", "📻 Intent details: " + intent.toString());
                    Log.d("FloatingOverlay", "📻 Intent package: " + intent.getPackage());
                    Log.d("FloatingOverlay", "📻 React context available: " + (reactContext != null));
                    Log.d("FloatingOverlay", "📻 React context active: " + (reactContext != null && reactContext.hasActiveCatalystInstance()));
                    
                    if ("FLOATING_OVERLAY_CLICKED".equals(intent.getAction())) {
                        Log.d("FloatingOverlay", "🚀 CORRECT ACTION RECEIVED! Now sending to React Native...");
                        Log.d("FloatingOverlay", "🚀 This should trigger the overlay expansion...");
                        try {
                            sendEvent("FloatingOverlayClicked", null);
                            Log.d("FloatingOverlay", "✅ ✅ ✅ Event sent to React Native: FloatingOverlayClicked");
                            Log.d("FloatingOverlay", "✅ React Native should now show the expanded overlay!");
                        } catch (Exception e) {
                            Log.e("FloatingOverlay", "❌ ERROR sending event to React Native: " + e.getMessage());
                            e.printStackTrace();
                        }
                    } else {
                        Log.d("FloatingOverlay", "❌ Unknown broadcast action: " + intent.getAction());
                    }
                }
            };

            IntentFilter filter = new IntentFilter("FLOATING_OVERLAY_CLICKED");
            filter.setPriority(IntentFilter.SYSTEM_HIGH_PRIORITY);
            
            // Android 14+ requires explicit export flag for broadcast receivers
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.TIRAMISU) {
                reactContext.registerReceiver(overlayReceiver, filter, android.content.Context.RECEIVER_NOT_EXPORTED);
                Log.d("FloatingOverlay", "✅ Broadcast receiver registered with RECEIVER_NOT_EXPORTED flag");
            } else {
                reactContext.registerReceiver(overlayReceiver, filter);
                Log.d("FloatingOverlay", "✅ Broadcast receiver registered (legacy method)");
            }
            Log.d("FloatingOverlay", "✅ Broadcast receiver registered successfully for action: FLOATING_OVERLAY_CLICKED");
            Log.d("FloatingOverlay", "✅ Filter priority set to HIGH for better reception");
        } catch (Exception e) {
            Log.e("FloatingOverlay", "❌ Error setting up broadcast receiver: " + e.getMessage());
            e.printStackTrace();
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
    
    @ReactMethod
    public void addListener(String eventName) {
        // Required for NativeEventEmitter - iOS only, but Android needs this to avoid warnings
    }
    
    @ReactMethod
    public void removeListeners(Integer count) {
        // Required for NativeEventEmitter - iOS only, but Android needs this to avoid warnings
    }
    
    @ReactMethod
    public void testBroadcast(Promise promise) {
        try {
            Log.d("FloatingOverlay", "🧪 ========================================");
            Log.d("FloatingOverlay", "🧪 MANUAL TEST BROADCAST TRIGGERED");
            Log.d("FloatingOverlay", "🧪 This should trigger the same flow as clicking floating icon");
            Log.d("FloatingOverlay", "🧪 ========================================");
            
            Log.d("FloatingOverlay", "🧪 Checking broadcast receiver setup:");
            Log.d("FloatingOverlay", "🧪 - Receiver object: " + (overlayReceiver != null ? "EXISTS" : "NULL"));
            Log.d("FloatingOverlay", "🧪 - React context: " + (reactContext != null ? "EXISTS" : "NULL"));
            Log.d("FloatingOverlay", "🧪 - Context active: " + (reactContext != null && reactContext.hasActiveCatalystInstance()));
            
            Log.d("FloatingOverlay", "🧪 Sending broadcast with action: FLOATING_OVERLAY_CLICKED");
            Intent intent = new Intent("FLOATING_OVERLAY_CLICKED");
            intent.addFlags(Intent.FLAG_INCLUDE_STOPPED_PACKAGES);
            reactContext.sendBroadcast(intent);
            Log.d("FloatingOverlay", "🧪 Test broadcast sent successfully - now waiting for receiver...");
            
            // Add a small delay and try again with different approach
            new android.os.Handler().postDelayed(new Runnable() {
                @Override
                public void run() {
                    try {
                        Log.d("FloatingOverlay", "🧪 Sending retry broadcast with package targeting...");
                        Intent retryIntent = new Intent("FLOATING_OVERLAY_CLICKED");
                        retryIntent.setPackage(reactContext.getPackageName());
                        reactContext.sendBroadcast(retryIntent);
                        Log.d("FloatingOverlay", "🧪 Retry broadcast sent");
                    } catch (Exception e) {
                        Log.e("FloatingOverlay", "🧪 Retry broadcast failed: " + e.getMessage());
                    }
                }
            }, 100);
            
            promise.resolve("Test broadcast sent");
        } catch (Exception e) {
            Log.e("FloatingOverlay", "🧪 Test broadcast failed: " + e.getMessage());
            promise.reject("ERROR", "Test broadcast failed: " + e.getMessage());
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