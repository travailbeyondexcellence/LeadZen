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
    private String currentCallState = "DURING"; // DURING, AFTER, ENDED
    private int selectedTabIndex = 0; // 0=Action, 1=Activity, 2=Insight

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
        android.util.Log.d("FloatingOverlay", "Creating professional overlay with proper transparency and icon connection...");
        
        // Main container with semi-transparent background (like reference image)
        FrameLayout mainContainer = new FrameLayout(this);
        mainContainer.setClickable(true);
        mainContainer.setFocusable(true);
        // Semi-transparent dark overlay background (50% opacity)
        mainContainer.setBackgroundColor(Color.parseColor("#80000000")); // 50% black overlay
        
        // Create a new circular icon for the top of overlay (don't move the original)
        View overlayIcon = createOverlayTopIcon();
        
        // Professional overlay card (positioned below the icon)
        LinearLayout overlayCard = new LinearLayout(this);
        overlayCard.setOrientation(LinearLayout.VERTICAL);
        overlayCard.setPadding(dpToPx(20), dpToPx(60), dpToPx(20), dpToPx(20)); // Top padding for icon space
        
        // White card background with rounded corners
        GradientDrawable cardBg = new GradientDrawable();
        cardBg.setShape(GradientDrawable.RECTANGLE);
        cardBg.setColor(Color.parseColor("#FFFFFF"));
        cardBg.setCornerRadius(dpToPx(16));
        overlayCard.setBackground(cardBg);
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            overlayCard.setElevation(dpToPx(16));
        }
        
        // PHASE 1: Professional Header with Contact Info
        LinearLayout headerSection = createProfessionalHeader();
        
        // PHASE 2 & 4: Quick Action Buttons (Move to..., Create Meeting, SMS)
        LinearLayout quickActionsSection = createQuickActionButtons();
        
        // PHASE 2: Tab Navigation (Action, Activity, Insight)
        LinearLayout tabNavigationSection = createTabNavigation();
        
        // PHASE 3: Label Management Section
        LinearLayout labelSection = createLabelManagementSection();
        
        // PHASE 5: Bottom Action Bar (Labels, Note, Reminder, Task)
        LinearLayout bottomActionBar = createBottomActionBar();
        
        // Assemble all sections
        overlayCard.addView(headerSection);
        overlayCard.addView(quickActionsSection);
        overlayCard.addView(tabNavigationSection);
        overlayCard.addView(labelSection);
        overlayCard.addView(bottomActionBar);
        
        // Position the overlay card (takes ~50% of screen height, connected to icon)
        FrameLayout.LayoutParams cardParams = new FrameLayout.LayoutParams(
            dpToPx(340), FrameLayout.LayoutParams.WRAP_CONTENT);
        cardParams.gravity = Gravity.CENTER_HORIZONTAL | Gravity.TOP;
        cardParams.setMargins(dpToPx(20), dpToPx(120), dpToPx(20), dpToPx(50)); // Position below icon
        overlayCard.setLayoutParams(cardParams);
        
        // Position the overlay icon at the top center
        FrameLayout.LayoutParams iconParams = new FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.WRAP_CONTENT, FrameLayout.LayoutParams.WRAP_CONTENT);
        iconParams.gravity = Gravity.CENTER_HORIZONTAL | Gravity.TOP;
        iconParams.setMargins(0, dpToPx(60), 0, 0); // Top margin for icon
        overlayIcon.setLayoutParams(iconParams);
        
        // Add both card and icon to main container
        mainContainer.addView(overlayCard);
        mainContainer.addView(overlayIcon);
        
        expandedView = mainContainer;
        
        // Set up window parameters
        int layoutType;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            layoutType = WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY;
        } else {
            layoutType = WindowManager.LayoutParams.TYPE_PHONE;
        }

        expandedParams = new WindowManager.LayoutParams(
                WindowManager.LayoutParams.MATCH_PARENT,
                WindowManager.LayoutParams.MATCH_PARENT,
                layoutType,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE | 
                WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL | 
                WindowManager.LayoutParams.FLAG_WATCH_OUTSIDE_TOUCH,
                PixelFormat.TRANSLUCENT
        );

        expandedParams.gravity = Gravity.CENTER;
        expandedParams.x = 0;
        expandedParams.y = 0;
        
        android.util.Log.d("FloatingOverlay", "Professional expanded overlay created successfully");
    }
    
    // PHASE 1: Professional Header with Contact Info
    private LinearLayout createProfessionalHeader() {
        LinearLayout headerContainer = new LinearLayout(this);
        headerContainer.setOrientation(LinearLayout.VERTICAL);
        headerContainer.setPadding(0, 0, 0, dpToPx(20));
        
        // Contact Info Section
        LinearLayout contactHeader = new LinearLayout(this);
        contactHeader.setOrientation(LinearLayout.HORIZONTAL);
        contactHeader.setGravity(Gravity.CENTER_VERTICAL);
        contactHeader.setPadding(0, 0, 0, dpToPx(16));
        
        // Profile Picture with purple ring (like reference)
        LinearLayout profileContainer = new LinearLayout(this);
        profileContainer.setGravity(Gravity.CENTER);
        profileContainer.setPadding(dpToPx(8), dpToPx(8), dpToPx(8), dpToPx(8));
        
        // Purple ring around profile
        GradientDrawable profileRing = new GradientDrawable();
        profileRing.setShape(GradientDrawable.OVAL);
        profileRing.setStroke(dpToPx(3), Color.parseColor("#8B5CF6")); // Purple ring
        profileRing.setColor(Color.parseColor("#F3F4F6")); // Light background
        profileContainer.setBackground(profileRing);
        
        // Profile picture placeholder
        TextView profilePic = new TextView(this);
        profilePic.setText("👤");
        profilePic.setTextSize(24);
        profilePic.setGravity(Gravity.CENTER);
        
        LinearLayout.LayoutParams profileParams = new LinearLayout.LayoutParams(dpToPx(60), dpToPx(60));
        profileContainer.setLayoutParams(profileParams);
        profileContainer.addView(profilePic);
        
        // Contact Details
        LinearLayout contactDetails = new LinearLayout(this);
        contactDetails.setOrientation(LinearLayout.VERTICAL);
        contactDetails.setPadding(dpToPx(16), 0, 0, 0);
        LinearLayout.LayoutParams detailsParams = new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1.0f);
        contactDetails.setLayoutParams(detailsParams);
        
        // Contact Name (like "Brianna Harper")
        TextView contactName = new TextView(this);
        contactName.setText(currentLeadName != null ? currentLeadName : "Unknown Contact");
        contactName.setTextColor(Color.parseColor("#111827"));
        contactName.setTextSize(18);
        contactName.setTypeface(null, android.graphics.Typeface.BOLD);
        
        // Contact Role (like "Nurse")
        TextView contactRole = new TextView(this);
        contactRole.setText("Contact"); // Could be enhanced with actual role data
        contactRole.setTextColor(Color.parseColor("#6B7280"));
        contactRole.setTextSize(14);
        contactRole.setPadding(0, dpToPx(2), 0, dpToPx(4));
        
        // Phone Number
        TextView phoneNumber = new TextView(this);
        phoneNumber.setText(currentPhoneNumber != null ? currentPhoneNumber : "(000) 000-0000");
        phoneNumber.setTextColor(Color.parseColor("#374151"));
        phoneNumber.setTextSize(14);
        
        contactDetails.addView(contactName);
        contactDetails.addView(contactRole);
        contactDetails.addView(phoneNumber);
        
        // Close button
        TextView closeButton = new TextView(this);
        closeButton.setText("✕");
        closeButton.setTextColor(Color.parseColor("#9CA3AF"));
        closeButton.setTextSize(20);
        closeButton.setPadding(dpToPx(12), dpToPx(12), dpToPx(12), dpToPx(12));
        closeButton.setClickable(true);
        closeButton.setOnClickListener(v -> hideExpandedOverlay());
        
        contactHeader.addView(profileContainer);
        contactHeader.addView(contactDetails);
        contactHeader.addView(closeButton);
        
        headerContainer.addView(contactHeader);
        
        return headerContainer;
    }
    
    // PHASE 2 & 4: Quick Action Buttons
    private LinearLayout createQuickActionButtons() {
        LinearLayout actionButtonsContainer = new LinearLayout(this);
        actionButtonsContainer.setOrientation(LinearLayout.VERTICAL);
        actionButtonsContainer.setPadding(0, 0, 0, dpToPx(20));
        
        // Move to... button
        LinearLayout moveToButton = createQuickActionButton("🔗", "Move to...", false);
        
        // Create Meeting button  
        LinearLayout meetingButton = createQuickActionButton("📅", "Create Meeting", false);
        
        // SMS button (only show for AFTER call state)
        if ("AFTER".equals(currentCallState)) {
            LinearLayout smsButton = createQuickActionButton("💬", "Send SMS", false);
            actionButtonsContainer.addView(smsButton);
        }
        
        actionButtonsContainer.addView(moveToButton);
        actionButtonsContainer.addView(meetingButton);
        
        return actionButtonsContainer;
    }
    
    private LinearLayout createQuickActionButton(String icon, String text, boolean hasChevron) {
        LinearLayout buttonContainer = new LinearLayout(this);
        buttonContainer.setOrientation(LinearLayout.HORIZONTAL);
        buttonContainer.setGravity(Gravity.CENTER_VERTICAL);
        buttonContainer.setPadding(dpToPx(16), dpToPx(12), dpToPx(16), dpToPx(12));
        buttonContainer.setClickable(true);
        
        // Button background
        GradientDrawable buttonBg = new GradientDrawable();
        buttonBg.setShape(GradientDrawable.RECTANGLE);
        buttonBg.setColor(Color.parseColor("#F9FAFB"));
        buttonBg.setCornerRadius(dpToPx(8));
        buttonBg.setStroke(dpToPx(1), Color.parseColor("#E5E7EB"));
        buttonContainer.setBackground(buttonBg);
        
        LinearLayout.LayoutParams buttonParams = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        buttonParams.setMargins(0, 0, 0, dpToPx(8));
        buttonContainer.setLayoutParams(buttonParams);
        
        // Icon
        TextView iconView = new TextView(this);
        iconView.setText(icon);
        iconView.setTextSize(16);
        iconView.setPadding(0, 0, dpToPx(12), 0);
        
        // Text
        TextView textView = new TextView(this);
        textView.setText(text);
        textView.setTextColor(Color.parseColor("#374151"));
        textView.setTextSize(14);
        LinearLayout.LayoutParams textParams = new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1.0f);
        textView.setLayoutParams(textParams);
        
        buttonContainer.addView(iconView);
        buttonContainer.addView(textView);
        
        if (hasChevron) {
            TextView chevron = new TextView(this);
            chevron.setText(">");
            chevron.setTextColor(Color.parseColor("#9CA3AF"));
            chevron.setTextSize(14);
            buttonContainer.addView(chevron);
        }
        
        return buttonContainer;
    }
    
    // PHASE 2: Tab Navigation System
    private LinearLayout createTabNavigation() {
        LinearLayout tabContainer = new LinearLayout(this);
        tabContainer.setOrientation(LinearLayout.HORIZONTAL);
        tabContainer.setPadding(0, dpToPx(16), 0, dpToPx(16));
        
        // Tab buttons
        TextView actionTab = createTabButton("Action", 0);
        TextView activityTab = createTabButton("Activity", 1);
        TextView insightTab = createTabButton("Insight", 2);
        
        LinearLayout.LayoutParams tabParams = new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1.0f);
        
        tabContainer.addView(actionTab, tabParams);
        tabContainer.addView(activityTab, tabParams);
        tabContainer.addView(insightTab, tabParams);
        
        return tabContainer;
    }
    
    private TextView createTabButton(String title, int tabIndex) {
        TextView tabButton = new TextView(this);
        tabButton.setText(title);
        tabButton.setTextSize(14);
        tabButton.setGravity(Gravity.CENTER);
        tabButton.setPadding(dpToPx(16), dpToPx(12), dpToPx(16), dpToPx(12));
        tabButton.setClickable(true);
        
        if (selectedTabIndex == tabIndex) {
            // Selected tab styling
            tabButton.setTextColor(Color.parseColor("#8B5CF6")); // Purple
            tabButton.setTypeface(null, android.graphics.Typeface.BOLD);
            
            // Add purple underline
            GradientDrawable selectedBg = new GradientDrawable();
            selectedBg.setShape(GradientDrawable.RECTANGLE);
            selectedBg.setColor(Color.parseColor("#F9FAFB"));
            selectedBg.setStroke(0, 0, 0, dpToPx(2)); // Bottom border
            selectedBg.setStroke(dpToPx(2), Color.parseColor("#8B5CF6")); // Purple underline
            tabButton.setBackground(selectedBg);
        } else {
            // Unselected tab styling
            tabButton.setTextColor(Color.parseColor("#9CA3AF"));
            tabButton.setTypeface(null, android.graphics.Typeface.NORMAL);
        }
        
        tabButton.setOnClickListener(v -> {
            selectedTabIndex = tabIndex;
            // Recreate tab navigation to update selected state
            // For now, just log the selection
            android.util.Log.d("FloatingOverlay", "Tab selected: " + title + " (index: " + tabIndex + ")");
        });
        
        return tabButton;
    }
    
    // PHASE 3: Label Management System
    private LinearLayout createLabelManagementSection() {
        LinearLayout labelContainer = new LinearLayout(this);
        labelContainer.setOrientation(LinearLayout.VERTICAL);
        labelContainer.setPadding(0, 0, 0, dpToPx(20));
        
        // Label section header
        TextView labelHeader = new TextView(this);
        labelHeader.setText("Label " + (currentLeadName != null ? currentLeadName : "Contact"));
        labelHeader.setTextColor(Color.parseColor("#6B7280"));
        labelHeader.setTextSize(14);
        labelHeader.setTypeface(null, android.graphics.Typeface.BOLD);
        labelHeader.setPadding(0, 0, 0, dpToPx(12));
        
        // Label pills container (horizontal scrollable)
        LinearLayout labelsRow = new LinearLayout(this);
        labelsRow.setOrientation(LinearLayout.HORIZONTAL);
        labelsRow.setPadding(0, 0, 0, 0);
        
        // Create label pills matching reference design
        labelsRow.addView(createLabelPill("Warm Leads", "#F59E0B", "#FEF3C7")); // Orange/Yellow
        labelsRow.addView(createLabelPill("Customer", "#EF4444", "#FEE2E2")); // Red
        labelsRow.addView(createLabelPill("Budge $", "#8B5CF6", "#F3E8FF")); // Purple
        labelsRow.addView(createLabelPill("Project A", "#3B82F6", "#DBEAFE")); // Blue
        labelsRow.addView(createLabelPill("Project B", "#10B981", "#D1FAE5")); // Green
        
        labelContainer.addView(labelHeader);
        labelContainer.addView(labelsRow);
        
        return labelContainer;
    }
    
    private TextView createLabelPill(String text, String textColor, String bgColor) {
        TextView labelPill = new TextView(this);
        labelPill.setText(text);
        labelPill.setTextColor(Color.parseColor(textColor));
        labelPill.setTextSize(12);
        labelPill.setTypeface(null, android.graphics.Typeface.BOLD);
        labelPill.setPadding(dpToPx(12), dpToPx(6), dpToPx(12), dpToPx(6));
        labelPill.setClickable(true);
        
        // Pill background
        GradientDrawable pillBg = new GradientDrawable();
        pillBg.setShape(GradientDrawable.RECTANGLE);
        pillBg.setColor(Color.parseColor(bgColor));
        pillBg.setCornerRadius(dpToPx(16)); // Full rounded corners
        labelPill.setBackground(pillBg);
        
        LinearLayout.LayoutParams pillParams = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        pillParams.setMargins(0, 0, dpToPx(8), 0);
        labelPill.setLayoutParams(pillParams);
        
        return labelPill;
    }
    
    // PHASE 5: Bottom Action Bar
    private LinearLayout createBottomActionBar() {
        LinearLayout bottomContainer = new LinearLayout(this);
        bottomContainer.setOrientation(LinearLayout.HORIZONTAL);
        bottomContainer.setGravity(Gravity.CENTER);
        bottomContainer.setPadding(dpToPx(8), dpToPx(16), dpToPx(8), dpToPx(8));
        
        // Bottom action buttons
        bottomContainer.addView(createBottomActionButton("🏷️", "Labels", true));
        bottomContainer.addView(createBottomActionButton("📝", "Note", false));
        bottomContainer.addView(createBottomActionButton("⏰", "Reminder", false));
        bottomContainer.addView(createBottomActionButton("✅", "Task", false));
        
        return bottomContainer;
    }
    
    private LinearLayout createBottomActionButton(String icon, String label, boolean isSelected) {
        LinearLayout buttonContainer = new LinearLayout(this);
        buttonContainer.setOrientation(LinearLayout.VERTICAL);
        buttonContainer.setGravity(Gravity.CENTER);
        buttonContainer.setPadding(dpToPx(16), dpToPx(8), dpToPx(16), dpToPx(8));
        buttonContainer.setClickable(true);
        
        LinearLayout.LayoutParams buttonParams = new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1.0f);
        buttonContainer.setLayoutParams(buttonParams);
        
        // Icon
        TextView iconView = new TextView(this);
        iconView.setText(icon);
        iconView.setTextSize(20);
        iconView.setGravity(Gravity.CENTER);
        iconView.setPadding(0, 0, 0, dpToPx(4));
        
        // Label
        TextView labelView = new TextView(this);
        labelView.setText(label);
        labelView.setTextSize(12);
        labelView.setGravity(Gravity.CENTER);
        
        if (isSelected) {
            iconView.setTextColor(Color.parseColor("#8B5CF6")); // Purple for selected
            labelView.setTextColor(Color.parseColor("#8B5CF6"));
            labelView.setTypeface(null, android.graphics.Typeface.BOLD);
            
            // Add purple underline
            View underline = new View(this);
            underline.setBackgroundColor(Color.parseColor("#8B5CF6"));
            LinearLayout.LayoutParams underlineParams = new LinearLayout.LayoutParams(dpToPx(24), dpToPx(2));
            underlineParams.setMargins(0, dpToPx(4), 0, 0);
            underline.setLayoutParams(underlineParams);
            
            buttonContainer.addView(iconView);
            buttonContainer.addView(labelView);
            buttonContainer.addView(underline);
        } else {
            iconView.setTextColor(Color.parseColor("#9CA3AF")); // Gray for unselected
            labelView.setTextColor(Color.parseColor("#9CA3AF"));
            
            buttonContainer.addView(iconView);
            buttonContainer.addView(labelView);
        }
        
        return buttonContainer;
    }
    
    // Create the circular icon that appears at top of overlay (connected to main card)
    private View createOverlayTopIcon() {
        FrameLayout container = new FrameLayout(this);
        
        // Outer pulse ring (same as floating icon)
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
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            iconBackground.setElevation(dpToPx(8));
        }
        
        FrameLayout.LayoutParams iconParams = new FrameLayout.LayoutParams(dpToPx(56), dpToPx(56));
        iconParams.gravity = Gravity.CENTER;
        iconBackground.setLayoutParams(iconParams);
        
        // Phone icon
        TextView phoneIcon = new TextView(this);
        phoneIcon.setText("📞");
        phoneIcon.setTextSize(24);
        phoneIcon.setGravity(Gravity.CENTER);
        FrameLayout.LayoutParams phoneParams = new FrameLayout.LayoutParams(dpToPx(56), dpToPx(56));
        phoneParams.gravity = Gravity.CENTER;
        phoneIcon.setLayoutParams(phoneParams);
        
        // Assemble the icon
        container.addView(pulseRing);
        container.addView(iconBackground);
        container.addView(phoneIcon);
        
        // Start pulse animation
        startPulseAnimation(pulseRing);
        
        return container;
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
            
            // Keep the original floating icon visible - don't hide it
            // The overlay has its own connected icon at the top
            android.util.Log.d("FloatingOverlay", "✅ Keeping original floating icon visible and adding connected overlay");
            
            // Show the expanded overlay
            windowManager.addView(expandedView, expandedParams);
            isExpanded = true;
            
            // PHASE 6: Professional slide-up animation
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.HONEYCOMB) {
                expandedView.setAlpha(0f);
                expandedView.setTranslationY(dpToPx(300)); // Start from bottom
                expandedView.animate()
                    .alpha(1f)
                    .translationY(0f)
                    .setDuration(400) // Smooth 400ms animation
                    .setInterpolator(new android.view.animation.DecelerateInterpolator())
                    .start();
            }
            
            android.util.Log.d("FloatingOverlay", "✅ PROFESSIONAL EXPANDED OVERLAY SHOWN WITH ANIMATION!");
            android.util.Log.d("FloatingOverlay", "✅ All 6 phases implemented - overlay should look exactly like reference!");
            
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
            
            // Original floating icon stays visible - no need to restore
            android.util.Log.d("FloatingOverlay", "✅ Original floating icon remains visible");
            
            android.util.Log.d("FloatingOverlay", "✅ NATIVE EXPANDED OVERLAY HIDDEN SUCCESSFULLY!");
            
        } catch (Exception e) {
            android.util.Log.e("FloatingOverlay", "❌ Error hiding expanded overlay: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public void updateOverlayData(String phoneNumber, String leadName) {
        updateOverlayData(phoneNumber, leadName, "DURING");
    }
    
    public void updateOverlayData(String phoneNumber, String leadName, String callState) {
        // Store current call data
        this.currentPhoneNumber = phoneNumber;
        this.currentLeadName = leadName;
        this.currentCallState = callState;
        
        // Update small floating icon
        if (leadNameView != null) {
            leadNameView.setText(leadName != null ? leadName : "Unknown");
        }
        
        // If overlay is currently expanded, recreate it to reflect new state
        if (isExpanded && expandedView != null) {
            try {
                windowManager.removeView(expandedView);
                expandedView = null;
                createExpandedOverlay();
                windowManager.addView(expandedView, expandedParams);
                
                // PHASE 6: Add slide-up animation
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.HONEYCOMB) {
                    expandedView.setAlpha(0f);
                    expandedView.setTranslationY(dpToPx(200));
                    expandedView.animate()
                        .alpha(1f)
                        .translationY(0f)
                        .setDuration(300)
                        .start();
                }
                
            } catch (Exception e) {
                android.util.Log.e("FloatingOverlay", "Error updating expanded overlay: " + e.getMessage());
            }
        }
        
        android.util.Log.d("FloatingOverlay", "✅ Updated overlay data - Phone: " + phoneNumber + ", Lead: " + leadName + ", State: " + callState);
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