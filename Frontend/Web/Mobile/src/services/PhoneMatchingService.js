import AsyncStorageService from './AsyncStorageService';

class PhoneMatchingService {
  /**
   * Normalize phone number to a standard format for matching
   * @param {string} phoneNumber - Raw phone number
   * @returns {string} - Normalized phone number
   */
  normalizePhoneNumber(phoneNumber) {
    if (!phoneNumber) return '';
    
    // Remove all non-digit characters except +
    let normalized = phoneNumber.replace(/[^\d+]/g, '');
    
    // Handle different formats
    if (normalized.startsWith('+91')) {
      // Indian format: +91XXXXXXXXXX -> keep as is
      return normalized;
    } else if (normalized.startsWith('91') && normalized.length === 12) {
      // Indian format without +: 91XXXXXXXXXX -> +91XXXXXXXXXX
      return '+' + normalized;
    } else if (normalized.length === 10) {
      // 10 digit number: XXXXXXXXXX -> +91XXXXXXXXXX
      return '+91' + normalized;
    }
    
    return normalized;
  }

  /**
   * Match phone number to existing lead in database
   * @param {string} phoneNumber - Phone number to match
   * @returns {Promise<Object>} - Match result with lead data
   */
  async matchPhoneToLead(phoneNumber) {
    try {
      console.log('[PHONE_MATCH] Matching phone:', phoneNumber);
      
      const normalizedNumber = this.normalizePhoneNumber(phoneNumber);
      console.log('[PHONE_MATCH] Normalized to:', normalizedNumber);
      
      // Get all leads from database
      const allLeads = await AsyncStorageService.getLeads(1000, 0);
      console.log('[PHONE_MATCH] Searching through', allLeads.length, 'leads');
      
      // Find matching leads
      const matchedLeads = allLeads.filter(lead => {
        if (!lead.phone) return false;
        
        const leadNormalizedPhone = this.normalizePhoneNumber(lead.phone);
        const isMatch = leadNormalizedPhone === normalizedNumber;
        
        if (isMatch) {
          console.log('[PHONE_MATCH] Found match:', lead.name, leadNormalizedPhone);
        }
        
        return isMatch;
      });
      
      // Determine match confidence
      let matchConfidence = 'none';
      if (matchedLeads.length === 1) {
        matchConfidence = 'exact';
      } else if (matchedLeads.length > 1) {
        matchConfidence = 'partial'; // Multiple matches found
      }
      
      const result = {
        phoneNumber: phoneNumber,
        normalizedNumber: normalizedNumber,
        matchedLeads: matchedLeads,
        matchConfidence: matchConfidence,
        multipleMatches: matchedLeads.length > 1,
        hasMatch: matchedLeads.length > 0
      };
      
      console.log('[PHONE_MATCH] Match result:', {
        phone: phoneNumber,
        matches: matchedLeads.length,
        confidence: matchConfidence
      });
      
      return result;
    } catch (error) {
      console.error('[PHONE_MATCH] Error matching phone:', error);
      return {
        phoneNumber: phoneNumber,
        normalizedNumber: this.normalizePhoneNumber(phoneNumber),
        matchedLeads: [],
        matchConfidence: 'none',
        multipleMatches: false,
        hasMatch: false,
        error: error.message
      };
    }
  }

  /**
   * Create a new lead entry for unknown phone number
   * @param {string} phoneNumber - Phone number for new lead
   * @param {Object} additionalData - Additional lead information
   * @returns {Promise<Object>} - Created lead object
   */
  async createLeadForUnknownNumber(phoneNumber, additionalData = {}) {
    try {
      console.log('[PHONE_MATCH] Creating new lead for:', phoneNumber);
      
      const normalizedNumber = this.normalizePhoneNumber(phoneNumber);
      
      const newLead = {
        name: additionalData.name || `Unknown Contact`,
        phone: normalizedNumber,
        email: additionalData.email || '',
        company: additionalData.company || '',
        status: 'new',
        priority: 'medium',
        source: 'phone_call',
        value: 0,
        notes: `Created from phone call: ${phoneNumber}`,
        tags: ['Phone Call'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const createdLead = await AsyncStorageService.createLead(newLead);
      console.log('[PHONE_MATCH] New lead created:', createdLead.id);
      
      return createdLead;
    } catch (error) {
      console.error('[PHONE_MATCH] Error creating lead:', error);
      throw error;
    }
  }

  /**
   * Handle multiple matches scenario
   * @param {Array} matchedLeads - Array of matched leads
   * @returns {Object} - Best match lead
   */
  selectBestMatch(matchedLeads) {
    if (!matchedLeads || matchedLeads.length === 0) return null;
    if (matchedLeads.length === 1) return matchedLeads[0];
    
    // For multiple matches, prefer:
    // 1. Most recently updated
    // 2. Higher priority
    // 3. More complete information
    
    return matchedLeads.sort((a, b) => {
      // Sort by updatedAt (most recent first)
      const aDate = new Date(a.updatedAt || a.createdAt);
      const bDate = new Date(b.updatedAt || b.createdAt);
      
      if (aDate > bDate) return -1;
      if (aDate < bDate) return 1;
      
      // If same date, prefer higher priority
      const priorityOrder = { 'urgent': 4, 'high': 3, 'medium': 2, 'low': 1 };
      const aPriority = priorityOrder[a.priority] || 0;
      const bPriority = priorityOrder[b.priority] || 0;
      
      return bPriority - aPriority;
    })[0];
  }

  /**
   * Validate phone number format
   * @param {string} phoneNumber - Phone number to validate
   * @returns {boolean} - Whether phone number is valid
   */
  isValidPhoneNumber(phoneNumber) {
    if (!phoneNumber) return false;
    
    const normalized = this.normalizePhoneNumber(phoneNumber);
    
    // Check if it's a valid Indian mobile number
    if (normalized.match(/^\+91[6-9]\d{9}$/)) return true;
    
    // Check if it's a valid 10-digit number
    if (normalized.match(/^[6-9]\d{9}$/)) return true;
    
    // Allow other international formats
    if (normalized.match(/^\+\d{10,15}$/)) return true;
    
    return false;
  }
}

export default new PhoneMatchingService();