import { useState, useCallback, useRef } from 'react';
import PermissionService from '../services/PermissionService';

interface UsePermissionReturn {
  checkPermissionAndPrompt: (permission: string, featureName: string) => Promise<boolean>;
  modalVisible: boolean;
  modalData: {
    permission: string;
    featureName: string;
  } | null;
  closeModal: () => void;
}

export const usePermission = (): UsePermissionReturn => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState<{
    permission: string;
    featureName: string;
  } | null>(null);
  
  // Cache permission status to avoid repeated checks
  const permissionCache = useRef<Record<string, { granted: boolean; lastChecked: number }>>({});

  const checkPermissionAndPrompt = useCallback(async (
    permission: string, 
    featureName: string
  ): Promise<boolean> => {
    try {
      const now = Date.now();
      const cached = permissionCache.current[permission];
      
      // Use cache if permission was checked recently (within 5 seconds)
      if (cached && (now - cached.lastChecked) < 5000) {
        if (cached.granted) {
          return true;
        } else if (!modalVisible) {
          // Only show modal if not already visible
          console.log('🔒 Permission needed, showing modal:', permission, featureName);
          setModalData({ permission, featureName });
          setModalVisible(true);
        }
        return false;
      }
      
      // Check permission status
      const status = await PermissionService.checkAllPermissions();
      const isGranted = status.granted?.includes(permission) || false;
      
      // Update cache
      permissionCache.current[permission] = {
        granted: isGranted,
        lastChecked: now,
      };
      
      if (isGranted) {
        console.log('✅ Permission already granted:', permission);
        return true;
      }
      
      // Show modal to request permission (only if not already visible)
      if (!modalVisible) {
        console.log('🔒 Permission needed, showing modal:', permission, featureName);
        setModalData({ permission, featureName });
        setModalVisible(true);
      }
      
      return false; // Permission not granted yet
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }, [modalVisible]);

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setModalData(null);
  }, []);

  const handlePermissionGranted = useCallback((permission: string) => {
    // Update cache when permission is granted
    permissionCache.current[permission] = {
      granted: true,
      lastChecked: Date.now(),
    };
  }, []);

  return {
    checkPermissionAndPrompt,
    modalVisible,
    modalData,
    closeModal,
    handlePermissionGranted,
  };
};

export default usePermission;