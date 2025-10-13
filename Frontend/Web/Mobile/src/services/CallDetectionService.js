import CallDetectorManager from 'react-native-call-detection';
import PermissionService from './PermissionService';
import OverlayService from './OverlayService';
import PhoneMatchingService from './PhoneMatchingService';
import PermissionManager from './PermissionManager';
import NativeFloatingOverlay from './NativeFloatingOverlay';

class CallDetectionService {
  constructor() {
    this.callDetector = null;
    this.isRunning = false;
    this.currentCall = null;
    this.floatingCallManager = null;
    this.callStartTime = null;
    this.lastCallPhoneNumber = null; // Store phone number from Incoming/Outgoing events
    this.lastMatchResult = null; // Store last match result
    this.nativeOverlayActive = false;
    this.setupNativeOverlayListener();
  }
  
  setupNativeOverlayListener() {
    // Listen for native overlay clicks
    this.overlayClickCleanup = NativeFloatingOverlay.onOverlayClick(() => {
      console.log('[CALL_DETECTION] 🎯 NATIVE OVERLAY CLICKED! Expanding React Native overlay...');
      console.log('[CALL_DETECTION] =====================================================');
      console.log('[CALL_DETECTION] Event triggered by native overlay click');
      console.log('[CALL_DETECTION] floatingCallManager available:', !!this.floatingCallManager);
      console.log('[CALL_DETECTION] lastCallPhoneNumber:', this.lastCallPhoneNumber);
      console.log('[CALL_DETECTION] currentCall:', this.currentCall);
      console.log('[CALL_DETECTION] lastMatchResult:', this.lastMatchResult);
      
      // Show the React Native overlay when native overlay is clicked
      if (this.floatingCallManager) {
        console.log('[CALL_DETECTION] ✅ FloatingCallManager available - proceeding with overlay expansion');
        
        try {
          // Use stored phone number or fallback to current call or default
          const phoneNumber = this.lastCallPhoneNumber || 
                             this.currentCall?.phoneNumber || 
                             'Unknown Number';
          
          const callType = this.currentCall?.event === 'Outgoing' ? 'outgoing' : 'incoming';
          console.log('[CALL_DETECTION] Using phone number:', phoneNumber);
          console.log('[CALL_DETECTION] Call type determined:', callType);
          
          // Create a match result if we don't have one
          const matchResult = this.lastMatchResult || {
            phoneNumber: phoneNumber,
            normalizedNumber: phoneNumber,
            matchedLeads: [],
            matchConfidence: 'none',
            multipleMatches: false,
            hasMatch: false
          };
          
          this.showFloatingCallOverlay(
            phoneNumber,
            callType,
            matchResult
          );
          
          console.log('[CALL_DETECTION] 🚀 React Native overlay show request sent successfully');
        } catch (error) {
          console.error('[CALL_DETECTION] ❌ Error showing React Native overlay:', error);
        }
      } else {
        console.log('[CALL_DETECTION] ❌ Cannot expand overlay - FloatingCallManager not available');
        console.log('[CALL_DETECTION] - floatingCallManager:', !!this.floatingCallManager);
        console.log('[CALL_DETECTION] - lastCallPhoneNumber:', this.lastCallPhoneNumber);
        console.log('[CALL_DETECTION] - currentCall:', this.currentCall);
      }
      console.log('[CALL_DETECTION] =====================================================');
    });
  }

  async start() {
    try {
      console.log('🚀 Starting call detection service...');
      
      // Check native overlay availability
      console.log('[CALL_DETECTION] Native overlay available:', NativeFloatingOverlay.isAvailable());
      
      // Check if we have required permissions using new PermissionManager
      const hasPermissions = await PermissionManager.validatePermissions();
      if (!hasPermissions) {
        console.warn('⚠️ Required permissions not granted, cannot start call detection');
        return false;
      }

      if (this.isRunning) {
        console.log('⚠️ Call detection service already running');
        return true;
      }

      this.callDetector = new CallDetectorManager(
        (event, phoneNumber) => this.handleCallEvent(event, phoneNumber),
        true, // readPhoneNumber
        () => console.log('📞 Call detector manager initialized'),
        () => console.error('❌ Call detector manager initialization failed')
      );

      this.isRunning = true;
      console.log('✅ Call detection service started successfully');
      return true;
    } catch (error) {
      console.error('❌ Error starting call detection service:', error);
      this.isRunning = false;
      return false;
    }
  }

