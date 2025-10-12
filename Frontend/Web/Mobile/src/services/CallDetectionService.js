import CallDetectorManager from 'react-native-call-detection';
import PermissionService from './PermissionService';
import OverlayService from './OverlayService';
import PhoneMatchingService from './PhoneMatchingService';
import PermissionManager from './PermissionManager';

class CallDetectionService {
  constructor() {
    this.callDetector = null;
    this.isRunning = false;
    this.currentCall = null;
    this.floatingCallManager = null;
    this.callStartTime = null;
  }

  async start() {
    try {
      console.log('🚀 Starting call detection service...');
      
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
      timestamp: new Date().toISOString()
    });

    // Store current call info
    this.currentCall = {
      event,
      phoneNumber,
      timestamp: Date.now()
    };

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
      // Match phone number to lead
      const matchResult = await PhoneMatchingService.matchPhoneToLead(phoneNumber);
      console.log('[FLOATING_CALL] Match result:', matchResult);
      
      // Trigger floating call overlay
      await this.showFloatingCallOverlay(phoneNumber, 'incoming', matchResult);
      
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
      // Match phone number to lead
      const matchResult = await PhoneMatchingService.matchPhoneToLead(phoneNumber);
      console.log('[FLOATING_CALL] Match result:', matchResult);
      
      // Trigger floating call overlay
      await this.showFloatingCallOverlay(phoneNumber, 'outgoing', matchResult);
      
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
    
    // If we don't have a floating overlay yet and we have a phone number, show it
    if (phoneNumber && !this.currentCall?.hasFloatingOverlay) {
      console.log('[FLOATING_CALL] 📱 Showing floating overlay on call answer');
      try {
        // Match phone number to lead
        const matchResult = await PhoneMatchingService.matchPhoneToLead(phoneNumber);
        console.log('[FLOATING_CALL] Match result on answer:', matchResult);
        
        // Determine call type based on current call state
        const callType = this.currentCall?.event === 'Incoming' ? 'incoming' : 'outgoing';
        
        // Trigger floating call overlay
        await this.showFloatingCallOverlay(phoneNumber, callType, matchResult);
        
        // Mark that we've shown the overlay for this call
        if (this.currentCall) {
          this.currentCall.hasFloatingOverlay = true;
        }
      } catch (error) {
        console.error('[FLOATING_CALL] Error handling call answer:', error);
      }
    }
  }

  handleCallEnded(phoneNumber) {
    console.log('📴 Call ended with:', phoneNumber);
    
    // Calculate call duration and show post-call tray
    const callDuration = OverlayService.getCallDuration();
    OverlayService.showPostCallTray(callDuration);
    console.log('📋 Action: Showing post-call tray with duration:', callDuration);
    
    this.currentCall = null;
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
}

export default new CallDetectionService();