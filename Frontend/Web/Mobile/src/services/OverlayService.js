import AsyncStorageService from './AsyncStorageService';
import { PhoneUtils } from '../utils/phoneUtils';

export const OverlayStates = {
  HIDDEN: 'hidden',
  COMPACT: 'compact',         // During call - minimal info
  MINIMIZED: 'minimized',     // User minimized during call
  POST_CALL: 'post_call',     // After call - detailed tray
  ADDING_LEAD: 'adding_lead'  // Creating new lead from unknown number
};

class OverlayService {
  constructor() {
    this.state = OverlayStates.HIDDEN;
    this.currentLead = null;
    this.currentPhoneNumber = null;
    this.callStartTime = null;
    this.callDuration = 0;
    this.callType = null; // 'incoming', 'outgoing', 'missed'
    this.overlayVisible = false;
    
    // Listeners for state changes
    this.listeners = [];
  }

  // Event subscription methods
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.getState());
      } catch (error) {
        console.error('Error in overlay listener:', error);
      }
    });
  }

  // State management
  setState(newState) {
    if (this.state !== newState) {
      console.log(`📱 Overlay state: ${this.state} -> ${newState}`);
      this.state = newState;
      this.overlayVisible = newState !== OverlayStates.HIDDEN;
      this.notifyListeners();
    }
  }

  getState() {
    return {
      state: this.state,
      visible: this.overlayVisible,
      currentLead: this.currentLead,
      phoneNumber: this.currentPhoneNumber,
      callStartTime: this.callStartTime,
      callDuration: this.callDuration,
      callType: this.callType
    };
  }

  // Main overlay control methods
  async showCallOverlay(phoneNumber, callType = 'incoming') {
    try {
      console.log('📞 Showing call overlay for:', phoneNumber, 'Type:', callType);
      
      this.currentPhoneNumber = phoneNumber;
      this.callType = callType;
      this.callStartTime = new Date();
      
      // Look up lead in database
      const lead = await this.findLeadByPhone(phoneNumber);
      
      if (lead) {
        console.log('✅ Lead found:', lead.name);
        this.currentLead = lead;
        
        // Update last contact time
        // Note: AsyncStorageService doesn't have updateLeadLastContact method
        // We'll update the lead with lastContactedAt field
        await AsyncStorageService.updateLead(lead.id, {
          lastContactedAt: new Date()
        });
      } else {
        console.log('❓ Unknown caller:', phoneNumber);
        this.currentLead = null;
      }
      
      this.setState(OverlayStates.COMPACT);
      
    } catch (error) {
      console.error('❌ Error showing call overlay:', error);
      this.currentLead = null;
      this.setState(OverlayStates.COMPACT); // Still show overlay for unknown callers
    }
  }

  hideCallOverlay() {
    console.log('🚫 Hiding call overlay');
    this.setState(OverlayStates.HIDDEN);
    this.resetCallData();
  }

  minimizeOverlay() {
    if (this.state === OverlayStates.COMPACT) {
      console.log('📉 Minimizing overlay');
      this.setState(OverlayStates.MINIMIZED);
    }
  }

  maximizeOverlay() {
    if (this.state === OverlayStates.MINIMIZED) {
      console.log('📈 Maximizing overlay');
      this.setState(OverlayStates.COMPACT);
    }
  }

  async showPostCallTray(callDuration = 0) {
    try {
      console.log('📋 Showing post-call tray, duration:', callDuration);
      
      this.callDuration = callDuration;
      
      // Log the call to database if we have a lead
      if (this.currentLead && this.currentPhoneNumber) {
        await this.logCallToDatabase();
      }
      
      this.setState(OverlayStates.POST_CALL);
      
    } catch (error) {
      console.error('❌ Error showing post-call tray:', error);
    }
  }

  showAddLeadFlow() {
    if (this.currentPhoneNumber && !this.currentLead) {
      console.log('➕ Showing add lead flow for:', this.currentPhoneNumber);
      this.setState(OverlayStates.ADDING_LEAD);
    }
  }

  // Helper methods
  async findLeadByPhone(phoneNumber) {
    try {
      const cleanedNumber = PhoneUtils.cleanPhoneNumber(phoneNumber);
      if (!cleanedNumber) return null;
      
      console.log('🔍 Looking up lead for phone:', phoneNumber);
      // Note: AsyncStorageService doesn't have getLeadByPhone method
      // We'll search through all leads to find matching phone number
      const allLeads = await AsyncStorageService.getLeads(1000, 0);
      const lead = allLeads.find(l => l.phone === cleanedNumber);
      
      return lead;
    } catch (error) {
      console.error('❌ Error finding lead by phone:', error);
      return null;
    }
  }

  async logCallToDatabase() {
    try {
      if (!this.currentLead || !this.currentPhoneNumber || !this.callStartTime) {
        console.log('⚠️ Missing data for call logging');
        return;
      }

      const callLog = {
        lead_id: this.currentLead.id,
        phone_number: this.currentPhoneNumber,
        call_type: this.callType || 'incoming',
        call_status: 'completed',
        duration: this.callDuration,
        started_at: this.callStartTime,
        ended_at: new Date(),
        notes: null
      };

      await AsyncStorageService.addCallLog(callLog);
      console.log('📝 Call logged to database');
      
    } catch (error) {
      console.error('❌ Error logging call to database:', error);
    }
  }

  resetCallData() {
    this.currentLead = null;
    this.currentPhoneNumber = null;
    this.callStartTime = null;
    this.callDuration = 0;
    this.callType = null;
  }

  // Quick actions during call
  async addQuickNote(note) {
    try {
      if (!this.currentLead) {
        console.log('⚠️ No lead available for quick note');
        return false;
      }

      // Add note to database
      // Note: AsyncStorageService doesn't have separate notes table
      // We'll add notes to the lead's notes field
      const currentLead = await AsyncStorageService.getLeadById(this.currentLead.id);
      const existingNotes = currentLead?.notes || '';
      const newNotes = existingNotes ? `${existingNotes}\n\nQuick Note (${new Date().toLocaleDateString()}): ${note}` : `Quick Note (${new Date().toLocaleDateString()}): ${note}`;
      
      await AsyncStorageService.updateLead(this.currentLead.id, {
        notes: newNotes
      });

      console.log('📝 Quick note added:', note);
      return true;
      
    } catch (error) {
      console.error('❌ Error adding quick note:', error);
      return false;
    }
  }

  async updateLeadStatus(newStatus) {
    try {
      if (!this.currentLead) {
        console.log('⚠️ No lead available for status update');
        return false;
      }

      await AsyncStorageService.updateLead(this.currentLead.id, {
        status: newStatus
      });

      // Update current lead data
      this.currentLead.status = newStatus;
      this.notifyListeners();

      console.log('📊 Lead status updated to:', newStatus);
      return true;
      
    } catch (error) {
      console.error('❌ Error updating lead status:', error);
      return false;
    }
  }

  // Utility methods
  isOverlayVisible() {
    return this.overlayVisible;
  }

  getCurrentLead() {
    return this.currentLead;
  }

  getCurrentPhoneNumber() {
    return this.currentPhoneNumber;
  }

  getCallInfo() {
    return PhoneUtils.getCallTypeInfo(this.currentPhoneNumber, this.currentLead);
  }

  getCallDuration() {
    if (!this.callStartTime) return 0;
    return Math.floor((Date.now() - this.callStartTime.getTime()) / 1000);
  }

  // For testing/debugging
  simulateCall(phoneNumber, callType = 'incoming') {
    console.log('🧪 Simulating call for testing:', phoneNumber, callType);
    this.showCallOverlay(phoneNumber, callType);
  }

  getDebugInfo() {
    return {
      state: this.state,
      visible: this.overlayVisible,
      hasLead: !!this.currentLead,
      phoneNumber: this.currentPhoneNumber,
      callType: this.callType,
      callDuration: this.getCallDuration(),
      listenersCount: this.listeners.length
    };
  }
}

export default new OverlayService();