  stop() {
    try {
      console.log('🛑 Stopping call detection service...');
      
      if (this.callDetector) {
        this.callDetector.dispose();
        this.callDetector = null;
      }
      
      this.isRunning = false;
      this.currentCall = null;
      console.log('✅ Call detection service stopped');
    } catch (error) {
      console.error('❌ Error stopping call detection service:', error);
    }
  }

  restart() {
    console.log('🔄 Restarting call detection service...');
    this.stop();
    return this.start();
  }

  handleCallEvent(event, phoneNumber) {
    console.log('📞 Call Event Detected:', {
      event,
      phoneNumber,
      phoneNumberLength: phoneNumber ? phoneNumber.length : 0,
      phoneNumberType: typeof phoneNumber,
      timestamp: new Date().toISOString()
    });

    console.log('[CALL_DETECTION] 🔍 Event details:');
    console.log('[CALL_DETECTION] - Event type:', event);
    console.log('[CALL_DETECTION] - Phone number raw:', JSON.stringify(phoneNumber));
    console.log('[CALL_DETECTION] - Phone number exists:', !!phoneNumber);
    console.log('[CALL_DETECTION] - Phone number length:', phoneNumber ? phoneNumber.length : 0);
    console.log('[CALL_DETECTION] - Previous stored number:', this.lastCallPhoneNumber);

    // Store current call info
    this.currentCall = {
      event,
      phoneNumber,
      timestamp: Date.now()
    };
    
    // Store phone number for use in subsequent events (Offhook, Disconnected)
    if (phoneNumber && phoneNumber.trim()) {
      this.lastCallPhoneNumber = phoneNumber;
      console.log('[FLOATING_CALL] ✅ Stored phone number for call:', phoneNumber);
    } else {
      console.log('[FLOATING_CALL] ⚠️ No phone number provided in this event');
      console.log('[FLOATING_CALL] ⚠️ Using previously stored number:', this.lastCallPhoneNumber);
    }

    switch (event) {
      case 'Incoming':
        this.handleIncomingCall(phoneNumber);
        break;
      case 'Outgoing':
        this.handleOutgoingCall(phoneNumber);
        break;
      case 'Disconnected':
        this.handleCallEnded(phoneNumber);
        break;
      case 'Missed':
        this.handleMissedCall(phoneNumber);
        break;
      case 'Offhook':
        this.handleCallAnswered(phoneNumber);
        break;
      default:
        console.log('🔍 Unknown call event:', event);
    }
  }

