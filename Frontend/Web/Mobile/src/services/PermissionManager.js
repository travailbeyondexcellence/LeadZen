import { PermissionsAndroid, Alert, Linking, Platform } from 'react-native';

class PermissionManager {
  constructor() {
    this.requiredPermissions = {
      SYSTEM_ALERT_WINDOW: 'android.permission.SYSTEM_ALERT_WINDOW',
      READ_PHONE_STATE: PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
      CALL_PHONE: PermissionsAndroid.PERMISSIONS.CALL_PHONE,
      READ_CONTACTS: PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
      RECORD_AUDIO: PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    };
  }

  /**
   * Check if all required permissions are granted
   * @returns {Promise<Object>} - Permission status object
   */
  async checkAllPermissions() {
    try {
      const permissions = {};
      
      // Check standard Android permissions
      const standardPermissions = [
        this.requiredPermissions.READ_PHONE_STATE,
        this.requiredPermissions.CALL_PHONE,
        this.requiredPermissions.READ_CONTACTS,
      ];

      for (const permission of standardPermissions) {
        try {
          const granted = await PermissionsAndroid.check(permission);
          permissions[permission] = granted;
          console.log(`[PERMISSIONS] ${permission}: ${granted ? 'GRANTED' : 'DENIED'}`);
        } catch (error) {
          console.error(`[PERMISSIONS] Error checking ${permission}:`, error);
          permissions[permission] = false;
        }
      }

      // Check system alert window permission (special case)
      // Note: This requires a different API check for Android 6+
      permissions[this.requiredPermissions.SYSTEM_ALERT_WINDOW] = await this.checkSystemAlertWindowPermission();

      const allGranted = Object.values(permissions).every(granted => granted === true);
      
      console.log('[PERMISSIONS] All permissions status:', permissions);
      console.log('[PERMISSIONS] All granted:', allGranted);

      return {
        permissions,
        allGranted,
        missingPermissions: Object.keys(permissions).filter(key => !permissions[key])
      };
    } catch (error) {
      console.error('[PERMISSIONS] Error checking permissions:', error);
      return {
        permissions: {},
        allGranted: false,
        missingPermissions: Object.keys(this.requiredPermissions),
        error: error.message
      };
    }
  }

  /**
   * Check system alert window permission specifically
   * @returns {Promise<boolean>} - Whether permission is granted
   */
  async checkSystemAlertWindowPermission() {
    try {
      // For now, we'll assume this needs to be checked via native module
      // This is a placeholder - actual implementation would need native bridge
      console.log('[PERMISSIONS] System Alert Window permission check - placeholder');
      return true; // Temporary - will implement native check later
    } catch (error) {
      console.error('[PERMISSIONS] Error checking system alert window:', error);
      return false;
    }
  }

  /**
   * Request all floating call overlay permissions
   * @returns {Promise<Object>} - Request results
   */
  async requestFloatingCallPermissions() {
    try {
      console.log('[PERMISSIONS] Requesting floating call permissions...');

      // Request standard permissions
      const standardPermissions = [
        this.requiredPermissions.READ_PHONE_STATE,
        this.requiredPermissions.CALL_PHONE,
        this.requiredPermissions.READ_CONTACTS,
      ];

      const permissionResults = {};

      // Request permissions one by one for better user experience
      for (const permission of standardPermissions) {
        try {
          const granted = await PermissionsAndroid.request(permission, {
            title: this.getPermissionTitle(permission),
            message: this.getPermissionMessage(permission),
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          });

          permissionResults[permission] = granted === PermissionsAndroid.RESULTS.GRANTED;
          console.log(`[PERMISSIONS] ${permission} result:`, granted);
        } catch (error) {
          console.error(`[PERMISSIONS] Error requesting ${permission}:`, error);
          permissionResults[permission] = false;
        }
      }

      // Handle system alert window permission separately
      const systemAlertGranted = await this.requestSystemAlertWindowPermission();
      permissionResults[this.requiredPermissions.SYSTEM_ALERT_WINDOW] = systemAlertGranted;

      const allGranted = Object.values(permissionResults).every(granted => granted === true);

      console.log('[PERMISSIONS] Request results:', permissionResults);
      console.log('[PERMISSIONS] All granted:', allGranted);

      return {
        results: permissionResults,
        allGranted,
        deniedPermissions: Object.keys(permissionResults).filter(key => !permissionResults[key])
      };
    } catch (error) {
      console.error('[PERMISSIONS] Error requesting permissions:', error);
      return {
        results: {},
        allGranted: false,
        deniedPermissions: Object.keys(this.requiredPermissions),
        error: error.message
      };
    }
  }

