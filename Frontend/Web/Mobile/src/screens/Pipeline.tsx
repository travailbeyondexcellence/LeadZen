import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
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
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleLeadPress = useCallback((lead: Lead) => {
    // Do nothing - completely disable modal functionality
    console.log('Lead pressed:', lead.name, '- Modal disabled');
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

  const handleSMS = useCallback((lead: Lead) => {
    if (lead.phone) {
      const cleanPhone = lead.phone.replace(/[^0-9+]/g, '');
      Linking.openURL(`sms:${cleanPhone}`);
    } else {
      Alert.alert('No Phone Number', 'This lead does not have a phone number for SMS.');
    }
  }, []);

  const handleNotes = useCallback((lead: Lead) => {
    navigation.navigate('LeadNotes' as never, { 
      leadId: lead.id 
    } as never);
  }, [navigation]);


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
        onSMS={handleSMS}
        onNotes={handleNotes}
      />

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
});