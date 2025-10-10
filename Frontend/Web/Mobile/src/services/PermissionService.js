import { 
  requestMultiple, 
  checkMultiple, 
  RESULTS,
  openSettings 
} from 'react-native-permissions';
import { Alert, Linking } from 'react-native';
import { 
  ALL_PERMISSIONS, 
  REQUIRED_PERMISSIONS, 
  PERMISSION_EXPLANATIONS 
} from '../utils/androidPermissions';

class PermissionService {
  constructor() {
    this.permissionStatus = {};
  }

  async checkAllPermissions() {
    try {
      console.log('🔍 Checking all permissions...');
      const results = await checkMultiple(ALL_PERMISSIONS);
      this.permissionStatus = results;
      
      console.log('📋 Permission Status:', results);
      return this.analyzePermissionResults(results);
    } catch (error) {
      console.error('❌ Error checking permissions:', error);
      return { granted: [], denied: ALL_PERMISSIONS };
    }
  }

  async requestAllPermissions() {
    try {
      console.log('🔒 Requesting all permissions...');
      const results = await requestMultiple(ALL_PERMISSIONS);
      this.permissionStatus = results;
      
      console.log('📝 Permission Request Results:', results);
      return this.analyzePermissionResults(results);
    } catch (error) {
      console.error('❌ Error requesting permissions:', error);
      return { granted: [], denied: ALL_PERMISSIONS };
    }
  }

  async requestRequiredPermissions() {
    try {
      console.log('🔒 Requesting required permissions...');
      const results = await requestMultiple(REQUIRED_PERMISSIONS);
      
      const analysis = this.analyzePermissionResults(results);
      
      if (analysis.denied.length > 0) {
        console.warn('⚠️ Some required permissions denied:', analysis.denied);
        this.showPermissionDeniedAlert(analysis.denied);
      } else {
        console.log('✅ All required permissions granted!');
      }
      
      return analysis;
    } catch (error) {
      console.error('❌ Error requesting required permissions:', error);
      return { granted: [], denied: REQUIRED_PERMISSIONS };
    }
  }

  analyzePermissionResults(results) {
    const granted = [];
    const denied = [];
    const blocked = [];
    
    Object.keys(results).forEach(permission => {
      switch (results[permission]) {
        case RESULTS.GRANTED:
          granted.push(permission);
          console.log('✅ Permission granted:', permission);
          break;
        case RESULTS.DENIED:
          denied.push(permission);
          console.log('❌ Permission denied:', permission);
          break;
        case RESULTS.BLOCKED:
          blocked.push(permission);
          console.log('🚫 Permission blocked:', permission);
          break;
        case RESULTS.UNAVAILABLE:
          console.log('📱 Permission unavailable:', permission);
          break;
      }
    });

    return { granted, denied, blocked };
  }

  areRequiredPermissionsGranted() {
    const grantedPermissions = Object.keys(this.permissionStatus).filter(
      permission => this.permissionStatus[permission] === RESULTS.GRANTED
    );
    
    const requiredGranted = REQUIRED_PERMISSIONS.every(permission => 
      grantedPermissions.includes(permission)
    );
    
    console.log('🔍 Required permissions granted:', requiredGranted);
    return requiredGranted;
  }

  showPermissionDeniedAlert(deniedPermissions) {
    const permissionNames = deniedPermissions.map(permission => 
      PERMISSION_EXPLANATIONS[permission]?.title || permission
    ).join(', ');

    Alert.alert(
      '🔒 Permissions Required',
      `The following permissions are required for the app to function properly:\n\n${permissionNames}\n\nWould you like to open settings to grant these permissions?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Open Settings',
          onPress: () => this.openAppSettings(),
        },
      ]
    );
  }

  async openAppSettings() {
    try {
      console.log('⚙️ Opening app settings...');
      await openSettings();
    } catch (error) {
      console.error('❌ Error opening settings:', error);
      // Fallback to general settings
      Linking.openSettings();
    }
  }

  getPermissionExplanation(permission) {
    return PERMISSION_EXPLANATIONS[permission] || {
      title: 'Permission',
      description: 'Required for app functionality',
      required: false,
    };
  }

  async initializePermissions() {
    console.log('🚀 Initializing permission service...');
    
    const status = await this.checkAllPermissions();
    
    if (!this.areRequiredPermissionsGranted()) {
      console.log('⚠️ Required permissions not granted, requesting...');
      return await this.requestRequiredPermissions();
    }
    
    console.log('✅ All required permissions already granted');
    return status;
  }
}

export default new PermissionService();