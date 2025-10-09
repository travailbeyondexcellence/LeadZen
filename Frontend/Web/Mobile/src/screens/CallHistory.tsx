import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  Alert,
  RefreshControl,
  TextInput,
} from 'react-native';
import MaterialPressable from '../components/Pressable';
import CallLogCard from '../components/CallLogCard';
import {
  CallLog,
  CallDirection,
  CallStatus,
  CallOutcome,
  CallType,
} from '../types/Call';

const CallHistory: React.FC = () => {
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [filteredCallLogs, setFilteredCallLogs] = useState<CallLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | CallDirection>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Mock data - expanded call logs
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
      notes: 'Discussed enterprise package pricing. Very interested in Q4 implementation.',
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
      notes: 'Called back regarding proposal. Needs technical details and ROI analysis.',
      outcome: CallOutcome.CALLBACK_REQUESTED,
      followUpRequired: true,
      followUpDate: new Date('2024-10-09'),
      recordings: [{
        id: 'rec2',
        url: 'https://example.com/recording2.mp3',
        duration: 465,
        size: 1024000,
        createdAt: new Date('2024-10-08T11:15:00'),
      }],
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
      notes: 'Left voicemail about demo scheduling. Mentioned new features.',
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
      notes: 'Detailed partnership discussion. Very promising opportunity for enterprise clients.',
      outcome: CallOutcome.MEETING_SCHEDULED,
      followUpRequired: true,
      followUpDate: new Date('2024-10-12'),
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
    {
      id: '6',
      phoneNumber: '+1 (555) 111-2222',
      contactName: 'David Wilson',
      type: CallType.VOICE,
      direction: CallDirection.INBOUND,
      status: CallStatus.ENDED,
      startTime: new Date('2024-10-05T10:15:00'),
      endTime: new Date('2024-10-05T10:18:30'),
      duration: 210,
      notes: 'Quick check-in call. All systems running smoothly.',
      outcome: CallOutcome.SUCCESSFUL,
      createdAt: new Date('2024-10-05T10:15:00'),
      updatedAt: new Date('2024-10-05T10:18:30'),
    },
    {
      id: '7',
      phoneNumber: '+1 (555) 777-8888',
      type: CallType.VOICE,
      direction: CallDirection.OUTBOUND,
      status: CallStatus.ENDED,
      startTime: new Date('2024-10-04T15:45:00'),
      duration: 0,
      outcome: CallOutcome.BUSY,
      notes: 'Line was busy. Will try again later.',
      createdAt: new Date('2024-10-04T15:45:00'),
      updatedAt: new Date('2024-10-04T15:45:15'),
    },
    {
      id: '8',
      phoneNumber: '+1 (555) 999-0000',
      contactName: 'Lisa Anderson',
      type: CallType.VOICE,
      direction: CallDirection.OUTBOUND,
      status: CallStatus.ENDED,
      startTime: new Date('2024-10-03T09:00:00'),
      endTime: new Date('2024-10-03T09:12:45'),
      duration: 765,
      notes: 'Initial discovery call. Good fit for our solution.',
      outcome: CallOutcome.PROPOSAL_REQUESTED,
      followUpRequired: true,
      followUpDate: new Date('2024-10-11'),
      createdAt: new Date('2024-10-03T09:00:00'),
      updatedAt: new Date('2024-10-03T09:12:45'),
    },
  ];

  useEffect(() => {
    loadCallLogs();
  }, []);

  useEffect(() => {
    filterCallLogs();
  }, [callLogs, searchQuery, selectedFilter]);

  const loadCallLogs = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const sortedLogs = mockCallLogs.sort((a, b) => 
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      );
      setCallLogs(sortedLogs);
    } catch (error) {
      Alert.alert('Error', 'Failed to load call history');
    } finally {
      setLoading(false);
    }
  };

  const filterCallLogs = () => {
    let filtered = callLogs;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(log => 
        log.contactName?.toLowerCase().includes(query) ||
        log.phoneNumber.includes(query) ||
        log.notes?.toLowerCase().includes(query)
      );
    }

    // Filter by direction
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(log => log.direction === selectedFilter);
    }

    setFilteredCallLogs(filtered);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCallLogs();
    setRefreshing(false);
  };

  const handleCallLogPress = (callLog: CallLog) => {
    Alert.alert(
      'Call Details',
      `View details for call with ${callLog.contactName || callLog.phoneNumber}`,
      [
        { text: 'Call Back', onPress: () => handleCallBack(callLog) },
        { text: 'Add Notes', onPress: () => handleAddNotes(callLog) },
        { text: 'View Recording', onPress: () => handleViewRecording(callLog), style: 'default' },
        { text: 'Close', style: 'cancel' },
      ]
    );
  };

  const handleCallBack = (callLog: CallLog) => {
    Alert.alert('Call Back', `Calling ${callLog.contactName || callLog.phoneNumber}...`);
    // Navigate to dialer with pre-filled number
  };

  const handleAddNotes = (callLog: CallLog) => {
    Alert.alert('Add Notes', `Add notes for call with ${callLog.contactName || callLog.phoneNumber}`);
    // Navigate to notes screen
  };

  const handleViewRecording = (callLog: CallLog) => {
    if (callLog.recordings && callLog.recordings.length > 0) {
      Alert.alert('Recording', `Playing recording for call with ${callLog.contactName || callLog.phoneNumber}`);
      // Play recording
    } else {
      Alert.alert('No Recording', 'This call was not recorded.');
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Call History</Text>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search calls..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
    </View>
  );

  const renderFilters = () => (
    <View style={styles.filterContainer}>
      <FlatList
        data={[
          { key: 'all', label: 'All Calls' },
          { key: CallDirection.OUTBOUND, label: 'Outbound' },
          { key: CallDirection.INBOUND, label: 'Inbound' },
          { key: CallDirection.MISSED, label: 'Missed' },
        ]}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <MaterialPressable
            style={[
              styles.filterChip,
              selectedFilter === item.key && styles.filterChipActive,
            ]}
            onPress={() => setSelectedFilter(item.key as 'all' | CallDirection)}
            rippleColor="rgba(20, 184, 166, 0.2)"
          >
            <Text
              style={[
                styles.filterChipText,
                selectedFilter === item.key && styles.filterChipTextActive,
              ]}
            >
              {item.label}
            </Text>
          </MaterialPressable>
        )}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.filterList}
      />
    </View>
  );

  const renderStats = () => {
    const totalCalls = filteredCallLogs.length;
    const successfulCalls = filteredCallLogs.filter(log => 
      log.outcome === CallOutcome.SUCCESSFUL || 
      log.outcome === CallOutcome.MEETING_SCHEDULED ||
      log.outcome === CallOutcome.PROPOSAL_REQUESTED
    ).length;
    const totalDuration = filteredCallLogs.reduce((sum, log) => sum + log.duration, 0);
    const avgDuration = totalCalls > 0 ? Math.round(totalDuration / totalCalls) : 0;

    return (
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{totalCalls}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{successfulCalls}</Text>
          <Text style={styles.statLabel}>Successful</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{Math.floor(avgDuration / 60)}m</Text>
          <Text style={styles.statLabel}>Avg Duration</Text>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📞</Text>
      <Text style={styles.emptyTitle}>
        {searchQuery || selectedFilter !== 'all' ? 'No calls found' : 'No call history'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery || selectedFilter !== 'all' 
          ? 'Try adjusting your search or filters'
          : 'Your call history will appear here'
        }
      </Text>
    </View>
  );

  const renderCallLog = ({ item }: { item: CallLog }) => (
    <CallLogCard
      callLog={item}
      onPress={handleCallLogPress}
      onCallback={handleCallBack}
      onAddNotes={handleAddNotes}
    />
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#14B8A6" />
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading call history...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#14B8A6" />
      {renderHeader()}
      {renderFilters()}
      {filteredCallLogs.length > 0 && renderStats()}
      
      <FlatList
        data={filteredCallLogs}
        renderItem={renderCallLog}
        keyExtractor={(item) => item.id}
        contentContainerStyle={filteredCallLogs.length === 0 ? styles.emptyListContainer : styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#14B8A6"
            colors={['#14B8A6']}
          />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
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
    paddingTop: 16,
    paddingBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchIcon: {
    fontSize: 16,
    opacity: 0.8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    padding: 0,
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  filterList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#14B8A6',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#14B8A6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyListContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default CallHistory;