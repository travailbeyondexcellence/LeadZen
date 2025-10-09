import AsyncStorage from '@react-native-async-storage/async-storage';
import { Lead, LeadStatus, LeadPriority } from '../types/Lead';
import { demoLeads } from '../data/demoLeads';

// Storage keys
const STORAGE_KEYS = {
  LEADS: '@leadzen_leads',
  CALL_LOGS: '@leadzen_call_logs',
  IS_INITIALIZED: '@leadzen_initialized',
  NEXT_ID: '@leadzen_next_id',
};

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

class AsyncStorageService {
  private nextId: number = 31; // Start after demo leads

  // Initialize database with demo data if needed
  public async initDatabase(): Promise<void> {
    try {
      console.log('Initializing AsyncStorage database...');
      
      // Check if already initialized
      const isInitialized = await AsyncStorage.getItem(STORAGE_KEYS.IS_INITIALIZED);
      
      if (!isInitialized) {
        console.log('First time initialization - loading demo data...');
        
        // Prepare demo leads with IDs
        const leadsWithIds = demoLeads.map((lead, index) => ({
          ...lead,
          id: (index + 1).toString(),
          createdAt: lead.createdAt || new Date(),
          updatedAt: lead.updatedAt || new Date(),
        }));
        
        // Store demo leads
        await AsyncStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leadsWithIds));
        await AsyncStorage.setItem(STORAGE_KEYS.IS_INITIALIZED, 'true');
        await AsyncStorage.setItem(STORAGE_KEYS.NEXT_ID, '31');
        await AsyncStorage.setItem(STORAGE_KEYS.CALL_LOGS, JSON.stringify([]));
        
        console.log('AsyncStorage initialized with', leadsWithIds.length, 'demo leads');
      } else {
        console.log('AsyncStorage already initialized, loading existing data...');
        
        // Load next ID
        const storedNextId = await AsyncStorage.getItem(STORAGE_KEYS.NEXT_ID);
        if (storedNextId) {
          this.nextId = parseInt(storedNextId);
        }
      }
    } catch (error) {
      console.error('Failed to initialize AsyncStorage:', error);
      throw error;
    }
  }

  // CRUD Operations for Leads

  public async createLead(lead: Omit<Lead, 'id'>): Promise<number> {
    try {
      // Get existing leads
      const leadsJson = await AsyncStorage.getItem(STORAGE_KEYS.LEADS);
      const leads: Lead[] = leadsJson ? JSON.parse(leadsJson) : [];
      
      // Create new lead
      const newLead: Lead = {
        ...lead,
        id: this.nextId.toString(),
        createdAt: lead.createdAt || new Date(),
        updatedAt: lead.updatedAt || new Date(),
      };
      
      // Add to array and save
      leads.push(newLead);
      await AsyncStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
      
      // Update next ID
      this.nextId++;
      await AsyncStorage.setItem(STORAGE_KEYS.NEXT_ID, this.nextId.toString());
      
      return parseInt(newLead.id);
    } catch (error) {
      console.error('Failed to create lead:', error);
      throw error;
    }
  }

  public async getLeads(limit: number = 100, offset: number = 0): Promise<Lead[]> {
    try {
      const leadsJson = await AsyncStorage.getItem(STORAGE_KEYS.LEADS);
      
      if (!leadsJson) {
        return [];
      }
      
      const leads: Lead[] = JSON.parse(leadsJson);
      
      // Convert date strings back to Date objects
      const processedLeads = leads.map(lead => ({
        ...lead,
        createdAt: lead.createdAt ? new Date(lead.createdAt) : new Date(),
        updatedAt: lead.updatedAt ? new Date(lead.updatedAt) : new Date(),
        lastContactedAt: lead.lastContactedAt ? new Date(lead.lastContactedAt) : undefined,
        nextFollowUpAt: lead.nextFollowUpAt ? new Date(lead.nextFollowUpAt) : undefined,
      }));
      
      // Sort by createdAt descending
      processedLeads.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      
      // Apply pagination
      return processedLeads.slice(offset, offset + limit);
    } catch (error) {
      console.error('Failed to get leads:', error);
      throw error;
    }
  }

  public async getLeadById(id: string): Promise<Lead | null> {
    try {
      const leadsJson = await AsyncStorage.getItem(STORAGE_KEYS.LEADS);
      
      if (!leadsJson) {
        return null;
      }
      
      const leads: Lead[] = JSON.parse(leadsJson);
      const lead = leads.find(l => l.id === id);
      
      if (!lead) {
        return null;
      }
      
      // Convert date strings back to Date objects
      return {
        ...lead,
        createdAt: lead.createdAt ? new Date(lead.createdAt) : new Date(),
        updatedAt: lead.updatedAt ? new Date(lead.updatedAt) : new Date(),
        lastContactedAt: lead.lastContactedAt ? new Date(lead.lastContactedAt) : undefined,
        nextFollowUpAt: lead.nextFollowUpAt ? new Date(lead.nextFollowUpAt) : undefined,
      };
    } catch (error) {
      console.error('Failed to get lead by ID:', error);
      throw error;
    }
  }

  public async updateLead(id: string, updates: Partial<Lead>): Promise<void> {
    try {
      const leadsJson = await AsyncStorage.getItem(STORAGE_KEYS.LEADS);
      
      if (!leadsJson) {
        throw new Error('No leads found');
      }
      
      const leads: Lead[] = JSON.parse(leadsJson);
      const index = leads.findIndex(l => l.id === id);
      
      if (index === -1) {
        throw new Error('Lead not found');
      }
      
      // Update the lead
      leads[index] = {
        ...leads[index],
        ...updates,
        id: id, // Ensure ID doesn't change
        updatedAt: new Date(),
      };
      
      // Save back to AsyncStorage
      await AsyncStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
    } catch (error) {
      console.error('Failed to update lead:', error);
      throw error;
    }
  }

  public async deleteLead(id: string): Promise<void> {
    try {
      const leadsJson = await AsyncStorage.getItem(STORAGE_KEYS.LEADS);
      
      if (!leadsJson) {
        throw new Error('No leads found');
      }
      
      const leads: Lead[] = JSON.parse(leadsJson);
      const filteredLeads = leads.filter(l => l.id !== id);
      
      if (filteredLeads.length === leads.length) {
        throw new Error('Lead not found');
      }
      
      // Save updated array
      await AsyncStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(filteredLeads));
      
      // Also remove associated call logs
      await this.deleteCallLogsForLead(parseInt(id));
    } catch (error) {
      console.error('Failed to delete lead:', error);
      throw error;
    }
  }

  public async searchLeads(searchQuery: string): Promise<Lead[]> {
    try {
      const leads = await this.getLeads(1000, 0); // Get all leads
      const query = searchQuery.toLowerCase();
      
      return leads.filter(lead => 
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
      const leads = await this.getLeads(1000, 0); // Get all leads
      return leads.filter(lead => lead.status === status);
    } catch (error) {
      console.error('Failed to get leads by status:', error);
      throw error;
    }
  }

  // Call Log Operations

  public async addCallLog(callLog: CallLog): Promise<number> {
    try {
      const callLogsJson = await AsyncStorage.getItem(STORAGE_KEYS.CALL_LOGS);
      const callLogs: CallLog[] = callLogsJson ? JSON.parse(callLogsJson) : [];
      
      // Generate new ID
      const newId = callLogs.length > 0 
        ? Math.max(...callLogs.map(log => log.id || 0)) + 1 
        : 1;
      
      const newCallLog: CallLog = {
        ...callLog,
        id: newId,
      };
      
      callLogs.push(newCallLog);
      await AsyncStorage.setItem(STORAGE_KEYS.CALL_LOGS, JSON.stringify(callLogs));
      
      // Update lead's last contact date
      const leadId = callLog.lead_id.toString();
      await this.updateLead(leadId, {
        lastContactedAt: callLog.started_at,
      });
      
      return newId;
    } catch (error) {
      console.error('Failed to add call log:', error);
      throw error;
    }
  }

  public async getCallLogs(leadId?: number): Promise<CallLog[]> {
    try {
      const callLogsJson = await AsyncStorage.getItem(STORAGE_KEYS.CALL_LOGS);
      
      if (!callLogsJson) {
        return [];
      }
      
      const callLogs: CallLog[] = JSON.parse(callLogsJson);
      
      // Convert date strings back to Date objects
      const processedLogs = callLogs.map(log => ({
        ...log,
        started_at: new Date(log.started_at),
        ended_at: log.ended_at ? new Date(log.ended_at) : undefined,
      }));
      
      // Filter by lead ID if provided
      const filteredLogs = leadId 
        ? processedLogs.filter(log => log.lead_id === leadId)
        : processedLogs;
      
      // Sort by started_at descending
      return filteredLogs.sort((a, b) => {
        const dateA = a.started_at ? new Date(a.started_at).getTime() : 0;
        const dateB = b.started_at ? new Date(b.started_at).getTime() : 0;
        return dateB - dateA;
      });
    } catch (error) {
      console.error('Failed to get call logs:', error);
      throw error;
    }
  }

  private async deleteCallLogsForLead(leadId: number): Promise<void> {
    try {
      const callLogsJson = await AsyncStorage.getItem(STORAGE_KEYS.CALL_LOGS);
      
      if (!callLogsJson) {
        return;
      }
      
      const callLogs: CallLog[] = JSON.parse(callLogsJson);
      const filteredLogs = callLogs.filter(log => log.lead_id !== leadId);
      
      await AsyncStorage.setItem(STORAGE_KEYS.CALL_LOGS, JSON.stringify(filteredLogs));
    } catch (error) {
      console.error('Failed to delete call logs for lead:', error);
    }
  }

  // Utility methods

  public async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.LEADS,
        STORAGE_KEYS.CALL_LOGS,
        STORAGE_KEYS.IS_INITIALIZED,
        STORAGE_KEYS.NEXT_ID,
      ]);
      console.log('All data cleared from AsyncStorage');
    } catch (error) {
      console.error('Failed to clear data:', error);
      throw error;
    }
  }

  public async exportData(): Promise<{ leads: Lead[], callLogs: CallLog[] }> {
    try {
      const leads = await this.getLeads(1000, 0);
      const callLogs = await this.getCallLogs();
      
      return { leads, callLogs };
    } catch (error) {
      console.error('Failed to export data:', error);
      throw error;
    }
  }

  // Mock close method for compatibility
  public async closeDatabase(): Promise<void> {
    console.log('AsyncStorage database closed');
  }
}

export default new AsyncStorageService();