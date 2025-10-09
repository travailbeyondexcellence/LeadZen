# Task 5: Android Permissions & Call Detection Service

## 🎯 Goal
Implement Android permissions system and call detection service to monitor incoming/outgoing calls.

## 📋 Scope
- Request and manage Android permissions (phone, overlay, contacts)
- Implement call detection service
- Create permission request flow with explanations
- Set up call state monitoring
- Test call detection with real phone calls

## 🛠️ Technical Requirements
- Install `react-native-permissions` and `react-native-call-detection`
- Create permission management service
- Implement call detection background service
- Add permission request screens with explanations
- Handle permission denial gracefully

## 📱 Expected Deliverable
Working call detection system with:
- Proper Android permissions requested and granted
- Call detection service monitoring phone state
- Permission request flow with user-friendly explanations
- Console logging of call events (incoming, outgoing, ended)
- Graceful handling of permission denials
- Background service working when app is closed

## 🔍 Acceptance Criteria
- [ ] App requests necessary permissions on first launch
- [ ] Permission explanations are clear and user-friendly
- [ ] Call detection service starts automatically
- [ ] Console logs show call events (RINGING, OFFHOOK, IDLE)
- [ ] Phone number extraction works for incoming calls
- [ ] Service continues running in background
- [ ] Handles permission denial without crashing
- [ ] Works with real phone calls (test with actual calls)

## 📚 Files to Create/Modify
- `src/services/PermissionService.js` - Permission management
- `src/services/CallDetectionService.js` - Call monitoring
- `src/screens/PermissionRequest.tsx` - Permission explanation screen
- `src/utils/androidPermissions.js` - Permission constants
- `App.tsx` - Initialize services on startup
- `android/app/src/main/AndroidManifest.xml` - Permission declarations

## 🔐 Required Android Permissions
```xml
<!-- Call Management -->
<uses-permission android:name="android.permission.READ_PHONE_STATE" />
<uses-permission android:name="android.permission.CALL_PHONE" />
<uses-permission android:name="android.permission.ANSWER_PHONE_CALLS" />

<!-- Overlay System -->
<uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />

<!-- Contacts Integration -->
<uses-permission android:name="android.permission.READ_CONTACTS" />

<!-- Storage for lead photos -->
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.CAMERA" />
```

## 🔧 Call Detection Implementation
```javascript
// CallDetectionService.js
class CallDetectionService {
  start() {
    this.callDetector = new CallDetectorManager((event, number) => {
      console.log('Call Event:', event, 'Number:', number);
      
      switch(event) {
        case 'Incoming':
          this.handleIncomingCall(number);
          break;
        case 'Outgoing':
          this.handleOutgoingCall(number);
          break;
        case 'Disconnected':
          this.handleCallEnded(number);
          break;
        case 'Missed':
          this.handleMissedCall(number);
          break;
      }
    });
  }

  handleIncomingCall(phoneNumber) {
    console.log('📞 Incoming call from:', phoneNumber);
    // Next task will implement overlay display
  }

  handleOutgoingCall(phoneNumber) {
    console.log('📱 Outgoing call to:', phoneNumber);
    // Next task will implement overlay display
  }

  handleCallEnded(phoneNumber) {
    console.log('📴 Call ended with:', phoneNumber);
    // Next task will implement post-call actions
  }
}
```

## 🎨 Permission Request Flow UI
```
┌─────────────────────────────────────┐
│ 🔒 Permissions Required             │
├─────────────────────────────────────┤
│                                     │
│ 📞 Phone Access                     │
│ To display lead information during  │
│ calls and track call history        │
│                                     │
│ 🎯 Overlay Permission               │
│ To show lead popup during active    │
│ calls without interrupting you      │
│                                     │
│ 👥 Contacts Access                  │
│ To match incoming calls with your   │
│ existing leads and contacts         │
│                                     │
│ [Grant Permissions] [Learn More]    │
│                                     │
│ ⚠️ These permissions are required   │
│ for core app functionality          │
└─────────────────────────────────────┘
```

## 🔧 Permission Management Logic
```javascript
const PermissionService = {
  async requestAllPermissions() {
    const permissions = [
      PERMISSIONS.ANDROID.READ_PHONE_STATE,
      PERMISSIONS.ANDROID.CALL_PHONE,
      PERMISSIONS.ANDROID.SYSTEM_ALERT_WINDOW,
      PERMISSIONS.ANDROID.READ_CONTACTS,
      PERMISSIONS.ANDROID.CAMERA
    ];

    const results = await requestMultiple(permissions);
    return this.analyzePermissionResults(results);
  },

  analyzePermissionResults(results) {
    const granted = [];
    const denied = [];
    
    Object.keys(results).forEach(permission => {
      if (results[permission] === RESULTS.GRANTED) {
        granted.push(permission);
      } else {
        denied.push(permission);
      }
    });

    return { granted, denied };
  }
};
```

## 📱 Testing Strategy
1. **Permission Flow Testing:**
   - Test on fresh app install
   - Test permission denial scenarios
   - Test permission revocation
   - Test "Don't ask again" handling

2. **Call Detection Testing:**
   - Make actual phone calls to test device
   - Test incoming calls from different numbers
   - Test outgoing calls to various numbers
   - Test missed call detection
   - Verify background service persistence

## ⚠️ Critical Notes
- **Test with Real Calls:** This task requires actual phone calls for testing
- **Background Service:** Ensure service survives app backgrounding
- **Battery Optimization:** Handle Android battery optimization warnings
- **Permission Rationale:** Provide clear explanations for each permission
- **Graceful Degradation:** App should work with limited permissions

## 🔍 Debugging & Logs
Add comprehensive logging for troubleshooting:
```javascript
console.log('🔒 Permission granted:', permission);
console.log('❌ Permission denied:', permission);
console.log('📞 Call detected:', event, phoneNumber);
console.log('🔋 Service started in background');
```

## 🚀 Next Task Preview
Task 6 will implement the call overlay UI that appears during calls.