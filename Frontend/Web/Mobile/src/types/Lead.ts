export interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  source: string;
  status: LeadStatus;
  priority: LeadPriority;
  value?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  lastContactedAt?: Date;
  nextFollowUpAt?: Date;
}

export enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  QUALIFIED = 'qualified',
  PROPOSAL = 'proposal',
  CLOSED_WON = 'closed_won',
  CLOSED_LOST = 'closed_lost'
}

export enum LeadPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface LeadSource {
  id: string;
  name: string;
  description?: string;
}

export const defaultLeadSources: LeadSource[] = [
  { id: 'website', name: 'Website' },
  { id: 'social_media', name: 'Social Media' },
  { id: 'referral', name: 'Referral' },
  { id: 'cold_call', name: 'Cold Call' },
  { id: 'email_campaign', name: 'Email Campaign' },
  { id: 'trade_show', name: 'Trade Show' },
  { id: 'advertising', name: 'Advertising' },
  { id: 'other', name: 'Other' },
];

export const getStatusColor = (status: LeadStatus): string => {
  switch (status) {
    case LeadStatus.NEW:
      return '#06B6D4';
    case LeadStatus.CONTACTED:
      return '#F59E0B';
    case LeadStatus.QUALIFIED:
      return '#10B981';
    case LeadStatus.PROPOSAL:
      return '#8B5CF6';
    case LeadStatus.CLOSED_WON:
      return '#10B981';
    case LeadStatus.CLOSED_LOST:
      return '#EF4444';
    default:
      return '#64748B';
  }
};

export const getPriorityColor = (priority: LeadPriority): string => {
  switch (priority) {
    case LeadPriority.LOW:
      return '#64748B';
    case LeadPriority.MEDIUM:
      return '#F59E0B';
    case LeadPriority.HIGH:
      return '#EF4444';
    case LeadPriority.URGENT:
      return '#DC2626';
    default:
      return '#64748B';
  }
};

export const getStatusDisplayName = (status: LeadStatus): string => {
  switch (status) {
    case LeadStatus.NEW:
      return 'New';
    case LeadStatus.CONTACTED:
      return 'Contacted';
    case LeadStatus.QUALIFIED:
      return 'Qualified';
    case LeadStatus.PROPOSAL:
      return 'Proposal';
    case LeadStatus.CLOSED_WON:
      return 'Closed Won';
    case LeadStatus.CLOSED_LOST:
      return 'Closed Lost';
    default:
      return 'Unknown';
  }
};

export const getPriorityDisplayName = (priority: LeadPriority): string => {
  switch (priority) {
    case LeadPriority.LOW:
      return 'Low';
    case LeadPriority.MEDIUM:
      return 'Medium';
    case LeadPriority.HIGH:
      return 'High';
    case LeadPriority.URGENT:
      return 'Urgent';
    default:
      return 'Unknown';
  }
};