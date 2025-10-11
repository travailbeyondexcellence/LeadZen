import AsyncStorage from '@react-native-async-storage/async-storage';
import AsyncStorageService from './AsyncStorageService';
import { Note, NoteTag } from '../types/notes';

class NotesService {
  private notes: Note[] = [];

  /**
   * Get all notes for a specific lead
   * @param leadId - Lead ID
   * @returns Promise<Note[]>
   */
  async getNotesForLead(leadId: string): Promise<Note[]> {
    try {
      console.log('📝 Loading notes for lead:', leadId);
      
      // In a real app, this would be a database query
      // For now, we'll use AsyncStorage with a notes key
      const notesJson = await AsyncStorage.getItem(`@leadzen_notes_${leadId}`);
      const notesData = notesJson ? JSON.parse(notesJson) : [];
      
      // Convert stored data back to Note objects with proper Date objects
      const notes = notesData.map((note: any) => ({
        ...note,
        createdAt: new Date(note.createdAt),
      }));
      
      console.log(`📋 Loaded ${notes.length} notes for lead ${leadId}`);
      return notes;
    } catch (error) {
      console.error('❌ Error loading notes for lead:', error);
      return [];
    }
  }

  /**
   * Add a new note
   * @param noteData - Note data without ID and createdAt
   * @returns Promise<Note>
   */
  async addNote(noteData: Omit<Note, 'id' | 'createdAt'>): Promise<Note> {
    try {
      const newNote: Note = {
        ...noteData,
        id: this.generateNoteId(),
        createdAt: new Date(),
      };

      console.log('📝 Adding new note:', newNote);

      // Get existing notes for this lead
      const existingNotes = await this.getNotesForLead(noteData.leadId);
      
      // Add new note
      const updatedNotes = [...existingNotes, newNote];
      
      // Save back to storage
      await AsyncStorage.setItem(`@leadzen_notes_${noteData.leadId}`, JSON.stringify(updatedNotes));
      
      console.log('✅ Note added successfully');
      return newNote;
    } catch (error) {
      console.error('❌ Error adding note:', error);
      throw error;
    }
  }

  /**
   * Update an existing note
   * @param noteId - Note ID
   * @param updates - Fields to update
   * @returns Promise<Note>
   */
  async updateNote(noteId: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>): Promise<Note> {
    try {
      console.log('📝 Updating note:', noteId, updates);

      // Find the note across all leads (we need to know which lead it belongs to)
      // In a real database, this would be more efficient
      const allLeads = await AsyncStorageService.getLeads(1000, 0);
      let targetLeadId = '';
      let existingNotes: Note[] = [];
      let noteToUpdate: Note | undefined;

      for (const lead of allLeads) {
        const notes = await this.getNotesForLead(lead.id);
        noteToUpdate = notes.find(note => note.id === noteId);
        if (noteToUpdate) {
          targetLeadId = lead.id;
          existingNotes = notes;
          break;
        }
      }

      if (!noteToUpdate) {
        throw new Error('Note not found');
      }

      // Update the note
      const updatedNote: Note = {
        ...noteToUpdate,
        ...updates,
      };

      // Replace in the array
      const updatedNotes = existingNotes.map(note => 
        note.id === noteId ? updatedNote : note
      );

      // Save back to storage
      await AsyncStorage.setItem(`@leadzen_notes_${targetLeadId}`, JSON.stringify(updatedNotes));
      
      console.log('✅ Note updated successfully');
      return updatedNote;
    } catch (error) {
      console.error('❌ Error updating note:', error);
      throw error;
    }
  }

  /**
   * Delete a note
   * @param noteId - Note ID
   * @returns Promise<void>
   */
  async deleteNote(noteId: string): Promise<void> {
    try {
      console.log('🗑️ Deleting note:', noteId);

      // Find the note across all leads
      const allLeads = await AsyncStorageService.getLeads(1000, 0);
      let targetLeadId = '';
      let existingNotes: Note[] = [];

      for (const lead of allLeads) {
        const notes = await this.getNotesForLead(lead.id);
        if (notes.some(note => note.id === noteId)) {
          targetLeadId = lead.id;
          existingNotes = notes;
          break;
        }
      }

      if (!targetLeadId) {
        throw new Error('Note not found');
      }

      // Remove the note
      const updatedNotes = existingNotes.filter(note => note.id !== noteId);

      // Save back to storage
      await AsyncStorage.setItem(`@leadzen_notes_${targetLeadId}`, JSON.stringify(updatedNotes));
      
      console.log('✅ Note deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting note:', error);
      throw error;
    }
  }

  /**
   * Get notes by tag
   * @param leadId - Lead ID
   * @param tag - Note tag
   * @returns Promise<Note[]>
   */
  async getNotesByTag(leadId: string, tag: NoteTag): Promise<Note[]> {
    try {
      const allNotes = await this.getNotesForLead(leadId);
      return allNotes.filter(note => note.tag === tag);
    } catch (error) {
      console.error('❌ Error getting notes by tag:', error);
      return [];
    }
  }

  /**
   * Get notes linked to a specific call
   * @param callLogId - Call log ID
   * @returns Promise<Note[]>
   */
  async getNotesForCall(callLogId: string): Promise<Note[]> {
    try {
      // This would require searching across all leads
      // For now, return empty array - can be implemented later if needed
      console.log('📞 Getting notes for call:', callLogId);
      return [];
    } catch (error) {
      console.error('❌ Error getting notes for call:', error);
      return [];
    }
  }

  /**
   * Generate a unique note ID
   * @returns string
   */
  private generateNoteId(): string {
    return `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Search notes by content
   * @param leadId - Lead ID
   * @param searchTerm - Search term
   * @returns Promise<Note[]>
   */
  async searchNotes(leadId: string, searchTerm: string): Promise<Note[]> {
    try {
      const allNotes = await this.getNotesForLead(leadId);
      const lowercaseSearch = searchTerm.toLowerCase();
      
      return allNotes.filter(note => 
        note.content.toLowerCase().includes(lowercaseSearch)
      );
    } catch (error) {
      console.error('❌ Error searching notes:', error);
      return [];
    }
  }
}

export default new NotesService();