import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { initializeDatabase } from './src/utils/dbInit';

function App(): React.JSX.Element {
  const [isDbReady, setIsDbReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    const initDb = async () => {
      try {
        const success = await initializeDatabase();
        if (success) {
          setIsDbReady(true);
        } else {
          setDbError('Failed to initialize database');
        }
      } catch (error) {
        console.error('Database initialization error:', error);
        setDbError('Database initialization failed');
      }
    };

    initDb();
  }, []);

  if (dbError) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {dbError}</Text>
        <Text style={styles.subText}>Please restart the app</Text>
      </View>
    );
  }

  if (!isDbReady) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#14B8A6" />
        <Text style={styles.loadingText}>Initializing database...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
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
