import { Lead, LeadStatus, LeadPriority } from '../types/Lead';
import { demoLeads } from '../data/demoLeads';

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

class MockDatabaseService {
  private leads: Lead[] = [];
  private callLogs: CallLog[] = [];
  private isInitialized: boolean = false;
  private nextId: number = 31; // Start after demo leads

  // Initialize mock database
  public async initDatabase(): Promise<void> {
    try {
      console.log('Initializing mock database...');
      
      // Simulate database initialization delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Load demo data if not already initialized
      if (!this.isInitialized) {
        this.leads = demoLeads.map((lead, index) => ({
          ...lead,
          id: (index + 1).toString(),
        }));
        this.isInitialized = true;
      }
      
      console.log('Mock database initialized with', this.leads.length, 'leads');
    } catch (error) {
      console.error('Failed to initialize mock database:', error);
      throw error;
    }
  }

  // CRUD Operations for Leads

  public async createLead(lead: Omit<Lead, 'id'>): Promise<number> {
    try {
      const newLead: Lead = {
        ...lead,
        id: this.nextId.toString(),
      };
      
      this.leads.push(newLead);
      this.nextId++;
      
      return parseInt(newLead.id);
    } catch (error) {
      console.error('Failed to create lead:', error);
      throw error;
    }
  }

  public async getLeads(limit: number = 100, offset: number = 0): Promise<Lead[]> {
    try {
      // Simulate async database query
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Sort by createdAt descending and apply pagination
      const sortedLeads = [...this.leads].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      
      return sortedLeads.slice(offset, offset + limit);
    } catch (error) {
      console.error('Failed to get leads:', error);
      throw error;
    }
  }

  public async getLeadById(id: string): Promise<Lead | null> {
    try {
      await new Promise(resolve => setTimeout(resolve, 50));
      const lead = this.leads.find(l => l.id === id);
      return lead || null;
    } catch (error) {
      console.error('Failed to get lead:', error);
      throw error;
    }
  }

  public async updateLead(id: string, updates: Partial<Lead>): Promise<void> {
    try {
      const index = this.leads.findIndex(l => l.id === id);
      
      if (index === -1) {
        throw new Error('Lead not found');
      }
      
      this.leads[index] = {
        ...this.leads[index],
        ...updates,
        id: id, // Ensure ID doesn't change
        updatedAt: new Date(),
      };
    } catch (error) {
      console.error('Failed to update lead:', error);
      throw error;
    }
  }

  public async deleteLead(id: string): Promise<void> {
    try {
      const index = this.leads.findIndex(l => l.id === id);
      
      if (index === -1) {
        throw new Error('Lead not found');
      }
      
      this.leads.splice(index, 1);
      
      // Also remove associated call logs
      this.callLogs = this.callLogs.filter(log => log.lead_id !== parseInt(id));
    } catch (error) {
      console.error('Failed to delete lead:', error);
      throw error;
    }
  }

  public async searchLeads(searchQuery: string): Promise<Lead[]> {
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const query = searchQuery.toLowerCase();
      
      return this.leads.filter(lead => 
        lead.name?.toLowerCase().includes(query) ||
        lead.company?.toLowerCase().includes(query) ||
        lead.phone?.toLowerCase().includes(query) ||
        lead.email?.toLowerCase().includes(query) ||
        lead.notes?.toLowerCase().includes(query)
      );
    } catch (error) {
      console.error('Failed to search leads:', error);
      throw error;
    }
  }

  public async getLeadsByStatus(status: LeadStatus): Promise<Lead[]> {
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return this.leads.filter(lead => lead.status === status);
    } catch (error) {
      console.error('Failed to get leads by status:', error);
      throw error;
    }
  }

  // Call Log Operations

  public async addCallLog(callLog: CallLog): Promise<number> {
    try {
      const newCallLog: CallLog = {
        ...callLog,
        id: this.callLogs.length + 1,
      };
      
      this.callLogs.push(newCallLog);
      
      // Update lead's last contact date
      const leadId = callLog.lead_id.toString();
      const lead = this.leads.find(l => l.id === leadId);
      if (lead) {
        lead.lastContactedAt = callLog.started_at;
        lead.updatedAt = new Date();
      }
      
      return newCallLog.id!;
    } catch (error) {
      console.error('Failed to add call log:', error);
      throw error;
    }
  }

  public async getCallLogs(leadId?: number): Promise<CallLog[]> {
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (leadId) {
        return this.callLogs.filter(log => log.lead_id === leadId);
      }
      
      // Sort by started_at descending
      return [...this.callLogs].sort((a, b) => {
        const dateA = a.started_at ? new Date(a.started_at).getTime() : 0;
        const dateB = b.started_at ? new Date(b.started_at).getTime() : 0;
        return dateB - dateA;
      });
    } catch (error) {
      console.error('Failed to get call logs:', error);
      throw error;
    }
  }

  // Close database connection (mock implementation)
  public async closeDatabase(): Promise<void> {
    console.log('Mock database closed');
  }
}

export default new MockDatabaseService();