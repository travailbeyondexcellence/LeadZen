import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Colors, Spacing } from '../theme';
import { 
  REQUIRED_PERMISSIONS, 
  OPTIONAL_PERMISSIONS, 
  PERMISSION_EXPLANATIONS 
} from '../utils/androidPermissions';
import PermissionService from '../services/PermissionService';

interface PermissionOnboardingProps {
  onComplete: (success: boolean) => void;
}

const PermissionOnboarding: React.FC<PermissionOnboardingProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [grantedPermissions, setGrantedPermissions] = useState<string[]>([]);
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
      permissions: REQUIRED_PERMISSIONS,
      isRequired: true,
    },
    {
      title: '✨ Enhanced Features',
      subtitle: 'Optional permissions for additional features',
      content: 'These permissions enable extra features like contact sync and photo uploads.',
      permissions: OPTIONAL_PERMISSIONS,
      isRequired: false,
    },
  ];

  const handleNext = async () => {
    if (currentStep === 0) {
      setCurrentStep(1);
      return;
    }

    const step = steps[currentStep];
    if (step.permissions && step.permissions.length > 0) {
      setIsProcessing(true);
      try {
        const results = await PermissionService.requestMultiplePermissions(step.permissions);
        const granted = results.granted || [];
        setGrantedPermissions(prev => [...prev, ...granted]);
        
        if (step.isRequired && granted.length < step.permissions.length) {
          // Show alert for required permissions
          PermissionService.showPermissionDeniedAlert(results.denied || []);
        }
      } catch (error) {
        console.error('Error requesting permissions:', error);
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

  const renderPermissionItem = (permission: string) => {
    const explanation = PERMISSION_EXPLANATIONS[permission];
    const isGranted = grantedPermissions.includes(permission);
    
    return (
      <View key={permission} style={styles.permissionItem}>
        <View style={styles.permissionHeader}>
          <Text style={styles.permissionTitle}>
            {explanation?.title || 'Permission'}
          </Text>
          {isGranted && <Text style={styles.grantedBadge}>✅ Granted</Text>}
        </View>
        <Text style={styles.permissionDescription}>
          {explanation?.description || 'Required for app functionality'}
        </Text>
      </View>
    );
  };

  const renderStep = () => {
    const step = steps[currentStep];
    
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>{step.title}</Text>
        <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
        <Text style={styles.stepContent}>{step.content}</Text>
        
        {step.permissions && (
          <View style={styles.permissionsContainer}>
            {step.permissions.map(renderPermissionItem)}
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
              key={index}
              style={[
                styles.progressDot,
                index <= currentStep && styles.progressDotActive
              ]} 
            />
          ))}
        </View>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderStep()}
      </ScrollView>
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
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  grantedBadge: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  permissionDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
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