import SQLite, { SQLiteDatabase, ResultSet, Transaction } from 'react-native-sqlite-storage';
import { Lead, LeadStatus, LeadPriority, LeadSource } from '../types/Lead';

// Configure SQLite
SQLite.DEBUG(false); // Disable verbose logging to avoid console warnings
SQLite.enablePromise(true);

const DATABASE_NAME = 'leadzen.db';
const DATABASE_VERSION = '1.0.0';
const DATABASE_DISPLAY_NAME = 'LeadZen Database';
const DATABASE_SIZE = 200000; // 200KB
const DATABASE_LOCATION = 'default';

export interface CallLog {
  id?: number;
  lead_id: number;
  phone_number: string;
  call_type: 'incoming' | 'outgoing' | 'missed';
  call_status?: 'completed' | 'no_answer' | 'busy' | 'failed';
  duration: number;
  started_at: Date;
  ended_at?: Date;
  notes?: string;
}

export interface Note {
  id?: number;
  lead_id: number;
  content: string;
  note_type?: 'general' | 'meeting' | 'task' | 'reminder';
  created_by?: string;
  created_at?: Date;
}

export interface Label {
  id?: number;
  name: string;
  color?: string;
}

export interface Task {
  id?: number;
  lead_id: number;
  title: string;
  description?: string;
  due_date?: Date;
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

class DatabaseService {
  private database: SQLiteDatabase | null = null;

