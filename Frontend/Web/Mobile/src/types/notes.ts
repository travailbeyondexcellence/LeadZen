export interface Note {
  id: string;
  content: string;
  tag: NoteTag;
  createdBy: string;
  createdAt: Date;
  leadId: string;
  callLogId?: string; // Optional reference to associated call
}

export type NoteTag = 'call-related' | 'general' | 'follow-up' | 'custom';

export interface NoteTagInfo {
  id: NoteTag;
  label: string;
  icon: string;
  color: string;
}

export const NOTE_TAGS: Record<NoteTag, NoteTagInfo> = {
  'call-related': {
    id: 'call-related',
    label: 'Call Related',
    icon: '📞',
    color: '#3B82F6'
  },
  'general': {
    id: 'general',
    label: 'General',
    icon: '📝',
    color: '#6B7280'
  },
  'follow-up': {
    id: 'follow-up',
    label: 'Follow Up',
    icon: '⏰',
    color: '#F59E0B'
  },
  'custom': {
    id: 'custom',
    label: 'Custom',
    icon: '🏷️',
    color: '#8B5CF6'
  }
};