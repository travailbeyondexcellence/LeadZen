import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import { initializeDatabase } from './src/utils/dbInit';
import PermissionService from './src/services/PermissionService';
import CallDetectionService from './src/services/CallDetectionService';
import CallOverlay from './src/components/CallOverlay';
import ErrorBoundary from './src/components/ErrorBoundary';
import PermissionOnboarding from './src/components/PermissionOnboarding';
import { FloatingCallManager } from './src/components/FloatingCallManager';
import { PerformanceMonitor } from './src/utils/performance';

function App(): React.JSX.Element {
  const [isDbReady, setIsDbReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [servicesReady, setServicesReady] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingChecked, setOnboardingChecked] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        PerformanceMonitor.startMeasurement('App Initialization');
        console.log('🚀 Initializing LeadZen app...');
        
        // Step 1: Initialize database
        console.log('📊 Initializing database...');
        const dbSuccess = await PerformanceMonitor.measureAsync(
          'Database Initialization',
          () => initializeDatabase()
        );
        if (!dbSuccess) {
          setDbError('Failed to initialize database');
          return;
        }
        setIsDbReady(true);
        
        // Step 2: Check if onboarding is needed
        console.log('🔍 Checking if permission onboarding is needed...');
        const needsOnboarding = await PermissionService.needsOnboarding();
        setOnboardingChecked(true);
        
        if (needsOnboarding) {
          console.log('📱 Showing permission onboarding...');
          setShowOnboarding(true);
          return; // Don't continue with service initialization until onboarding is complete
        }
        
        // Step 3: Initialize permissions (if onboarding already completed)
        console.log('🔒 Initializing permissions...');
        await PerformanceMonitor.measureAsync(
          'Permissions Initialization',
          () => PermissionService.initializePermissions()
        );
        
        // Step 4: Start call detection service
        console.log('📞 Starting call detection service...');
        const callServiceStarted = await PerformanceMonitor.measureAsync(
          'Call Detection Service',
          () => CallDetectionService.start()
        );
        
        if (callServiceStarted) {
          console.log('✅ Call detection service started successfully');
        } else {
          console.warn('⚠️ Call detection service failed to start');
        }
        
        setServicesReady(true);
        PerformanceMonitor.endMeasurement('App Initialization');
        console.log('✅ App initialization complete!');
        
      } catch (error) {
        console.error('❌ App initialization error:', error);
        setDbError('App initialization failed');
        PerformanceMonitor.endMeasurement('App Initialization');
      }
    };

    initializeApp();
  }, []);

  const handleOnboardingComplete = async (success: boolean) => {
    console.log('🎯 Onboarding completed with success:', success);
    
    if (success) {
      // Mark onboarding as completed
      await PermissionService.setOnboardingCompleted();
    }
    
    setShowOnboarding(false);
    
    try {
      // Continue with app initialization after onboarding
      console.log('🔒 Initializing permissions after onboarding...');
      await PerformanceMonitor.measureAsync(
        'Permissions Initialization',
        () => PermissionService.initializePermissionsQuietly()
      );
      
      // Start call detection service
      console.log('📞 Starting call detection service...');
      const callServiceStarted = await PerformanceMonitor.measureAsync(
        'Call Detection Service',
        () => CallDetectionService.start()
      );
      
      if (callServiceStarted) {
        console.log('✅ Call detection service started successfully');
      } else {
        console.warn('⚠️ Call detection service failed to start');
      }
      
      setServicesReady(true);
      PerformanceMonitor.endMeasurement('App Initialization');
      console.log('✅ App initialization complete after onboarding!');
      
    } catch (error) {
      console.error('❌ App initialization error after onboarding:', error);
      setDbError('App initialization failed after onboarding');
    }
  };

  if (dbError) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.container}>
          <Text style={styles.errorText}>Error: {dbError}</Text>
          <Text style={styles.subText}>Please restart the app</Text>
        </View>
      </GestureHandlerRootView>
    );
  }

  // Show onboarding if needed and onboarding check is complete
  if (onboardingChecked && showOnboarding) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <PermissionOnboarding onComplete={handleOnboardingComplete} />
      </GestureHandlerRootView>
    );
  }

  if (!isDbReady || !onboardingChecked || !servicesReady) {
    let loadingText = 'Initializing database...';
    if (isDbReady && !onboardingChecked) {
      loadingText = 'Checking permissions...';
    } else if (isDbReady && onboardingChecked && !servicesReady) {
      loadingText = 'Starting services...';
    }
      
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#14B8A6" />
          <Text style={styles.loadingText}>{loadingText}</Text>
        </View>
      </GestureHandlerRootView>
    );
  }

  const handleError = (error: Error, errorInfo: any) => {
    console.error('App-level error caught by ErrorBoundary:', error);
    // Log to crash reporting service
    PerformanceMonitor.generatePerformanceReport();
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary onError={handleError}>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
        
        {/* Call Overlay - Global overlay for call detection */}
        <CallOverlay />
        
        {/* Floating Call Manager - Modern floating overlay system */}
        <FloatingCallManager />
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    marginBottom: 8,
  },
  subText: {
    fontSize: 14,
    color: '#666666',
  },
});

export default App;
