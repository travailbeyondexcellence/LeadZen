import { PERMISSIONS } from 'react-native-permissions';

export const ANDROID_PERMISSIONS = {
  READ_PHONE_STATE: PERMISSIONS.ANDROID.READ_PHONE_STATE,
  CALL_PHONE: PERMISSIONS.ANDROID.CALL_PHONE,
  ANSWER_PHONE_CALLS: PERMISSIONS.ANDROID.ANSWER_PHONE_CALLS,
  SYSTEM_ALERT_WINDOW: 'android.permission.SYSTEM_ALERT_WINDOW',
  READ_CONTACTS: PERMISSIONS.ANDROID.READ_CONTACTS,
  WRITE_EXTERNAL_STORAGE: PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
  CAMERA: PERMISSIONS.ANDROID.CAMERA,
  VIBRATE: 'android.permission.VIBRATE',
};

export const PERMISSION_EXPLANATIONS = {
  [ANDROID_PERMISSIONS.READ_PHONE_STATE]: {
    title: '📞 Phone Access',
    description: 'To display lead information during calls and track call history',
    required: true,
  },
  [ANDROID_PERMISSIONS.CALL_PHONE]: {
    title: '📱 Make Calls',
    description: 'To initiate calls directly from the app to your leads',
    required: true,
  },
  [ANDROID_PERMISSIONS.ANSWER_PHONE_CALLS]: {
    title: '📲 Answer Calls',
    description: 'To detect and manage incoming calls from leads',
    required: true,
  },
  [ANDROID_PERMISSIONS.SYSTEM_ALERT_WINDOW]: {
    title: '🎯 Overlay Permission',
    description: 'Special permission - enable in Settings > Special app access > Display over other apps',
    required: true,
    special: true,
  },
  [ANDROID_PERMISSIONS.READ_CONTACTS]: {
    title: '👥 Contacts Access',
    description: 'To match incoming calls with your existing leads and contacts',
    required: false,
  },
  [ANDROID_PERMISSIONS.WRITE_EXTERNAL_STORAGE]: {
    title: '💾 Storage Access',
    description: 'Deprecated in Android 10+ - app uses scoped storage instead',
    required: false,
    deprecated: true,
  },
  [ANDROID_PERMISSIONS.CAMERA]: {
    title: '📸 Camera Access',
    description: 'To take photos for lead profiles',
    required: false,
  },
  [ANDROID_PERMISSIONS.VIBRATE]: {
    title: '📳 Vibration',
    description: 'Auto-granted by Android - provides haptic feedback when dialing',
    required: false,
    autoGranted: true,
  },
};

export const REQUIRED_PERMISSIONS = [
  ANDROID_PERMISSIONS.READ_PHONE_STATE,
  ANDROID_PERMISSIONS.CALL_PHONE,
  ANDROID_PERMISSIONS.ANSWER_PHONE_CALLS,
  // Note: SYSTEM_ALERT_WINDOW requires special handling
  // ANDROID_PERMISSIONS.SYSTEM_ALERT_WINDOW,
  // Note: VIBRATE is auto-granted, doesn't need user permission
  // ANDROID_PERMISSIONS.VIBRATE,
];

export const OPTIONAL_PERMISSIONS = [
  ANDROID_PERMISSIONS.READ_CONTACTS,
  // Note: WRITE_EXTERNAL_STORAGE is deprecated in Android 10+
  // ANDROID_PERMISSIONS.WRITE_EXTERNAL_STORAGE,
  ANDROID_PERMISSIONS.CAMERA,
];

// Special permissions that need different handling
export const SPECIAL_PERMISSIONS = [
  ANDROID_PERMISSIONS.SYSTEM_ALERT_WINDOW, // Requires Settings > Special app access > Display over other apps
];

// Auto-granted permissions (don't need user approval)
export const AUTO_GRANTED_PERMISSIONS = [
  ANDROID_PERMISSIONS.VIBRATE, // Normal permission, auto-granted
];

// Deprecated permissions (not needed in modern Android)
export const DEPRECATED_PERMISSIONS = [
  ANDROID_PERMISSIONS.WRITE_EXTERNAL_STORAGE, // Use scoped storage instead
];

export const ALL_PERMISSIONS = [
  ...REQUIRED_PERMISSIONS,
  ...OPTIONAL_PERMISSIONS,
  // Don't include special or auto-granted permissions in regular flow
];