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
} from 'react-native';
import DialerKeypad from '../components/DialerKeypad';
import T9Search from '../components/T9Search';
import RecentCalls from '../components/RecentCalls';
import DialerService from '../services/DialerService';
import { Colors, Typography } from '../theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type TabType = 'dialer' | 'recent';

const Dialer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dialer');
  const [phoneInput, setPhoneInput] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const searchAnimation = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);

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

  const handleKeyPress = (key: string) => {
    setPhoneInput(prev => {
      const newInput = prev + key;
      return DialerService.formatInput(newInput);
    });
  };

  const handleBackspace = () => {
    setPhoneInput(prev => {
      const newInput = prev.slice(0, -1);
      return DialerService.formatInput(newInput);
    });
  };

  const handleClear = () => {
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
    const result = await DialerService.makeCall(phoneNumber);
    
    if (result.success) {
      setRefreshTrigger(prev => prev + 1);
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (tab === 'recent') {
      setPhoneInput('');
    }
  };

  const renderNumberDisplay = () => (
    <View style={styles.numberDisplay}>
      <TextInput
        ref={inputRef}
        style={styles.numberInput}
        value={phoneInput}
        onChangeText={setPhoneInput}
        placeholder="Enter number or name"
        placeholderTextColor="#999999"
        keyboardType="phone-pad"
        autoCorrect={false}
        autoCapitalize="none"
        selectTextOnFocus
      />
      
      {phoneInput.length > 0 && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClear}
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
      >
        <Text style={styles.callButtonText}>📞</Text>
      </TouchableOpacity>
    </View>
  );

  const renderDialerTab = () => (
    <View style={styles.dialerContent}>
      {renderNumberDisplay()}
      
      <Animated.View
        style={[
          styles.searchContainer,
          {
            height: searchAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, SCREEN_HEIGHT * 0.3],
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
      
      <View style={styles.keypadContainer}>
        <DialerKeypad
          onKeyPress={handleKeyPress}
          disabled={false}
        />
        
        {renderActionButtons()}
      </View>
    </View>
  );

  const renderRecentTab = () => (
    <View style={styles.recentContent}>
      <RecentCalls
        onCallPress={handleCallFromRecent}
        refreshTrigger={refreshTrigger}
      />
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'dialer' && styles.activeTab]}
        onPress={() => handleTabChange('dialer')}
      >
        <Text style={[styles.tabText, activeTab === 'dialer' && styles.activeTabText]}>
          📱 Dialer
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'recent' && styles.activeTab]}
        onPress={() => handleTabChange('recent')}
      >
        <Text style={[styles.tabText, activeTab === 'recent' && styles.activeTabText]}>
          📞 Recent
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary.base} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>LeadZen Dialer</Text>
        <Text style={styles.headerSubtitle}>Smart calling with lead integration</Text>
      </View>

      {renderTabs()}

      <View style={styles.content}>
        {activeTab === 'dialer' ? renderDialerTab() : renderRecentTab()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: Colors.primary.base,
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    ...Typography.body2,
    color: Colors.primary.light,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E5E9',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: Colors.primary.base,
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 16,
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
  dialerContent: {
    flex: 1,
  },
  recentContent: {
    flex: 1,
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
  searchContainer: {
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