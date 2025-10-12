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
        // Create main container
        LinearLayout container = new LinearLayout(this);
        container.setOrientation(LinearLayout.VERTICAL);
        container.setPadding(24, 24, 24, 24);
        
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
        phoneIcon.setTextSize(24);
        phoneIcon.setPadding(16, 16, 16, 8);
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
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
                PixelFormat.TRANSLUCENT
        );

        params.gravity = Gravity.TOP | Gravity.RIGHT;
        params.x = 50;
        params.y = 200;

        // Add view to window manager
        windowManager.addView(floatingView, params);

        // Set up touch listener
        floatingView.setOnTouchListener(new View.OnTouchListener() {
            private int initialX, initialY;
            private float initialTouchX, initialTouchY;

            @Override
            public boolean onTouch(View v, MotionEvent event) {
                switch (event.getAction()) {
                    case MotionEvent.ACTION_DOWN:
                        initialX = params.x;
                        initialY = params.y;
                        initialTouchX = event.getRawX();
                        initialTouchY = event.getRawY();
                        return true;

                    case MotionEvent.ACTION_MOVE:
                        params.x = initialX + (int) (event.getRawX() - initialTouchX);
                        params.y = initialY + (int) (event.getRawY() - initialTouchY);
                        windowManager.updateViewLayout(floatingView, params);
                        return true;

                    case MotionEvent.ACTION_UP:
                        if (Math.abs(event.getRawX() - initialTouchX) < 10 &&
                            Math.abs(event.getRawY() - initialTouchY) < 10) {
                            handleOverlayClick();
                        }
                        return true;
                }
                return false;
            }
        });
    }

    private void handleOverlayClick() {
        Intent intent = new Intent("FLOATING_OVERLAY_CLICKED");
        sendBroadcast(intent);
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