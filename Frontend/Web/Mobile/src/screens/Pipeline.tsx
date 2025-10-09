import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { PipelineBoard } from '../components/PipelineBoard';
import { Lead } from '../types/Lead';
import { Colors, Spacing, Typography } from '../theme';
import { useNavigation } from '@react-navigation/native';

export const Pipeline = () => {
  const navigation = useNavigation();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleLeadPress = useCallback((lead: Lead) => {
    setSelectedLead(lead);
    setShowLeadModal(true);
  }, []);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleLeadAction = (action: string) => {
    setShowLeadModal(false);
    
    switch (action) {
      case 'details':
        // Navigate to lead details (to be implemented in Task 4)
        Alert.alert('Lead Details', 'Lead detail screen will be implemented in Task 4');
        break;
      case 'call':
        // Navigate to dialer with lead's phone
        navigation.navigate('Dialer' as never, { 
          phoneNumber: selectedLead?.phone 
        } as never);
        break;
      case 'edit':
        // Navigate to edit screen (to be implemented in Task 4)
        Alert.alert('Edit Lead', 'Edit functionality will be implemented in Task 4');
        break;
      default:
        break;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pipeline Board</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
        >
          <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
        </TouchableOpacity>
      </View>

      {/* Pipeline Board */}
      <PipelineBoard
        onLeadPress={handleLeadPress}
        refreshTrigger={refreshTrigger}
      />

      {/* Lead Action Modal */}
      <Modal
        visible={showLeadModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLeadModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowLeadModal(false)}
        >
          <View style={styles.modalContent}>
            {selectedLead && (
              <>
                <Text style={styles.modalTitle}>{selectedLead.name}</Text>
                {selectedLead.company && (
                  <Text style={styles.modalSubtitle}>{selectedLead.company}</Text>
                )}
                
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => handleLeadAction('details')}
                  >
                    <Text style={styles.modalButtonText}>👤 View Details</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.modalButton, styles.primaryButton]}
                    onPress={() => handleLeadAction('call')}
                  >
                    <Text style={[styles.modalButtonText, styles.primaryButtonText]}>
                      📞 Call Now
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => handleLeadAction('edit')}
                  >
                    <Text style={styles.modalButtonText}>✏️ Edit Lead</Text>
                  </TouchableOpacity>
                </View>
                
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowLeadModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.medium,
    paddingVertical: Spacing.small,
    backgroundColor: Colors.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.text,
  },
  refreshButton: {
    paddingHorizontal: Spacing.medium,
    paddingVertical: Spacing.small,
    borderRadius: Spacing.borderRadius.medium,
    backgroundColor: Colors.primary + '10',
  },
  refreshButtonText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: Spacing.borderRadius.large,
    borderTopRightRadius: Spacing.borderRadius.large,
    padding: Spacing.large,
    paddingBottom: Spacing.xl,
  },
  modalTitle: {
    ...Typography.h3,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  modalSubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.large,
  },
  modalActions: {
    marginTop: Spacing.medium,
  },
  modalButton: {
    paddingVertical: Spacing.medium,
    paddingHorizontal: Spacing.large,
    borderRadius: Spacing.borderRadius.medium,
    backgroundColor: Colors.background,
    marginBottom: Spacing.small,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  modalButtonText: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '500',
  },
  primaryButtonText: {
    color: Colors.card,
  },
  cancelButton: {
    paddingVertical: Spacing.medium,
    marginTop: Spacing.small,
    alignItems: 'center',
  },
  cancelButtonText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
});