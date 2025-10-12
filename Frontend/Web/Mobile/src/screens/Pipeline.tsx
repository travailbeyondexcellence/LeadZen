import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Modal,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { PipelineBoardV2 } from '../components/PipelineBoardV2';
import { Lead } from '../types/Lead';
import { Colors, Spacing, BorderRadius } from '../theme';
import { useNavigation } from '@react-navigation/native';
import { useSidebarContext } from '../context/SidebarContext';
import { useTabNavigation } from '../context/TabNavigationContext';
import PipelineSkeleton from '../components/LoadingStates/PipelineSkeleton';
import ErrorBoundary from '../components/ErrorBoundary';

export const Pipeline = () => {
  const navigation = useNavigation();
  const { toggleSidebar } = useSidebarContext();
  const { navigateToTab } = useTabNavigation();
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

  // Action handlers for lead cards
  const handleCall = useCallback((lead: Lead) => {
    if (lead.phone) {
      Linking.openURL(`tel:${lead.phone.replace(/[^0-9+]/g, '')}`);
    } else {
      Alert.alert('No Phone Number', 'This lead does not have a phone number.');
    }
  }, []);

  const handleEmail = useCallback((lead: Lead) => {
    if (lead.email) {
      Linking.openURL(`mailto:${lead.email}`);
    } else {
      Alert.alert('No Email', 'This lead does not have an email address.');
    }
  }, []);

  const handleWhatsApp = useCallback((lead: Lead) => {
    if (lead.phone) {
      const cleanPhone = lead.phone.replace(/[^0-9+]/g, '');
      Linking.openURL(`whatsapp://send?phone=${cleanPhone}`);
    } else {
      Alert.alert('No Phone Number', 'This lead does not have a phone number for WhatsApp.');
    }
  }, []);

  const handleNotes = useCallback((lead: Lead) => {
    navigation.navigate('LeadForm' as never, { 
      leadId: lead.id 
    } as never);
  }, [navigation]);

  const handleLeadAction = (action: string) => {
    setShowLeadModal(false);
    
    switch (action) {
      case 'details':
        if (selectedLead) {
          navigation.navigate('LeadDetail' as never, { 
            leadId: selectedLead.id 
          } as never);
        }
        break;
      case 'call':
        // Navigate to dialer with lead's phone
        navigateToTab('Dialer');
        break;
      case 'edit':
        if (selectedLead) {
          navigation.navigate('LeadForm' as never, { 
            leadId: selectedLead.id 
          } as never);
        }
        break;
      default:
        break;
    }
  };

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleSidebar} style={styles.menuButton}>
          <View style={styles.hamburgerMenu}>
            <View style={styles.hamburgerLineTop} />
            <View style={styles.hamburgerLineMiddle} />
            <View style={styles.hamburgerLineBottom} />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pipeline Board</Text>
        <TouchableOpacity
          style={styles.refreshIcon}
          onPress={handleRefresh}
        >
          <Icon name="refresh" size={24} color={Colors.text.inverse} />
        </TouchableOpacity>
      </View>

      {/* Pipeline Board */}
      <PipelineBoardV2
        onLeadPress={handleLeadPress}
        refreshTrigger={refreshTrigger}
        onCall={handleCall}
        onEmail={handleEmail}
        onWhatsApp={handleWhatsApp}
        onNotes={handleNotes}
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
    </ErrorBoundary>
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
    backgroundColor: Colors.primary.base,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border.base,
  },
  menuButton: {
    padding: 8,
  },
  hamburgerMenu: {
    width: 24,
    height: 20,
    justifyContent: 'space-between',
  },
  hamburgerLineTop: {
    width: 18,
    height: 3,
    backgroundColor: Colors.text.inverse,
    borderRadius: 1.5,
  },
  hamburgerLineMiddle: {
    width: 24,
    height: 3,
    backgroundColor: Colors.text.inverse,
    borderRadius: 1.5,
  },
  hamburgerLineBottom: {
    width: 12,
    height: 3,
    backgroundColor: Colors.text.inverse,
    borderRadius: 1.5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700' as any,
    color: Colors.text.inverse,
  },
  refreshIcon: {
    padding: Spacing.sm,
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
    fontSize: 20,
    fontWeight: '700' as any,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  modalSubtitle: {
    fontSize: 14,
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
    fontSize: 14,
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
    fontSize: 14,
    color: Colors.text.secondary,
  },
});