  /**
   * Request system alert window permission with user guidance
   * @returns {Promise<boolean>} - Whether permission was granted
   */
  async requestSystemAlertWindowPermission() {
    return new Promise((resolve) => {
      Alert.alert(
        'Display Over Other Apps',
        'LeadZen needs permission to display floating call information over other apps. This allows you to see lead details during phone calls.\n\nTap OK to open settings and enable this permission.',
        [
          {
            text: 'Cancel',
            onPress: () => {
              console.log('[PERMISSIONS] System alert window permission denied by user');
              resolve(false);
            },
            style: 'cancel',
          },
          {
            text: 'OK',
            onPress: () => {
              console.log('[PERMISSIONS] Opening settings for system alert window permission');
              // Open app settings
              Linking.openSettings();
              // For now, assume user will grant permission
              // In real implementation, we'd need to check permission again
              resolve(true);
            },
          },
        ],
        { cancelable: false }
      );
    });
  }

  /**
   * Get user-friendly title for permission request
   * @param {string} permission - Permission constant
   * @returns {string} - User-friendly title
   */
  getPermissionTitle(permission) {
    switch (permission) {
      case this.requiredPermissions.READ_PHONE_STATE:
        return 'Phone Access';
      case this.requiredPermissions.CALL_PHONE:
        return 'Make Phone Calls';
      case this.requiredPermissions.READ_CONTACTS:
        return 'Access Contacts';
      default:
        return 'Permission Required';
    }
  }

  /**
   * Get user-friendly message for permission request
   * @param {string} permission - Permission constant
   * @returns {string} - User-friendly message
   */
  getPermissionMessage(permission) {
    switch (permission) {
      case this.requiredPermissions.READ_PHONE_STATE:
        return 'LeadZen needs to detect incoming and outgoing calls to show relevant lead information during conversations.';
      case this.requiredPermissions.CALL_PHONE:
        return 'LeadZen needs to make phone calls directly from the app to contact your leads quickly.';
      case this.requiredPermissions.READ_CONTACTS:
        return 'LeadZen can match incoming calls with your contacts to provide better lead context.';
      default:
        return 'This permission is required for the floating call overlay feature to work properly.';
    }
  }

  /**
   * Show permission denied guidance to user
   * @param {Array} deniedPermissions - List of denied permissions
   */
  showPermissionDeniedGuidance(deniedPermissions) {
    if (deniedPermissions.length === 0) return;

    const permissionNames = deniedPermissions.map(permission => 
      this.getPermissionTitle(permission)
    ).join(', ');

    Alert.alert(
      'Permissions Required',
      `The following permissions are needed for the floating call overlay feature:\n\n${permissionNames}\n\nYou can enable these in Settings > Apps > LeadZen > Permissions`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Open Settings', 
          onPress: () => Linking.openSettings() 
        }
      ]
    );
  }

  /**
   * Validate permissions and guide user if needed
   * @returns {Promise<boolean>} - Whether all permissions are available
   */
  async validatePermissions() {
    const permissionStatus = await this.checkAllPermissions();
    
    if (!permissionStatus.allGranted) {
      console.log('[PERMISSIONS] Missing permissions:', permissionStatus.missingPermissions);
      this.showPermissionDeniedGuidance(permissionStatus.missingPermissions);
      return false;
    }
    
    console.log('[PERMISSIONS] All permissions validated successfully');
    return true;
  }

  /**
   * Get permission status for specific permission
   * @param {string} permission - Permission to check
   * @returns {Promise<boolean>} - Whether permission is granted
   */
  async hasPermission(permission) {
    try {
      if (permission === this.requiredPermissions.SYSTEM_ALERT_WINDOW) {
        return await this.checkSystemAlertWindowPermission();
      }
      
      return await PermissionsAndroid.check(permission);
    } catch (error) {
      console.error(`[PERMISSIONS] Error checking ${permission}:`, error);
      return false;
    }
  }
}

export default new PermissionManager();