import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import MaterialPressable from './Pressable';
import { ActiveCall, CallStatus, formatCallDuration } from '../types/Call';

interface ActiveCallScreenProps {
  activeCall: ActiveCall | null;
  onEndCall: () => void;
  onMute: () => void;
  onSpeaker: () => void;
  onKeypad: () => void;
  onHold: () => void;
  onRecord: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ActiveCallScreen: React.FC<ActiveCallScreenProps> = ({
  activeCall,
  onEndCall,
  onMute,
  onSpeaker,
  onKeypad,
  onHold,
  onRecord,
}) => {
  const [pulseAnim] = useState(new Animated.Value(1));
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    if (activeCall?.status === CallStatus.RINGING) {
      const pulse = () => {
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]).start(() => pulse());
      };
      pulse();
    } else {
      pulseAnim.setValue(1);
    }
  }, [activeCall?.status, pulseAnim]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeCall && activeCall.status === CallStatus.CONNECTED) {
      interval = setInterval(() => {
        const now = new Date();
        const duration = Math.floor((now.getTime() - activeCall.startTime.getTime()) / 1000);
        setCallDuration(duration);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeCall]);

  if (!activeCall) return null;

  const getStatusText = () => {
    switch (activeCall.status) {
      case CallStatus.INITIATED:
        return 'Calling...';
      case CallStatus.RINGING:
        return 'Ringing...';
      case CallStatus.CONNECTED:
        return formatCallDuration(callDuration);
      default:
        return 'Call in progress';
    }
  };

  const getInitials = (name?: string): string => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <Modal
      visible={true}
      animationType="slide"
      statusBarTranslucent={true}
    >
      <StatusBar barStyle="light-content" backgroundColor="#1E293B" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.statusText}>{getStatusText()}</Text>
          {activeCall.isRecording && (
            <View style={styles.recordingIndicator}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>Recording</Text>
            </View>
          )}
        </View>

        <View style={styles.contactSection}>
          <Animated.View 
            style={[
              styles.avatarContainer,
              { transform: [{ scale: pulseAnim }] }
            ]}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {getInitials(activeCall.contactName)}
              </Text>
            </View>
          </Animated.View>
          
          <Text style={styles.contactName}>
            {activeCall.contactName || 'Unknown Contact'}
          </Text>
          <Text style={styles.phoneNumber}>
            {activeCall.phoneNumber}
          </Text>
        </View>

        <View style={styles.controlsContainer}>
          {/* First row of controls */}
          <View style={styles.controlsRow}>
            <MaterialPressable
              style={[styles.controlButton, activeCall.isMuted && styles.controlButtonActive]}
              onPress={onMute}
              rippleColor="rgba(255, 255, 255, 0.2)"
            >
              <Text style={[styles.controlIcon, activeCall.isMuted && styles.controlIconActive]}>
                {activeCall.isMuted ? '🔇' : '🎤'}
              </Text>
              <Text style={[styles.controlLabel, activeCall.isMuted && styles.controlLabelActive]}>
                {activeCall.isMuted ? 'Unmute' : 'Mute'}
              </Text>
            </MaterialPressable>

            <MaterialPressable
              style={styles.controlButton}
              onPress={onKeypad}
              rippleColor="rgba(255, 255, 255, 0.2)"
            >
              <Text style={styles.controlIcon}>⌨️</Text>
              <Text style={styles.controlLabel}>Keypad</Text>
            </MaterialPressable>

            <MaterialPressable
              style={[styles.controlButton, activeCall.isSpeakerOn && styles.controlButtonActive]}
              onPress={onSpeaker}
              rippleColor="rgba(255, 255, 255, 0.2)"
            >
              <Text style={[styles.controlIcon, activeCall.isSpeakerOn && styles.controlIconActive]}>
                {activeCall.isSpeakerOn ? '🔊' : '🔈'}
              </Text>
              <Text style={[styles.controlLabel, activeCall.isSpeakerOn && styles.controlLabelActive]}>
                Speaker
              </Text>
            </MaterialPressable>
          </View>

          {/* Second row of controls */}
          <View style={styles.controlsRow}>
            <MaterialPressable
              style={styles.controlButton}
              onPress={onHold}
              rippleColor="rgba(255, 255, 255, 0.2)"
            >
              <Text style={styles.controlIcon}>⏸️</Text>
              <Text style={styles.controlLabel}>Hold</Text>
            </MaterialPressable>

            <MaterialPressable
              style={[styles.controlButton, activeCall.isRecording && styles.controlButtonActive]}
              onPress={onRecord}
              rippleColor="rgba(255, 255, 255, 0.2)"
            >
              <Text style={[styles.controlIcon, activeCall.isRecording && styles.controlIconActive]}>
                🎙️
              </Text>
              <Text style={[styles.controlLabel, activeCall.isRecording && styles.controlLabelActive]}>
                {activeCall.isRecording ? 'Stop Rec' : 'Record'}
              </Text>
            </MaterialPressable>

            <View style={styles.controlButton} />
          </View>

          {/* End call button */}
          <View style={styles.endCallContainer}>
            <MaterialPressable
              style={styles.endCallButton}
              onPress={onEndCall}
              rippleColor="rgba(255, 255, 255, 0.3)"
            >
              <Text style={styles.endCallIcon}>📞</Text>
            </MaterialPressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E293B',
    paddingTop: 50,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#E2E8F0',
    marginBottom: 8,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  recordingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FEE2E2',
  },
  contactSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  avatarContainer: {
    marginBottom: 32,
  },
  avatar: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#14B8A6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 8,
  },
  avatarText: {
    fontSize: 48,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  contactName: {
    fontSize: 28,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  phoneNumber: {
    fontSize: 18,
    color: '#94A3B8',
    textAlign: 'center',
  },
  controlsContainer: {
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 32,
  },
  controlButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  controlButtonActive: {
    backgroundColor: '#14B8A6',
  },
  controlIcon: {
    fontSize: 24,
  },
  controlIconActive: {
    opacity: 1,
  },
  controlLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94A3B8',
    textAlign: 'center',
  },
  controlLabelActive: {
    color: '#FFFFFF',
  },
  endCallContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  endCallButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6,
    transform: [{ rotate: '135deg' }],
  },
  endCallIcon: {
    fontSize: 32,
    transform: [{ rotate: '-135deg' }],
  },
});

export default ActiveCallScreen;