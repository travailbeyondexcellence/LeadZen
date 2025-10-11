import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { Colors, Spacing } from '../theme';
import { 
  REQUIRED_PERMISSIONS, 
  OPTIONAL_PERMISSIONS, 
  PERMISSION_EXPLANATIONS,
  SPECIAL_PERMISSIONS,
  AUTO_GRANTED_PERMISSIONS,
  DEPRECATED_PERMISSIONS
} from '../utils/androidPermissions';
import PermissionService from '../services/PermissionService';

interface PermissionOnboardingProps {
  onComplete: (success: boolean) => void;
}

const PermissionOnboarding: React.FC<PermissionOnboardingProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [grantedPermissions, setGrantedPermissions] = useState<string[]>([]);
  const [deniedPermissions, setDeniedPermissions] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const steps = [
    {
      title: '🚀 Welcome to LeadZen',
      subtitle: 'Let\'s set up your CRM for optimal performance',
      content: 'LeadZen needs some permissions to provide you with the best experience. We\'ll walk you through each one.',
      isIntro: true,
    },
    {
      title: '📞 Essential Permissions',
      subtitle: 'Required for core CRM functionality',
      content: 'These permissions are essential for call detection, dialing, and lead management.',
      permissions: [...new Set(REQUIRED_PERMISSIONS)], // Remove duplicates
      isRequired: true,
    },
    {
      title: '✨ Enhanced Features',
      subtitle: 'Optional permissions for additional features',
      content: 'These permissions enable extra features like contact sync and photo uploads.',
      permissions: [...new Set(OPTIONAL_PERMISSIONS)], // Remove duplicates
      isRequired: false,
    },
  ];

  // Check current permission status on mount and when step changes
  useEffect(() => {
    checkCurrentPermissions();
    
    // Debug: Log all permission constants
    console.log('🔍 REQUIRED_PERMISSIONS:', REQUIRED_PERMISSIONS);
    console.log('🔍 OPTIONAL_PERMISSIONS:', OPTIONAL_PERMISSIONS);
  }, [currentStep]);

  const checkCurrentPermissions = async () => {
    try {
      console.log('🔍 Checking current permission status...');
      const status = await PermissionService.checkAllPermissions();
      console.log('📊 Current permission status:', status);
      
      setGrantedPermissions(status.granted || []);
      setDeniedPermissions(status.denied || []);
      
      console.log('✅ Granted permissions:', status.granted || []);
      console.log('❌ Denied permissions:', status.denied || []);
    } catch (error) {
      console.error('❌ Error checking current permissions:', error);
    }
  };

  const handleNext = async () => {
    if (currentStep === 0) {
      setCurrentStep(1);
      return;
    }

    const step = steps[currentStep];
    if (step.permissions && step.permissions.length > 0) {
      setIsProcessing(true);
      try {
        console.log('🔒 Requesting step permissions:', step.permissions);
        const results = await PermissionService.requestMultiplePermissions(step.permissions);
        console.log('📱 Step permission results:', results);
        
        const granted = results.granted || [];
        const denied = results.denied || [];
        const blocked = results.blocked || [];
        
        // Update granted permissions (remove duplicates)
        setGrantedPermissions(prev => {
          const filtered = prev.filter(p => !step.permissions.includes(p));
          return [...filtered, ...granted];
        });
        
        // Update denied permissions (include blocked as denied)
        setDeniedPermissions(prev => {
          const filtered = prev.filter(p => !step.permissions.includes(p));
          return [...filtered, ...denied, ...blocked];
        });
        
        if (step.isRequired && granted.length < step.permissions.length) {
          console.warn('⚠️ Some required permissions denied:', [...denied, ...blocked]);
          PermissionService.showPermissionDeniedAlert([...denied, ...blocked]);
        }
      } catch (error) {
        console.error('❌ Error requesting step permissions:', error);
      }
      setIsProcessing(false);
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Onboarding complete
      const requiredGranted = REQUIRED_PERMISSIONS.every(permission => 
        grantedPermissions.includes(permission)
      );
      onComplete(requiredGranted);
    }
  };

  const handleSkip = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(false);
    }
  };

  const handlePrevious = () => {
    console.log('🔙 HandlePrevious called, currentStep:', currentStep);
    if (currentStep > 0) {
      console.log('🔙 Going to previous step:', currentStep - 1);
      setCurrentStep(currentStep - 1);
    } else {
      console.log('🔙 Already at first step, cannot go back');
    }
  };

  const handleSwipeGesture = (event: any) => {
    const { translationX, state } = event.nativeEvent;
    
    console.log('🔄 Swipe gesture:', { translationX, state, currentStep });
    
    if (state === State.END) {
      const swipeThreshold = 50; // minimum distance for swipe
      
      if (translationX > swipeThreshold) {
        // Swipe right - go to previous step
        console.log('➡️ Swiping right - going to previous step');
        handlePrevious();
      } else if (translationX < -swipeThreshold) {
        // Swipe left - go to next step
        console.log('⬅️ Swiping left - going to next step');
        if (currentStep < steps.length - 1) {
          setCurrentStep(currentStep + 1);
        }
      }
    }
  };

  const handleGrantIndividualPermission = async (permission: string) => {
    try {
      console.log('🔒 Requesting individual permission from Android system:', permission);
      
      // First check current status
      const currentStatus = await PermissionService.checkAllPermissions();
      const currentPermissionStatus = currentStatus.granted?.includes(permission) ? 'granted' : 
                                    currentStatus.denied?.includes(permission) ? 'denied' : 'unknown';
      
      console.log('📊 Current permission status for', permission, ':', currentPermissionStatus);
      
      // If already granted, no need to request
      if (currentPermissionStatus === 'granted') {
        console.log('✅ Permission already granted:', permission);
        return;
      }
      
      // Request the specific permission from Android system
      const results = await PermissionService.requestMultiplePermissions([permission]);
      console.log('📱 Android permission result:', results);
      
      const granted = results.granted || [];
      const denied = results.denied || [];
      const blocked = results.blocked || [];
      
      if (granted.includes(permission)) {
        // Update UI to show granted state
        setGrantedPermissions(prev => {
          const filtered = prev.filter(p => p !== permission);
          return [...filtered, permission];
        });
        setDeniedPermissions(prev => prev.filter(p => p !== permission));
        console.log('✅ Individual permission granted by user:', permission);
      } else if (blocked.includes(permission)) {
        // Permission is blocked - direct user to settings
        console.log('🚫 Permission blocked, directing to settings:', permission);
        const explanation = PERMISSION_EXPLANATIONS[permission];
        Alert.alert(
          '⚙️ Permission Blocked',
          `${explanation?.title || 'This permission'} has been permanently denied. Please grant it manually in Android Settings.`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Open Settings', 
              onPress: () => PermissionService.openAppSettings() 
            }
          ]
        );
        
        // Still update UI to show denied state
        setDeniedPermissions(prev => {
          const filtered = prev.filter(p => p !== permission);
          return [...filtered, permission];
        });
        setGrantedPermissions(prev => prev.filter(p => p !== permission));
      } else if (denied.includes(permission)) {
        // Update UI to show denied state
        setDeniedPermissions(prev => {
          const filtered = prev.filter(p => p !== permission);
          return [...filtered, permission];
        });
        setGrantedPermissions(prev => prev.filter(p => p !== permission));
        console.log('❌ Individual permission denied by user:', permission);
      }
      
      // Refresh permission status to ensure accuracy
      await checkCurrentPermissions();
      
    } catch (error) {
      console.error('❌ Error requesting individual permission:', error);
    }
  };

  const renderPermissionItem = (permission: string, index: number) => {
    const explanation = PERMISSION_EXPLANATIONS[permission];
    const isGranted = grantedPermissions.includes(permission);
    const isDenied = deniedPermissions.includes(permission);
    
    let permissionStyle = styles.permissionItem;
    let statusIcon = '';
    let statusText = '';
    let statusStyle = styles.permissionStatus;
    
    if (isGranted) {
      permissionStyle = [styles.permissionItem, styles.permissionItemGranted];
      statusIcon = '✅';
      statusText = 'Granted';
      statusStyle = [styles.permissionStatus, styles.permissionStatusGranted];
    } else {
      // Show warning state for any non-granted permission
      permissionStyle = [styles.permissionItem, styles.permissionItemDenied];
      statusIcon = '⚠️';
      statusText = 'Not Granted';
      statusStyle = [styles.permissionStatus, styles.permissionStatusDenied];
    }
    
    return (
      <View key={`permission-${index}-${permission}`} style={permissionStyle}>
        <View style={styles.permissionHeader}>
          <Text style={styles.permissionTitle}>
            {explanation?.title || 'Permission'}
          </Text>
          <View style={styles.permissionStatusContainer}>
            <Text style={statusStyle}>
              {statusIcon} {statusText}
            </Text>
          </View>
        </View>
        <Text style={styles.permissionDescription}>
          {explanation?.description || 'Required for app functionality'}
        </Text>
        
        {!isGranted && (
          <TouchableOpacity
            style={styles.grantNowButton}
            onPress={() => handleGrantIndividualPermission(permission)}
          >
            <Text style={styles.grantNowButtonText}>Grant Now</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderStep = () => {
    const step = steps[currentStep];
    
    // Debug: Check for duplicate permissions and undefined values
    if (step.permissions) {
      console.log('📋 Rendering step permissions:', step.permissions);
      const duplicates = step.permissions.filter((item, index) => step.permissions.indexOf(item) !== index);
      if (duplicates.length > 0) {
        console.warn('⚠️ Duplicate permissions found:', duplicates);
      }
      const undefinedPerms = step.permissions.filter(item => item === undefined || item === null);
      if (undefinedPerms.length > 0) {
        console.error('❌ Undefined permissions found:', undefinedPerms);
        console.error('❌ Full permissions array:', step.permissions);
      }
    }
    
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>{step.title}</Text>
        <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
        <Text style={styles.stepContent}>{step.content}</Text>
        
        {step.permissions && (
          <View style={styles.permissionsContainer}>
            {step.permissions
              .filter(permission => permission !== undefined && permission !== null)
              .map((permission, index) => renderPermissionItem(permission, index))}
          </View>
        )}
        
        <View style={styles.buttonContainer}>
          {!step.isIntro && !step.isRequired && (
            <TouchableOpacity 
              style={styles.skipButton} 
              onPress={handleSkip}
              disabled={isProcessing}
            >
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[styles.nextButton, isProcessing && styles.disabledButton]} 
            onPress={handleNext}
            disabled={isProcessing}
          >
            <Text style={styles.nextButtonText}>
              {isProcessing ? 'Processing...' : 
               currentStep === steps.length - 1 ? 'Complete Setup' :
               step.isIntro ? 'Get Started' : 'Grant Permissions'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#14B8A6" />
      
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          {steps.map((_, index) => (
            <View 
              key={`progress-dot-${index}`}
              style={[
                styles.progressDot,
                index <= currentStep && styles.progressDotActive
              ]} 
            />
          ))}
        </View>
      </View>
      
      <PanGestureHandler 
        onHandlerStateChange={handleSwipeGesture}
        minPointers={1}
        maxPointers={1}
        shouldCancelWhenOutside={false}
      >
        <View style={styles.gestureContainer}>
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {renderStep()}
          </ScrollView>
        </View>
      </PanGestureHandler>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#14B8A6',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 6,
  },
  progressDotActive: {
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  gestureContainer: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: 20,
    minHeight: '100%',
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#14B8A6',
    textAlign: 'center',
    marginBottom: 16,
  },
  stepContent: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  permissionsContainer: {
    width: '100%',
    marginBottom: 32,
  },
  permissionItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  permissionItemGranted: {
    backgroundColor: '#F0FDF4', // Light green background
    borderColor: '#22C55E',
    borderWidth: 1,
  },
  permissionItemDenied: {
    backgroundColor: '#FFFBEB', // Light yellow background
    borderColor: '#F59E0B',
    borderWidth: 1,
  },
  permissionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },
  permissionStatusContainer: {
    flexShrink: 0,
  },
  permissionStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  permissionStatusGranted: {
    color: '#059669',
  },
  permissionStatusDenied: {
    color: '#D97706',
  },
  permissionDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  grantNowButton: {
    backgroundColor: '#14B8A6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  grantNowButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 16,
    marginRight: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },
  nextButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#14B8A6',
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 4,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default PermissionOnboarding;