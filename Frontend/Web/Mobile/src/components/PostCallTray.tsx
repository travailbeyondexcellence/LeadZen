import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import AsyncStorageService from '../services/AsyncStorageService';
import OverlayService from '../services/OverlayService';
import { PhoneUtils } from '../utils/phoneUtils';
import { formatDate } from '../utils/formatting';

interface Props {
  visible: boolean;
  leadData: any;
  phoneNumber: string;
  callDuration: number;
  callType: 'incoming' | 'outgoing' | 'missed';
  onClose: () => void;
  onAddLead?: () => void;
}

const { height: screenHeight } = Dimensions.get('window');

const PostCallTray: React.FC<Props> = ({
  visible,
  leadData,
  phoneNumber,
  callDuration,
  callType,
  onClose,
  onAddLead,
}) => {
  const [activeTab, setActiveTab] = useState('info');
  const [callNotes, setCallNotes] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(leadData?.status || 'new');
  const [translateY] = useState(new Animated.Value(screenHeight));
  const [dragY] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      // Slide up animation
      Animated.spring(translateY, {
        toValue: screenHeight * 0.3, // Show 70% of screen
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      // Slide down animation
      Animated.timing(translateY, {
        toValue: screenHeight,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, translateY]);

  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const handleSaveAndClose = async () => {
    try {
      if (leadData && callNotes.trim()) {
        // Add call notes
        // Note: AsyncStorage doesn't have separate notes table
        // For now, we'll add notes to the lead's notes field
        const currentLead = await AsyncStorageService.getLeadById(leadData.id);
        const existingNotes = currentLead?.notes || '';
        const newNotes = existingNotes ? `${existingNotes}\n\nCall Note (${formatDate(new Date())}): ${callNotes.trim()}` : `Call Note (${formatDate(new Date())}): ${callNotes.trim()}`;
        
        await AsyncStorageService.updateLead(leadData.id, {
          notes: newNotes
        });
      }

      if (leadData && selectedStatus !== leadData.status) {
        // Update lead status
        await AsyncStorageService.updateLead(leadData.id, {
          status: selectedStatus
        });
      }

      Alert.alert('Success', 'Call information saved successfully', [
        { text: 'OK', onPress: onClose }
      ]);
    } catch (error) {
      console.error('Error saving call information:', error);
      Alert.alert('Error', 'Failed to save call information');
    }
  };

  const handleScheduleFollowUp = () => {
    // TODO: Implement follow-up scheduling
    Alert.alert('Follow-up', 'Follow-up scheduling will be implemented in a future update');
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: dragY } }],
    { useNativeDriver: false }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationY, velocityY } = event.nativeEvent;
      
      // If dragged down significantly or with high velocity, close
      if (translationY > 100 || velocityY > 1000) {
        onClose();
      } else {
        // Snap back to position
        Animated.spring(dragY, {
          toValue: 0,
          useNativeDriver: false,
        }).start();
      }
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return renderInfoTab();
      case 'notes':
        return renderNotesTab();
      case 'activity':
        return renderActivityTab();
      case 'labels':
        return renderLabelsTab();
      default:
        return renderInfoTab();
    }
  };

  const renderInfoTab = () => {
    if (leadData) {
      return (
        <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            <Text style={styles.infoText}>📧 {leadData.email || 'No email'}</Text>
            <Text style={styles.infoText}>📞 {PhoneUtils.formatPhoneNumber(phoneNumber)}</Text>
            <Text style={styles.infoText}>💼 {leadData.position || 'No position'}</Text>
            <Text style={styles.infoText}>🏢 {leadData.company || 'No company'}</Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Call Summary</Text>
            <Text style={styles.infoText}>📞 {callType.charAt(0).toUpperCase() + callType.slice(1)} call</Text>
            <Text style={styles.infoText}>⏱️ Duration: {formatCallDuration(callDuration)}</Text>
            <Text style={styles.infoText}>📅 {formatDate(new Date())}</Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Pipeline Status</Text>
            <View style={styles.statusContainer}>
              {['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'].map(status => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusOption,
                    selectedStatus === status && styles.selectedStatus
                  ]}
                  onPress={() => setSelectedStatus(status)}
                >
                  <Text style={[
                    styles.statusText,
                    selectedStatus === status && styles.selectedStatusText
                  ]}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      );
    } else {
      return (
        <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
          <View style={styles.unknownCallerSection}>
            <Text style={styles.unknownCallerTitle}>Unknown Caller</Text>
            <Text style={styles.unknownCallerPhone}>{PhoneUtils.formatPhoneNumber(phoneNumber)}</Text>
            <Text style={styles.unknownCallerText}>This number is not in your CRM</Text>
            
            <TouchableOpacity style={styles.addLeadButton} onPress={onAddLead}>
              <Text style={styles.addLeadButtonText}>+ Add to CRM</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      );
    }
  };

  const renderNotesTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Call Notes</Text>
      <TextInput
        style={styles.notesInput}
        placeholder="What did you discuss on this call?"
        value={callNotes}
        onChangeText={setCallNotes}
        multiline
        numberOfLines={6}
        textAlignVertical="top"
      />
      <Text style={styles.helpText}>
        Add notes about what was discussed, next steps, or important details from the call.
      </Text>
    </View>
  );

  const renderActivityTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Recent Activity</Text>
      <View style={styles.activityItem}>
        <Text style={styles.activityIcon}>📞</Text>
        <View style={styles.activityContent}>
          <Text style={styles.activityText}>
            {callType.charAt(0).toUpperCase() + callType.slice(1)} call - {formatCallDuration(callDuration)}
          </Text>
          <Text style={styles.activityTime}>Just now</Text>
        </View>
      </View>
      
      {leadData?.lastContactedAt && (
        <View style={styles.activityItem}>
          <Text style={styles.activityIcon}>📅</Text>
          <View style={styles.activityContent}>
            <Text style={styles.activityText}>Previous contact</Text>
            <Text style={styles.activityTime}>
              {formatDate(new Date(leadData.lastContactedAt))}
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );

  const renderLabelsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Tags & Labels</Text>
      <View style={styles.labelsContainer}>
        {['Hot Lead', 'Customer', 'VIP', 'Follow-up'].map(label => (
          <TouchableOpacity key={label} style={styles.labelChip}>
            <Text style={styles.labelText}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={styles.addLabelButton}>
        <Text style={styles.addLabelText}>+ Add Label</Text>
      </TouchableOpacity>
    </View>
  );

  if (!visible) return null;

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <Animated.View
        style={[
          styles.container,
          {
            transform: [
              { translateY },
              { translateY: dragY },
            ],
          },
        ]}
      >
        <View style={styles.dragHandle} />
        
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {leadData ? leadData.name : 'Unknown Caller'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {leadData ? leadData.company || PhoneUtils.formatPhoneNumber(phoneNumber) : PhoneUtils.formatPhoneNumber(phoneNumber)}
          </Text>
        </View>

        <View style={styles.tabs}>
          {['info', 'notes', 'activity', 'labels'].map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {renderTabContent()}

        <View style={styles.actions}>
          <TouchableOpacity style={styles.followUpButton} onPress={handleScheduleFollowUp}>
            <Text style={styles.followUpButtonText}>📅 Schedule Follow-up</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveAndClose}>
            <Text style={styles.saveButtonText}>💾 Save & Close</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: screenHeight * 0.7,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 16,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E1E5E9',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666666',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    color: '#666666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  infoSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E1E5E9',
  },
  selectedStatus: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  statusText: {
    fontSize: 12,
    color: '#666666',
  },
  selectedStatusText: {
    color: '#FFFFFF',
  },
  unknownCallerSection: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  unknownCallerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  unknownCallerPhone: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 8,
  },
  unknownCallerText: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 20,
  },
  addLeadButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addLeadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#E1E5E9',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 12,
    color: '#999999',
    fontStyle: 'italic',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  activityIcon: {
    fontSize: 18,
    marginRight: 12,
    marginTop: 2,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#999999',
  },
  labelsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  labelChip: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  labelText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  addLabelButton: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E5E9',
    alignSelf: 'flex-start',
  },
  addLabelText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  followUpButton: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E5E9',
  },
  followUpButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default PostCallTray;