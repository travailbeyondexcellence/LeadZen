import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { initializeDatabase } from './src/utils/dbInit';
import PermissionService from './src/services/PermissionService';
import CallDetectionService from './src/services/CallDetectionService';
import CallOverlay from './src/components/CallOverlay';
import ErrorBoundary from './src/components/ErrorBoundary';
import { PerformanceMonitor } from './src/utils/performance';

function App(): React.JSX.Element {
  const [isDbReady, setIsDbReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [servicesReady, setServicesReady] = useState(false);

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
        
        // Step 2: Initialize permissions
        console.log('🔒 Initializing permissions...');
        await PerformanceMonitor.measureAsync(
          'Permissions Initialization',
          () => PermissionService.initializePermissions()
        );
        
        // Step 3: Start call detection service
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

  if (dbError) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {dbError}</Text>
        <Text style={styles.subText}>Please restart the app</Text>
      </View>
    );
  }

  if (!isDbReady || !servicesReady) {
    const loadingText = !isDbReady 
      ? 'Initializing database...' 
      : 'Starting services...';
      
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#14B8A6" />
        <Text style={styles.loadingText}>{loadingText}</Text>
      </View>
    );
  }

  const handleError = (error: Error, errorInfo: any) => {
    console.error('App-level error caught by ErrorBoundary:', error);
    // Log to crash reporting service
    PerformanceMonitor.generatePerformanceReport();
  };

  return (
    <ErrorBoundary onError={handleError}>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
      
      {/* Call Overlay - Global overlay for call detection */}
      <CallOverlay />
    </ErrorBoundary>
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
