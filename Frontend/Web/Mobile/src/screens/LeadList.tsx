import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  StatusBar,
  Alert,
  RefreshControl,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSidebarContext } from '../context/SidebarContext';
import MaterialPressable from '../components/Pressable';
import LeadCard from '../components/LeadCard';
import SearchBar from '../components/SearchBar';
import { Lead, LeadStatus, LeadPriority } from '../types/Lead';
import AsyncStorageService from '../services/AsyncStorageService';
import { Colors, Spacing, BorderRadius } from '../theme';
import NoLeadsEmpty from '../components/EmptyStates/NoLeadsEmpty';
import LeadCardSkeleton from '../components/LoadingStates/LeadCardSkeleton';
import { PerformanceMonitor } from '../utils/performance';

const LeadList: React.FC = () => {
  const navigation = useNavigation<any>();
  const { toggleSidebar } = useSidebarContext();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Reload leads when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadLeads();
    }, [])
  );

  useEffect(() => {
    // Filter leads based on search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const filtered = leads.filter(
        lead =>
          lead.name.toLowerCase().includes(query) ||
          lead.company?.toLowerCase().includes(query) ||
          lead.phone?.includes(query) ||
          lead.email?.toLowerCase().includes(query)
      );
      setFilteredLeads(filtered);
    } else {
      setFilteredLeads(leads);
    }
  }, [searchQuery, leads]);

  const loadLeads = async () => {
    setLoading(true);
    try {
      const dbLeads = await PerformanceMonitor.measureAsync(
        'Load Leads',
        () => AsyncStorageService.getLeads(100, 0)
      );
      setLeads(dbLeads);
      setFilteredLeads(dbLeads);
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
    navigation.navigate('LeadDetail', { leadId: lead.id });
  };

  const handleCall = (lead: Lead) => {
    if (lead.phone) {
      Linking.openURL(`tel:${lead.phone.replace(/[^0-9+]/g, '')}`);
    } else {
      Alert.alert('No Phone Number', 'This lead does not have a phone number.');
    }
  };

  const handleEmail = (lead: Lead) => {
    if (lead.email) {
      Linking.openURL(`mailto:${lead.email}`);
    } else {
      Alert.alert('No Email', 'This lead does not have an email address.');
    }
  };

  const handleWhatsApp = (lead: Lead) => {
    if (lead.phone) {
      const cleanPhone = lead.phone.replace(/[^0-9+]/g, '');
      Linking.openURL(`whatsapp://send?phone=${cleanPhone}`);
    } else {
      Alert.alert('No Phone Number', 'This lead does not have a phone number for WhatsApp.');
    }
  };

  const handleSMS = (lead: Lead) => {
    if (lead.phone) {
      const cleanPhone = lead.phone.replace(/[^0-9+]/g, '');
      Linking.openURL(`sms:${cleanPhone}`);
    } else {
      Alert.alert('No Phone Number', 'This lead does not have a phone number for SMS.');
    }
  };

  const handleNotes = (lead: Lead) => {
    navigation.navigate('LeadNotes', { leadId: lead.id });
  };

  const handleAddLead = () => {
    navigation.navigate('LeadForm', {});
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={toggleSidebar} style={styles.menuButton}>
        <View style={styles.hamburgerMenu}>
          <View style={styles.hamburgerLineTop} />
          <View style={styles.hamburgerLineMiddle} />
          <View style={styles.hamburgerLineBottom} />
        </View>
      </TouchableOpacity>
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
        <Text style={styles.statNumber}>{filteredLeads.length}</Text>
        <Text style={styles.statLabel}>Total Leads</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>
          {filteredLeads.filter(lead => lead.status === LeadStatus.NEW).length}
        </Text>
        <Text style={styles.statLabel}>New Leads</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>
          {filteredLeads.filter(lead => lead.priority === LeadPriority.HIGH || lead.priority === LeadPriority.URGENT).length}
        </Text>
        <Text style={styles.statLabel}>High Priority</Text>
      </View>
    </View>
  );

  const renderLoadingSkeleton = () => (
    <View style={styles.content}>
      {renderHeader()}
      {renderStats()}
      <View style={styles.listContainer}>
        {[1, 2, 3, 4, 5].map((item) => (
          <LeadCardSkeleton key={item} />
        ))}
      </View>
    </View>
  );

  const renderLead = ({ item }: { item: Lead }) => (
    <LeadCard
      lead={item}
      onPress={handleLeadPress}
      onCall={handleCall}
      onEmail={handleEmail}
      onWhatsApp={handleWhatsApp}
      onSMS={handleSMS}
      onNotes={handleNotes}
    />
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#14B8A6" />
        {renderLoadingSkeleton()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#14B8A6" />
      {renderHeader()}
      
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search leads..."
        onClear={() => setSearchQuery('')}
      />
      
      {filteredLeads.length > 0 && renderStats()}
      
      <FlatList
        data={filteredLeads}
        renderItem={renderLead}
        keyExtractor={(item) => item.id}
        contentContainerStyle={filteredLeads.length === 0 ? styles.emptyListContainer : styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#14B8A6"
            colors={['#14B8A6']}
          />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={NoLeadsEmpty}
        {...PerformanceMonitor.optimizeListRendering()}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 4,
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
    backgroundColor: '#FFFFFF',
    borderRadius: 1.5,
  },
  hamburgerLineMiddle: {
    width: 24,
    height: 3,
    backgroundColor: '#FFFFFF',
    borderRadius: 1.5,
  },
  hamburgerLineBottom: {
    width: 12,
    height: 3,
    backgroundColor: '#FFFFFF',
    borderRadius: 1.5,
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
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 6,
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