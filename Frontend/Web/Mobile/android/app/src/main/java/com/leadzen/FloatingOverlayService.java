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
import android.widget.FrameLayout;
import android.animation.ObjectAnimator;
import android.animation.AnimatorSet;
import android.animation.ValueAnimator;
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
        // Create beautiful circular floating icon exactly like React Native version
        FrameLayout container = new FrameLayout(this);
        container.setClickable(true);
        container.setFocusable(true);
        android.util.Log.d("FloatingOverlay", "Creating beautiful circular floating icon...");
        
        // Outer pulse ring (blinking effect)
        TextView pulseRing = new TextView(this);
        GradientDrawable pulseBackground = new GradientDrawable();
        pulseBackground.setShape(GradientDrawable.OVAL);
        pulseBackground.setColor(Color.parseColor("#4014B8A6")); // 25% opacity teal
        pulseRing.setBackground(pulseBackground);
        FrameLayout.LayoutParams pulseParams = new FrameLayout.LayoutParams(dpToPx(70), dpToPx(70));
        pulseParams.gravity = Gravity.CENTER;
        pulseRing.setLayoutParams(pulseParams);
        
        // Main circular icon background
        TextView iconBackground = new TextView(this);
        GradientDrawable mainBackground = new GradientDrawable();
        mainBackground.setShape(GradientDrawable.OVAL);
        mainBackground.setColor(Color.parseColor("#14B8A6")); // Teal primary color
        mainBackground.setStroke(dpToPx(3), Color.parseColor("#FFFFFF")); // White border
        iconBackground.setBackground(mainBackground);
        
        // Add shadow effect for elevation
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            iconBackground.setElevation(dpToPx(8));
        }
        
        FrameLayout.LayoutParams iconParams = new FrameLayout.LayoutParams(dpToPx(56), dpToPx(56));
        iconParams.gravity = Gravity.CENTER;
        iconBackground.setLayoutParams(iconParams);
        
        // Phone icon (using Unicode phone symbol)
        TextView phoneIcon = new TextView(this);
        phoneIcon.setText("📞");
        phoneIcon.setTextSize(24);
        phoneIcon.setGravity(Gravity.CENTER);
        FrameLayout.LayoutParams phoneParams = new FrameLayout.LayoutParams(dpToPx(56), dpToPx(56));
        phoneParams.gravity = Gravity.CENTER;
        phoneIcon.setLayoutParams(phoneParams);
        
        // Call type indicator (small icon in top-right)
        TextView callTypeIndicator = new TextView(this);
        callTypeIndicator.setText("📞");
        callTypeIndicator.setTextSize(10);
        callTypeIndicator.setGravity(Gravity.CENTER);
        
        GradientDrawable indicatorBg = new GradientDrawable();
        indicatorBg.setShape(GradientDrawable.OVAL);
        indicatorBg.setColor(Color.parseColor("#FFFFFF"));
        indicatorBg.setStroke(dpToPx(1), Color.parseColor("#E5E7EB"));
        callTypeIndicator.setBackground(indicatorBg);
        
        FrameLayout.LayoutParams indicatorParams = new FrameLayout.LayoutParams(dpToPx(20), dpToPx(20));
        indicatorParams.gravity = Gravity.TOP | Gravity.END;
        indicatorParams.setMargins(0, dpToPx(5), dpToPx(5), 0);
        callTypeIndicator.setLayoutParams(indicatorParams);
        
        // Lead name label (below icon)
        leadNameView = new TextView(this);
        leadNameView.setText("Unknown");
        leadNameView.setTextColor(Color.parseColor("#1F2937"));
        leadNameView.setTextSize(10);
        leadNameView.setGravity(Gravity.CENTER);
        leadNameView.setTypeface(null, android.graphics.Typeface.BOLD);
        leadNameView.setPadding(dpToPx(6), dpToPx(2), dpToPx(6), dpToPx(2));
        leadNameView.setMaxWidth(dpToPx(80));
        leadNameView.setSingleLine(true);
        
        // Name background
        GradientDrawable nameBg = new GradientDrawable();
        nameBg.setShape(GradientDrawable.RECTANGLE);
        nameBg.setColor(Color.parseColor("#FFFFFF"));
        nameBg.setCornerRadius(dpToPx(6));
        nameBg.setStroke(dpToPx(1), Color.parseColor("#E5E7EB"));
        leadNameView.setBackground(nameBg);
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            leadNameView.setElevation(dpToPx(4));
        }
        
        FrameLayout.LayoutParams nameParams = new FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.WRAP_CONTENT, FrameLayout.LayoutParams.WRAP_CONTENT);
        nameParams.gravity = Gravity.CENTER_HORIZONTAL | Gravity.BOTTOM;
        nameParams.setMargins(0, 0, 0, -dpToPx(10));
        leadNameView.setLayoutParams(nameParams);
        
        // Assemble the floating icon
        container.addView(pulseRing);      // Pulse background
        container.addView(iconBackground); // Main circular background
        container.addView(phoneIcon);      // Phone icon
        container.addView(callTypeIndicator); // Call type indicator
        container.addView(leadNameView);   // Lead name
        
        floatingView = container;
        
        // Start pulse animation
        startPulseAnimation(pulseRing);
        
        android.util.Log.d("FloatingOverlay", "✅ Beautiful circular floating icon created successfully!");
    }
    
    // Pulse animation for the blinking outer ring
    private void startPulseAnimation(View pulseRing) {
        android.animation.ObjectAnimator scaleXAnimator = android.animation.ObjectAnimator.ofFloat(pulseRing, "scaleX", 1f, 1.3f, 1f);
        android.animation.ObjectAnimator scaleYAnimator = android.animation.ObjectAnimator.ofFloat(pulseRing, "scaleY", 1f, 1.3f, 1f);
        android.animation.ObjectAnimator alphaAnimator = android.animation.ObjectAnimator.ofFloat(pulseRing, "alpha", 0.7f, 0.3f, 0.7f);
        
        android.animation.AnimatorSet pulseSet = new android.animation.AnimatorSet();
        pulseSet.playTogether(scaleXAnimator, scaleYAnimator, alphaAnimator);
        pulseSet.setDuration(1200); // 1.2 second pulse
        // AnimatorSet doesn't have repeat methods, so we'll use individual animators
        scaleXAnimator.setRepeatCount(ObjectAnimator.INFINITE);
        scaleXAnimator.setRepeatMode(ObjectAnimator.RESTART);
        scaleYAnimator.setRepeatCount(ObjectAnimator.INFINITE);
        scaleYAnimator.setRepeatMode(ObjectAnimator.RESTART);
        alphaAnimator.setRepeatCount(ObjectAnimator.INFINITE);
        alphaAnimator.setRepeatMode(ObjectAnimator.RESTART);
        
        pulseSet.start();
        android.util.Log.d("FloatingOverlay", "✅ Pulse animation started - outer ring should be blinking!");

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

        // No gravity - use absolute positioning for completely free movement
        params.gravity = Gravity.NO_GRAVITY;
        params.x = 300; // Absolute position from left
        params.y = 400; // Absolute position from top

        // Add view to window manager
        windowManager.addView(floatingView, params);
        android.util.Log.d("FloatingOverlay", "Floating view added to WindowManager successfully");

        // Enhanced touch listener for smooth dragging and reliable click detection
        floatingView.setOnTouchListener(new View.OnTouchListener() {
            private int initialX, initialY;
            private float initialTouchX, initialTouchY;
            private long touchStartTime;
            private boolean isDragging = false;

            @Override
            public boolean onTouch(View v, MotionEvent event) {
                switch (event.getAction()) {
                    case MotionEvent.ACTION_DOWN:
                        // Store initial positions
                        initialX = params.x;
                        initialY = params.y;
                        initialTouchX = event.getRawX();
                        initialTouchY = event.getRawY();
                        touchStartTime = System.currentTimeMillis();
                        isDragging = false;
                        
                        // Add visual feedback - slightly scale down
                        floatingView.animate().scaleX(0.95f).scaleY(0.95f).setDuration(100).start();
                        
                        android.util.Log.d("FloatingOverlay", "👆 Touch DOWN - Ready for drag or click");
                        return true;

                    case MotionEvent.ACTION_MOVE:
                        float deltaX = event.getRawX() - initialTouchX;
                        float deltaY = event.getRawY() - initialTouchY;
                        float moveDistance = (float) Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                        
                        // Start dragging if moved more than threshold
                        if (moveDistance > 15 && !isDragging) {
                            isDragging = true;
                            android.util.Log.d("FloatingOverlay", "🚀 Started dragging - smooth movement enabled");
                        }
                        
                        if (isDragging) {
                            // Completely free dragging with NO_GRAVITY - direct absolute positioning
                            params.x = initialX + (int) deltaX; // Add deltaX for absolute positioning
                            params.y = initialY + (int) deltaY; // Add deltaY for absolute positioning
                            
                            windowManager.updateViewLayout(floatingView, params);
                            android.util.Log.d("FloatingOverlay", "📍 Free dragging to: x=" + params.x + ", y=" + params.y);
                        }
                        return true;

                    case MotionEvent.ACTION_UP:
                        // Restore visual feedback
                        floatingView.animate().scaleX(1.0f).scaleY(1.0f).setDuration(100).start();
                        
                        long touchDuration = System.currentTimeMillis() - touchStartTime;
                        float finalMoveDistance = (float) Math.sqrt(
                            Math.pow(event.getRawX() - initialTouchX, 2) + 
                            Math.pow(event.getRawY() - initialTouchY, 2)
                        );
                        
                        android.util.Log.d("FloatingOverlay", "👆 Touch UP - Duration: " + touchDuration + "ms, Distance: " + finalMoveDistance + "px");
                        
                        if (!isDragging && touchDuration < 500 && finalMoveDistance < 20) {
                            // This is a click, not a drag
                            android.util.Log.d("FloatingOverlay", "🎯 CLICK DETECTED! Expanding overlay...");
                            handleOverlayClick();
                        }
                        // Removed snap to edge - free dragging everywhere!
                        
                        isDragging = false;
                        return true;
                }
                return false;
            }
        });
        
        // Backup click listener for additional reliability
        floatingView.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                android.util.Log.d("FloatingOverlay", "🎯 Backup click listener triggered!");
                handleOverlayClick();
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
        
        android.util.Log.d("FloatingOverlay", "✅ Enhanced floating icon with dragging and click detection setup complete");
    }
    
    // Removed snapToEdge method - now allows completely free dragging

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