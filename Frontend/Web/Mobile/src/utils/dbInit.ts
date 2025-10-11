// Using AsyncStorageService for persistent local storage
import AsyncStorageService from '../services/AsyncStorageService';

export const initializeDatabase = async (): Promise<boolean> => {
  try {
    console.log('Initializing database...');
    await AsyncStorageService.initDatabase();
    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    return false;
  }
};

export const cleanupDatabase = async (): Promise<void> => {
  try {
    // AsyncStorage doesn't need explicit cleanup
    console.log('Database connection closed');
  } catch (error) {
    console.error('Failed to close database:', error);
  }
};