  // Initialize and open database
  public async initDatabase(): Promise<void> {
    try {
      console.log('Opening database...');
      this.database = await SQLite.openDatabase(
        DATABASE_NAME,
        DATABASE_VERSION,
        DATABASE_DISPLAY_NAME,
        DATABASE_SIZE,
        () => {
          console.log('Database opened successfully');
        },
        (error: any) => {
          console.error('Error opening database:', error);
        }
      );
      
      if (!this.database) {
        throw new Error('Failed to open database');
      }
      
      console.log('Database instance created, creating tables...');
      await this.createTables();
      await this.seedInitialData();
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  // Create tables from schema
  private async createTables(): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');

    const schemaStatements = [
      `CREATE TABLE IF NOT EXISTS leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        company TEXT,
        phone_primary TEXT UNIQUE NOT NULL,
        phone_secondary TEXT,
        email TEXT,
        position TEXT,
        source TEXT DEFAULT 'manual',
        pipeline_stage TEXT DEFAULT 'follow_up',
        priority TEXT DEFAULT 'medium',
        value REAL DEFAULT 0,
        notes TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        country TEXT DEFAULT 'USA',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_contact_at DATETIME,
        next_follow_up_at DATETIME
      )`,
      `CREATE TABLE IF NOT EXISTS call_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
        phone_number TEXT NOT NULL,
        call_type TEXT NOT NULL,
        call_status TEXT DEFAULT 'completed',
        duration INTEGER DEFAULT 0,
        started_at DATETIME NOT NULL,
        ended_at DATETIME,
        recording_url TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        note_type TEXT DEFAULT 'general',
        created_by TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS labels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        color TEXT DEFAULT '#14B8A6',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS lead_labels (
        lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
        label_id INTEGER REFERENCES labels(id) ON DELETE CASCADE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (lead_id, label_id)
      )`,
      `CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        due_date DATETIME,
        completed BOOLEAN DEFAULT 0,
        completed_at DATETIME,
        priority TEXT DEFAULT 'medium',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
    ];

    try {
      await this.database.transaction((tx: Transaction) => {
        for (const statement of schemaStatements) {
          tx.executeSql(
            statement,
            [],
            () => {},
            (tx, error) => {
              console.error('Error executing statement:', statement, error);
              return false;
            }
          );
        }
      });
      console.log('Database tables created successfully');
    } catch (error) {
      console.error('Failed to create tables:', error);
      throw error;
    }
  }

  // Check if database has been seeded
  private async isDatabaseSeeded(): Promise<boolean> {
    if (!this.database) return false;
    
    try {
      const [result] = await this.database.executeSql('SELECT COUNT(*) as count FROM leads');
      return result.rows.item(0).count > 0;
    } catch (error) {
      return false;
    }
  }

  // Seed initial demo data
  private async seedInitialData(): Promise<void> {
    const isSeeded = await this.isDatabaseSeeded();
    if (isSeeded) {
      console.log('Database already seeded, skipping...');
      return;
    }

    // Import and insert demo data
    const { demoLeads } = await import('../data/demoLeads');
    
    for (const lead of demoLeads) {
      await this.createLead(lead);
    }
    
    console.log('Demo data seeded successfully');
  }

  // CRUD Operations for Leads

  public async createLead(lead: Omit<Lead, 'id'>): Promise<number> {
    if (!this.database) throw new Error('Database not initialized');

    const query = `
      INSERT INTO leads (
        name, company, phone_primary, phone_secondary, email, position,
        source, pipeline_stage, priority, value, notes, address, city, state,
        country, last_contact_at, next_follow_up_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      lead.name,
      lead.company || null,
      lead.phone || '',
      null, // phone_secondary
      lead.email || null,
      lead.position || null,
      lead.source || LeadSource.MANUAL,
      lead.status || LeadStatus.NEW,
      lead.priority || LeadPriority.MEDIUM,
      lead.value || 0,
      lead.notes || null,
      null, // address
      null, // city
      null, // state
      'USA',
      lead.lastContactedAt ? lead.lastContactedAt.toISOString() : null,
      lead.nextFollowUpAt ? lead.nextFollowUpAt.toISOString() : null,
    ];

    try {
      const [result] = await this.database.executeSql(query, params);
      return result.insertId;
    } catch (error) {
      console.error('Failed to create lead:', error);
      throw error;
    }
  }

  public async getLeads(limit: number = 100, offset: number = 0): Promise<Lead[]> {
    if (!this.database) throw new Error('Database not initialized');

    const query = `
      SELECT * FROM leads 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;

    try {
      const [result] = await this.database.executeSql(query, [limit, offset]);
      const leads: Lead[] = [];
      
      for (let i = 0; i < result.rows.length; i++) {
        const row = result.rows.item(i);
        leads.push(this.mapRowToLead(row));
      }
      
      return leads;
    } catch (error) {
      console.error('Failed to get leads:', error);
      throw error;
    }
  }

  public async getLeadById(id: string): Promise<Lead | null> {
    if (!this.database) throw new Error('Database not initialized');

    const query = 'SELECT * FROM leads WHERE id = ?';

    try {
      const [result] = await this.database.executeSql(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.mapRowToLead(result.rows.item(0));
    } catch (error) {
      console.error('Failed to get lead:', error);
      throw error;
    }
  }

  public async updateLead(id: string, updates: Partial<Lead>): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');

    const fields: string[] = [];
    const params: any[] = [];

    // Build dynamic update query
    if (updates.name !== undefined) {
      fields.push('name = ?');
      params.push(updates.name);
    }
    if (updates.company !== undefined) {
      fields.push('company = ?');
      params.push(updates.company);
    }
    if (updates.phone !== undefined) {
      fields.push('phone_primary = ?');
      params.push(updates.phone);
    }
    if (updates.email !== undefined) {
      fields.push('email = ?');
      params.push(updates.email);
    }
    if (updates.position !== undefined) {
      fields.push('position = ?');
      params.push(updates.position);
    }
    if (updates.status !== undefined) {
      fields.push('pipeline_stage = ?');
      params.push(updates.status);
    }
    if (updates.priority !== undefined) {
      fields.push('priority = ?');
      params.push(updates.priority);
    }
    if (updates.value !== undefined) {
      fields.push('value = ?');
      params.push(updates.value);
    }
    if (updates.notes !== undefined) {
      fields.push('notes = ?');
      params.push(updates.notes);
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    const query = `UPDATE leads SET ${fields.join(', ')} WHERE id = ?`;

    try {
      await this.database.executeSql(query, params);
    } catch (error) {
      console.error('Failed to update lead:', error);
      throw error;
    }
  }

  public async deleteLead(id: string): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');

    const query = 'DELETE FROM leads WHERE id = ?';

    try {
      await this.database.executeSql(query, [id]);
    } catch (error) {
      console.error('Failed to delete lead:', error);
      throw error;
    }
  }

  public async searchLeads(searchQuery: string): Promise<Lead[]> {
    if (!this.database) throw new Error('Database not initialized');

    const query = `
      SELECT * FROM leads 
      WHERE name LIKE ? 
         OR company LIKE ? 
         OR phone_primary LIKE ?
         OR email LIKE ?
         OR notes LIKE ?
      ORDER BY created_at DESC
    `;

    const searchPattern = `%${searchQuery}%`;
    const params = Array(5).fill(searchPattern);

    try {
      const [result] = await this.database.executeSql(query, params);
      const leads: Lead[] = [];
      
      for (let i = 0; i < result.rows.length; i++) {
        leads.push(this.mapRowToLead(result.rows.item(i)));
      }
      
      return leads;
    } catch (error) {
      console.error('Failed to search leads:', error);
      throw error;
    }
  }

  public async getLeadsByStatus(status: LeadStatus): Promise<Lead[]> {
    if (!this.database) throw new Error('Database not initialized');

    const query = `
      SELECT * FROM leads 
      WHERE pipeline_stage = ?
      ORDER BY created_at DESC
    `;

    try {
      const [result] = await this.database.executeSql(query, [status]);
      const leads: Lead[] = [];
      
      for (let i = 0; i < result.rows.length; i++) {
        leads.push(this.mapRowToLead(result.rows.item(i)));
      }
      
      return leads;
    } catch (error) {
      console.error('Failed to get leads by status:', error);
      throw error;
    }
  }

  // Call Log Operations

  public async addCallLog(callLog: CallLog): Promise<number> {
    if (!this.database) throw new Error('Database not initialized');

    const query = `
      INSERT INTO call_logs (
        lead_id, phone_number, call_type, call_status, duration,
        started_at, ended_at, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      callLog.lead_id,
      callLog.phone_number,
      callLog.call_type,
      callLog.call_status || 'completed',
      callLog.duration,
      callLog.started_at.toISOString(),
      callLog.ended_at ? callLog.ended_at.toISOString() : null,
      callLog.notes || null,
    ];

    try {
      const [result] = await this.database.executeSql(query, params);
      
      // Update last_contact_at for the lead
      await this.database.executeSql(
        'UPDATE leads SET last_contact_at = ? WHERE id = ?',
        [callLog.started_at.toISOString(), callLog.lead_id]
      );
      
      return result.insertId;
    } catch (error) {
      console.error('Failed to add call log:', error);
      throw error;
    }
  }

  public async getCallLogs(leadId?: number): Promise<CallLog[]> {
    if (!this.database) throw new Error('Database not initialized');

    let query = 'SELECT * FROM call_logs';
    const params: any[] = [];

    if (leadId) {
      query += ' WHERE lead_id = ?';
      params.push(leadId);
    }

    query += ' ORDER BY started_at DESC';

    try {
      const [result] = await this.database.executeSql(query, params);
      const callLogs: CallLog[] = [];
      
      for (let i = 0; i < result.rows.length; i++) {
        const row = result.rows.item(i);
        callLogs.push({
          id: row.id,
          lead_id: row.lead_id,
          phone_number: row.phone_number,
          call_type: row.call_type,
          call_status: row.call_status,
          duration: row.duration,
          started_at: new Date(row.started_at),
          ended_at: row.ended_at ? new Date(row.ended_at) : undefined,
          notes: row.notes,
        });
      }
      
      return callLogs;
    } catch (error) {
      console.error('Failed to get call logs:', error);
      throw error;
    }
  }

  // Helper method to map database row to Lead object
  private mapRowToLead(row: any): Lead {
    return {
      id: row.id.toString(),
      name: row.name,
      company: row.company,
      phone: row.phone_primary,
      email: row.email,
      position: row.position,
      source: row.source as LeadSource,
      status: row.pipeline_stage as LeadStatus,
      priority: row.priority as LeadPriority,
      value: row.value,
      notes: row.notes,
      tags: [], // Tags will be loaded separately from lead_labels table
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      lastContactedAt: row.last_contact_at ? new Date(row.last_contact_at) : undefined,
      nextFollowUpAt: row.next_follow_up_at ? new Date(row.next_follow_up_at) : undefined,
    };
  }

  // Close database connection
  public async closeDatabase(): Promise<void> {
    if (this.database) {
      try {
        await this.database.close();
        console.log('Database closed successfully');
      } catch (error) {
        console.error('Failed to close database:', error);
      }
    }
  }
}

export default new DatabaseService();