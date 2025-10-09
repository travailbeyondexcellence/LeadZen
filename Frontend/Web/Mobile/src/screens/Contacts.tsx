import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  Alert,
  RefreshControl,
  TextInput,
} from 'react-native';
import MaterialPressable from '../components/Pressable';
import ContactCard from '../components/ContactCard';
import { Contact, ContactCategory } from '../types/Contact';

const Contacts: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ContactCategory | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  const mockContacts: Contact[] = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@techsolutions.com',
      phone: '+1 (555) 123-4567',
      company: 'Tech Solutions Inc',
      position: 'CTO',
      address: '123 Tech Street, San Francisco, CA',
      notes: 'Very interested in enterprise solutions. Decision maker for tech purchases.',
      tags: ['Hot Lead', 'Decision Maker', 'Technical Contact'],
      category: ContactCategory.LEAD,
      isFavorite: true,
      createdAt: new Date('2024-10-01'),
      updatedAt: new Date('2024-10-08'),
      lastContactedAt: new Date('2024-10-07'),
    },
    {
      id: '2',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@marketingpro.com',
      phone: '+1 (555) 987-6543',
      company: 'Marketing Pro Agency',
      position: 'Marketing Director',
      address: '456 Marketing Ave, New York, NY',
      notes: 'Looking for marketing automation tools. Budget approved.',
      tags: ['Follow Up', 'Budget Holder', 'Champion'],
      category: ContactCategory.PROSPECT,
      isFavorite: false,
      createdAt: new Date('2024-09-28'),
      updatedAt: new Date('2024-10-06'),
      lastContactedAt: new Date('2024-10-05'),
    },
    {
      id: '3',
      firstName: 'Michael',
      lastName: 'Chen',
      email: 'michael@startupventures.io',
      phone: '+1 (555) 456-7890',
      company: 'Startup Ventures',
      position: 'Founder & CEO',
      notes: 'Fast-growing startup, needs scalable solution urgently.',
      tags: ['VIP', 'Hot Lead', 'Decision Maker'],
      category: ContactCategory.CUSTOMER,
      isFavorite: true,
      createdAt: new Date('2024-09-25'),
      updatedAt: new Date('2024-10-05'),
      lastContactedAt: new Date('2024-10-04'),
    },
    {
      id: '4',
      firstName: 'Emily',
      lastName: 'Davis',
      email: 'emily.davis@corpsolutions.com',
      phone: '+1 (555) 321-6789',
      company: 'Corporate Solutions LLC',
      position: 'VP of Sales',
      notes: 'Potential partner for enterprise deals.',
      tags: ['Partner', 'Influencer'],
      category: ContactCategory.PARTNER,
      isFavorite: false,
      createdAt: new Date('2024-09-20'),
      updatedAt: new Date('2024-10-03'),
    },
    {
      id: '5',
      firstName: 'David',
      lastName: 'Wilson',
      email: 'david.wilson@supplier.com',
      company: 'Office Supplies Co',
      position: 'Account Manager',
      notes: 'Regular supplier for office equipment.',
      tags: ['Vendor'],
      category: ContactCategory.VENDOR,
      isFavorite: false,
      createdAt: new Date('2024-09-15'),
      updatedAt: new Date('2024-10-01'),
    },
  ];

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    filterContacts();
  }, [contacts, searchQuery, selectedCategory]);

  const loadContacts = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setContacts(mockContacts);
    } catch (error) {
      Alert.alert('Error', 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const filterContacts = () => {
    let filtered = contacts;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(contact => 
        `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(query) ||
        contact.email?.toLowerCase().includes(query) ||
        contact.phone?.includes(query) ||
        contact.company?.toLowerCase().includes(query) ||
        contact.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(contact => contact.category === selectedCategory);
    }

    setFilteredContacts(filtered);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadContacts();
    setRefreshing(false);
  };

  const handleContactPress = (contact: Contact) => {
    Alert.alert('Contact Details', `Opening details for ${contact.firstName} ${contact.lastName}`);
    // Navigate to contact detail screen
  };

  const handleCall = (contact: Contact) => {
    if (contact.phone) {
      Alert.alert('Call Contact', `Calling ${contact.firstName} ${contact.lastName} at ${contact.phone}`);
      // Implement actual calling functionality
    }
  };

  const handleEmail = (contact: Contact) => {
    if (contact.email) {
      Alert.alert('Email Contact', `Composing email to ${contact.firstName} ${contact.lastName} at ${contact.email}`);
      // Implement email functionality
    }
  };

  const handleFavorite = (contact: Contact) => {
    const updatedContacts = contacts.map(c => 
      c.id === contact.id ? { ...c, isFavorite: !c.isFavorite } : c
    );
    setContacts(updatedContacts);
  };

  const handleAddContact = () => {
    Alert.alert('Add Contact', 'Opening contact creation form');
    // Navigate to contact form screen
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Text style={styles.headerTitle}>Contacts</Text>
        <MaterialPressable
          style={styles.addButton}
          onPress={handleAddContact}
          rippleColor="rgba(255, 255, 255, 0.2)"
        >
          <Text style={styles.addIcon}>+</Text>
        </MaterialPressable>
      </View>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search contacts..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
    </View>
  );

  const renderCategoryFilter = () => (
    <View style={styles.filterContainer}>
      <FlatList
        data={[
          { key: 'all', label: 'All' },
          { key: ContactCategory.LEAD, label: 'Leads' },
          { key: ContactCategory.CUSTOMER, label: 'Customers' },
          { key: ContactCategory.PROSPECT, label: 'Prospects' },
          { key: ContactCategory.PARTNER, label: 'Partners' },
          { key: ContactCategory.VENDOR, label: 'Vendors' },
        ]}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <MaterialPressable
            style={[
              styles.filterChip,
              selectedCategory === item.key && styles.filterChipActive,
            ]}
            onPress={() => setSelectedCategory(item.key as ContactCategory | 'all')}
            rippleColor="rgba(20, 184, 166, 0.2)"
          >
            <Text
              style={[
                styles.filterChipText,
                selectedCategory === item.key && styles.filterChipTextActive,
              ]}
            >
              {item.label}
            </Text>
          </MaterialPressable>
        )}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.filterList}
      />
    </View>
  );

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{filteredContacts.length}</Text>
        <Text style={styles.statLabel}>Total</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>
          {filteredContacts.filter(c => c.isFavorite).length}
        </Text>
        <Text style={styles.statLabel}>Favorites</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>
          {filteredContacts.filter(c => c.category === ContactCategory.LEAD).length}
        </Text>
        <Text style={styles.statLabel}>Leads</Text>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>👥</Text>
      <Text style={styles.emptyTitle}>
        {searchQuery || selectedCategory !== 'all' ? 'No matches found' : 'No contacts yet'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery || selectedCategory !== 'all' 
          ? 'Try adjusting your search or filters'
          : 'Start building your network by adding your first contact'
        }
      </Text>
      {!searchQuery && selectedCategory === 'all' && (
        <MaterialPressable
          style={styles.emptyButton}
          onPress={handleAddContact}
          rippleColor="rgba(255, 255, 255, 0.2)"
        >
          <Text style={styles.emptyButtonText}>Add First Contact</Text>
        </MaterialPressable>
      )}
    </View>
  );

  const renderContact = ({ item }: { item: Contact }) => (
    <ContactCard
      contact={item}
      onPress={handleContactPress}
      onCall={handleCall}
      onEmail={handleEmail}
      onFavorite={handleFavorite}
    />
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#14B8A6" />
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading contacts...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#14B8A6" />
      {renderHeader()}
      {renderCategoryFilter()}
      {filteredContacts.length > 0 && renderStats()}
      
      <FlatList
        data={filteredContacts}
        renderItem={renderContact}
        keyExtractor={(item) => item.id}
        contentContainerStyle={filteredContacts.length === 0 ? styles.emptyListContainer : styles.listContainer}
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 4,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchIcon: {
    fontSize: 16,
    opacity: 0.8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    padding: 0,
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  filterList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#14B8A6',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  filterChipTextActive: {
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

export default Contacts;