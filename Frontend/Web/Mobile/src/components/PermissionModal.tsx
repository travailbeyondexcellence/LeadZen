import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import PermissionService from '../services/PermissionService';
import { PERMISSION_EXPLANATIONS } from '../utils/androidPermissions';

interface PermissionModalProps {
  visible: boolean;
  permission: string;
  featureName: string;
  onClose: () => void;
  onGranted?: () => void;
}

const PermissionModal: React.FC<PermissionModalProps> = ({
  visible,
  permission,
  featureName,
  onClose,
  onGranted,
}) => {
  const explanation = PERMISSION_EXPLANATIONS[permission];

  const handleGrantPermission = async () => {
    try {
      const results = await PermissionService.requestMultiplePermissions([permission]);
      
      if (results.granted && results.granted.includes(permission)) {
        console.log('✅ Permission granted:', permission);
        onGranted?.();
        onClose();
      } else {
        console.log('❌ Permission denied:', permission);
        // Still close modal but don't call onGranted
        onClose();
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      onClose();
    }
  };

  const handleOpenSettings = () => {
    PermissionService.openAppSettings();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.modalContainer}>
            <View style={styles.header}>
              <Text style={styles.icon}>🔒</Text>
              <Text style={styles.title}>Permission Required</Text>
            </View>

            <View style={styles.content}>
              <Text style={styles.featureText}>
                The <Text style={styles.featureName}>{featureName}</Text> feature requires permission to access:
              </Text>
              
              <View style={styles.permissionCard}>
                <Text style={styles.permissionTitle}>
                  {explanation?.title || 'Permission'}
                </Text>
                <Text style={styles.permissionDescription}>
                  {explanation?.description || 'Required for app functionality'}
                </Text>
              </View>

              <Text style={styles.explanation}>
                Please grant this permission to enable the {featureName} feature.
              </Text>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.grantButton}
                onPress={handleGrantPermission}
              >
                <Text style={styles.grantButtonText}>Grant Permission</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.settingsButton}
              onPress={handleOpenSettings}
            >
              <Text style={styles.settingsButtonText}>Open Settings</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  icon: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
  },
  content: {
    marginBottom: 24,
  },
  featureText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  featureName: {
    fontWeight: '600',
    color: '#14B8A6',
  },
  permissionCard: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#14B8A6',
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  permissionDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  explanation: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },
  grantButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#14B8A6',
  },
  grantButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  settingsButton: {
    paddingVertical: 8,
  },
  settingsButtonText: {
    fontSize: 14,
    color: '#14B8A6',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});

export default PermissionModal;