  async handleIncomingCall(phoneNumber) {
    console.log('[FLOATING_CALL] 📞 Incoming call from:', phoneNumber);
    
    try {
      // Handle empty phone number case
      const effectivePhoneNumber = phoneNumber || 'Unknown Number';
      console.log('[FLOATING_CALL] Using phone number:', effectivePhoneNumber);
      
      // Match phone number to lead (only if we have a real number)
      let matchResult = {
        phoneNumber: effectivePhoneNumber,
        normalizedNumber: effectivePhoneNumber,
        matchedLeads: [],
        matchConfidence: 'none',
        multipleMatches: false,
        hasMatch: false
      };
      
      let leadName = 'Unknown Contact';
      if (phoneNumber && phoneNumber.trim()) {
        matchResult = await PhoneMatchingService.matchPhoneToLead(phoneNumber);
        console.log('[FLOATING_CALL] Match result:', matchResult);
        
        // Get lead name for native overlay
        if (matchResult.hasMatch && matchResult.matchedLeads.length > 0) {
          leadName = matchResult.matchedLeads[0].name || 'Unknown Contact';
        }
      } else {
        console.log('[FLOATING_CALL] No phone number provided, showing unknown contact');
      }
      
      // Store match result for later use
      this.lastMatchResult = matchResult;
      console.log('[FLOATING_CALL] 📱 Stored match result for later use:', this.lastMatchResult);
      
      // Show NATIVE overlay over dialer
      if (NativeFloatingOverlay.isAvailable()) {
        console.log('[FLOATING_CALL] 🎯 Showing NATIVE overlay over dialer');
        await NativeFloatingOverlay.showFloatingOverlay(effectivePhoneNumber, leadName);
        this.nativeOverlayActive = true;
      } else {
        console.log('[FLOATING_CALL] Native overlay not available, using React Native overlay');
        // Fallback to React Native overlay
        await this.showFloatingCallOverlay(effectivePhoneNumber, 'incoming', matchResult);
      }
      
      // Legacy overlay for backward compatibility
      OverlayService.showCallOverlay(phoneNumber, 'incoming');
    } catch (error) {
      console.error('[FLOATING_CALL] Error handling incoming call:', error);
      // Fallback to legacy overlay
      OverlayService.showCallOverlay(phoneNumber, 'incoming');
    }
  }

  async handleOutgoingCall(phoneNumber) {
    console.log('[FLOATING_CALL] 📱 Outgoing call to:', phoneNumber);
    
    try {
      // Handle empty phone number case
      const effectivePhoneNumber = phoneNumber || 'Unknown Number';
      console.log('[FLOATING_CALL] Using phone number:', effectivePhoneNumber);
      
      // Match phone number to lead (only if we have a real number)
      let matchResult = {
        phoneNumber: effectivePhoneNumber,
        normalizedNumber: effectivePhoneNumber,
        matchedLeads: [],
        matchConfidence: 'none',
        multipleMatches: false,
        hasMatch: false
      };
      
      let leadName = 'Unknown Contact';
      if (phoneNumber && phoneNumber.trim()) {
        matchResult = await PhoneMatchingService.matchPhoneToLead(phoneNumber);
        console.log('[FLOATING_CALL] Match result:', matchResult);
        
        // Get lead name for native overlay
        if (matchResult.hasMatch && matchResult.matchedLeads.length > 0) {
          leadName = matchResult.matchedLeads[0].name || 'Unknown Contact';
        }
      } else {
        console.log('[FLOATING_CALL] No phone number provided, showing unknown contact');
      }
      
      // Show NATIVE overlay over dialer
      if (NativeFloatingOverlay.isAvailable()) {
        console.log('[FLOATING_CALL] 🎯 Showing NATIVE overlay over dialer');
        await NativeFloatingOverlay.showFloatingOverlay(effectivePhoneNumber, leadName);
        this.nativeOverlayActive = true;
      } else {
        console.log('[FLOATING_CALL] Native overlay not available, using React Native overlay');
        // Fallback to React Native overlay
        await this.showFloatingCallOverlay(effectivePhoneNumber, 'outgoing', matchResult);
      }
      
      // Legacy overlay for backward compatibility
      OverlayService.showCallOverlay(phoneNumber, 'outgoing');
    } catch (error) {
      console.error('[FLOATING_CALL] Error handling outgoing call:', error);
      // Fallback to legacy overlay
      OverlayService.showCallOverlay(phoneNumber, 'outgoing');
    }
  }

