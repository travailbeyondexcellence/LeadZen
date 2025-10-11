import { Linking, Alert, Vibration } from 'react-native';
import AsyncStorageService from './AsyncStorageService';
import { PhoneUtils } from '../utils/phoneUtils';
import { T9Search } from '../utils/t9Utils';

class DialerService {
  constructor() {
    this.recentCalls = [];
    this.callHistory = [];
  }

  /**
   * Initiate a phone call
   * @param {string} phoneNumber - Phone number to call
   * @returns {Promise<Object>} - Result object with success status
   */
  async makeCall(phoneNumber) {
    try {
      console.log('📞 Initiating call to:', phoneNumber);
      
      const cleanNumber = this.cleanPhoneNumber(phoneNumber);
      if (!cleanNumber) {
        throw new Error('Invalid phone number');
      }

      const url = `tel:${cleanNumber}`;
      console.log('📞 Calling URL:', url);
      
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        throw new Error('Phone calling not supported on this device');
      }

      // Log call attempt to database before making the call
      await this.logOutgoingCall(cleanNumber);
      
      // Make the call
      await Linking.openURL(url);
      
      // Provide haptic feedback (safe vibration)
      try {
        Vibration.vibrate(100);
      } catch (error) {
        // Ignore vibration errors if permission not granted
        console.log('Vibration not available:', error.message);
      }
      
      console.log('✅ Call initiated successfully');
      return { success: true, phoneNumber: cleanNumber };
      
    } catch (error) {
      console.error('❌ Call failed:', error);
      Alert.alert('Call Failed', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Clean and format phone number for calling
   * @param {string} phoneNumber - Raw phone number
   * @returns {string} - Cleaned phone number
   */
  cleanPhoneNumber(phoneNumber) {
    if (!phoneNumber) return '';
    
    // Remove all non-digit characters except +
    const cleaned = phoneNumber.replace(/[^\d+]/g, '');
    
    // If it starts with +1, keep it
    if (cleaned.startsWith('+1')) {
      return cleaned;
    }
    
    // If it's 11 digits starting with 1, add +
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+${cleaned}`;
    }
    
    // If it's 10 digits, add +1
    if (cleaned.length === 10) {
      return `+1${cleaned}`;
    }
    
    return cleaned;
  }

  /**
   * Format phone number for display
   * @param {string} phoneNumber - Phone number to format
   * @returns {string} - Formatted phone number
   */
  formatPhoneNumber(phoneNumber) {
    return PhoneUtils.formatPhoneNumber(phoneNumber);
  }

  /**
   * Log outgoing call to database
   * @param {string} phoneNumber - Phone number called
   */
  async logOutgoingCall(phoneNumber) {
    try {
      // Find lead by phone number
      // Note: AsyncStorageService doesn't have getLeadByPhone method
      // We'll search through all leads to find matching phone number
      const allLeads = await AsyncStorageService.getLeads(1000, 0);
      const lead = allLeads.find(l => l.phone === phoneNumber);
      
      const callLog = {
        lead_id: lead ? lead.id : null,
        phone_number: phoneNumber,
        call_type: 'outgoing',
        call_status: 'initiated',
        duration: 0, // Will be updated when call ends
        started_at: new Date(),
        notes: null
      };

      await AsyncStorageService.addCallLog(callLog);
      console.log('📝 Outgoing call logged to database');
      
    } catch (error) {
      console.error('❌ Failed to log outgoing call:', error);
    }
  }

  /**
   * Search leads using T9 algorithm
   * @param {string} input - T9 input string
   * @returns {Promise<Array>} - Array of matching leads
   */
  async searchLeads(input) {
    try {
      if (!input || input.length < 2) {
        return [];
      }

      console.log('🔍 Searching leads with T9 input:', input);
      
      // Get all leads from database
      const allLeads = await AsyncStorageService.getLeads(500, 0); // Get more leads for better search
      
      // Use T9 search to filter leads
      const matches = T9Search.searchLeads(input, allLeads, 8);
      
      console.log(`📋 Found ${matches.length} T9 matches for "${input}"`);
      return matches;
      
    } catch (error) {
      console.error('❌ Error searching leads:', error);
      return [];
    }
  }

  /**
   * Get recent calls from database
   * @param {number} limit - Number of recent calls to retrieve
   * @returns {Promise<Array>} - Array of recent calls
   */
  async getRecentCalls(limit = 10) {
    try {
      console.log('📞 Loading recent calls...');
      
      // This would be implemented in DatabaseService
      const recentCalls = await this.getCallHistoryFromDatabase(limit);
      
      this.recentCalls = recentCalls;
      console.log(`📋 Loaded ${recentCalls.length} recent calls`);
      
      return recentCalls;
      
    } catch (error) {
      console.error('❌ Error loading recent calls:', error);
      return [];
    }
  }

  /**
   * Get call history from database (placeholder implementation)
   * @param {number} limit - Number of calls to retrieve
   * @returns {Promise<Array>} - Array of call history
   */
  async getCallHistoryFromDatabase(limit) {
    try {
      // This would use a proper DatabaseService method
      // For now, we'll return mock data
      return [
        {
          id: 1,
          phone_number: '+1 (415) 555-0101',
          lead_name: 'Michael Johnson',
          company: 'TechVision Solutions',
          call_type: 'outgoing',
          started_at: new Date(Date.now() - 3600000), // 1 hour ago
          duration: 120
        },
        {
          id: 2,
          phone_number: '+1 (212) 555-0102',
          lead_name: 'Sarah Williams',
          company: 'Global Marketing Inc',
          call_type: 'incoming',
          started_at: new Date(Date.now() - 7200000), // 2 hours ago
          duration: 300
        },
        {
          id: 3,
          phone_number: '+1 (555) 123-4567',
          lead_name: null,
          company: null,
          call_type: 'missed',
          started_at: new Date(Date.now() - 86400000), // 1 day ago
          duration: 0
        }
      ].slice(0, limit);
      
    } catch (error) {
      console.error('❌ Error getting call history:', error);
      return [];
    }
  }

  /**
   * Check if a string looks like a phone number
   * @param {string} input - Input to check
   * @returns {boolean} - True if looks like phone number
   */
  isPhoneNumber(input) {
    return T9Search.isPhoneNumber(input);
  }

  /**
   * Format input as user types
   * @param {string} input - Raw input
   * @returns {string} - Formatted input
   */
  formatInput(input) {
    if (this.isPhoneNumber(input)) {
      return T9Search.formatPhoneInput(input);
    }
    return input;
  }

  /**
   * Add a lead to favorites (speed dial)
   * @param {Object} lead - Lead to add to favorites
   * @param {string} speedDialKey - Key (2-9) for speed dial
   */
  async addToSpeedDial(lead, speedDialKey) {
    try {
      // This would be implemented with a favorites table
      console.log(`⭐ Adding ${lead.name} to speed dial key ${speedDialKey}`);
      
      // For now, just log the action
      return { success: true };
      
    } catch (error) {
      console.error('❌ Error adding to speed dial:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Call a lead directly from lead object
   * @param {Object} lead - Lead object with phone number
   * @returns {Promise<Object>} - Result of call attempt
   */
  async callLead(lead) {
    if (!lead || !lead.phone) {
      return { success: false, error: 'Lead has no phone number' };
    }
    
    console.log('📞 Calling lead:', lead.name, lead.phone);
    return await this.makeCall(lead.phone);
  }

  /**
   * Get formatted call duration
   * @param {number} durationSeconds - Duration in seconds
   * @returns {string} - Formatted duration
   */
  formatCallDuration(durationSeconds) {
    if (!durationSeconds || durationSeconds === 0) {
      return 'No answer';
    }
    
    const minutes = Math.floor(durationSeconds / 60);
    const seconds = durationSeconds % 60;
    
    if (minutes === 0) {
      return `${seconds}s`;
    }
    
    return `${minutes}m ${seconds}s`;
  }

  /**
   * Get relative time string for call timestamps
   * @param {Date} timestamp - Call timestamp
   * @returns {string} - Relative time string
   */
  getRelativeTime(timestamp) {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    
    return timestamp.toLocaleDateString();
  }

  /**
   * Validate phone number before calling
   * @param {string} phoneNumber - Phone number to validate
   * @returns {Object} - Validation result
   */
  validatePhoneNumber(phoneNumber) {
    const cleaned = this.cleanPhoneNumber(phoneNumber);
    
    if (!cleaned) {
      return { valid: false, error: 'Phone number is required' };
    }
    
    if (cleaned.length < 10) {
      return { valid: false, error: 'Phone number is too short' };
    }
    
    if (cleaned.length > 15) {
      return { valid: false, error: 'Phone number is too long' };
    }
    
    return { valid: true, cleanedNumber: cleaned };
  }
}

export default new DialerService();