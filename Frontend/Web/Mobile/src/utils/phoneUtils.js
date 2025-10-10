/**
 * Phone number utilities for formatting, cleaning, and matching
 */

export class PhoneUtils {
  /**
   * Clean phone number by removing all non-digit characters
   * @param {string} phoneNumber - Raw phone number
   * @returns {string} - Cleaned phone number with only digits
   */
  static cleanPhoneNumber(phoneNumber) {
    if (!phoneNumber) return '';
    
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // For US numbers, remove country code if present
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return cleaned.slice(1);
    }
    
    return cleaned;
  }

  /**
   * Format phone number for display (US format)
   * @param {string} phoneNumber - Phone number to format
   * @returns {string} - Formatted phone number
   */
  static formatPhoneNumber(phoneNumber) {
    const cleaned = this.cleanPhoneNumber(phoneNumber);
    
    if (!cleaned) return 'Unknown';
    
    // Format as (XXX) XXX-XXXX for 10-digit numbers
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    
    // For other lengths, just return the cleaned number
    return cleaned;
  }

  /**
   * Create multiple search variants of a phone number for database matching
   * @param {string} phoneNumber - Phone number to create variants for
   * @returns {Array<string>} - Array of possible phone number formats
   */
  static createSearchVariants(phoneNumber) {
    const cleaned = this.cleanPhoneNumber(phoneNumber);
    const variants = new Set();
    
    if (!cleaned) return [];
    
    // Add the cleaned number
    variants.add(cleaned);
    
    // Add with country code
    if (cleaned.length === 10) {
      variants.add(`1${cleaned}`);
      variants.add(`+1${cleaned}`);
    }
    
    // Add formatted versions
    variants.add(this.formatPhoneNumber(cleaned));
    
    // Add with different separators
    if (cleaned.length === 10) {
      variants.add(`${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`);
      variants.add(`${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`);
      variants.add(`${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`);
    }
    
    return Array.from(variants);
  }

  /**
   * Check if two phone numbers are the same
   * @param {string} phone1 - First phone number
   * @param {string} phone2 - Second phone number
   * @returns {boolean} - True if they match
   */
  static arePhoneNumbersEqual(phone1, phone2) {
    const clean1 = this.cleanPhoneNumber(phone1);
    const clean2 = this.cleanPhoneNumber(phone2);
    
    if (!clean1 || !clean2) return false;
    
    // For US numbers, compare the last 10 digits
    const compare1 = clean1.slice(-10);
    const compare2 = clean2.slice(-10);
    
    return compare1 === compare2;
  }

  /**
   * Validate if a phone number is valid (basic validation)
   * @param {string} phoneNumber - Phone number to validate
   * @returns {boolean} - True if valid
   */
  static isValidPhoneNumber(phoneNumber) {
    const cleaned = this.cleanPhoneNumber(phoneNumber);
    
    // Check if it's a 10-digit US number
    return cleaned.length === 10 && /^\d{10}$/.test(cleaned);
  }

  /**
   * Extract phone number from caller ID string (handles various formats)
   * @param {string} callerIdString - Raw caller ID from phone system
   * @returns {string} - Extracted phone number
   */
  static extractPhoneFromCallerId(callerIdString) {
    if (!callerIdString) return '';
    
    // Common caller ID formats:
    // "+1 (555) 123-4567"
    // "John Doe <+15551234567>"
    // "5551234567"
    // "+15551234567"
    
    // Try to extract from angle brackets first (email-like format)
    const bracketMatch = callerIdString.match(/<([+\d\s\-\(\)\.]+)>/);
    if (bracketMatch) {
      return this.cleanPhoneNumber(bracketMatch[1]);
    }
    
    // Otherwise, clean the entire string
    return this.cleanPhoneNumber(callerIdString);
  }

  /**
   * Get a display name for unknown numbers
   * @param {string} phoneNumber - Phone number
   * @returns {string} - Display name
   */
  static getUnknownDisplayName(phoneNumber) {
    const formatted = this.formatPhoneNumber(phoneNumber);
    return formatted !== 'Unknown' ? formatted : 'Unknown Number';
  }

  /**
   * Determine the type of call based on caller info
   * @param {string} phoneNumber - Phone number
   * @param {Object} leadData - Lead data if found
   * @returns {Object} - Call type information
   */
  static getCallTypeInfo(phoneNumber, leadData = null) {
    const cleanNumber = this.cleanPhoneNumber(phoneNumber);
    const formattedNumber = this.formatPhoneNumber(phoneNumber);
    
    if (leadData) {
      return {
        type: 'known_lead',
        displayName: leadData.name,
        displaySubtitle: leadData.company || formattedNumber,
        phoneNumber: formattedNumber,
        leadId: leadData.id
      };
    } else {
      return {
        type: 'unknown',
        displayName: 'Unknown Caller',
        displaySubtitle: formattedNumber,
        phoneNumber: formattedNumber,
        leadId: null
      };
    }
  }
}

export default PhoneUtils;