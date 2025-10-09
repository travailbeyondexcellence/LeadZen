import DatabaseService from '../services/DatabaseService';

export const initializeDatabase = async (): Promise<boolean> => {
  try {
    console.log('Initializing database...');
    await DatabaseService.initDatabase();
    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    return false;
  }
};

export const cleanupDatabase = async (): Promise<void> => {
  try {
    await DatabaseService.closeDatabase();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Failed to close database:', error);
  }
};