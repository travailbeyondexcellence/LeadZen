import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  FlatList,
} from 'react-native';
import MaterialPressable from '../components/Pressable';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme';
import Input from '../components/Input';
import Button from '../components/Button';

interface CallLog {
  id: string;
  number: string;
  timestamp: Date;
  duration: string;
}

const Dialer: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);

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

    const newLog: CallLog = {
      id: Date.now().toString(),
      number: phoneNumber,
      timestamp: new Date(),
      duration: '0:00',
    };

    setCallLogs(prev => [newLog, ...prev]);
    Alert.alert('Call Initiated', `Calling ${phoneNumber}...`);
    setPhoneNumber('');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderCallLog = ({ item }: { item: CallLog }) => (
    <View style={styles.callLogItem}>
      <View style={styles.callLogInfo}>
        <Text style={styles.callLogNumber}>{item.number}</Text>
        <Text style={styles.callLogTime}>{formatTime(item.timestamp)}</Text>
      </View>
      <Text style={styles.callLogDuration}>{item.duration}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary.base} />
      
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
                  rippleColor={Colors.stateLayer.pressed}
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
            rippleColor={Colors.stateLayer.hover}
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
            <FlatList
              data={callLogs.slice(0, 4)}
              renderItem={renderCallLog}
              keyExtractor={(item) => item.id}
              style={styles.callLogsList}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📞</Text>
              <Text style={styles.emptyText}>No recent calls</Text>
              <Text style={styles.emptySubtext}>Your call history will appear here</Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    backgroundColor: Colors.primary.base,
    paddingHorizontal: Spacing.screen,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    ...Shadows.primary,
  },
  headerTitle: {
    ...Typography.h3,
    color: Colors.text.inverse,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  phoneInputContainer: {
    marginBottom: 32,
    alignItems: 'center',
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
  callLogsList: {
    flexGrow: 0,
  },
  callLogItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 8,
    borderRadius: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  callLogInfo: {
    flex: 1,
  },
  callLogNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  callLogTime: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  callLogDuration: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
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