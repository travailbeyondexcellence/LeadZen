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
    private View expandedView;
    private WindowManager.LayoutParams params;
    private WindowManager.LayoutParams expandedParams;
    private TextView leadNameView;
    private boolean isExpanded = false;
    private String currentPhoneNumber;
    private String currentLeadName;

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

    private void createExpandedOverlay() {
        android.util.Log.d("FloatingOverlay", "Creating expanded overlay...");
        
        // Create main expanded container
        LinearLayout expandedContainer = new LinearLayout(this);
        expandedContainer.setOrientation(LinearLayout.VERTICAL);
        expandedContainer.setPadding(24, 24, 24, 24);
        expandedContainer.setClickable(true);
        expandedContainer.setFocusable(true);
        
        // Create background for expanded overlay
        GradientDrawable expandedBackground = new GradientDrawable();
        expandedBackground.setShape(GradientDrawable.RECTANGLE);
        expandedBackground.setColor(Color.parseColor("#F0FFFFFF")); // Semi-transparent white
        expandedBackground.setCornerRadius(16);
        expandedBackground.setStroke(2, Color.parseColor("#14B8A6"));
        expandedContainer.setBackground(expandedBackground);
        
        // Header section
        LinearLayout headerSection = new LinearLayout(this);
        headerSection.setOrientation(LinearLayout.HORIZONTAL);
        headerSection.setPadding(0, 0, 0, 16);
        
        // Phone icon in header
        TextView phoneIconHeader = new TextView(this);
        phoneIconHeader.setText("📞");
        phoneIconHeader.setTextSize(24);
        phoneIconHeader.setPadding(0, 0, 12, 0);
        
        // Call info text
        TextView callInfoText = new TextView(this);
        callInfoText.setText("Incoming Call");
        callInfoText.setTextColor(Color.parseColor("#1F2937"));
        callInfoText.setTextSize(18);
        callInfoText.setTypeface(null, android.graphics.Typeface.BOLD);
        
        // Close button
        TextView closeButton = new TextView(this);
        closeButton.setText("✕");
        closeButton.setTextColor(Color.parseColor("#EF4444"));
        closeButton.setTextSize(20);
        closeButton.setPadding(16, 8, 8, 8);
        closeButton.setClickable(true);
        closeButton.setOnClickListener(v -> hideExpandedOverlay());
        
        // Add to header
        headerSection.addView(phoneIconHeader);
        headerSection.addView(callInfoText);
        
        // Contact info section
        LinearLayout contactSection = new LinearLayout(this);
        contactSection.setOrientation(LinearLayout.VERTICAL);
        contactSection.setPadding(0, 0, 0, 16);
        
        // Phone number display
        TextView phoneNumberDisplay = new TextView(this);
        phoneNumberDisplay.setText(currentPhoneNumber != null ? currentPhoneNumber : "Unknown Number");
        phoneNumberDisplay.setTextColor(Color.parseColor("#374151"));
        phoneNumberDisplay.setTextSize(16);
        phoneNumberDisplay.setTypeface(null, android.graphics.Typeface.BOLD);
        
        // Lead name display
        TextView leadNameDisplay = new TextView(this);
        leadNameDisplay.setText(currentLeadName != null ? currentLeadName : "Unknown Contact");
        leadNameDisplay.setTextColor(Color.parseColor("#6B7280"));
        leadNameDisplay.setTextSize(14);
        
        contactSection.addView(phoneNumberDisplay);
        contactSection.addView(leadNameDisplay);
        
        // Quick actions section
        LinearLayout actionsSection = new LinearLayout(this);
        actionsSection.setOrientation(LinearLayout.HORIZONTAL);
        actionsSection.setPadding(0, 8, 0, 0);
        
        // Notes button
        TextView notesButton = createActionButton("📝 Notes", "#3B82F6");
        // Lead details button  
        TextView detailsButton = createActionButton("👤 Details", "#10B981");
        // Minimize button
        TextView minimizeButton = createActionButton("⬇️ Minimize", "#6B7280");
        minimizeButton.setOnClickListener(v -> hideExpandedOverlay());
        
        actionsSection.addView(notesButton);
        actionsSection.addView(detailsButton);
        actionsSection.addView(minimizeButton);
        
        // Assemble the expanded overlay
        expandedContainer.addView(headerSection);
        expandedContainer.addView(closeButton);
        expandedContainer.addView(contactSection);
        expandedContainer.addView(actionsSection);
        
        expandedView = expandedContainer;
        
        // Set up window parameters for expanded overlay
        int layoutType;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            layoutType = WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY;
        } else {
            layoutType = WindowManager.LayoutParams.TYPE_PHONE;
        }

        expandedParams = new WindowManager.LayoutParams(
                WindowManager.LayoutParams.WRAP_CONTENT,
                WindowManager.LayoutParams.WRAP_CONTENT,
                layoutType,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE | 
                WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL | 
                WindowManager.LayoutParams.FLAG_WATCH_OUTSIDE_TOUCH,
                PixelFormat.TRANSLUCENT
        );

        expandedParams.gravity = Gravity.CENTER;
        expandedParams.x = 0;
        expandedParams.y = -100;
        
        android.util.Log.d("FloatingOverlay", "Expanded overlay created successfully");
    }
    
    private TextView createActionButton(String text, String colorHex) {
        TextView button = new TextView(this);
        button.setText(text);
        button.setTextColor(Color.WHITE);
        button.setTextSize(12);
        button.setPadding(16, 8, 16, 8);
        button.setClickable(true);
        
        // Create button background
        GradientDrawable buttonBg = new GradientDrawable();
        buttonBg.setShape(GradientDrawable.RECTANGLE);
        buttonBg.setColor(Color.parseColor(colorHex));
        buttonBg.setCornerRadius(8);
        button.setBackground(buttonBg);
        
        // Add margin
        LinearLayout.LayoutParams layoutParams = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.WRAP_CONTENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        );
        layoutParams.setMargins(0, 0, 8, 0);
        button.setLayoutParams(layoutParams);
        
        return button;
    }

    private void handleOverlayClick() {
        android.util.Log.d("FloatingOverlay", "🎯 FLOATING ICON CLICKED! User tapped the floating icon!");
        android.util.Log.d("FloatingOverlay", "🎯 ==========================================");
        android.util.Log.d("FloatingOverlay", "🎯 FLOATING ICON CLICK DETECTED");
        android.util.Log.d("FloatingOverlay", "🎯 Now showing native expanded overlay...");
        android.util.Log.d("FloatingOverlay", "🎯 ==========================================");
        
        // Show native expanded overlay instead of sending broadcast
        showExpandedOverlay();
    }
    
    private void showExpandedOverlay() {
        try {
            android.util.Log.d("FloatingOverlay", "🚀 SHOWING NATIVE EXPANDED OVERLAY");
            
            if (isExpanded) {
                android.util.Log.d("FloatingOverlay", "⚠️ Expanded overlay already visible");
                return;
            }
            
            // Create expanded overlay if not created yet
            if (expandedView == null) {
                createExpandedOverlay();
            }
            
            // Hide the small floating icon
            if (floatingView != null) {
                floatingView.setVisibility(View.GONE);
                android.util.Log.d("FloatingOverlay", "✅ Hidden small floating icon");
            }
            
            // Show the expanded overlay
            windowManager.addView(expandedView, expandedParams);
            isExpanded = true;
            
            android.util.Log.d("FloatingOverlay", "✅ NATIVE EXPANDED OVERLAY SHOWN SUCCESSFULLY!");
            android.util.Log.d("FloatingOverlay", "✅ Overlay should now be visible over dialer!");
            
        } catch (Exception e) {
            android.util.Log.e("FloatingOverlay", "❌ Error showing expanded overlay: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    private void hideExpandedOverlay() {
        try {
            android.util.Log.d("FloatingOverlay", "🔄 HIDING NATIVE EXPANDED OVERLAY");
            
            if (!isExpanded || expandedView == null) {
                android.util.Log.d("FloatingOverlay", "⚠️ Expanded overlay not visible");
                return;
            }
            
            // Remove expanded overlay from window manager
            windowManager.removeView(expandedView);
            isExpanded = false;
            
            // Show the small floating icon again
            if (floatingView != null) {
                floatingView.setVisibility(View.VISIBLE);
                android.util.Log.d("FloatingOverlay", "✅ Restored small floating icon");
            }
            
            android.util.Log.d("FloatingOverlay", "✅ NATIVE EXPANDED OVERLAY HIDDEN SUCCESSFULLY!");
            
        } catch (Exception e) {
            android.util.Log.e("FloatingOverlay", "❌ Error hiding expanded overlay: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public void updateOverlayData(String phoneNumber, String leadName) {
        // Store current call data
        this.currentPhoneNumber = phoneNumber;
        this.currentLeadName = leadName;
        
        // Update small floating icon
        if (leadNameView != null) {
            leadNameView.setText(leadName != null ? leadName : "Unknown");
        }
        
        android.util.Log.d("FloatingOverlay", "✅ Updated overlay data - Phone: " + phoneNumber + ", Lead: " + leadName);
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
        
        // Clean up floating icon
        if (floatingView != null && windowManager != null) {
            try {
                windowManager.removeView(floatingView);
            } catch (Exception e) {
                // View already removed
            }
        }
        
        // Clean up expanded overlay
        if (expandedView != null && windowManager != null && isExpanded) {
            try {
                windowManager.removeView(expandedView);
            } catch (Exception e) {
                // View already removed
            }
        }
        
        android.util.Log.d("FloatingOverlay", "✅ FloatingOverlayService destroyed and cleaned up");
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}