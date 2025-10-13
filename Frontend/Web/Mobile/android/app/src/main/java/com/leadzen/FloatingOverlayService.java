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
        android.util.Log.d("FloatingOverlay", "Creating enhanced expanded overlay...");
        
        // Main container with proper styling
        LinearLayout mainContainer = new LinearLayout(this);
        mainContainer.setOrientation(LinearLayout.VERTICAL);
        mainContainer.setClickable(true);
        mainContainer.setFocusable(true);
        
        // Create beautiful background with shadow effect
        GradientDrawable mainBackground = new GradientDrawable();
        mainBackground.setShape(GradientDrawable.RECTANGLE);
        mainBackground.setColor(Color.parseColor("#FFFFFF")); // Pure white background
        mainBackground.setCornerRadius(dpToPx(16)); // 16dp corner radius
        mainContainer.setBackground(mainBackground);
        
        // Add shadow effect by setting elevation
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            mainContainer.setElevation(dpToPx(12));
        }
        
        // Set minimum width for better appearance
        mainContainer.setMinimumWidth(dpToPx(320));
        
        // Header section with gradient background
        LinearLayout headerContainer = new LinearLayout(this);
        headerContainer.setOrientation(LinearLayout.HORIZONTAL);
        headerContainer.setGravity(Gravity.CENTER_VERTICAL);
        headerContainer.setPadding(dpToPx(20), dpToPx(16), dpToPx(20), dpToPx(16));
        
        // Header background with light primary color
        GradientDrawable headerBg = new GradientDrawable();
        headerBg.setShape(GradientDrawable.RECTANGLE);
        headerBg.setColor(Color.parseColor("#F0F9FF")); // Light blue background
        headerBg.setCornerRadii(new float[]{dpToPx(16), dpToPx(16), dpToPx(16), dpToPx(16), 0, 0, 0, 0});
        headerContainer.setBackground(headerBg);
        
        // Call type indicator with avatar style
        LinearLayout avatarContainer = new LinearLayout(this);
        avatarContainer.setOrientation(LinearLayout.HORIZONTAL);
        avatarContainer.setGravity(Gravity.CENTER);
        avatarContainer.setPadding(dpToPx(12), dpToPx(12), dpToPx(12), dpToPx(12));
        
        GradientDrawable avatarBg = new GradientDrawable();
        avatarBg.setShape(GradientDrawable.OVAL);
        avatarBg.setColor(Color.parseColor("#14B8A6")); // Teal color
        avatarContainer.setBackground(avatarBg);
        
        TextView callIcon = new TextView(this);
        callIcon.setText("📞");
        callIcon.setTextSize(20);
        avatarContainer.addView(callIcon);
        
        // Call info section
        LinearLayout callInfoContainer = new LinearLayout(this);
        callInfoContainer.setOrientation(LinearLayout.VERTICAL);
        callInfoContainer.setPadding(dpToPx(16), 0, 0, 0);
        LinearLayout.LayoutParams callInfoParams = new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1.0f);
        callInfoContainer.setLayoutParams(callInfoParams);
        
        TextView callTypeLabel = new TextView(this);
        callTypeLabel.setText("Incoming Call");
        callTypeLabel.setTextColor(Color.parseColor("#14B8A6"));
        callTypeLabel.setTextSize(14);
        callTypeLabel.setTypeface(null, android.graphics.Typeface.BOLD);
        
        TextView timestampLabel = new TextView(this);
        timestampLabel.setText("Just now");
        timestampLabel.setTextColor(Color.parseColor("#6B7280"));
        timestampLabel.setTextSize(12);
        
        callInfoContainer.addView(callTypeLabel);
        callInfoContainer.addView(timestampLabel);
        
        // Close button with proper styling
        TextView closeButton = new TextView(this);
        closeButton.setText("✕");
        closeButton.setTextColor(Color.parseColor("#6B7280"));
        closeButton.setTextSize(18);
        closeButton.setPadding(dpToPx(12), dpToPx(12), dpToPx(12), dpToPx(12));
        closeButton.setClickable(true);
        
        // Close button background
        GradientDrawable closeBg = new GradientDrawable();
        closeBg.setShape(GradientDrawable.OVAL);
        closeBg.setColor(Color.parseColor("#F3F4F6"));
        closeButton.setBackground(closeBg);
        closeButton.setOnClickListener(v -> hideExpandedOverlay());
        
        headerContainer.addView(avatarContainer);
        headerContainer.addView(callInfoContainer);
        headerContainer.addView(closeButton);
        
        // Content section with proper spacing
        LinearLayout contentContainer = new LinearLayout(this);
        contentContainer.setOrientation(LinearLayout.VERTICAL);
        contentContainer.setPadding(dpToPx(20), dpToPx(20), dpToPx(20), dpToPx(16));
        
        // Contact information section
        LinearLayout contactSection = new LinearLayout(this);
        contactSection.setOrientation(LinearLayout.VERTICAL);
        contactSection.setPadding(0, 0, 0, dpToPx(16));
        
        TextView phoneNumberLabel = new TextView(this);
        phoneNumberLabel.setText("Phone Number");
        phoneNumberLabel.setTextColor(Color.parseColor("#6B7280"));
        phoneNumberLabel.setTextSize(12);
        phoneNumberLabel.setTypeface(null, android.graphics.Typeface.BOLD);
        phoneNumberLabel.setPadding(0, 0, 0, dpToPx(4));
        
        TextView phoneNumberDisplay = new TextView(this);
        phoneNumberDisplay.setText(currentPhoneNumber != null ? currentPhoneNumber : "Unknown Number");
        phoneNumberDisplay.setTextColor(Color.parseColor("#111827"));
        phoneNumberDisplay.setTextSize(16);
        phoneNumberDisplay.setTypeface(null, android.graphics.Typeface.BOLD);
        phoneNumberDisplay.setPadding(0, 0, 0, dpToPx(12));
        
        TextView leadNameLabel = new TextView(this);
        leadNameLabel.setText("Contact");
        leadNameLabel.setTextColor(Color.parseColor("#6B7280"));
        leadNameLabel.setTextSize(12);
        leadNameLabel.setTypeface(null, android.graphics.Typeface.BOLD);
        leadNameLabel.setPadding(0, 0, 0, dpToPx(4));
        
        TextView leadNameDisplay = new TextView(this);
        leadNameDisplay.setText(currentLeadName != null ? currentLeadName : "Unknown Contact");
        leadNameDisplay.setTextColor(Color.parseColor("#374151"));
        leadNameDisplay.setTextSize(14);
        
        contactSection.addView(phoneNumberLabel);
        contactSection.addView(phoneNumberDisplay);
        contactSection.addView(leadNameLabel);
        contactSection.addView(leadNameDisplay);
        
        // Divider
        View divider = new View(this);
        divider.setBackgroundColor(Color.parseColor("#E5E7EB"));
        LinearLayout.LayoutParams dividerParams = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT, dpToPx(1)
        );
        dividerParams.setMargins(0, dpToPx(8), 0, dpToPx(16));
        divider.setLayoutParams(dividerParams);
        
        // Quick actions with modern button design
        LinearLayout actionsSection = new LinearLayout(this);
        actionsSection.setOrientation(LinearLayout.HORIZONTAL);
        actionsSection.setGravity(Gravity.CENTER);
        
        // Create modern action buttons
        TextView notesButton = createModernActionButton("📝", "Notes", "#3B82F6");
        TextView detailsButton = createModernActionButton("👤", "Details", "#10B981");
        TextView minimizeButton = createModernActionButton("⬇️", "Minimize", "#6B7280");
        minimizeButton.setOnClickListener(v -> hideExpandedOverlay());
        
        // Add buttons with proper spacing
        LinearLayout.LayoutParams buttonParams = new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1.0f);
        buttonParams.setMargins(dpToPx(4), 0, dpToPx(4), 0);
        
        actionsSection.addView(notesButton, buttonParams);
        actionsSection.addView(detailsButton, buttonParams);
        actionsSection.addView(minimizeButton, buttonParams);
        
        // Assemble all sections
        contentContainer.addView(contactSection);
        contentContainer.addView(divider);
        contentContainer.addView(actionsSection);
        
        mainContainer.addView(headerContainer);
        mainContainer.addView(contentContainer);
        
        expandedView = mainContainer;
        
        // Set up window parameters
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
        expandedParams.y = -dpToPx(50);
        
        android.util.Log.d("FloatingOverlay", "Enhanced expanded overlay created successfully");
    }
    
    private TextView createModernActionButton(String icon, String label, String colorHex) {
        LinearLayout buttonContainer = new LinearLayout(this);
        buttonContainer.setOrientation(LinearLayout.VERTICAL);
        buttonContainer.setGravity(Gravity.CENTER);
        buttonContainer.setPadding(dpToPx(12), dpToPx(12), dpToPx(12), dpToPx(12));
        buttonContainer.setClickable(true);
        
        // Modern button background with rounded corners
        GradientDrawable buttonBg = new GradientDrawable();
        buttonBg.setShape(GradientDrawable.RECTANGLE);
        buttonBg.setColor(Color.parseColor(colorHex + "15")); // 15% opacity background
        buttonBg.setCornerRadius(dpToPx(12));
        buttonBg.setStroke(dpToPx(1), Color.parseColor(colorHex + "30")); // 30% opacity border
        buttonContainer.setBackground(buttonBg);
        
        // Icon container
        LinearLayout iconContainer = new LinearLayout(this);
        iconContainer.setGravity(Gravity.CENTER);
        iconContainer.setPadding(dpToPx(8), dpToPx(8), dpToPx(8), dpToPx(8));
        
        GradientDrawable iconBg = new GradientDrawable();
        iconBg.setShape(GradientDrawable.OVAL);
        iconBg.setColor(Color.parseColor(colorHex));
        iconContainer.setBackground(iconBg);
        
        TextView iconText = new TextView(this);
        iconText.setText(icon);
        iconText.setTextSize(16);
        iconContainer.addView(iconText);
        
        // Label text
        TextView labelText = new TextView(this);
        labelText.setText(label);
        labelText.setTextColor(Color.parseColor(colorHex));
        labelText.setTextSize(11);
        labelText.setTypeface(null, android.graphics.Typeface.BOLD);
        labelText.setGravity(Gravity.CENTER);
        labelText.setPadding(0, dpToPx(6), 0, 0);
        
        buttonContainer.addView(iconContainer);
        buttonContainer.addView(labelText);
        
        // Create wrapper TextView to return (keeping interface consistent)
        TextView wrapper = new TextView(this);
        wrapper.setClickable(true);
        
        // Since we can't return LinearLayout as TextView, we'll create a compound drawable effect
        // For now, return a simplified modern button
        TextView modernButton = new TextView(this);
        modernButton.setText(icon + "\n" + label);
        modernButton.setTextColor(Color.parseColor(colorHex));
        modernButton.setTextSize(11);
        modernButton.setTypeface(null, android.graphics.Typeface.BOLD);
        modernButton.setGravity(Gravity.CENTER);
        modernButton.setPadding(dpToPx(16), dpToPx(12), dpToPx(16), dpToPx(12));
        modernButton.setClickable(true);
        
        // Modern button styling
        GradientDrawable modernBg = new GradientDrawable();
        modernBg.setShape(GradientDrawable.RECTANGLE);
        modernBg.setColor(Color.parseColor(colorHex + "10")); // Light background
        modernBg.setCornerRadius(dpToPx(12));
        modernBg.setStroke(dpToPx(2), Color.parseColor(colorHex + "40"));
        modernButton.setBackground(modernBg);
        
        return modernButton;
    }
    
    // Utility method to convert dp to pixels
    private int dpToPx(int dp) {
        float density = getResources().getDisplayMetrics().density;
        return Math.round(dp * density);
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