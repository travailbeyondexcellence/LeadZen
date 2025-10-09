export const ValidationRules = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s'-]+$/,
    message: 'Name must be 2-50 characters and contain only letters'
  },
  
  email: {
    required: false,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  },
  
  phone: {
    required: true,
    pattern: /^[\d\s\-\(\)\+]+$/,
    minLength: 10,
    message: 'Please enter a valid phone number'
  },
  
  company: {
    required: false,
    minLength: 2,
    maxLength: 100,
    message: 'Company name must be 2-100 characters'
  },
  
  position: {
    required: false,
    minLength: 2,
    maxLength: 50,
    message: 'Position must be 2-50 characters'
  },
  
  value: {
    required: false,
    min: 0,
    max: 999999999,
    message: 'Value must be a positive number'
  },
  
  notes: {
    required: false,
    maxLength: 1000,
    message: 'Notes cannot exceed 1000 characters'
  }
};

export const validateField = (fieldName: string, value: any): string | null => {
  const rule = ValidationRules[fieldName as keyof typeof ValidationRules];
  
  if (!rule) return null;
  
  // Check required
  if (rule.required && (!value || value.toString().trim() === '')) {
    return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
  }
  
  // Skip validation for optional empty fields
  if (!rule.required && (!value || value.toString().trim() === '')) {
    return null;
  }
  
  const stringValue = value.toString().trim();
  
  // Check pattern
  if (rule.pattern && !rule.pattern.test(stringValue)) {
    return rule.message;
  }
  
  // Check min length
  if (rule.minLength && stringValue.length < rule.minLength) {
    return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${rule.minLength} characters`;
  }
  
  // Check max length
  if (rule.maxLength && stringValue.length > rule.maxLength) {
    return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} cannot exceed ${rule.maxLength} characters`;
  }
  
  // Check min value (for numbers)
  if (rule.min !== undefined && Number(value) < rule.min) {
    return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${rule.min}`;
  }
  
  // Check max value (for numbers)
  if (rule.max !== undefined && Number(value) > rule.max) {
    return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} cannot exceed ${rule.max}`;
  }
  
  return null;
};

export const validateForm = (data: Record<string, any>): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  Object.keys(data).forEach(field => {
    const error = validateField(field, data[field]);
    if (error) {
      errors[field] = error;
    }
  });
  
  return errors;
};

export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  // Format as +X (XXX) XXX-XXXX
  if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  return phone;
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const validateEmail = (email: string): boolean => {
  return ValidationRules.email.pattern.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 11;
};