import React, { useState, useEffect, useLayoutEffect } from 'react';
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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import NotesList from '../components/notes/NotesList';
import NotesModal from '../components/notes/NotesModal';
import NotesService from '../services/NotesService';
import { Note } from '../types/notes';
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
  const [activeTab, setActiveTab] = useState<'info' | 'notes' | 'activity' | 'reminders'>('info');
  const [notes, setNotes] = useState<Note[]>([]);
  const [notesModalVisible, setNotesModalVisible] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | undefined>(undefined);
  
  useEffect(() => {
    loadLead();
    if (leadId) {
      loadNotes();
    }
  }, [leadId]);
  
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row', marginRight: 10 }}>
          <TouchableOpacity onPress={handleEdit} style={{ marginRight: 15 }}>
            <Icon name="account-edit" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete}>
            <Icon name="delete" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, handleEdit, handleDelete]);
  
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
  
  const loadNotes = async () => {
    try {
      const notesData = await NotesService.getNotesForLead(leadId);
      setNotes(notesData);
    } catch (error) {
      console.error('Failed to load notes:', error);
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

  const handleWhatsApp = () => {
    if (lead?.phone) {
      const cleanPhone = lead.phone.replace(/[^0-9+]/g, '');
      const whatsappUrl = `whatsapp://send?phone=${cleanPhone}`;
      Linking.openURL(whatsappUrl);
    } else {
      Alert.alert('No Phone Number', 'This lead does not have a phone number for WhatsApp.');
    }
  };

  const handleSMS = () => {
    if (lead?.phone) {
      const smsUrl = `sms:${lead.phone}`;
      Linking.openURL(smsUrl);
    } else {
      Alert.alert('No Phone Number', 'This lead does not have a phone number for SMS.');
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
  
  const handleAddNote = () => {
    setEditingNote(undefined);
    setNotesModalVisible(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setNotesModalVisible(true);
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await NotesService.deleteNote(noteId);
      await loadNotes(); // Reload notes after deletion
    } catch (error) {
      console.error('Failed to delete note:', error);
      Alert.alert('Error', 'Failed to delete note');
    }
  };

  const handleSaveNote = async (noteData: Omit<Note, 'id' | 'createdAt'>) => {
    try {
      if (editingNote) {
        await NotesService.updateNote(editingNote.id, noteData);
      } else {
        // Add leadId to noteData for new notes
        const noteWithLeadId = { ...noteData, leadId };
        await NotesService.addNote(noteWithLeadId);
      }
      await loadNotes(); // Reload notes after save
      setNotesModalVisible(false);
    } catch (error) {
      console.error('Failed to save note:', error);
      Alert.alert('Error', 'Failed to save note');
    }
  };
  
  const renderInfoTab = () => (
    <View style={styles.tabContent}>
      {/* Contact Information Section */}
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
      
      {/* Lead Details and Labels Side by Side */}
      <View style={styles.sideByySideContainer}>
        {/* Left Side - Lead Details */}
        <View style={styles.leftSection}>
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
        
        {/* Right Side - Labels */}
        <View style={styles.rightSection}>
          <Text style={styles.sectionTitle}>Labels</Text>
          
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
              <View style={styles.emptyLabelsState}>
                <Text style={styles.emptyLabelsIcon}>🏷️</Text>
                <Text style={styles.emptyLabelsText}>No labels yet</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
  
  const renderNotesTab = () => (
    <View style={styles.tabContent}>
      <NotesList
        notes={notes}
        onAddNote={handleAddNote}
        onEditNote={handleEditNote}
        onDeleteNote={handleDeleteNote}
      />
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
  
  const renderRemindersTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>⏰</Text>
        <Text style={styles.emptyTitle}>Reminders</Text>
        <Text style={styles.emptyText}>
          Feature is incoming
        </Text>
      </View>
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
      {/* Profile Section */}
      <View style={styles.profileSection}>
        {/* Left Side - Contact Info */}
        <View style={styles.contactInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {lead.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </Text>
          </View>
          <Text style={styles.profileName}>{lead.name}</Text>
          {lead.position && <Text style={styles.profilePosition}>{lead.position}</Text>}
          {lead.company && <Text style={styles.profileCompany}>{lead.company}</Text>}
        </View>
        
        {/* Right Side - Action Icons Grid */}
        <View style={styles.actionIconsGrid}>
          {/* Top Row */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.actionIconButton, styles.phoneButton]} onPress={handleCall}>
              <Icon name="phone" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionIconButton, styles.whatsappButton]} onPress={handleWhatsApp}>
              <Icon name="whatsapp" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          
          {/* Bottom Row */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.actionIconButton, styles.smsButton]} onPress={handleSMS}>
              <Text style={styles.smsText}>SMS</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionIconButton, styles.emailButton]} onPress={handleEmail}>
              <Icon name="email" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
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
          style={[styles.tab, activeTab === 'reminders' && styles.activeTab]}
          onPress={() => setActiveTab('reminders')}
        >
          <Text style={[styles.tabText, activeTab === 'reminders' && styles.activeTabText]}>
            Reminders
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Tab Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'info' && renderInfoTab()}
        {activeTab === 'notes' && renderNotesTab()}
        {activeTab === 'activity' && renderActivityTab()}
        {activeTab === 'reminders' && renderRemindersTab()}
      </ScrollView>
      
      {/* Notes Modal - Reusing Existing System */}
      <NotesModal
        visible={notesModalVisible}
        leadId={leadId}
        existingNote={editingNote}
        onClose={() => setNotesModalVisible(false)}
        onSave={handleSaveNote}
      />
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
  profileSection: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    padding: Spacing.lg,
    backgroundColor: Colors.background.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  contactInfo: {
    paddingRight: Spacing.lg,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.primary.base + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary.base,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  profilePosition: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  profileCompany: {
    fontSize: 14,
    color: Colors.text.tertiary,
    marginBottom: Spacing.md,
  },
  actionIconsGrid: {
    justifyContent: 'space-evenly',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: Spacing.sm,
  },
  actionIconButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  phoneButton: {
    backgroundColor: '#4A5568',
  },
  whatsappButton: {
    backgroundColor: '#1E88E5',
  },
  smsButton: {
    backgroundColor: '#4A5568',
  },
  emailButton: {
    backgroundColor: '#1E88E5',
  },
  smsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
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
  sideByySideContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  leftSection: {
    flex: 1,
  },
  rightSection: {
    flex: 1,
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
    minHeight: 80,
  },
  emptyLabelsState: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  emptyLabelsIcon: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  emptyLabelsText: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center',
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
});

export default LeadDetail;