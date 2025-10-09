export interface CallLog {
  id: string;
  contactId?: string;
  phoneNumber: string;
  contactName?: string;
  type: CallType;
  direction: CallDirection;
  status: CallStatus;
  startTime: Date;
  endTime?: Date;
  duration: number; // in seconds
  notes?: string;
  outcome?: CallOutcome;
  followUpRequired?: boolean;
  followUpDate?: Date;
  recordings?: CallRecording[];
  createdAt: Date;
  updatedAt: Date;
}

export enum CallType {
  VOICE = 'voice',
  VIDEO = 'video',
  CONFERENCE = 'conference'
}

export enum CallDirection {
  OUTBOUND = 'outbound',
  INBOUND = 'inbound',
  MISSED = 'missed'
}

export enum CallStatus {
  INITIATED = 'initiated',
  RINGING = 'ringing',
  CONNECTED = 'connected',
  ENDED = 'ended',
  FAILED = 'failed',
  BUSY = 'busy',
  NO_ANSWER = 'no_answer',
  DECLINED = 'declined'
}

export enum CallOutcome {
  SUCCESSFUL = 'successful',
  VOICEMAIL = 'voicemail',
  BUSY = 'busy',
  NO_ANSWER = 'no_answer',
  WRONG_NUMBER = 'wrong_number',
  CALLBACK_REQUESTED = 'callback_requested',
  MEETING_SCHEDULED = 'meeting_scheduled',
  PROPOSAL_REQUESTED = 'proposal_requested',
  NOT_INTERESTED = 'not_interested',
  FOLLOW_UP_NEEDED = 'follow_up_needed'
}

export interface CallRecording {
  id: string;
  url: string;
  duration: number;
  size: number;
  createdAt: Date;
}

export interface ActiveCall {
  id: string;
  phoneNumber: string;
  contactName?: string;
  startTime: Date;
  status: CallStatus;
  duration: number;
  isMuted: boolean;
  isSpeakerOn: boolean;
  isRecording: boolean;
}

export const getCallStatusColor = (status: CallStatus): string => {
  switch (status) {
    case CallStatus.CONNECTED:
      return '#10B981';
    case CallStatus.INITIATED:
    case CallStatus.RINGING:
      return '#F59E0B';
    case CallStatus.ENDED:
      return '#64748B';
    case CallStatus.FAILED:
    case CallStatus.DECLINED:
      return '#EF4444';
    case CallStatus.BUSY:
    case CallStatus.NO_ANSWER:
      return '#F97316';
    default:
      return '#64748B';
  }
};

export const getCallDirectionIcon = (direction: CallDirection): string => {
  switch (direction) {
    case CallDirection.OUTBOUND:
      return '📞';
    case CallDirection.INBOUND:
      return '📲';
    case CallDirection.MISSED:
      return '📵';
    default:
      return '📞';
  }
};

export const getCallOutcomeColor = (outcome: CallOutcome): string => {
  switch (outcome) {
    case CallOutcome.SUCCESSFUL:
    case CallOutcome.MEETING_SCHEDULED:
    case CallOutcome.PROPOSAL_REQUESTED:
      return '#10B981';
    case CallOutcome.CALLBACK_REQUESTED:
    case CallOutcome.FOLLOW_UP_NEEDED:
      return '#F59E0B';
    case CallOutcome.NOT_INTERESTED:
    case CallOutcome.WRONG_NUMBER:
      return '#EF4444';
    case CallOutcome.VOICEMAIL:
    case CallOutcome.BUSY:
    case CallOutcome.NO_ANSWER:
      return '#64748B';
    default:
      return '#64748B';
  }
};

export const formatCallDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
};

export const getCallDisplayName = (status: CallStatus): string => {
  switch (status) {
    case CallStatus.INITIATED:
      return 'Initiating';
    case CallStatus.RINGING:
      return 'Ringing';
    case CallStatus.CONNECTED:
      return 'Connected';
    case CallStatus.ENDED:
      return 'Ended';
    case CallStatus.FAILED:
      return 'Failed';
    case CallStatus.BUSY:
      return 'Busy';
    case CallStatus.NO_ANSWER:
      return 'No Answer';
    case CallStatus.DECLINED:
      return 'Declined';
    default:
      return 'Unknown';
  }
};

export const getOutcomeDisplayName = (outcome: CallOutcome): string => {
  switch (outcome) {
    case CallOutcome.SUCCESSFUL:
      return 'Successful';
    case CallOutcome.VOICEMAIL:
      return 'Left Voicemail';
    case CallOutcome.BUSY:
      return 'Line Busy';
    case CallOutcome.NO_ANSWER:
      return 'No Answer';
    case CallOutcome.WRONG_NUMBER:
      return 'Wrong Number';
    case CallOutcome.CALLBACK_REQUESTED:
      return 'Callback Requested';
    case CallOutcome.MEETING_SCHEDULED:
      return 'Meeting Scheduled';
    case CallOutcome.PROPOSAL_REQUESTED:
      return 'Proposal Requested';
    case CallOutcome.NOT_INTERESTED:
      return 'Not Interested';
    case CallOutcome.FOLLOW_UP_NEEDED:
      return 'Follow-up Needed';
    default:
      return 'Unknown';
  }
};