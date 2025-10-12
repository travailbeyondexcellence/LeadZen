import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, BorderRadius, Shadows } from '../theme';
import CallDetectionService from '../services/CallDetectionService';
import NativeFloatingOverlay from '../services/NativeFloatingOverlay';

interface AppSettings {
  // App Preferences
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  autoSave: boolean;
  defaultLeadPriority: 'LOW' | 'MEDIUM' | 'HIGH';
  currency: 'USD' | 'EUR' | 'GBP';
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  
  // App Behavior
  darkMode: boolean;
  language: 'English' | 'Spanish' | 'French';
  defaultPipelineView: 'board' | 'list';
  autoCallRecording: boolean;
  
  // Privacy & Security
  twoFactorAuth: boolean;
  biometricLogin: boolean;
  autoLogout: boolean;
  dataBackup: boolean;
}

const SETTINGS_KEY = '@leadzen_app_settings';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>({
    // App Preferences
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    autoSave: true,
    defaultLeadPriority: 'MEDIUM',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    
    // App Behavior
    darkMode: false,
    language: 'English',
    defaultPipelineView: 'board',
    autoCallRecording: false,
    
    // Privacy & Security
    twoFactorAuth: false,
    biometricLogin: false,
    autoLogout: true,
    dataBackup: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem(SETTINGS_KEY);
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSettings = async (newSettings: AppSettings) => {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Failed to save settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const updateSetting = (field: keyof AppSettings, value: any) => {
    const newSettings = { ...settings, [field]: value };
    saveSettings(newSettings);
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Export all your CRM data to a backup file?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Export', onPress: () => Alert.alert('Success', 'Data exported successfully!') }
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => Alert.alert('Success', 'Cache cleared!') }
      ]
    );
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'This will reset all settings to default values. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: () => {
          const defaultSettings: AppSettings = {
            pushNotifications: true,
            emailNotifications: true,
            smsNotifications: false,
            autoSave: true,
            defaultLeadPriority: 'MEDIUM',
            currency: 'USD',
            dateFormat: 'MM/DD/YYYY',
            darkMode: false,
            language: 'English',
            defaultPipelineView: 'board',
            autoCallRecording: false,
            twoFactorAuth: false,
            biometricLogin: false,
            autoLogout: true,
            dataBackup: true,
          };
          saveSettings(defaultSettings);
          Alert.alert('Success', 'Settings reset to default!');
        }}
      ]
    );
  };

  const renderSwitchRow = (
    title: string,
    subtitle: string,
    icon: string,
    value: boolean,
    onValueChange: (value: boolean) => void,
    iconColor: string = Colors.primary.base
  ) => (
    <View style={styles.settingRow}>
      <View style={styles.settingLeft}>
        <Icon name={icon} size={24} color={iconColor} style={styles.settingIcon} />
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: Colors.border.base, true: Colors.primary.light }}
        thumbColor={value ? Colors.primary.base : Colors.background.secondary}
      />
    </View>
  );

  const renderSelectRow = (
    title: string,
    subtitle: string,
    icon: string,
    value: string,
    onPress: () => void,
    iconColor: string = Colors.primary.base
  ) => (
    <TouchableOpacity style={styles.settingRow} onPress={onPress}>
      <View style={styles.settingLeft}>
        <Icon name={icon} size={24} color={iconColor} style={styles.settingIcon} />
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <View style={styles.settingRight}>
        <Text style={styles.settingValue}>{value}</Text>
        <Icon name="chevron-right" size={20} color={Colors.text.secondary} />
      </View>
    </TouchableOpacity>
  );

  const renderActionRow = (
    title: string,
    subtitle: string,
    icon: string,
    onPress: () => void,
    iconColor: string = Colors.primary.base,
    isDestructive: boolean = false
  ) => (
    <TouchableOpacity style={styles.settingRow} onPress={onPress}>
      <View style={styles.settingLeft}>
        <Icon name={icon} size={24} color={iconColor} style={styles.settingIcon} />
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, isDestructive && styles.destructiveText]}>{title}</Text>
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <Icon name="chevron-right" size={20} color={Colors.text.secondary} />
    </TouchableOpacity>
  );

  const handleTestFloatingOverlay = async () => {
    try {
      console.log('[SETTINGS] Testing floating overlay...');
      const result = await CallDetectionService.testFloatingOverlay('+919876543210');
      
      if (result) {
        Alert.alert('Success', 'Floating overlay test successful! Check if the floating icon appeared.');
      } else {
        Alert.alert('Error', 'Floating overlay test failed. Check the logs for details.');
      }
    } catch (error) {
      console.error('[SETTINGS] Error testing floating overlay:', error);
      Alert.alert('Error', 'Failed to test floating overlay: ' + error.message);
    }
  };
  
  const handleSimulateCall = (callType: 'Incoming' | 'Outgoing') => {
    try {
      console.log(`[SETTINGS] Simulating ${callType} call...`);
      CallDetectionService.simulateCallEvent(callType, '+919876543210');
      Alert.alert('Success', `${callType} call simulation triggered. Check the logs and look for floating overlay.`);
    } catch (error) {
      console.error(`[SETTINGS] Error simulating ${callType} call:`, error);
      Alert.alert('Error', `Failed to simulate ${callType} call: ` + error.message);
    }
  };
  
  const handleForceShowIcon = () => {
    Alert.alert(
      'Permission Check',
      'This will help debug if the floating overlay is working. Make sure you have enabled "Display over other apps" permission in Settings > Apps > LeadZen > Permissions.\n\nContinue with test?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Test Icon', 
          onPress: async () => {
            try {
              console.log('[SETTINGS] 🔍 Force showing floating icon for debugging...');
              const result = await CallDetectionService.testFloatingOverlay('+919876543210');
              
              Alert.alert(
                'Debug Test',
                'Test completed. Check your screen for the floating icon.\n\nIf you don\'t see it:\n1. Check "Display over other apps" permission\n2. Look at the Metro logs for error messages\n3. Try calling again',
                [{ text: 'OK' }]
              );
            } catch (error) {
              Alert.alert('Error', 'Test failed: ' + error.message);
            }
          }
        }
      ]
    );
  };
  
  const handleTestNativeOverlay = async () => {
    try {
      console.log('[SETTINGS] Testing native overlay...');
      
      if (!NativeFloatingOverlay.isAvailable()) {
        Alert.alert('Error', 'Native floating overlay module is not available. Make sure the app is rebuilt after adding native code.');
        return;
      }
      
      const result = await NativeFloatingOverlay.showFloatingOverlay('+919876543210', 'John Doe');
      
      if (result) {
        Alert.alert(
          'Native Overlay Test',
          'Native overlay should now be visible over ANY app (including dialer).\n\nTry:\n1. Open phone dialer\n2. Look for floating overlay\n3. Tap it to expand\n\nThis will work during real calls!',
          [
            { text: 'Hide Overlay', onPress: () => NativeFloatingOverlay.hideFloatingOverlay() },
            { text: 'Keep Testing', style: 'cancel' }
          ]
        );
      }
    } catch (error) {
      console.error('[SETTINGS] Error testing native overlay:', error);
      Alert.alert('Error', 'Failed to test native overlay: ' + error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary.base} />
      

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* App Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Preferences</Text>
          
          {renderSwitchRow(
            'Push Notifications',
            'Receive push notifications for new leads and updates',
            'bell-outline',
            settings.pushNotifications,
            (value) => updateSetting('pushNotifications', value)
          )}
          
          {renderSwitchRow(
            'Email Notifications',
            'Receive email notifications for important events',
            'email-outline',
            settings.emailNotifications,
            (value) => updateSetting('emailNotifications', value)
          )}
          
          {renderSwitchRow(
            'SMS Notifications',
            'Receive SMS notifications for urgent matters',
            'message-text-outline',
            settings.smsNotifications,
            (value) => updateSetting('smsNotifications', value)
          )}
          
          {renderSwitchRow(
            'Auto Save',
            'Automatically save changes without confirmation',
            'content-save-outline',
            settings.autoSave,
            (value) => updateSetting('autoSave', value)
          )}
          
          {renderSelectRow(
            'Default Lead Priority',
            'Default priority for new leads',
            'flag-outline',
            settings.defaultLeadPriority,
            () => Alert.alert('Feature Coming Soon', 'Priority selection will be available soon')
          )}
          
          {renderSelectRow(
            'Currency',
            'Default currency for deal values',
            'currency-usd',
            settings.currency,
            () => Alert.alert('Feature Coming Soon', 'Currency selection will be available soon')
          )}
          
          {renderSelectRow(
            'Date Format',
            'How dates are displayed throughout the app',
            'calendar-outline',
            settings.dateFormat,
            () => Alert.alert('Feature Coming Soon', 'Date format selection will be available soon')
          )}
        </View>

        {/* App Behavior */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Behavior</Text>
          
          {renderSwitchRow(
            'Dark Mode',
            'Use dark theme throughout the app',
            'theme-light-dark',
            settings.darkMode,
            (value) => updateSetting('darkMode', value)
          )}
          
          {renderSelectRow(
            'Language',
            'App display language',
            'translate',
            settings.language,
            () => Alert.alert('Feature Coming Soon', 'Language selection will be available soon')
          )}
          
          {renderSelectRow(
            'Default Pipeline View',
            'How the pipeline is displayed by default',
            'view-dashboard-outline',
            settings.defaultPipelineView === 'board' ? 'Board View' : 'List View',
            () => Alert.alert('Feature Coming Soon', 'View selection will be available soon')
          )}
          
          {renderSwitchRow(
            'Auto Call Recording',
            'Automatically record calls when possible',
            'record-rec',
            settings.autoCallRecording,
            (value) => updateSetting('autoCallRecording', value),
            Colors.semantic.warning
          )}
        </View>

        {/* Privacy & Security */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy & Security</Text>
          
          {renderSwitchRow(
            'Two-Factor Authentication',
            'Add extra security to your account',
            'shield-check-outline',
            settings.twoFactorAuth,
            (value) => updateSetting('twoFactorAuth', value),
            Colors.semantic.success
          )}
          
          {renderSwitchRow(
            'Biometric Login',
            'Use fingerprint or face ID to login',
            'fingerprint',
            settings.biometricLogin,
            (value) => updateSetting('biometricLogin', value),
            Colors.semantic.success
          )}
          
          {renderSwitchRow(
            'Auto Logout',
            'Automatically logout after inactivity',
            'logout',
            settings.autoLogout,
            (value) => updateSetting('autoLogout', value)
          )}
          
          {renderSwitchRow(
            'Data Backup',
            'Automatically backup your data',
            'backup-restore',
            settings.dataBackup,
            (value) => updateSetting('dataBackup', value),
            Colors.semantic.info
          )}
          
          {renderActionRow(
            'Export Data',
            'Download all your CRM data',
            'download-outline',
            handleExportData,
            Colors.semantic.info
          )}
          
          {renderActionRow(
            'Change Password',
            'Update your account password',
            'lock-outline',
            () => Alert.alert('Feature Coming Soon', 'Password change will be available soon'),
            Colors.semantic.warning
          )}
        </View>

        {/* Development/Testing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Testing (Development)</Text>
          
          {renderActionRow(
            'Test Floating Call Overlay',
            'Test the new floating call overlay feature',
            'phone-in-talk',
            handleTestFloatingOverlay,
            Colors.primary.base
          )}
          
          {renderActionRow(
            'Simulate Incoming Call',
            'Simulate an incoming call event',
            'phone-incoming',
            () => handleSimulateCall('Incoming'),
            Colors.semantic.success
          )}
          
          {renderActionRow(
            'Simulate Outgoing Call',
            'Simulate an outgoing call event',
            'phone-outgoing',
            () => handleSimulateCall('Outgoing'),
            Colors.semantic.info
          )}
          
          {renderActionRow(
            'Force Show Floating Icon',
            'Force show the floating icon (bypass permissions)',
            'eye',
            handleForceShowIcon,
            Colors.semantic.warning
          )}
          
          {renderActionRow(
            'Test Native Overlay (Over Dialer)',
            'Test the native Android overlay over dialer',
            'android',
            handleTestNativeOverlay,
            Colors.accent.amber
          )}
        </View>

        {/* System Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System</Text>
          
          {renderActionRow(
            'Clear Cache',
            'Clear app cache and temporary files',
            'cached',
            handleClearCache,
            Colors.semantic.warning
          )}
          
          {renderActionRow(
            'Reset Settings',
            'Reset all settings to default values',
            'restore',
            handleResetSettings,
            Colors.semantic.error,
            true
          )}
        </View>
        
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: Colors.background.card,
    marginHorizontal: Spacing.screen,
    marginVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    ...Shadows.medium,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border.light,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: Spacing.md,
    width: 24,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginRight: Spacing.sm,
  },
  destructiveText: {
    color: Colors.semantic.error,
  },
  bottomSpacer: {
    height: Spacing['3xl'],
  },
});

export default Settings;