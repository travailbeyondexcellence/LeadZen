import CallDetectorManager from 'react-native-call-detection';
import PermissionService from './PermissionService';

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
    
    // TODO: Next task will implement overlay display
    // For now, just log the event
    console.log('📋 Action: Would show lead overlay for incoming call');
    
    // Future implementation:
    // - Look up lead by phone number
    // - Show overlay with lead info
    // - Track call in database
  }

  handleOutgoingCall(phoneNumber) {
    console.log('📱 Outgoing call to:', phoneNumber);
    
    // TODO: Next task will implement overlay display
    console.log('📋 Action: Would show lead overlay for outgoing call');
    
    // Future implementation:
    // - Look up lead by phone number
    // - Show overlay with lead info
    // - Pre-populate call notes
  }

  handleCallAnswered(phoneNumber) {
    console.log('✅ Call answered with:', phoneNumber);
    
    // TODO: Track call start time for duration calculation
    console.log('📋 Action: Call is now active');
  }

  handleCallEnded(phoneNumber) {
    console.log('📴 Call ended with:', phoneNumber);
    
    // TODO: Next task will implement post-call actions
    console.log('📋 Action: Would show post-call options (add notes, schedule follow-up)');
    
    // Future implementation:
    // - Calculate call duration
    // - Show post-call action dialog
    // - Option to add call notes
    // - Option to schedule follow-up
    
    this.currentCall = null;
  }

  handleMissedCall(phoneNumber) {
    console.log('📵 Missed call from:', phoneNumber);
    
    // TODO: Handle missed call notifications
    console.log('📋 Action: Would create missed call notification');
    
    // Future implementation:
    // - Create missed call entry
    // - Show notification
    // - Add to follow-up list
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