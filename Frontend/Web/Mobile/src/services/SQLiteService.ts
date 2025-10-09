import SQLite, { SQLiteDatabase, Transaction, ResultSet } from 'react-native-sqlite-storage';

// Enable debugging in development
if (__DEV__) {
  SQLite.DEBUG(false); // Set to false to avoid verbose logging
  SQLite.enablePromise(true);
}

class SQLiteService {
  private db: SQLiteDatabase | null = null;
  private dbName = 'leadzen.db';
  private dbVersion = '1.0';

  async initDatabase(): Promise<void> {
    try {
      if (this.db) {
        console.log('Database already initialized');
        return;
      }

      // Open database
      this.db = await SQLite.openDatabase(
        {
          name: this.dbName,
          location: 'default',
        },
        () => console.log('Database opened successfully'),
        (error) => console.error('Error opening database:', error)
      );

      // Create tables
      await this.createTables();
      console.log('SQLite database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize SQLite database:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      await this.db.transaction(async (tx: Transaction) => {
        // Create leads table
        await tx.executeSql(
          `CREATE TABLE IF NOT EXISTS leads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            company TEXT,
            email TEXT,
            phone TEXT,
            status TEXT DEFAULT 'new',
            priority TEXT DEFAULT 'medium',
            lastContact TEXT,
            nextFollowUp TEXT,
            notes TEXT,
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
            updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
          )`
        );

        // Create call_logs table
        await tx.executeSql(
          `CREATE TABLE IF NOT EXISTS call_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            leadId INTEGER,
            duration INTEGER,
            timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
            notes TEXT,
            type TEXT DEFAULT 'outgoing',
            FOREIGN KEY (leadId) REFERENCES leads(id)
          )`
        );
      });
    } catch (error) {
      console.error('Error creating tables:', error);
      throw error;
    }
  }

  async closeDatabase(): Promise<void> {
    if (this.db) {
      try {
        await this.db.close();
        this.db = null;
        console.log('Database closed successfully');
      } catch (error) {
        console.error('Error closing database:', error);
      }
    }
  }

  // Helper method to execute queries safely
  async executeQuery(query: string, params: any[] = []): Promise<ResultSet> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      const [result] = await this.db.executeSql(query, params);
      return result;
    } catch (error) {
      console.error('Query execution error:', error);
      throw error;
    }
  }

  // Helper method for transactions
  async runTransaction<T>(callback: (tx: Transaction) => Promise<T>): Promise<T> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      this.db!.transaction(
        async (tx) => {
          try {
            const result = await callback(tx);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        },
        (error) => {
          console.error('Transaction error:', error);
          reject(error);
        },
        () => {
          console.log('Transaction completed successfully');
        }
      );
    });
  }
}

export default new SQLiteService();