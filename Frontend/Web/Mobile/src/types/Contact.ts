export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  address?: string;
  notes?: string;
  tags: string[];
  category: ContactCategory;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastContactedAt?: Date;
  avatar?: string;
}

export enum ContactCategory {
  LEAD = 'lead',
  CUSTOMER = 'customer',
  PROSPECT = 'prospect',
  PARTNER = 'partner',
  VENDOR = 'vendor',
  OTHER = 'other'
}

export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  address: string;
  notes: string;
  tags: string[];
  category: ContactCategory;
}

export const defaultContactTags = [
  'Hot Lead',
  'Cold Lead',
  'Follow Up',
  'Decision Maker',
  'Influencer',
  'Champion',
  'Technical Contact',
  'Budget Holder',
  'Competitor',
  'VIP'
];

export const getCategoryColor = (category: ContactCategory): string => {
  switch (category) {
    case ContactCategory.LEAD:
      return '#06B6D4';
    case ContactCategory.CUSTOMER:
      return '#10B981';
    case ContactCategory.PROSPECT:
      return '#F59E0B';
    case ContactCategory.PARTNER:
      return '#8B5CF6';
    case ContactCategory.VENDOR:
      return '#64748B';
    case ContactCategory.OTHER:
      return '#94A3B8';
    default:
      return '#64748B';
  }
};

export const getCategoryDisplayName = (category: ContactCategory): string => {
  switch (category) {
    case ContactCategory.LEAD:
      return 'Lead';
    case ContactCategory.CUSTOMER:
      return 'Customer';
    case ContactCategory.PROSPECT:
      return 'Prospect';
    case ContactCategory.PARTNER:
      return 'Partner';
    case ContactCategory.VENDOR:
      return 'Vendor';
    case ContactCategory.OTHER:
      return 'Other';
    default:
      return 'Unknown';
  }
};

export const getContactInitials = (contact: Contact): string => {
  const firstInitial = contact.firstName.charAt(0).toUpperCase();
  const lastInitial = contact.lastName.charAt(0).toUpperCase();
  return `${firstInitial}${lastInitial}`;
};

export const getContactFullName = (contact: Contact): string => {
  return `${contact.firstName} ${contact.lastName}`.trim();
};