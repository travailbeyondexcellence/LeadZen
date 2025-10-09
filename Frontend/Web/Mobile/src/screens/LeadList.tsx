import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  StatusBar,
  Alert,
  RefreshControl,
} from 'react-native';
import MaterialPressable from '../components/Pressable';
import LeadCard from '../components/LeadCard';
import { Lead, LeadStatus, LeadPriority } from '../types/Lead';
import DatabaseService from '../services/DatabaseService';

const LeadList: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    setLoading(true);
    try {
      // Load leads from database
      const dbLeads = await DatabaseService.getLeads(100, 0);
      setLeads(dbLeads);
    } catch (error) {
      console.error('Failed to load leads:', error);
      Alert.alert('Error', 'Failed to load leads from database');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadLeads();
    setRefreshing(false);
  };

  const handleLeadPress = (lead: Lead) => {
    Alert.alert('Lead Details', `Opening details for ${lead.name}`);
    // Navigate to lead detail screen
  };

  const handleCall = (lead: Lead) => {
    if (lead.phone) {
      Alert.alert('Call Lead', `Calling ${lead.name} at ${lead.phone}`);
      // Implement actual calling functionality
    }
  };

  const handleEmail = (lead: Lead) => {
    if (lead.email) {
      Alert.alert('Email Lead', `Composing email to ${lead.name} at ${lead.email}`);
      // Implement email functionality
    }
  };

  const handleAddLead = () => {
    Alert.alert('Add Lead', 'Opening lead creation form');
    // Navigate to lead form screen
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Leads</Text>
      <MaterialPressable
        style={styles.addButton}
        onPress={handleAddLead}
        rippleColor="rgba(255, 255, 255, 0.2)"
      >
        <Text style={styles.addIcon}>+</Text>
      </MaterialPressable>
    </View>
  );

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{leads.length}</Text>
        <Text style={styles.statLabel}>Total Leads</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>
          {leads.filter(lead => lead.status === LeadStatus.NEW).length}
        </Text>
        <Text style={styles.statLabel}>New Leads</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>
          {leads.filter(lead => lead.priority === LeadPriority.HIGH || lead.priority === LeadPriority.URGENT).length}
        </Text>
        <Text style={styles.statLabel}>High Priority</Text>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={styles.emptyTitle}>No leads yet</Text>
      <Text style={styles.emptySubtitle}>Start building your pipeline by adding your first lead</Text>
      <MaterialPressable
        style={styles.emptyButton}
        onPress={handleAddLead}
        rippleColor="rgba(255, 255, 255, 0.2)"
      >
        <Text style={styles.emptyButtonText}>Add First Lead</Text>
      </MaterialPressable>
    </View>
  );

  const renderLead = ({ item }: { item: Lead }) => (
    <LeadCard
      lead={item}
      onPress={handleLeadPress}
      onCall={handleCall}
      onEmail={handleEmail}
    />
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#14B8A6" />
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading leads...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#14B8A6" />
      {renderHeader()}
      
      {leads.length > 0 && renderStats()}
      
      <FlatList
        data={leads}
        renderItem={renderLead}
        keyExtractor={(item) => item.id}
        contentContainerStyle={leads.length === 0 ? styles.emptyListContainer : styles.listContainer}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
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
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIcon: {
    fontSize: 24,
    fontWeight: '600',
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
    marginBottom: 32,
  },
  emptyButton: {
    backgroundColor: '#14B8A6',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 24,
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 4,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default LeadList;