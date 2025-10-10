import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import PermissionService from '../services/PermissionService';
import { PERMISSION_EXPLANATIONS, REQUIRED_PERMISSIONS } from '../utils/androidPermissions';

interface Props {
  navigation: any;
  onPermissionsGranted?: () => void;
}

const PermissionRequest: React.FC<Props> = ({ navigation, onPermissionsGranted }) => {
  const [loading, setLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<any>({});

  useEffect(() => {
    checkCurrentPermissions();
  }, []);

  const checkCurrentPermissions = async () => {
    try {
      const status = await PermissionService.checkAllPermissions();
      setPermissionStatus(status);
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  };

  const handleGrantPermissions = async () => {
    setLoading(true);
    
    try {
      const result = await PermissionService.requestRequiredPermissions();
      
      if (result.granted.length === REQUIRED_PERMISSIONS.length) {
        Alert.alert(
          '✅ Success!',
          'All required permissions have been granted. You can now use all features of the app.',
          [
            {
              text: 'Continue',
              onPress: () => {
                if (onPermissionsGranted) {
                  onPermissionsGranted();
                } else {
                  navigation.goBack();
                }
              },
            },
          ]
        );
      } else {
        Alert.alert(
          '⚠️ Permissions Required',
          'Some permissions were not granted. The app may not function properly without these permissions.',
          [
            {
              text: 'Try Again',
              onPress: () => handleGrantPermissions(),
            },
            {
              text: 'Continue Anyway',
              onPress: () => {
                if (onPermissionsGranted) {
                  onPermissionsGranted();
                } else {
                  navigation.goBack();
                }
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      Alert.alert('Error', 'Failed to request permissions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLearnMore = () => {
    Alert.alert(
      '📖 Why We Need These Permissions',
      `LeadZen is designed to help you manage your leads during phone calls. Here's why each permission is important:

📞 Phone Access: Detects when you receive or make calls to show relevant lead information.

🎯 Overlay Permission: Displays lead information on top of other apps during calls without interrupting your conversation.

📱 Call Management: Allows the app to properly detect call states and manage call-related features.

👥 Contacts Access: Matches incoming calls with your existing leads and contacts for better organization.

🔒 Your privacy is important to us. We only use these permissions for the intended features and never share your data with third parties.`,
      [{ text: 'Got It', style: 'default' }]
    );
  };

  const renderPermissionItem = (permission: string) => {
    const explanation = PERMISSION_EXPLANATIONS[permission];
    const isGranted = permissionStatus.granted?.includes(permission);
    const isRequired = REQUIRED_PERMISSIONS.includes(permission);

    return (
      <View key={permission} style={styles.permissionItem}>
        <View style={styles.permissionHeader}>
          <Text style={styles.permissionTitle}>{explanation.title}</Text>
          {isRequired && <Text style={styles.requiredBadge}>Required</Text>}
          {isGranted && <Text style={styles.grantedBadge}>✅ Granted</Text>}
        </View>
        <Text style={styles.permissionDescription}>{explanation.description}</Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.headerIcon}>🔒</Text>
        <Text style={styles.headerTitle}>Permissions Required</Text>
        <Text style={styles.headerSubtitle}>
          LeadZen needs these permissions to provide you with the best lead management experience during calls.
        </Text>
      </View>

      <View style={styles.permissionsContainer}>
        {REQUIRED_PERMISSIONS.map(renderPermissionItem)}
      </View>

      <View style={styles.warningContainer}>
        <Text style={styles.warningIcon}>⚠️</Text>
        <Text style={styles.warningText}>
          These permissions are required for core app functionality. Without them, some features may not work properly.
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleGrantPermissions}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>Grant Permissions</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handleLearnMore}
          disabled={loading}
        >
          <Text style={styles.secondaryButtonText}>Learn More</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.skipButton}
        onPress={() => {
          if (onPermissionsGranted) {
            onPermissionsGranted();
          } else {
            navigation.goBack();
          }
        }}
        disabled={loading}
      >
        <Text style={styles.skipButtonText}>Skip for Now</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  headerIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
  },
  permissionsContainer: {
    marginBottom: 20,
  },
  permissionItem: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  permissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
  },
  requiredBadge: {
    backgroundColor: '#FF3B30',
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  grantedBadge: {
    backgroundColor: '#34C759',
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  permissionDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  warningContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF3CD',
    padding: 16,
    borderRadius: 10,
    marginBottom: 30,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  warningIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#F8F9FA',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipButtonText: {
    color: '#999999',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default PermissionRequest;