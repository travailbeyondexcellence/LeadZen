import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import DialerService from '../services/DialerService';
import { PhoneUtils } from '../utils/phoneUtils';
import NoCallsEmpty from './EmptyStates/NoCallsEmpty';
import ShimmerPlaceholder from './LoadingStates/ShimmerPlaceholder';

interface CallLog {
  id: number;
  phone_number: string;
  lead_name?: string;
  company?: string;
  call_type: 'incoming' | 'outgoing' | 'missed';
  started_at: Date;
  duration: number;
}

interface Props {
  onCallPress: (phoneNumber: string) => void;
  refreshTrigger?: number; // Can be used to trigger refresh from parent
}

const RecentCalls: React.FC<Props> = ({ onCallPress, refreshTrigger }) => {
  const [callHistory, setCallHistory] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRecentCalls();
  }, []);

  useEffect(() => {
    if (refreshTrigger !== undefined) {
      loadRecentCalls();
    }
  }, [refreshTrigger]);

  const loadRecentCalls = async () => {
    try {
      setLoading(true);
      const calls = await DialerService.getRecentCalls(20);
      setCallHistory(calls);
    } catch (error) {
      console.error('Error loading recent calls:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRecentCalls();
    setRefreshing(false);
  };

  const handleCallPress = (call: CallLog) => {
    console.log('📞 Recent call pressed:', call.lead_name || 'Unknown', call.phone_number);
    onCallPress(call.phone_number);
  };

  const getCallTypeIcon = (callType: string) => {
    switch (callType) {
      case 'incoming':
        return '📞';
      case 'outgoing':
        return '📱';
      case 'missed':
        return '📵';
      default:
        return '📞';
    }
  };

  const getCallTypeColor = (callType: string) => {
    switch (callType) {
      case 'incoming':
        return '#34C759';
      case 'outgoing':
        return '#007AFF';
      case 'missed':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

  const formatCallTime = (timestamp: Date) => {
    return DialerService.getRelativeTime(timestamp);
  };

  const formatDuration = (durationSeconds: number) => {
    return DialerService.formatCallDuration(durationSeconds);
  };

  const renderCallItem = ({ item: call }: { item: CallLog }) => (
    <TouchableOpacity
      style={styles.callItem}
      onPress={() => handleCallPress(call)}
      activeOpacity={0.7}
    >
      <View style={styles.callTypeIndicator}>
        <View style={[styles.callTypeIcon, { backgroundColor: getCallTypeColor(call.call_type) }]}>
          <Text style={styles.callTypeEmoji}>
            {getCallTypeIcon(call.call_type)}
          </Text>
        </View>
      </View>

      <View style={styles.callInfo}>
        <Text style={styles.contactName} numberOfLines={1}>
          {call.lead_name || 'Unknown'}
        </Text>
        
        {call.company && (
          <Text style={styles.companyName} numberOfLines={1}>
            {call.company}
          </Text>
        )}
        
        <Text style={styles.phoneNumber}>
          {PhoneUtils.formatPhoneNumber(call.phone_number)}
        </Text>
        
        <View style={styles.callDetails}>
          <Text style={styles.callTime}>
            {formatCallTime(call.started_at)}
          </Text>
          {call.duration > 0 && (
            <>
              <Text style={styles.separator}>•</Text>
              <Text style={styles.duration}>
                {formatDuration(call.duration)}
              </Text>
            </>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={styles.callButton}
        onPress={() => handleCallPress(call)}
      >
        <Text style={styles.callButtonText}>📞</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderLoadingSkeleton = () => (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((item) => (
        <View key={item} style={styles.callItem}>
          <View style={styles.callIconContainer}>
            <ShimmerPlaceholder width={40} height={40} borderRadius={20} />
          </View>
          <View style={styles.callInfo}>
            <ShimmerPlaceholder width="70%" height={16} borderRadius={8} style={{ marginBottom: 4 }} />
            <ShimmerPlaceholder width="50%" height={12} borderRadius={6} style={{ marginBottom: 4 }} />
            <ShimmerPlaceholder width="80%" height={12} borderRadius={6} style={{ marginBottom: 4 }} />
            <ShimmerPlaceholder width="40%" height={10} borderRadius={5} />
          </View>
          <View style={styles.callButton}>
            <ShimmerPlaceholder width={36} height={36} borderRadius={18} />
          </View>
        </View>
      ))}
    </View>
  );

  const renderEmptyState = () => <NoCallsEmpty />;

  if (loading && callHistory.length === 0) {
    return renderLoadingSkeleton();
  }

  const renderOldEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📞</Text>
      <Text style={styles.emptyText}>No recent calls</Text>
      <Text style={styles.emptySubtext}>
        Your call history will appear here
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerText}>Recent Calls</Text>
      <Text style={styles.headerSubtext}>
        {callHistory.length} call{callHistory.length !== 1 ? 's' : ''}
      </Text>
    </View>
  );


  return (
    <View style={styles.container}>
      {renderHeader()}
      
      {callHistory.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={callHistory}
          renderItem={renderCallItem}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#007AFF"
              colors={['#007AFF']}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E5E9',
    backgroundColor: '#F8F9FA',
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  headerSubtext: {
    fontSize: 14,
    color: '#666666',
  },
  listContainer: {
    paddingVertical: 8,
  },
  callItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F4',
  },
  callTypeIndicator: {
    marginRight: 16,
  },
  callTypeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callTypeEmoji: {
    fontSize: 18,
  },
  callInfo: {
    flex: 1,
    marginRight: 12,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  companyName: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  phoneNumber: {
    fontSize: 14,
    color: '#007AFF',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  callDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  callTime: {
    fontSize: 12,
    color: '#999999',
  },
  separator: {
    fontSize: 12,
    color: '#999999',
    marginHorizontal: 6,
  },
  duration: {
    fontSize: 12,
    color: '#999999',
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  callButtonText: {
    fontSize: 18,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 16,
  },
});

export default RecentCalls;