/**
 * T9 (Text on 9 keys) search utilities for phone dialers
 */

export const T9_MAPPING = {
  '0': ' +',
  '1': '',
  '2': 'abc',
  '3': 'def',
  '4': 'ghi',
  '5': 'jkl',
  '6': 'mno',
  '7': 'pqrs',
  '8': 'tuv',
  '9': 'wxyz'
};

export const REVERSE_T9_MAPPING = {};

// Build reverse mapping (letter -> digit)
Object.keys(T9_MAPPING).forEach(digit => {
  const letters = T9_MAPPING[digit];
  for (let i = 0; i < letters.length; i++) {
    REVERSE_T9_MAPPING[letters[i]] = digit;
  }
});

export class T9Search {
  /**
   * Convert text to T9 digit sequence
   * @param {string} text - Text to convert
   * @returns {string} - T9 digit sequence
   */
  static textToT9(text) {
    if (!text) return '';
    
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters except spaces
      .split('')
      .map(char => REVERSE_T9_MAPPING[char] || char)
      .join('');
  }

  /**
   * Check if a T9 pattern matches text
   * @param {string} text - Text to check against
   * @param {string} pattern - T9 digit pattern
   * @returns {boolean} - True if pattern matches
   */
  static matchesT9Pattern(text, pattern) {
    if (!text || !pattern) return false;
    
    const textT9 = this.textToT9(text);
    const patternLower = pattern.toLowerCase();
    
    // Direct T9 sequence match
    if (textT9.includes(patternLower)) {
      return true;
    }
    
    // Fuzzy match - check if pattern letters can be found in sequence
    return this.fuzzyT9Match(text, pattern);
  }

  /**
   * Fuzzy T9 matching - allows for partial matches
   * @param {string} text - Text to search in
   * @param {string} pattern - T9 pattern to match
   * @returns {boolean} - True if fuzzy match found
   */
  static fuzzyT9Match(text, pattern) {
    const cleanText = text.toLowerCase().replace(/[^a-z]/g, '');
    let textIndex = 0;
    
    for (let i = 0; i < pattern.length; i++) {
      const digit = pattern[i];
      const letters = T9_MAPPING[digit];
      
      if (!letters) continue; // Skip non-letter digits
      
      let found = false;
      while (textIndex < cleanText.length) {
        if (letters.includes(cleanText[textIndex])) {
          found = true;
          textIndex++;
          break;
        }
        textIndex++;
      }
      
      if (!found) return false;
    }
    
    return true;
  }

  /**
   * Search leads using T9 algorithm
   * @param {string} input - T9 input digits
   * @param {Array} leads - Array of lead objects
   * @param {number} limit - Maximum results to return
   * @returns {Array} - Filtered leads matching T9 pattern
   */
  static searchLeads(input, leads, limit = 5) {
    if (!input || input.length < 2) return [];
    
    const matches = leads.filter(lead => {
      // Check name match
      if (lead.name && this.matchesT9Pattern(lead.name, input)) {
        return true;
      }
      
      // Check company match
      if (lead.company && this.matchesT9Pattern(lead.company, input)) {
        return true;
      }
      
      // Check phone number direct match
      if (lead.phone && this.phoneNumberMatch(lead.phone, input)) {
        return true;
      }
      
      return false;
    });
    
    // Sort by relevance (exact matches first, then partial matches)
    const sorted = matches.sort((a, b) => {
      const aNameExact = a.name && this.exactT9Match(a.name, input);
      const bNameExact = b.name && this.exactT9Match(b.name, input);
      
      if (aNameExact && !bNameExact) return -1;
      if (!aNameExact && bNameExact) return 1;
      
      // If both or neither are exact, sort by name
      return (a.name || '').localeCompare(b.name || '');
    });
    
    return sorted.slice(0, limit);
  }

  /**
   * Check for exact T9 match (pattern matches from start)
   * @param {string} text - Text to check
   * @param {string} pattern - T9 pattern
   * @returns {boolean} - True if exact match
   */
  static exactT9Match(text, pattern) {
    if (!text || !pattern) return false;
    
    const textT9 = this.textToT9(text);
    return textT9.startsWith(pattern.toLowerCase());
  }

  /**
   * Check if phone number matches input
   * @param {string} phoneNumber - Phone number to check
   * @param {string} input - Input digits
   * @returns {boolean} - True if phone matches
   */
  static phoneNumberMatch(phoneNumber, input) {
    if (!phoneNumber || !input) return false;
    
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const cleanInput = input.replace(/\D/g, '');
    
    return cleanPhone.includes(cleanInput);
  }

  /**
   * Get T9 suggestions for a digit
   * @param {string} digit - Single digit
   * @returns {string} - Letters for that digit
   */
  static getT9Letters(digit) {
    return T9_MAPPING[digit] || '';
  }

  /**
   * Format phone number as user types
   * @param {string} input - Raw input
   * @returns {string} - Formatted phone number
   */
  static formatPhoneInput(input) {
    // Remove all non-digits
    const digits = input.replace(/\D/g, '');
    
    // Format based on length
    if (digits.length === 0) return '';
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  }

  /**
   * Check if input is a valid phone number pattern
   * @param {string} input - Input to check
   * @returns {boolean} - True if looks like phone number
   */
  static isPhoneNumber(input) {
    const digits = input.replace(/\D/g, '');
    return digits.length >= 10 && /^\d+$/.test(digits);
  }

  /**
   * Get search score for ranking results
   * @param {Object} lead - Lead object
   * @param {string} pattern - Search pattern
   * @returns {number} - Score (higher is better)
   */
  static getSearchScore(lead, pattern) {
    let score = 0;
    
    // Exact name match gets highest score
    if (lead.name && this.exactT9Match(lead.name, pattern)) {
      score += 100;
    }
    
    // Partial name match
    if (lead.name && this.matchesT9Pattern(lead.name, pattern)) {
      score += 50;
    }
    
    // Company match
    if (lead.company && this.matchesT9Pattern(lead.company, pattern)) {
      score += 25;
    }
    
    // Phone match
    if (lead.phone && this.phoneNumberMatch(lead.phone, pattern)) {
      score += 75;
    }
    
    // Boost score for recent contacts
    if (lead.lastContactedAt) {
      const daysSinceContact = Math.floor(
        (Date.now() - new Date(lead.lastContactedAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      score += Math.max(0, 10 - daysSinceContact);
    }
    
    return score;
  }
}

export default T9Search;