import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialPressable from './Pressable';
import { 
  CallLog, 
  getCallStatusColor, 
  getCallDirectionIcon, 
  getCallOutcomeColor,
  formatCallDuration,
  getCallDisplayName,
  getOutcomeDisplayName 
} from '../types/Call';

interface CallLogCardProps {
  callLog: CallLog;
  onPress: (callLog: CallLog) => void;
  onCallback?: (callLog: CallLog) => void;
  onAddNotes?: (callLog: CallLog) => void;
}

const CallLogCard: React.FC<CallLogCardProps> = ({ 
  callLog, 
  onPress, 
  onCallback, 
  onAddNotes 
}) => {
  const statusColor = getCallStatusColor(callLog.status);
  const directionIcon = getCallDirectionIcon(callLog.direction);
  const outcomeColor = callLog.outcome ? getCallOutcomeColor(callLog.outcome) : '#64748B';
  
  const formatTime = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(date));
  };

  const formatDate = (date: Date): string => {
    const now = new Date();
    const callDate = new Date(date);
    const diffTime = Math.abs(now.getTime() - callDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Today';
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return callDate.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return callDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  return (
    <MaterialPressable
      style={styles.card}
      onPress={() => onPress(callLog)}
      rippleColor="rgba(20, 184, 166, 0.08)"
    >
      <View style={styles.header}>
        <View style={styles.callInfo}>
          <View style={styles.iconContainer}>
            <Text style={styles.directionIcon}>{directionIcon}</Text>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          </View>
          
          <View style={styles.contactInfo}>
            <Text style={styles.contactName} numberOfLines={1}>
              {callLog.contactName || callLog.phoneNumber}
            </Text>
            {callLog.contactName && (
              <Text style={styles.phoneNumber} numberOfLines={1}>
                {callLog.phoneNumber}
              </Text>
            )}
          </View>
        </View>
        
        <View style={styles.timeInfo}>
          <Text style={styles.time}>{formatTime(callLog.startTime)}</Text>
          <Text style={styles.date}>{formatDate(callLog.startTime)}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.callDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status:</Text>
            <Text style={[styles.detailValue, { color: statusColor }]}>
              {getCallDisplayName(callLog.status)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Duration:</Text>
            <Text style={styles.detailValue}>
              {formatCallDuration(callLog.duration)}
            </Text>
          </View>
          
          {callLog.outcome && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Outcome:</Text>
              <Text style={[styles.detailValue, { color: outcomeColor }]}>
                {getOutcomeDisplayName(callLog.outcome)}
              </Text>
            </View>
          )}
        </View>

        {callLog.notes && (
          <View style={styles.notesContainer}>
            <Text style={styles.notesLabel}>Notes:</Text>
            <Text style={styles.notesText} numberOfLines={2}>
              {callLog.notes}
            </Text>
          </View>
        )}

        {callLog.followUpRequired && callLog.followUpDate && (
          <View style={styles.followUpContainer}>
            <Text style={styles.followUpIcon}>⏰</Text>
            <Text style={styles.followUpText}>
              Follow-up: {formatDate(callLog.followUpDate)}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.recordingInfo}>
          {callLog.recordings && callLog.recordings.length > 0 && (
            <View style={styles.recordingBadge}>
              <Text style={styles.recordingIcon}>🎙️</Text>
              <Text style={styles.recordingText}>
                {callLog.recordings.length} recording{callLog.recordings.length > 1 ? 's' : ''}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.actions}>
          {onCallback && (
            <MaterialPressable
              style={styles.actionButton}
              onPress={() => onCallback(callLog)}
              rippleColor="rgba(20, 184, 166, 0.2)"
            >
              <Text style={styles.actionIcon}>📞</Text>
            </MaterialPressable>
          )}
          {onAddNotes && (
            <MaterialPressable
              style={styles.actionButton}
              onPress={() => onAddNotes(callLog)}
              rippleColor="rgba(20, 184, 166, 0.2)"
            >
              <Text style={styles.actionIcon}>📝</Text>
            </MaterialPressable>
          )}
        </View>
      </View>
    </MaterialPressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  callInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  iconContainer: {
    position: 'relative',
    marginRight: 12,
  },
  directionIcon: {
    fontSize: 24,
  },
  statusDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  phoneNumber: {
    fontSize: 14,
    color: '#64748B',
  },
  timeInfo: {
    alignItems: 'flex-end',
  },
  time: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
  },
  date: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  content: {
    marginBottom: 12,
  },
  callDetails: {
    gap: 4,
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  notesContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
  },
  notesLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  notesText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  followUpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    gap: 6,
  },
  followUpIcon: {
    fontSize: 12,
  },
  followUpText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordingInfo: {
    flex: 1,
  },
  recordingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 4,
  },
  recordingIcon: {
    fontSize: 10,
  },
  recordingText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#047857',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 14,
  },
});

export default CallLogCard;