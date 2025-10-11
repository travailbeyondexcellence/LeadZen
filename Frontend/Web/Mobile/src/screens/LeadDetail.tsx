import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Colors, Spacing, BorderRadius, Shadows } from '../theme';
import { Lead, LeadStatus, LeadPriority } from '../types/Lead';
import AsyncStorageService from '../services/AsyncStorageService';
import { formatPhoneNumber, formatCurrency } from '../utils/validation';

type RouteParams = {
  LeadDetail: {
    leadId: string;
  };
};

const LeadDetail: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'LeadDetail'>>();
  const { leadId } = route.params;
  
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'notes' | 'activity' | 'labels'>('info');
  
  useEffect(() => {
    loadLead();
  }, [leadId]);
  
  const loadLead = async () => {
    try {
      setLoading(true);
      const leadData = await AsyncStorageService.getLeadById(leadId);
      setLead(leadData);
    } catch (error) {
      console.error('Failed to load lead:', error);
      Alert.alert('Error', 'Failed to load lead details');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCall = () => {
    if (lead?.phone) {
      const phoneUrl = `tel:${lead.phone}`;
      Linking.canOpenURL(phoneUrl)
        .then(supported => {
          if (supported) {
            Linking.openURL(phoneUrl);
          } else {
            Alert.alert('Error', 'Unable to make phone call');
          }
        })
        .catch(err => console.error('Error making call:', err));
    }
  };
  
  const handleEmail = () => {
    if (lead?.email) {
      const emailUrl = `mailto:${lead.email}`;
      Linking.openURL(emailUrl);
    }
  };
  
  const handleEdit = () => {
    navigation.navigate('LeadForm' as never, { leadId: lead?.id } as never);
  };
  
  const handleDelete = () => {
    Alert.alert(
      'Delete Lead',
      `Are you sure you want to delete ${lead?.name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorageService.deleteLead(leadId);
              Alert.alert('Success', 'Lead deleted successfully');
              navigation.goBack();
            } catch (error) {
              console.error('Failed to delete lead:', error);
              Alert.alert('Error', 'Failed to delete lead');
            }
          },
        },
      ]
    );
  };
  
  const renderInfoTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>📞</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Phone</Text>
            <TouchableOpacity onPress={handleCall}>
              <Text style={[styles.infoValue, styles.linkText]}>
                {lead?.phone ? formatPhoneNumber(lead.phone) : 'Not provided'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>📧</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Email</Text>
            <TouchableOpacity onPress={handleEmail}>
              <Text style={[styles.infoValue, lead?.email && styles.linkText]}>
                {lead?.email || 'Not provided'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>🏢</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Company</Text>
            <Text style={styles.infoValue}>
              {lead?.company || 'Not provided'}
            </Text>
          </View>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>💼</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Position</Text>
            <Text style={styles.infoValue}>
              {lead?.position || 'Not provided'}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Lead Details</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>🎯</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Pipeline Stage</Text>
            <View style={[styles.badge, { backgroundColor: getStatusColor(lead?.status) }]}>
              <Text style={styles.badgeText}>{getStatusLabel(lead?.status)}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>⚡</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Priority</Text>
            <View style={[styles.badge, { backgroundColor: getPriorityColor(lead?.priority) }]}>
              <Text style={styles.badgeText}>{lead?.priority || 'Medium'}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>💰</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Value</Text>
            <Text style={styles.infoValue}>
              {lead?.value ? formatCurrency(lead.value) : 'Not set'}
            </Text>
          </View>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>📅</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Created</Text>
            <Text style={styles.infoValue}>
              {lead?.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'Unknown'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
  
  const renderNotesTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.notesContainer}>
        <Text style={styles.notesText}>
          {lead?.notes || 'No notes available for this lead.'}
        </Text>
      </View>
      
      <TouchableOpacity style={styles.addNoteButton} onPress={handleEdit}>
        <Text style={styles.addNoteIcon}>📝</Text>
        <Text style={styles.addNoteText}>Add Note</Text>
      </TouchableOpacity>
    </View>
  );
  
  const renderActivityTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>📊</Text>
        <Text style={styles.emptyTitle}>No Activity Yet</Text>
        <Text style={styles.emptyText}>
          Call history and activities will appear here
        </Text>
      </View>
    </View>
  );
  
  const renderLabelsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.labelsContainer}>
        {lead?.tags && lead.tags.length > 0 ? (
          <View style={styles.labelsList}>
            {lead.tags.map((tag, index) => (
              <View key={index} style={styles.label}>
                <Text style={styles.labelText}>{tag}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🏷️</Text>
            <Text style={styles.emptyTitle}>No Labels</Text>
            <Text style={styles.emptyText}>
              Add labels to categorize this lead
            </Text>
          </View>
        )}
      </View>
      
      <TouchableOpacity style={styles.addLabelButton} onPress={handleEdit}>
        <Text style={styles.addLabelIcon}>🏷️</Text>
        <Text style={styles.addLabelText}>Manage Labels</Text>
      </TouchableOpacity>
    </View>
  );
  
  const getStatusColor = (status?: LeadStatus): string => {
    switch (status) {
      case LeadStatus.NEW: return Colors.primary.light;
      case LeadStatus.CONTACTED: return Colors.secondary.base;
      case LeadStatus.QUALIFIED: return Colors.accent.purple;
      case LeadStatus.PROPOSAL: return Colors.accent.amber;
      case LeadStatus.CLOSED_WON: return Colors.semantic.success;
      case LeadStatus.CLOSED_LOST: return Colors.semantic.error;
      default: return Colors.text.tertiary;
    }
  };
  
  const getStatusLabel = (status?: LeadStatus): string => {
    switch (status) {
      case LeadStatus.NEW: return 'New Lead';
      case LeadStatus.CONTACTED: return 'Contacted';
      case LeadStatus.QUALIFIED: return 'Qualified';
      case LeadStatus.PROPOSAL: return 'Proposal';
      case LeadStatus.CLOSED_WON: return 'Closed Won';
      case LeadStatus.CLOSED_LOST: return 'Closed Lost';
      default: return 'Unknown';
    }
  };
  
  const getPriorityColor = (priority?: LeadPriority): string => {
    switch (priority) {
      case LeadPriority.HIGH: return Colors.semantic.error;
      case LeadPriority.MEDIUM: return Colors.semantic.warning;
      case LeadPriority.LOW: return Colors.semantic.success;
      default: return Colors.text.tertiary;
    }
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary.base} />
        <Text style={styles.loadingText}>Loading lead details...</Text>
      </View>
    );
  }
  
  if (!lead) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Lead not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.leadName}>{lead.name}</Text>
          {lead.company && <Text style={styles.leadCompany}>{lead.company}</Text>}
        </View>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <Text style={styles.deleteIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>
      
      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {lead.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </Text>
        </View>
        <Text style={styles.profileName}>{lead.name}</Text>
        {lead.position && <Text style={styles.profilePosition}>{lead.position}</Text>}
        {lead.company && <Text style={styles.profileCompany}>{lead.company}</Text>}
      </View>
      
      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
          <Text style={styles.actionIcon}>📞</Text>
          <Text style={styles.actionText}>Call</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleEmail}>
          <Text style={styles.actionIcon}>📧</Text>
          <Text style={styles.actionText}>Email</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleEdit}>
          <Text style={styles.actionIcon}>✏️</Text>
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
      </View>
      
      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'info' && styles.activeTab]}
          onPress={() => setActiveTab('info')}
        >
          <Text style={[styles.tabText, activeTab === 'info' && styles.activeTabText]}>
            Info
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'notes' && styles.activeTab]}
          onPress={() => setActiveTab('notes')}
        >
          <Text style={[styles.tabText, activeTab === 'notes' && styles.activeTabText]}>
            Notes
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'activity' && styles.activeTab]}
          onPress={() => setActiveTab('activity')}
        >
          <Text style={[styles.tabText, activeTab === 'activity' && styles.activeTabText]}>
            Activity
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'labels' && styles.activeTab]}
          onPress={() => setActiveTab('labels')}
        >
          <Text style={[styles.tabText, activeTab === 'labels' && styles.activeTabText]}>
            Labels
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Tab Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'info' && renderInfoTab()}
        {activeTab === 'notes' && renderNotesTab()}
        {activeTab === 'activity' && renderActivityTab()}
        {activeTab === 'labels' && renderLabelsTab()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: 14,
    color: Colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
  },
  errorText: {
    fontSize: 16,
    color: Colors.text.primary,
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.background.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  backButton: {
    padding: Spacing.sm,
  },
  backIcon: {
    fontSize: 24,
    color: Colors.text.primary,
  },
  headerContent: {
    flex: 1,
    marginHorizontal: Spacing.md,
  },
  leadName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  leadCompany: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  deleteButton: {
    padding: Spacing.sm,
  },
  deleteIcon: {
    fontSize: 20,
  },
  profileSection: {
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.background.card,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary.base + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary.base,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  profilePosition: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  profileCompany: {
    fontSize: 14,
    color: Colors.text.tertiary,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: Spacing.lg,
    backgroundColor: Colors.background.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  actionButton: {
    alignItems: 'center',
    padding: Spacing.sm,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  actionText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.background.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary.base,
  },
  tabText: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: Colors.primary.base,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: Spacing.lg,
  },
  infoSection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    alignItems: 'flex-start',
  },
  infoIcon: {
    fontSize: 20,
    marginRight: Spacing.md,
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.text.tertiary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: Colors.text.primary,
  },
  linkText: {
    color: Colors.primary.base,
    textDecorationLine: 'underline',
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    color: Colors.white,
    fontWeight: '600',
  },
  notesContainer: {
    backgroundColor: Colors.background.secondary,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    minHeight: 100,
  },
  notesText: {
    fontSize: 14,
    color: Colors.text.primary,
    lineHeight: 20,
  },
  addNoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    marginTop: Spacing.lg,
    backgroundColor: Colors.primary.base,
    borderRadius: BorderRadius.md,
  },
  addNoteIcon: {
    fontSize: 18,
    marginRight: Spacing.sm,
  },
  addNoteText: {
    fontSize: 14,
    color: Colors.white,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl * 2,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  labelsContainer: {
    minHeight: 100,
  },
  labelsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Spacing.sm,
  },
  label: {
    backgroundColor: Colors.primary.base + '20',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  labelText: {
    fontSize: 13,
    color: Colors.primary.base,
    fontWeight: '500',
  },
  addLabelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    marginTop: Spacing.lg,
    backgroundColor: Colors.secondary.base,
    borderRadius: BorderRadius.md,
  },
  addLabelIcon: {
    fontSize: 18,
    marginRight: Spacing.sm,
  },
  addLabelText: {
    fontSize: 14,
    color: Colors.white,
    fontWeight: '600',
  },
});

export default LeadDetail;