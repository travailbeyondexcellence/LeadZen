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
import { Colors, Spacing, BorderRadius, Typography } from '../theme';
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
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border.base,
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.text.primary,
  },
  refreshButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary.base + '10',
  },
  refreshButtonText: {
    ...Typography.body,
    color: Colors.primary.base,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background.card,
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  modalTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  modalSubtitle: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  modalActions: {
    marginTop: Spacing.md,
  },
  modalButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background.primary,
    marginBottom: Spacing.sm,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: Colors.primary.base,
  },
  modalButtonText: {
    ...Typography.body,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  primaryButtonText: {
    color: Colors.background.card,
  },
  cancelButton: {
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
    alignItems: 'center',
  },
  cancelButtonText: {
    ...Typography.body,
    color: Colors.text.secondary,
  },
});