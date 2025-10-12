import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
  TextInput,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DialerKeypad from '../components/DialerKeypad';
import T9Search from '../components/T9Search';
import RecentCalls from '../components/RecentCalls';
import SearchBar from '../components/SearchBar';
import DialerService from '../services/DialerService';
import AsyncStorageService from '../services/AsyncStorageService';
import { useSidebarContext } from '../context/SidebarContext';
import { Colors, Typography } from '../theme';
import { Lead } from '../types/Lead';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type TabType = 'allcontacts' | 'recent' | 'keypad';

const Dialer: React.FC = () => {
  const { toggleSidebar } = useSidebarContext();
  const [activeTab, setActiveTab] = useState<TabType>('allcontacts');
  const [allContacts, setAllContacts] = useState<Lead[]>([]);
  const [recentContacts, setRecentContacts] = useState<Lead[]>([]);
  const [frequentContacts, setFrequentContacts] = useState<Lead[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const searchAnimation = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    // Show/hide search based on input
    const shouldShow = phoneInput.length >= 2 && !DialerService.isPhoneNumber(phoneInput);
    
    if (shouldShow !== showSearch) {
      setShowSearch(shouldShow);
      
      Animated.timing(searchAnimation, {
        toValue: shouldShow ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [phoneInput, showSearch, searchAnimation]);

  const loadContacts = async () => {
    try {
      // Load all contacts
      const contacts = await AsyncStorageService.getLeads(100, 0);
      setAllContacts(contacts);
      
      // Get recent contacts (contacts with recent calls)
      const recentContactsList = contacts.filter(contact => 
        contact.lastContactedAt && 
        new Date(contact.lastContactedAt).getTime() > Date.now() - (7 * 24 * 60 * 60 * 1000) // Last 7 days
      ).sort((a, b) => 
        new Date(b.lastContactedAt!).getTime() - new Date(a.lastContactedAt!).getTime()
      );
      setRecentContacts(recentContactsList);
      
      // Get frequent contacts (contacts with multiple calls)
      const frequentContactsList = contacts.filter(contact => 
        contact.callCount && contact.callCount > 2
      ).sort((a, b) => (b.callCount || 0) - (a.callCount || 0));
      setFrequentContacts(frequentContactsList.slice(0, 10)); // Top 10 frequent
      
    } catch (error) {
      console.error('Failed to load contacts:', error);
    }
  };

  const handleKeyPress = (key: string) => {
    console.log('🔤 Dialer key pressed:', key);
    // Blur TextInput to prevent interference
    inputRef.current?.blur();
    
    setPhoneInput(prev => {
      const newInput = prev + key;
      const formatted = DialerService.formatInput(newInput);
      console.log('📱 Input updated:', prev, '→', formatted);
      return formatted;
    });
  };

  const handleBackspace = () => {
    console.log('⌫ Backspace pressed');
    // Blur TextInput to prevent interference
    inputRef.current?.blur();
    
    setPhoneInput(prev => {
      if (prev.length === 0) {
        console.log('⌫ Input already empty');
        return '';
      }
      const newInput = prev.slice(0, -1);
      const formatted = DialerService.formatInput(newInput);
      console.log('⌫ Input updated:', prev, '→', formatted);
      return formatted;
    });
  };

  const handleClear = () => {
    console.log('🧹 Clearing dialer input');
    // Blur TextInput to prevent interference
    inputRef.current?.blur();
    setPhoneInput('');
  };

  const handleCall = async () => {
    if (!phoneInput.trim()) {
      Alert.alert('No Number', 'Please enter a phone number to call');
      return;
    }

    const validation = DialerService.validatePhoneNumber(phoneInput);
    if (!validation.valid) {
      Alert.alert('Invalid Number', validation.error);
      return;
    }

    const result = await DialerService.makeCall(phoneInput);
    
    if (result.success) {
      // Clear input after successful call
      setPhoneInput('');
      // Trigger refresh of recent calls
      setRefreshTrigger(prev => prev + 1);
    }
  };

  const handleSelectLead = (lead: any) => {
    setPhoneInput(DialerService.formatPhoneNumber(lead.phone));
  };

  const handleCallLead = async (lead: any) => {
    const result = await DialerService.callLead(lead);
    
    if (result.success) {
      setRefreshTrigger(prev => prev + 1);
    }
  };

  const handleCallFromRecent = async (phoneNumber: string) => {
    console.log('📞 Making call from recent calls to:', phoneNumber);
    const result = await DialerService.makeCall(phoneNumber);
    
    if (result.success) {
      console.log('✅ Recent call successful, refreshing call list');
      setRefreshTrigger(prev => prev + 1);
    } else {
      console.error('❌ Recent call failed:', result.error);
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (tab !== 'keypad') {
      setPhoneInput('');
      setSearchQuery('');
    }
  };

  const getFilteredContacts = () => {
    let contacts: Lead[] = [];
    
    switch (activeTab) {
      case 'allcontacts':
        contacts = allContacts;
        break;
      case 'recent':
        contacts = recentContacts;
        break;
      default:
        return [];
    }

    if (!searchQuery) return contacts;

    return contacts.filter(contact =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone?.includes(searchQuery) ||
      contact.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const handleContactPress = async (contact: Lead) => {
    if (contact.phone) {
      const result = await DialerService.makeCall(contact.phone);
      if (result.success) {
        setRefreshTrigger(prev => prev + 1);
        loadContacts(); // Refresh contacts to update recent/frequent lists
      }
    } else {
      Alert.alert('No Phone Number', 'This contact does not have a phone number.');
    }
  };

  const renderSearchHeader = () => (
    <View style={styles.searchHeader}>
      <View style={styles.searchContainer}>
        <TouchableOpacity onPress={toggleSidebar} style={styles.hamburgerButton}>
          <View style={styles.hamburgerMenu}>
            <View style={styles.hamburgerLineTop} />
            <View style={styles.hamburgerLineMiddle} />
            <View style={styles.hamburgerLineBottom} />
          </View>
        </TouchableOpacity>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={`Search ${activeTab === 'allcontacts' ? 'all contacts' : 'recent contacts'}...`}
          placeholderTextColor="#999999"
          autoCorrect={false}
          autoCapitalize="none"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearSearchButton}
            onPress={() => setSearchQuery('')}
          >
            <Icon name="close" size={20} color="#666666" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderContactItem = ({ item }: { item: Lead }) => (
    <TouchableOpacity
      style={styles.contactItem}
      onPress={() => handleContactPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.contactAvatar}>
        <Text style={styles.contactAvatarText}>
          {item.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{item.name}</Text>
        {item.company && (
          <Text style={styles.contactCompany}>{item.company}</Text>
        )}
        <Text style={styles.contactPhone}>{item.phone || 'No phone'}</Text>
      </View>
      <TouchableOpacity
        style={styles.callIconButton}
        onPress={() => handleContactPress(item)}
      >
        <Icon name="phone" size={20} color={Colors.primary.base} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderNumberDisplay = () => (
    <View style={styles.numberDisplay}>
      <TextInput
        ref={inputRef}
        style={styles.numberInput}
        value={phoneInput}
        onChangeText={(text) => {
          // Format the input through DialerService
          const formatted = DialerService.formatInput(text);
          setPhoneInput(formatted);
        }}
        placeholder="Enter number or name"
        placeholderTextColor="#999999"
        keyboardType="phone-pad"
        autoCorrect={false}
        autoCapitalize="none"
        selectTextOnFocus
        blurOnSubmit={false}
        showSoftInputOnFocus={false} // Prevent system keyboard from showing
        onFocus={() => {
          // Always blur when focused to prevent keyboard
          inputRef.current?.blur();
        }}
      />
      
      {phoneInput.length > 0 && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClear}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.clearButtonText}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderActionButtons = () => (
    <View style={styles.actionButtons}>
      {phoneInput.length > 0 && (
        <TouchableOpacity
          style={styles.backspaceButton}
          onPress={handleBackspace}
          activeOpacity={0.7}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          <Text style={styles.backspaceText}>⌫</Text>
        </TouchableOpacity>
      )}
      
      <TouchableOpacity
        style={[
          styles.callButton,
          !phoneInput.trim() && styles.callButtonDisabled,
        ]}
        onPress={handleCall}
        disabled={!phoneInput.trim()}
        activeOpacity={0.8}
      >
        <Text style={styles.callButtonText}>📞</Text>
      </TouchableOpacity>
    </View>
  );

  const renderAllContactsTab = () => (
    <View style={styles.contactsContent}>
      {renderSearchHeader()}
      <FlatList
        data={getFilteredContacts()}
        renderItem={renderContactItem}
        keyExtractor={(item) => item.id}
        style={styles.contactsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Icon name="account-group" size={64} color="#E1E5E9" />
            <Text style={styles.emptyTitle}>No Contacts Found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'Try a different search term' : 'No contacts available'}
            </Text>
          </View>
        )}
      />
    </View>
  );

  const renderRecentTab = () => (
    <View style={styles.contactsContent}>
      {renderSearchHeader()}
      <FlatList
        data={getFilteredContacts()}
        renderItem={renderContactItem}
        keyExtractor={(item) => item.id}
        style={styles.contactsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Icon name="clock-outline" size={64} color="#E1E5E9" />
            <Text style={styles.emptyTitle}>No Recent Contacts</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'Try a different search term' : 'Recent contacts will appear here'}
            </Text>
          </View>
        )}
      />
    </View>
  );

  const renderKeypadTab = () => (
    <View style={styles.keypadContent}>
      {/* Frequent contacts section */}
      {frequentContacts.length > 0 && (
        <View style={styles.frequentSection}>
          <Text style={styles.frequentTitle}>Frequently Dialed</Text>
          <FlatList
            data={frequentContacts}
            renderItem={renderContactItem}
            keyExtractor={(item) => item.id}
            style={styles.frequentList}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}
      
      {/* Number display */}
      {renderNumberDisplay()}
      
      {/* T9 Search when typing */}
      <Animated.View
        style={[
          styles.t9SearchContainer,
          {
            height: searchAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, SCREEN_HEIGHT * 0.2],
            }),
            opacity: searchAnimation,
          },
        ]}
      >
        {showSearch && (
          <T9Search
            searchInput={phoneInput.replace(/\D/g, '')} // Remove formatting for search
            onSelectLead={handleSelectLead}
            onCallLead={handleCallLead}
          />
        )}
      </Animated.View>
      
      {/* Keypad */}
      <View style={styles.keypadContainer}>
        <DialerKeypad
          onKeyPress={handleKeyPress}
          disabled={false}
        />
        
        {renderActionButtons()}
      </View>
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'allcontacts' && styles.activeTab]}
        onPress={() => handleTabChange('allcontacts')}
      >
        <Icon 
          name="account-group" 
          size={20} 
          color={activeTab === 'allcontacts' ? Colors.primary.base : '#666666'} 
        />
        <Text style={[styles.tabText, activeTab === 'allcontacts' && styles.activeTabText]}>
          All Contacts
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'recent' && styles.activeTab]}
        onPress={() => handleTabChange('recent')}
      >
        <Icon 
          name="clock-outline" 
          size={20} 
          color={activeTab === 'recent' ? Colors.primary.base : '#666666'} 
        />
        <Text style={[styles.tabText, activeTab === 'recent' && styles.activeTabText]}>
          Recent
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'keypad' && styles.activeTab]}
        onPress={() => handleTabChange('keypad')}
      >
        <Icon 
          name="dialpad" 
          size={20} 
          color={activeTab === 'keypad' ? Colors.primary.base : '#666666'} 
        />
        <Text style={[styles.tabText, activeTab === 'keypad' && styles.activeTabText]}>
          Keypad
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'allcontacts':
        return renderAllContactsTab();
      case 'recent':
        return renderRecentTab();
      case 'keypad':
        return renderKeypadTab();
      default:
        return renderAllContactsTab();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary.base} />
      
      {renderTabs()}

      <View style={styles.content}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E5E9',
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
    flexDirection: 'column',
    gap: 4,
  },
  activeTab: {
    borderBottomColor: Colors.primary.base,
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666666',
  },
  activeTabText: {
    color: Colors.primary.base,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  // Contact list styles
  contactsContent: {
    flex: 1,
  },
  searchHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E5E9',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  hamburgerButton: {
    padding: 8,
    marginRight: 8,
  },
  hamburgerMenu: {
    width: 20,
    height: 16,
    justifyContent: 'space-between',
  },
  hamburgerLineTop: {
    width: 14,
    height: 2,
    backgroundColor: Colors.primary.base,
    borderRadius: 1,
  },
  hamburgerLineMiddle: {
    width: 20,
    height: 2,
    backgroundColor: Colors.primary.base,
    borderRadius: 1,
  },
  hamburgerLineBottom: {
    width: 10,
    height: 2,
    backgroundColor: Colors.primary.base,
    borderRadius: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    paddingVertical: 4,
  },
  clearSearchButton: {
    padding: 4,
    marginLeft: 8,
  },
  contactsList: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F4',
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary.base,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactAvatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  contactCompany: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: 14,
    color: '#999999',
  },
  callIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary.base + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Keypad styles
  keypadContent: {
    flex: 1,
  },
  frequentSection: {
    maxHeight: SCREEN_HEIGHT * 0.25,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E5E9',
  },
  frequentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  frequentList: {
    paddingBottom: 8,
  },
  numberDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E5E9',
    backgroundColor: '#FFFFFF',
  },
  numberInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '400',
    color: '#333333',
    textAlign: 'center',
    paddingVertical: 12,
    fontFamily: 'monospace',
  },
  clearButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F3F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#666666',
  },
  t9SearchContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E5E9',
    overflow: 'hidden',
  },
  keypadContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 20,
    gap: 20,
  },
  backspaceButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E1E5E9',
  },
  backspaceText: {
    fontSize: 24,
    color: '#666666',
  },
  callButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  callButtonDisabled: {
    backgroundColor: '#E1E5E9',
  },
  callButtonText: {
    fontSize: 32,
  },
});

export default Dialer;