  async handleCallAnswered(phoneNumber) {
    console.log('[FLOATING_CALL] ✅ Call answered with:', phoneNumber);
    
    // Track call start time for duration calculation
    this.callStartTime = Date.now();
    console.log('[FLOATING_CALL] 📋 Action: Call is now active, tracking start time');
    
    // Use stored phone number if current one is empty (common for Offhook events)
    const effectivePhoneNumber = phoneNumber || this.lastCallPhoneNumber || 'Unknown Number';
    console.log('[FLOATING_CALL] 📱 Using phone number for overlay:', effectivePhoneNumber);
    
    // Always try to show floating overlay on call answer (for cases where Incoming/Outgoing events were missed)
    try {
      // If we don't already have a floating overlay active, show it
      if (!this.currentCall?.hasFloatingOverlay) {
        // Match phone number to lead (only if we have a real number)
        let matchResult = {
          phoneNumber: effectivePhoneNumber,
          normalizedNumber: effectivePhoneNumber,
          matchedLeads: [],
          matchConfidence: 'none',
          multipleMatches: false,
          hasMatch: false
        };
        
        let leadName = 'Unknown Contact';
        if (effectivePhoneNumber && effectivePhoneNumber !== 'Unknown Number') {
          matchResult = await PhoneMatchingService.matchPhoneToLead(effectivePhoneNumber);
          console.log('[FLOATING_CALL] Match result on answer:', matchResult);
          
          // Get lead name for native overlay
          if (matchResult.hasMatch && matchResult.matchedLeads.length > 0) {
            leadName = matchResult.matchedLeads[0].name || 'Unknown Contact';
          }
          
          // Store match result for click handling
          this.lastMatchResult = matchResult;
        }
        
        // Show NATIVE overlay over dialer FIRST
        if (NativeFloatingOverlay.isAvailable()) {
          console.log('[FLOATING_CALL] 🎯 Showing NATIVE overlay over dialer from handleCallAnswered');
          await NativeFloatingOverlay.showFloatingOverlay(effectivePhoneNumber, leadName);
          this.nativeOverlayActive = true;
        } else {
          console.log('[FLOATING_CALL] Native overlay not available, using React Native overlay');
          
          // Determine call type - default to incoming if unknown
          const callType = this.currentCall?.event === 'Outgoing' ? 'outgoing' : 'incoming';
          
          // Fallback to React Native overlay
          await this.showFloatingCallOverlay(effectivePhoneNumber, callType, matchResult);
        }
        
        // Mark that we've shown the overlay for this call
        if (this.currentCall) {
          this.currentCall.hasFloatingOverlay = true;
        }
      } else {
        console.log('[FLOATING_CALL] Floating overlay already active for this call');
      }
    } catch (error) {
      console.error('[FLOATING_CALL] Error handling call answer:', error);
    }
  }

  handleCallEnded(phoneNumber) {
    console.log('📴 Call ended with:', phoneNumber);
    
    // Hide native overlay
    if (this.nativeOverlayActive && NativeFloatingOverlay.isAvailable()) {
      console.log('[FLOATING_CALL] Hiding native overlay after call ended');
      NativeFloatingOverlay.hideFloatingOverlay();
      this.nativeOverlayActive = false;
    }
    
    // Calculate call duration and show post-call tray
    const callDuration = OverlayService.getCallDuration();
    OverlayService.showPostCallTray(callDuration);
    console.log('📋 Action: Showing post-call tray with duration:', callDuration);
    
    // Clear call state
    this.currentCall = null;
    this.lastCallPhoneNumber = null;
    this.callStartTime = null;
  }

  handleMissedCall(phoneNumber) {
    console.log('📵 Missed call from:', phoneNumber);
    
    // Show post-call tray for missed calls
    OverlayService.showPostCallTray(0); // 0 duration for missed calls
    console.log('📋 Action: Showing post-call tray for missed call');
  }

  getCurrentCall() {
    return this.currentCall;
  }

  isServiceRunning() {
    return this.isRunning;
  }

  // Helper method to format phone numbers
  formatPhoneNumber(phoneNumber) {
    if (!phoneNumber) return 'Unknown';
    
    // Remove any non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX if it's a US number
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    
    // Return original if not a standard US number
    return phoneNumber;
  }

  // Method to simulate call events for testing
  simulateCallEvent(event, phoneNumber = '+919876543210') {
    console.log('🧪 Simulating call event for testing:', event, phoneNumber);
    this.handleCallEvent(event, phoneNumber);
  }
  
