import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated,
  Modal,
} from 'react-native';
import OverlayService from '../services/OverlayService';
import { PhoneUtils } from '../utils/phoneUtils';

interface Props {
  visible: boolean;
  leadData: any;
  phoneNumber: string;
  callType: 'incoming' | 'outgoing' | 'missed';
  onMinimize: () => void;
  onClose: () => void;
}

const CompactCallView: React.FC<Props> = ({
  visible,
  leadData,
  phoneNumber,
  callType,
  onMinimize,
  onClose,
}) => {
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [quickNote, setQuickNote] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Start call duration timer
      const timer = setInterval(() => {
        setCallDuration(OverlayService.getCallDuration());
      }, 1000);

      return () => clearInterval(timer);
    } else {
      // Fade out animation
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, fadeAnim]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCallTypeIcon = () => {
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

  const getCallTypeText = () => {
    switch (callType) {
      case 'incoming':
        return 'Incoming Call';
      case 'outgoing':
        return 'Outgoing Call';
      case 'missed':
        return 'Missed Call';
      default:
        return 'Call';
    }
  };

  const handleQuickNote = async () => {
    if (!quickNote.trim()) {
      Alert.alert('Error', 'Please enter a note');
      return;
    }

    const success = await OverlayService.addQuickNote(quickNote.trim());
    
    if (success) {
      Alert.alert('Success', 'Note added successfully');
      setQuickNote('');
      setShowNoteModal(false);
    } else {
      Alert.alert('Error', 'Failed to add note');
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    const success = await OverlayService.updateLeadStatus(newStatus);
    
    if (success) {
      Alert.alert('Success', 'Status updated successfully');
      setShowStatusModal(false);
    } else {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const renderLeadInfo = () => {
    if (leadData) {
      return (
        <View style={styles.leadInfo}>
          <Text style={styles.leadName}>{leadData.name}</Text>
          <Text style={styles.leadCompany}>{leadData.company || 'No Company'}</Text>
          <Text style={styles.leadStatus}>Status: {leadData.status || 'Unknown'}</Text>
          <Text style={styles.leadContact}>
            Last Contact: {leadData.lastContactedAt 
              ? new Date(leadData.lastContactedAt).toLocaleDateString()
              : 'Never'
            }
          </Text>
        </View>
      );
    } else {
      return (
        <View style={styles.leadInfo}>
          <Text style={styles.leadName}>Unknown Caller</Text>
          <Text style={styles.leadCompany}>{PhoneUtils.formatPhoneNumber(phoneNumber)}</Text>
          <Text style={styles.unknownText}>Not in your contacts</Text>
          <TouchableOpacity 
            style={styles.addLeadButton}
            onPress={() => OverlayService.showAddLeadFlow()}
          >
            <Text style={styles.addLeadText}>+ Add to CRM</Text>
          </TouchableOpacity>
        </View>
      );
    }
  };

  const renderQuickActions = () => {
    if (!leadData) {
      return null; // Don't show actions for unknown callers during call
    }

    return (
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowNoteModal(true)}
        >
          <Text style={styles.actionButtonText}>📝 Note</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowStatusModal(true)}
        >
          <Text style={styles.actionButtonText}>📊 Status</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={onMinimize}
        >
          <Text style={styles.actionButtonText}>─ Min</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.overlay}>
        <View style={styles.header}>
          <Text style={styles.callIcon}>{getCallTypeIcon()}</Text>
          <Text style={styles.callTypeText}>{getCallTypeText()}</Text>
          <Text style={styles.duration}>{formatDuration(callDuration)}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {renderLeadInfo()}
        {renderQuickActions()}

        {/* Quick Note Modal */}
        <Modal
          visible={showNoteModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowNoteModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Quick Note</Text>
              <TextInput
                style={styles.noteInput}
                placeholder="Type your note here..."
                value={quickNote}
                onChangeText={setQuickNote}
                multiline
                numberOfLines={4}
                autoFocus
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowNoteModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleQuickNote}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Status Update Modal */}
        <Modal
          visible={showStatusModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowStatusModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Update Status</Text>
              <View style={styles.statusOptions}>
                {['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'].map(status => (
                  <TouchableOpacity
                    key={status}
                    style={styles.statusOption}
                    onPress={() => handleStatusUpdate(status)}
                  >
                    <Text style={styles.statusOptionText}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowStatusModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  overlay: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  callIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  callTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    flex: 1,
  },
  duration: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
    marginRight: 8,
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#999999',
  },
  leadInfo: {
    marginBottom: 12,
  },
  leadName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  leadCompany: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  leadStatus: {
    fontSize: 13,
    color: '#007AFF',
    marginBottom: 2,
  },
  leadContact: {
    fontSize: 12,
    color: '#999999',
  },
  unknownText: {
    fontSize: 13,
    color: '#FF6B35',
    marginBottom: 8,
  },
  addLeadButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  addLeadText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E5E9',
    flex: 1,
    marginHorizontal: 2,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#007AFF',
    textAlign: 'center',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
    textAlign: 'center',
  },
  noteInput: {
    borderWidth: 1,
    borderColor: '#E1E5E9',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E1E5E9',
  },
  cancelButtonText: {
    color: '#666666',
    textAlign: 'center',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  saveButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
  },
  statusOptions: {
    marginBottom: 16,
  },
  statusOption: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E1E5E9',
  },
  statusOptionText: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
  },
});

export default CompactCallView;