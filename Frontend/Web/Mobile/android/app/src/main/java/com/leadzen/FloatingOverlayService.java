package com.leadzen;

import android.app.Service;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.PixelFormat;
import android.graphics.drawable.GradientDrawable;
import android.os.Build;
import android.os.IBinder;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;
import android.widget.LinearLayout;
import android.widget.TextView;
import androidx.annotation.Nullable;

public class FloatingOverlayService extends Service {
    private WindowManager windowManager;
    private View floatingView;
    private WindowManager.LayoutParams params;
    private TextView leadNameView;

    @Override
    public void onCreate() {
        super.onCreate();
        windowManager = (WindowManager) getSystemService(WINDOW_SERVICE);
        createFloatingView();
    }

    private void createFloatingView() {
        // Create main container with larger clickable area
        LinearLayout container = new LinearLayout(this);
        container.setOrientation(LinearLayout.VERTICAL);
        container.setPadding(32, 32, 32, 32);
        container.setMinimumWidth(120);
        container.setMinimumHeight(120);
        container.setClickable(true);
        container.setFocusable(true);
        android.util.Log.d("FloatingOverlay", "Container created with clickable: true, focusable: true");
        
        // Create background
        GradientDrawable background = new GradientDrawable();
        background.setShape(GradientDrawable.RECTANGLE);
        background.setColor(Color.parseColor("#E614B8A6"));
        background.setCornerRadius(24);
        background.setStroke(4, Color.parseColor("#14B8A6"));
        container.setBackground(background);
        
        // Create phone icon
        TextView phoneIcon = new TextView(this);
        phoneIcon.setText("📞");
        phoneIcon.setTextSize(28);
        phoneIcon.setPadding(20, 20, 20, 12);
        phoneIcon.setGravity(Gravity.CENTER);
        
        // Create lead name text
        leadNameView = new TextView(this);
        leadNameView.setText("Unknown");
        leadNameView.setTextColor(Color.WHITE);
        leadNameView.setTextSize(12);
        leadNameView.setGravity(Gravity.CENTER);
        leadNameView.setPadding(8, 0, 8, 4);
        
        // Add views to container
        container.addView(phoneIcon);
        container.addView(leadNameView);
        
        floatingView = container;

        // Set up window parameters
        int layoutType;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            layoutType = WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY;
        } else {
            layoutType = WindowManager.LayoutParams.TYPE_PHONE;
        }

        params = new WindowManager.LayoutParams(
                WindowManager.LayoutParams.WRAP_CONTENT,
                WindowManager.LayoutParams.WRAP_CONTENT,
                layoutType,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE | 
                WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL | 
                WindowManager.LayoutParams.FLAG_WATCH_OUTSIDE_TOUCH,
                PixelFormat.TRANSLUCENT
        );

        params.gravity = Gravity.TOP | Gravity.RIGHT;
        params.x = 50;
        params.y = 200;

        // Add view to window manager
        windowManager.addView(floatingView, params);
        android.util.Log.d("FloatingOverlay", "Floating view added to WindowManager successfully");

        // Set up touch listener with better click detection
        floatingView.setOnTouchListener(new View.OnTouchListener() {
            private int initialX, initialY;
            private float initialTouchX, initialTouchY;
            private long touchStartTime;

            @Override
            public boolean onTouch(View v, MotionEvent event) {
                android.util.Log.d("FloatingOverlay", "Touch event: " + event.getAction());
                
                switch (event.getAction()) {
                    case MotionEvent.ACTION_DOWN:
                        android.util.Log.d("FloatingOverlay", "Touch DOWN detected");
                        initialX = params.x;
                        initialY = params.y;
                        initialTouchX = event.getRawX();
                        initialTouchY = event.getRawY();
                        touchStartTime = System.currentTimeMillis();
                        return true;

                    case MotionEvent.ACTION_MOVE:
                        // Only move if significant movement
                        float deltaX = event.getRawX() - initialTouchX;
                        float deltaY = event.getRawY() - initialTouchY;
                        if (Math.abs(deltaX) > 20 || Math.abs(deltaY) > 20) {
                            params.x = initialX + (int) deltaX;
                            params.y = initialY + (int) deltaY;
                            windowManager.updateViewLayout(floatingView, params);
                            android.util.Log.d("FloatingOverlay", "Moving overlay to: " + params.x + ", " + params.y);
                        }
                        return true;

                    case MotionEvent.ACTION_UP:
                        android.util.Log.d("FloatingOverlay", "Touch UP detected");
                        long touchDuration = System.currentTimeMillis() - touchStartTime;
                        float moveDistance = (float) Math.sqrt(
                            Math.pow(event.getRawX() - initialTouchX, 2) + 
                            Math.pow(event.getRawY() - initialTouchY, 2)
                        );
                        
                        android.util.Log.d("FloatingOverlay", "Touch duration: " + touchDuration + "ms, Move distance: " + moveDistance + "px");
                        
                        // More lenient click detection: longer duration OR more movement allowed
                        if (touchDuration < 1000 && moveDistance < 50) {
                            android.util.Log.d("FloatingOverlay", "🎯 CLICK DETECTED! Triggering click handler...");
                            android.util.Log.d("FloatingOverlay", "📊 Click stats - Duration: " + touchDuration + "ms, Distance: " + moveDistance + "px");
                            handleOverlayClick();
                        } else {
                            android.util.Log.d("FloatingOverlay", "❌ Not a click - duration: " + touchDuration + "ms, distance: " + moveDistance + "px");
                        }
                        return true;
                }
                return false;
            }
        });
        
