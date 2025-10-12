import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Colors, Spacing } from '../theme';
import { Lead } from '../types/Lead';
import AsyncStorageService from '../services/AsyncStorageService';
import NotesList from '../components/notes/NotesList';
import NotesModal from '../components/notes/NotesModal';
import NotesService from '../services/NotesService';
import { Note } from '../types/notes';

type RouteParams = {
  LeadNotes: {
    leadId: string;
  };
};

const LeadNotes: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'LeadNotes'>>();
  const { leadId } = route.params;
  
  const [lead, setLead] = useState<Lead | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [notesModalVisible, setNotesModalVisible] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | undefined>(undefined);
  
  useEffect(() => {
    loadLead();
    loadNotes();
  }, [leadId]);
  
  const loadLead = async () => {
    try {
      const leadData = await AsyncStorageService.getLeadById(leadId);
      setLead(leadData);
    } catch (error) {
      console.error('Failed to load lead:', error);
      Alert.alert('Error', 'Failed to load lead details');
    }
  };
  
  const loadNotes = async () => {
    try {
      const notesData = await NotesService.getNotesForLead(leadId);
      setNotes(notesData);
    } catch (error) {
      console.error('Failed to load notes:', error);
    }
  };
  
  const handleAddNote = () => {
    setEditingNote(undefined);
    setNotesModalVisible(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setNotesModalVisible(true);
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await NotesService.deleteNote(noteId);
      await loadNotes(); // Reload notes after deletion
    } catch (error) {
      console.error('Failed to delete note:', error);
      Alert.alert('Error', 'Failed to delete note');
    }
  };

  const handleSaveNote = async (noteData: Omit<Note, 'id' | 'createdAt'>) => {
    try {
      if (editingNote) {
        await NotesService.updateNote(editingNote.id, noteData);
      } else {
        // Add leadId to noteData for new notes
        const noteWithLeadId = { ...noteData, leadId };
        await NotesService.addNote(noteWithLeadId);
      }
      await loadNotes(); // Reload notes after save
      setNotesModalVisible(false);
    } catch (error) {
      console.error('Failed to save note:', error);
      Alert.alert('Error', 'Failed to save note');
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <NotesList
          notes={notes}
          onAddNote={handleAddNote}
          onEditNote={handleEditNote}
          onDeleteNote={handleDeleteNote}
        />
      </View>
      
      {/* Notes Modal */}
      <NotesModal
        visible={notesModalVisible}
        leadId={leadId}
        existingNote={editingNote}
        onClose={() => setNotesModalVisible(false)}
        onSave={handleSaveNote}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
});

export default LeadNotes;