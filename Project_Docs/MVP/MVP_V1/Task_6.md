# Task 6: Call Overlay UI Implementation

## 🎯 Goal
Create the call overlay system that displays lead information during active calls.

## 📋 Scope
- Implement floating call overlay window
- Display lead information during calls (compact view)
- Add quick action buttons (Add Note, Update Status)
- Create post-call bottom tray (detailed view)
- Integrate with call detection service from Task 5

## 🛠️ Technical Requirements
- Create overlay component using `SYSTEM_ALERT_WINDOW` permission
- Implement lead matching by phone number
- Design compact overlay for during-call use
- Build detailed bottom tray for post-call interaction
- Connect to call detection events

## 📱 Expected Deliverable
Functional call overlay system with:
- Compact overlay appearing during active calls
- Lead information displayed (name, company, status, last contact)
- Quick action buttons working during calls
- Detailed bottom tray opening after call ends
- Smooth animations and transitions
- Lead matching working with demo data

## 🔍 Acceptance Criteria
- [ ] Overlay appears automatically when call is detected
- [ ] Lead information displays correctly (if found in database)
- [ ] Unknown callers show "Add to CRM" option
- [ ] Quick actions work during active calls
- [ ] Overlay minimizes/maximizes on user request
- [ ] Post-call bottom tray slides up after call ends
- [ ] All interactions save to database
- [ ] Overlay doesn't interfere with native call UI

## 📚 Files to Create/Modify
- `src/components/CallOverlay.tsx` - Main overlay component
- `src/components/CompactCallView.tsx` - During-call view
- `src/components/PostCallTray.tsx` - After-call detailed view
- `src/services/OverlayService.js` - Overlay management
- `src/services/CallDetectionService.js` - Connect to overlay
- `src/services/DatabaseService.js` - Add lead lookup methods
- `src/utils/phoneUtils.js` - Phone number formatting/matching

## 🎨 UI Design - Compact Overlay (During Call)
```
┌─────────────────────────────────────┐
│ 📞 Incoming Call - 00:42           │ ← Native call interface
│                                     │
│ ╭─────────────────────────────────╮ │
│ │ 👤 Sarah Johnson               │ │ ← Compact overlay (30% screen)
│ │ Tech Solutions Ltd             │ │
│ │ Status: Warm Lead              │ │
│ │ Last Contact: 2 days ago       │ │
│ │                                │ │
│ │ [📝 Note] [📊 Status] [─] Min  │ │ ← Quick actions
│ ╰─────────────────────────────────╯ │
│                                     │
│ [🔴 End]    [📞 Hold]    [🔇 Mute] │ ← Native controls
└─────────────────────────────────────┘
```

## 🎨 UI Design - Post-Call Tray (Reference Based)
```
┌─────────────────────────────────────┐
│                                     │
│ ╭─────────────────────────────────╮ │ ← Slides up from bottom
│ │ ═══                             │ │ ← Drag handle
│ │ 👤 Sarah Johnson               │ │
│ │ Tech Solutions Ltd             │ │
│ │ (555) 123-4567                 │ │
│ │                                │ │
│ │ Info │ Notes │ Activity │ Tags  │ │ ← Tabs
│ │ ─────                          │ │
│ │                                │ │
│ │ 📝 Call Notes:                 │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ Type your notes here...     │ │ │
│ │ └─────────────────────────────┘ │ │
│ │                                │ │
│ │ Move to: [Warm Leads ▼]        │ │
│ │                                │ │
│ │ 🏷️ Add Label  [Customer] [VIP] │ │
│ │                                │ │
│ │ [📅 Schedule Follow-up]        │ │
│ │ [💾 Save & Close]              │ │
│ ╰─────────────────────────────────╯ │
└─────────────────────────────────────┘
```

## 🔧 Lead Matching Logic
```javascript
const LeadMatcher = {
  async findLeadByPhone(phoneNumber) {
    // Clean and format phone number
    const cleanNumber = this.cleanPhoneNumber(phoneNumber);
    
    // Search in database
    const lead = await DatabaseService.getLeadByPhone(cleanNumber);
    
    if (lead) {
      return {
        found: true,
        lead: lead,
        type: 'existing'
      };
    }
    
    return {
      found: false,
      phoneNumber: cleanNumber,
      type: 'unknown'
    };
  },

  cleanPhoneNumber(phone) {
    // Remove all non-digits and format consistently
    return phone.replace(/\D/g, '').slice(-10);
  }
};
```

## 🎭 Overlay State Management
```javascript
const OverlayStates = {
  HIDDEN: 'hidden',           // No overlay shown
  COMPACT: 'compact',         // During call - minimal info
  MINIMIZED: 'minimized',     // User minimized during call
  POST_CALL: 'post_call',     // After call - detailed tray
  ADDING_LEAD: 'adding_lead'  // Creating new lead from unknown number
};

class OverlayService {
  constructor() {
    this.state = OverlayStates.HIDDEN;
    this.currentLead = null;
    this.callStartTime = null;
  }

  showCallOverlay(phoneNumber) {
    this.findAndDisplayLead(phoneNumber);
    this.setState(OverlayStates.COMPACT);
  }

  hideCallOverlay() {
    this.setState(OverlayStates.HIDDEN);
  }

  showPostCallTray(phoneNumber, callDuration) {
    this.logCallToDatabase(phoneNumber, callDuration);
    this.setState(OverlayStates.POST_CALL);
  }
}
```

## 📝 Quick Actions Implementation
**During Call Actions:**
1. **Add Note:** Quick text input for call notes
2. **Update Status:** Dropdown to change pipeline stage
3. **Minimize:** Hide overlay but keep in memory

**Post-Call Actions:**
1. **Detailed Notes:** Rich text editor for comprehensive notes
2. **Pipeline Movement:** Change lead stage with visual feedback
3. **Label Management:** Add/remove tags and labels
4. **Schedule Follow-up:** Create reminder for next contact
5. **Add New Lead:** For unknown callers

## 🔧 Animation & UX Details
- **Overlay Entrance:** Fade in with slide down (300ms)
- **State Transitions:** Smooth morphing between compact/detailed (400ms)
- **Bottom Tray:** Spring animation slide up from bottom (500ms)
- **Minimize Animation:** Scale down to small floating button
- **Touch Feedback:** Haptic feedback for button presses

## ⚠️ Critical Implementation Notes
- **Overlay Z-Index:** Ensure overlay appears above all other apps
- **Touch Passthrough:** Don't block native call controls
- **Memory Management:** Clean up overlay when not needed
- **Battery Optimization:** Minimal CPU usage during calls
- **Error Handling:** Graceful fallback if overlay fails

## 🧪 Testing Scenarios
1. **Known Lead Call:** Call from number in demo database
2. **Unknown Number:** Call from number not in database
3. **Multiple Calls:** Handling call waiting scenarios
4. **Long Calls:** Test overlay during extended calls
5. **Quick Actions:** Test all buttons during active calls
6. **Post-Call Flow:** Verify bottom tray after call ends

## 🚀 Next Task Preview
Task 7 will implement the built-in dialer with T9 search and lead integration.