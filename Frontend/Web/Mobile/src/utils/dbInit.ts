// Using MockDatabaseService temporarily until SQLite native issue is resolved
import MockDatabaseService from '../services/MockDatabaseService';

export const initializeDatabase = async (): Promise<boolean> => {
  try {
    console.log('Initializing database...');
    await MockDatabaseService.initDatabase();
    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    return false;
  }
};

export const cleanupDatabase = async (): Promise<void> => {
  try {
    await MockDatabaseService.closeDatabase();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Failed to close database:', error);
  }
};