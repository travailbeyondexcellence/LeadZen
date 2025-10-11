import { PERMISSIONS } from 'react-native-permissions';

export const ANDROID_PERMISSIONS = {
  READ_PHONE_STATE: PERMISSIONS.ANDROID.READ_PHONE_STATE,
  CALL_PHONE: PERMISSIONS.ANDROID.CALL_PHONE,
  ANSWER_PHONE_CALLS: PERMISSIONS.ANDROID.ANSWER_PHONE_CALLS,
  SYSTEM_ALERT_WINDOW: PERMISSIONS.ANDROID.SYSTEM_ALERT_WINDOW,
  READ_CONTACTS: PERMISSIONS.ANDROID.READ_CONTACTS,
  WRITE_EXTERNAL_STORAGE: PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
  CAMERA: PERMISSIONS.ANDROID.CAMERA,
  VIBRATE: PERMISSIONS.ANDROID.VIBRATE,
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
    description: 'To show lead popup during active calls without interrupting you',
    required: true,
  },
  [ANDROID_PERMISSIONS.READ_CONTACTS]: {
    title: '👥 Contacts Access',
    description: 'To match incoming calls with your existing leads and contacts',
    required: false,
  },
  [ANDROID_PERMISSIONS.WRITE_EXTERNAL_STORAGE]: {
    title: '💾 Storage Access',
    description: 'To save lead photos and documents',
    required: false,
  },
  [ANDROID_PERMISSIONS.CAMERA]: {
    title: '📸 Camera Access',
    description: 'To take photos for lead profiles',
    required: false,
  },
  [ANDROID_PERMISSIONS.VIBRATE]: {
    title: '📳 Vibration',
    description: 'To provide haptic feedback when dialing',
    required: true,
  },
};

export const REQUIRED_PERMISSIONS = [
  ANDROID_PERMISSIONS.READ_PHONE_STATE,
  ANDROID_PERMISSIONS.CALL_PHONE,
  ANDROID_PERMISSIONS.ANSWER_PHONE_CALLS,
  ANDROID_PERMISSIONS.SYSTEM_ALERT_WINDOW,
  ANDROID_PERMISSIONS.VIBRATE,
];

export const OPTIONAL_PERMISSIONS = [
  ANDROID_PERMISSIONS.READ_CONTACTS,
  ANDROID_PERMISSIONS.WRITE_EXTERNAL_STORAGE,
  ANDROID_PERMISSIONS.CAMERA,
];

export const ALL_PERMISSIONS = [
  ...REQUIRED_PERMISSIONS,
  ...OPTIONAL_PERMISSIONS,
];