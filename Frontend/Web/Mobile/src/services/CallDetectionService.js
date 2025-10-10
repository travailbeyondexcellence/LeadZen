import CallDetectorManager from 'react-native-call-detection';
import PermissionService from './PermissionService';
import OverlayService from './OverlayService';

class CallDetectionService {
  constructor() {
    this.callDetector = null;
    this.isRunning = false;
    this.currentCall = null;
  }

  async start() {
    try {
      console.log('🚀 Starting call detection service...');
      
      // Check if we have required permissions
      if (!PermissionService.areRequiredPermissionsGranted()) {
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

  handleIncomingCall(phoneNumber) {
    console.log('📞 Incoming call from:', phoneNumber);
    
    // Show call overlay with lead lookup
    OverlayService.showCallOverlay(phoneNumber, 'incoming');
    console.log('📋 Action: Showing lead overlay for incoming call');
  }

  handleOutgoingCall(phoneNumber) {
    console.log('📱 Outgoing call to:', phoneNumber);
    
    // Show call overlay with lead lookup
    OverlayService.showCallOverlay(phoneNumber, 'outgoing');
    console.log('📋 Action: Showing lead overlay for outgoing call');
  }

  handleCallAnswered(phoneNumber) {
    console.log('✅ Call answered with:', phoneNumber);
    
    // TODO: Track call start time for duration calculation
    console.log('📋 Action: Call is now active');
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
  simulateCallEvent(event, phoneNumber = '+1234567890') {
    console.log('🧪 Simulating call event for testing:', event, phoneNumber);
    this.handleCallEvent(event, phoneNumber);
  }

  // Get service status for debugging
  getServiceStatus() {
    return {
      isRunning: this.isRunning,
      hasDetector: !!this.callDetector,
      currentCall: this.currentCall,
      permissions: PermissionService.areRequiredPermissionsGranted()
    };
  }
}

export default new CallDetectionService();