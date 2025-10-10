import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
  TextInput,
} from 'react-native';
import DialerKeypad from '../components/DialerKeypad';
import T9Search from '../components/T9Search';
import RecentCalls from '../components/RecentCalls';
import DialerService from '../services/DialerService';
import { Colors, Typography } from '../theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type TabType = 'dialer' | 'recent';

const Dialer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dialer');
  const [phoneInput, setPhoneInput] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const searchAnimation = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);

  // Mock call logs data
  const mockCallLogs: CallLog[] = [
    {
      id: '1',
      contactId: '1',
      phoneNumber: '+1 (555) 123-4567',
      contactName: 'John Smith',
      type: CallType.VOICE,
      direction: CallDirection.OUTBOUND,
      status: CallStatus.ENDED,
      startTime: new Date('2024-10-08T14:30:00'),
      endTime: new Date('2024-10-08T14:35:30'),
      duration: 330,
      notes: 'Discussed enterprise package pricing. Very interested.',
      outcome: CallOutcome.SUCCESSFUL,
      followUpRequired: true,
      followUpDate: new Date('2024-10-10'),
      createdAt: new Date('2024-10-08T14:30:00'),
      updatedAt: new Date('2024-10-08T14:35:30'),
    },
    {
      id: '2',
      phoneNumber: '+1 (555) 987-6543',
      contactName: 'Sarah Johnson',
      type: CallType.VOICE,
      direction: CallDirection.INBOUND,
      status: CallStatus.ENDED,
      startTime: new Date('2024-10-08T11:15:00'),
      endTime: new Date('2024-10-08T11:22:45'),
      duration: 465,
      notes: 'Called back regarding proposal. Needs technical details.',
      outcome: CallOutcome.CALLBACK_REQUESTED,
      followUpRequired: true,
      followUpDate: new Date('2024-10-09'),
      createdAt: new Date('2024-10-08T11:15:00'),
      updatedAt: new Date('2024-10-08T11:22:45'),
    },
    {
      id: '3',
      phoneNumber: '+1 (555) 456-7890',
      contactName: 'Michael Chen',
      type: CallType.VOICE,
      direction: CallDirection.OUTBOUND,
      status: CallStatus.ENDED,
      startTime: new Date('2024-10-07T16:45:00'),
      duration: 0,
      outcome: CallOutcome.VOICEMAIL,
      notes: 'Left voicemail about demo scheduling.',
      createdAt: new Date('2024-10-07T16:45:00'),
      updatedAt: new Date('2024-10-07T16:45:30'),
    },
    {
      id: '4',
      phoneNumber: '+1 (555) 321-9876',
      type: CallType.VOICE,
      direction: CallDirection.MISSED,
      status: CallStatus.NO_ANSWER,
      startTime: new Date('2024-10-07T09:30:00'),
      duration: 0,
      outcome: CallOutcome.NO_ANSWER,
      createdAt: new Date('2024-10-07T09:30:00'),
      updatedAt: new Date('2024-10-07T09:30:00'),
    },
    {
      id: '5',
      phoneNumber: '+1 (555) 654-3210',
      contactName: 'Emily Davis',
      type: CallType.VOICE,
      direction: CallDirection.OUTBOUND,
      status: CallStatus.ENDED,
      startTime: new Date('2024-10-06T13:20:00'),
      endTime: new Date('2024-10-06T14:05:30'),
      duration: 2730,
      notes: 'Detailed discussion about partnership opportunities. Very promising.',
      outcome: CallOutcome.MEETING_SCHEDULED,
      recordings: [{
        id: 'rec1',
        url: 'https://example.com/recording1.mp3',
        duration: 2730,
        size: 2048000,
        createdAt: new Date('2024-10-06T13:20:00'),
      }],
      createdAt: new Date('2024-10-06T13:20:00'),
      updatedAt: new Date('2024-10-06T14:05:30'),
    },
  ];

  useEffect(() => {
    loadCallLogs();
  }, []);

  const loadCallLogs = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCallLogs(mockCallLogs);
    } catch (error) {
      Alert.alert('Error', 'Failed to load call logs');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCallLogs();
    setRefreshing(false);
  };

  const dialpadNumbers = [
    [{ number: '1', letters: '' }, { number: '2', letters: 'ABC' }, { number: '3', letters: 'DEF' }],
    [{ number: '4', letters: 'GHI' }, { number: '5', letters: 'JKL' }, { number: '6', letters: 'MNO' }],
    [{ number: '7', letters: 'PQRS' }, { number: '8', letters: 'TUV' }, { number: '9', letters: 'WXYZ' }],
    [{ number: '*', letters: '' }, { number: '0', letters: '+' }, { number: '#', letters: '' }],
  ];

  const handleNumberPress = (number: string) => {
    setPhoneNumber(prev => prev + number);
  };

  const handleBackspace = () => {
    setPhoneNumber(prev => prev.slice(0, -1));
  };

  const handleCall = () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter a phone number');
      return;
    }

    // Create active call
    const newActiveCall: ActiveCall = {
      id: Date.now().toString(),
      phoneNumber: phoneNumber,
      startTime: new Date(),
      status: CallStatus.INITIATED,
      duration: 0,
      isMuted: false,
      isSpeakerOn: false,
      isRecording: false,
    };

    setActiveCall(newActiveCall);
    
    // Simulate call progression
    setTimeout(() => {
      if (newActiveCall) {
        setActiveCall(prev => prev ? { ...prev, status: CallStatus.RINGING } : null);
      }
    }, 1000);
    
    setTimeout(() => {
      if (newActiveCall) {
        setActiveCall(prev => prev ? { ...prev, status: CallStatus.CONNECTED } : null);
      }
    }, 3000);
  };

  const handleEndCall = () => {
    if (activeCall) {
      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - activeCall.startTime.getTime()) / 1000);
      
      // Create call log entry
      const newCallLog: CallLog = {
        id: activeCall.id,
        phoneNumber: activeCall.phoneNumber,
        contactName: activeCall.contactName,
        type: CallType.VOICE,
        direction: CallDirection.OUTBOUND,
        status: CallStatus.ENDED,
        startTime: activeCall.startTime,
        endTime: endTime,
        duration: duration,
        outcome: duration > 10 ? CallOutcome.SUCCESSFUL : CallOutcome.NO_ANSWER,
        createdAt: activeCall.startTime,
        updatedAt: endTime,
      };
      
      setCallLogs(prev => [newCallLog, ...prev]);
      setActiveCall(null);
      setPhoneNumber('');
    }
  };

  const handleMute = () => {
    setActiveCall(prev => prev ? { ...prev, isMuted: !prev.isMuted } : null);
  };

  const handleSpeaker = () => {
    setActiveCall(prev => prev ? { ...prev, isSpeakerOn: !prev.isSpeakerOn } : null);
  };

  const handleKeypad = () => {
    Alert.alert('Keypad', 'Keypad functionality would be implemented here');
  };

  const handleHold = () => {
    Alert.alert('Hold', 'Call hold functionality would be implemented here');
  };

  const handleRecord = () => {
    setActiveCall(prev => prev ? { ...prev, isRecording: !prev.isRecording } : null);
  };

  const handleCallLogPress = (callLog: CallLog) => {
    Alert.alert(
      'Call Details',
      `View details for call with ${callLog.contactName || callLog.phoneNumber}`,
      [
        { text: 'Call Back', onPress: () => handleCallBack(callLog) },
        { text: 'Add Notes', onPress: () => handleAddNotes(callLog) },
        { text: 'Close', style: 'cancel' },
      ]
    );
  };

  const handleCallBack = (callLog: CallLog) => {
    setPhoneNumber(callLog.phoneNumber);
    handleCall();
  };

  const handleAddNotes = (callLog: CallLog) => {
    Alert.alert('Add Notes', `Add notes for call with ${callLog.contactName || callLog.phoneNumber}`);
    // Navigate to notes screen
  };

  const renderCallLog = ({ item }: { item: CallLog }) => (
    <CallLogCard
      callLog={item}
      onPress={handleCallLogPress}
      onCallback={handleCallBack}
      onAddNotes={handleAddNotes}
    />
  );

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{callLogs.length}</Text>
        <Text style={styles.statLabel}>Total Calls</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>
          {callLogs.filter(log => log.direction === CallDirection.OUTBOUND).length}
        </Text>
        <Text style={styles.statLabel}>Outbound</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>
          {callLogs.filter(log => log.outcome === CallOutcome.SUCCESSFUL).length}
        </Text>
        <Text style={styles.statLabel}>Successful</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#14B8A6" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dialer</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Phone Input */}
        <View style={styles.phoneInputContainer}>
          <Input
            label="Phone Number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
            style={styles.phoneInput}
          />
        </View>

        {/* Dialpad */}
        <View style={styles.dialpad}>
          {dialpadNumbers.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.dialpadRow}>
              {row.map((item) => (
                <MaterialPressable
                  key={item.number}
                  style={styles.dialpadButton}
                  onPress={() => handleNumberPress(item.number)}
                  rippleColor="rgba(20, 184, 166, 0.16)"
                >
                  <Text style={styles.dialpadNumber}>{item.number}</Text>
                  {item.letters && <Text style={styles.dialpadLetters}>{item.letters}</Text>}
                </MaterialPressable>
              ))}
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <MaterialPressable
            style={styles.backspaceButton}
            onPress={handleBackspace}
            rippleColor="rgba(20, 184, 166, 0.08)"
          >
            <Text style={styles.backspaceIcon}>⌫</Text>
          </MaterialPressable>
          
          <MaterialPressable
            style={styles.callButton}
            onPress={handleCall}
            rippleColor="rgba(255, 255, 255, 0.2)"
          >
            <Text style={styles.callIcon}>📞</Text>
            <Text style={styles.callText}>Call</Text>
          </MaterialPressable>
          
          <View style={styles.spacer} />
        </View>

        {/* Call Logs */}
        <View style={styles.callLogsSection}>
          <Text style={styles.sectionTitle}>Recent Calls</Text>
          {callLogs.length > 0 ? (
            <>
              {renderStats()}
              <FlatList
                data={callLogs.slice(0, 3)}
                renderItem={renderCallLog}
                keyExtractor={(item) => item.id}
                style={styles.callLogsList}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    tintColor="#14B8A6"
                    colors={['#14B8A6']}
                  />
                }
              />
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📞</Text>
              <Text style={styles.emptyText}>No recent calls</Text>
              <Text style={styles.emptySubtext}>Your call history will appear here</Text>
            </View>
          )}
        </View>
      </View>

      {/* Active Call Screen */}
      <ActiveCallScreen
        activeCall={activeCall}
        onEndCall={handleEndCall}
        onMute={handleMute}
        onSpeaker={handleSpeaker}
        onKeypad={handleKeypad}
        onHold={handleHold}
        onRecord={handleRecord}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#14B8A6',
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  phoneInputContainer: {
    marginBottom: 32,
    width: '84%',
    alignSelf: 'center',
  },
  phoneInput: {
    width: '100%',
  },
  dialpad: {
    marginBottom: 24,
    paddingHorizontal: 12,
  },
  dialpadRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 16,
  },
  dialpadButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  dialpadNumber: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1E293B',
    lineHeight: 32,
  },
  dialpadLetters: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginTop: -2,
    letterSpacing: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 12,
  },
  backspaceButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  backspaceIcon: {
    fontSize: 24,
    color: '#64748B',
  },
  callButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#14B8A6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 4,
  },
  callIcon: {
    fontSize: 28,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  callText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  spacer: {
    width: 64,
  },
  callLogsSection: {
    flex: 1,
    minHeight: 200,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#14B8A6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
  },
  callLogsList: {
    flexGrow: 0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    opacity: 0.3,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
});

export default Dialer;