        // Also add a simple click listener as backup
        floatingView.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                android.util.Log.d("FloatingOverlay", "✅ SIMPLE CLICK LISTENER TRIGGERED!");
                android.util.Log.d("FloatingOverlay", "View clicked: " + v.toString());
                android.util.Log.d("FloatingOverlay", "View clickable: " + v.isClickable());
                android.util.Log.d("FloatingOverlay", "View enabled: " + v.isEnabled());
                handleOverlayClick();
            }
        });
        
        android.util.Log.d("FloatingOverlay", "Touch and click listeners setup complete");
    }

    private void handleOverlayClick() {
        android.util.Log.d("FloatingOverlay", "🎯 FLOATING ICON CLICKED! User tapped the floating icon!");
        android.util.Log.d("FloatingOverlay", "🎯 ==========================================");
        android.util.Log.d("FloatingOverlay", "🎯 FLOATING ICON CLICK DETECTED");
        android.util.Log.d("FloatingOverlay", "🎯 Now sending broadcast to trigger overlay expansion...");
        android.util.Log.d("FloatingOverlay", "🎯 ==========================================");
        
        // Send both local and system broadcast to ensure one works
        try {
            // System broadcast
            Intent systemIntent = new Intent("FLOATING_OVERLAY_CLICKED");
            systemIntent.addFlags(Intent.FLAG_INCLUDE_STOPPED_PACKAGES);
            sendBroadcast(systemIntent);
            android.util.Log.d("FloatingOverlay", "✅ System broadcast sent successfully");
            
            // Also try sending with package name for better targeting
            Intent packageIntent = new Intent("FLOATING_OVERLAY_CLICKED");
            packageIntent.setPackage(getPackageName());
            sendBroadcast(packageIntent);
            android.util.Log.d("FloatingOverlay", "✅ Package-targeted broadcast sent successfully");
            
            // Add a delay and try one more broadcast
            new android.os.Handler().postDelayed(new Runnable() {
                @Override
                public void run() {
                    try {
                        Intent retryIntent = new Intent("FLOATING_OVERLAY_CLICKED");
                        sendBroadcast(retryIntent);
                        android.util.Log.d("FloatingOverlay", "✅ Retry broadcast sent after delay");
                    } catch (Exception e) {
                        android.util.Log.e("FloatingOverlay", "❌ Retry broadcast failed: " + e.getMessage());
                    }
                }
            }, 100);
            
        } catch (Exception e) {
            android.util.Log.e("FloatingOverlay", "❌ Error sending broadcasts: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public void updateOverlayData(String phoneNumber, String leadName) {
        if (leadNameView != null) {
            leadNameView.setText(leadName != null ? leadName : "Unknown");
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null) {
            String action = intent.getStringExtra("action");
            
            if ("SHOW_OVERLAY".equals(action)) {
                String phoneNumber = intent.getStringExtra("phoneNumber");
                String leadName = intent.getStringExtra("leadName");
                updateOverlayData(phoneNumber, leadName);
                
                if (floatingView.getVisibility() != View.VISIBLE) {
                    floatingView.setVisibility(View.VISIBLE);
                }
            } else if ("HIDE_OVERLAY".equals(action)) {
                if (floatingView != null) {
                    floatingView.setVisibility(View.GONE);
                }
            }
        }
        
        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (floatingView != null && windowManager != null) {
            windowManager.removeView(floatingView);
        }
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}