  // Test method to directly show floating overlay
  async testFloatingOverlay(phoneNumber = '+919876543210') {
    console.log('🧪 Testing floating overlay with phone:', phoneNumber);
    try {
      // Match phone number to lead
      const matchResult = await PhoneMatchingService.matchPhoneToLead(phoneNumber);
      console.log('[FLOATING_TEST] Match result:', matchResult);
      
      // Show floating overlay
      await this.showFloatingCallOverlay(phoneNumber, 'incoming', matchResult);
      console.log('[FLOATING_TEST] ✅ Floating overlay test successful');
      
      return true;
    } catch (error) {
      console.error('[FLOATING_TEST] ❌ Error testing floating overlay:', error);
      return false;
    }
  }

  // Show floating call overlay
  async showFloatingCallOverlay(phoneNumber, callType, matchResult) {
    try {
      console.log('[FLOATING_CALL] Showing floating overlay for:', phoneNumber, callType);
      
      // Store call data for overlay
      const callData = {
        phoneNumber,
        callType,
        matchResult,
        startTime: Date.now(),
        callStartTime: this.callStartTime
      };
      
      // TODO: Trigger FloatingCallManager to show overlay
      // This will be implemented when we create the FloatingCallManager
      if (this.floatingCallManager) {
        await this.floatingCallManager.showCallOverlay(callData);
      } else {
        console.log('[FLOATING_CALL] FloatingCallManager not initialized yet');
      }
      
      return callData;
    } catch (error) {
      console.error('[FLOATING_CALL] Error showing floating overlay:', error);
      throw error;
    }
  }
  
  // Set floating call manager reference
  setFloatingCallManager(manager) {
    console.log('[FLOATING_CALL] Setting floating call manager');
    this.floatingCallManager = manager;
  }

  // Manual test method for debugging
  async testExpandOverlay() {
    console.log('[CALL_DETECTION] 🧪 MANUAL TEST: Triggering overlay expansion...');
    
    if (!this.floatingCallManager) {
      console.log('[CALL_DETECTION] ❌ No floating call manager available');
      return false;
    }

    if (!this.lastCallPhoneNumber) {
      console.log('[CALL_DETECTION] ❌ No phone number available, using test number');
      this.lastCallPhoneNumber = "7777095511";
    }

    try {
      // Simulate the overlay click
      const callType = this.currentCall?.event === 'Outgoing' ? 'outgoing' : 'incoming';
      console.log('[CALL_DETECTION] 🧪 Using phone:', this.lastCallPhoneNumber);
      console.log('[CALL_DETECTION] 🧪 Call type:', callType);
      console.log('[CALL_DETECTION] 🧪 Match result:', this.lastMatchResult);
      
      await this.showFloatingCallOverlay(
        this.lastCallPhoneNumber,
        callType,
        this.lastMatchResult || {
          phoneNumber: this.lastCallPhoneNumber,
          hasMatch: false,
          matchedLeads: [],
          matchConfidence: 'none'
        }
      );
      
      console.log('[CALL_DETECTION] ✅ Manual test completed');
      return true;
    } catch (error) {
      console.error('[CALL_DETECTION] ❌ Manual test failed:', error);
      return false;
    }
  }
  
  // Calculate call duration
  getCallDuration() {
    if (!this.callStartTime) return 0;
    return Math.floor((Date.now() - this.callStartTime) / 1000);
  }

  // Get service status for debugging
  getServiceStatus() {
    return {
      isRunning: this.isRunning,
      hasDetector: !!this.callDetector,
      currentCall: this.currentCall,
      floatingCallManager: !!this.floatingCallManager,
      callStartTime: this.callStartTime,
      permissions: PermissionService.areRequiredPermissionsGranted()
    };
  }
  
  // Test native overlay click communication
  async testNativeOverlayClick() {
    console.log('[CALL_DETECTION] 🧪 Testing native overlay click communication...');
    try {
      // Test the broadcast mechanism
      const result = await NativeFloatingOverlay.testBroadcast();
      console.log('[CALL_DETECTION] 🧪 Broadcast test result:', result);
      return result;
    } catch (error) {
      console.error('[CALL_DETECTION] 🧪 Broadcast test failed:', error);
      return false;
    }
  }
}

export default new CallDetectionService();