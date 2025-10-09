import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';
import { Colors, Typography, Spacing } from '../theme';
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
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['*', '0', '#'],
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
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      
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
              {row.map((number) => (
                <TouchableOpacity
                  key={number}
                  style={styles.dialpadButton}
                  onPress={() => handleNumberPress(number)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dialpadText}>{number}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title="⌫"
            variant="outline"
            onPress={handleBackspace}
            style={styles.backspaceButton}
          />
          <Button
            title="📞 Call"
            onPress={handleCall}
            style={styles.callButton}
          />
        </View>

        {/* Call Logs */}
        <View style={styles.callLogsSection}>
          <Text style={styles.sectionTitle}>Recent Calls</Text>
          {callLogs.length > 0 ? (
            <FlatList
              data={callLogs}
              renderItem={renderCallLog}
              keyExtractor={(item) => item.id}
              style={styles.callLogsList}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <Text style={styles.emptyText}>No recent calls</Text>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.base,
  },
  phoneInputContainer: {
    marginBottom: Spacing.base,
  },
  dialpad: {
    marginBottom: Spacing.base,
  },
  dialpadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  dialpadButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  dialpadText: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.onSurface,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  backspaceButton: {
    flex: 0.3,
  },
  callButton: {
    flex: 0.65,
  },
  callLogsSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.onSurface,
    marginBottom: Spacing.sm,
  },
  callLogsList: {
    flex: 1,
  },
  callLogItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.base,
    marginBottom: Spacing.xs,
    borderRadius: 8,
  },
  callLogInfo: {
    flex: 1,
  },
  callLogNumber: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.onSurface,
  },
  callLogTime: {
    fontSize: Typography.fontSize.sm,
    color: Colors.gray600,
  },
  callLogDuration: {
    fontSize: Typography.fontSize.sm,
    color: Colors.gray600,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.gray600,
    fontSize: Typography.fontSize.base,
    marginTop: Spacing.lg,
  },
});

export default Dialer;