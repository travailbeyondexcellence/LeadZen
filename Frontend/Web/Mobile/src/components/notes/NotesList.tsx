import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Note, NOTE_TAGS } from '../../types/notes';

interface NotesListProps {
  notes: Note[];
  onAddNote: () => void;
  onEditNote: (note: Note) => void;
  onDeleteNote: (noteId: string) => void;
}

const NotesList: React.FC<NotesListProps> = ({
  notes,
  onAddNote,
  onEditNote,
  onDeleteNote,
}) => {
  const formatDate = (date: Date) => {
    const noteDate = new Date(date);
    const day = noteDate.getDate();
    const year = noteDate.getFullYear();
    
    // Month names array
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[noteDate.getMonth()];
    
    // Add ordinal suffix to day
    const ordinalSuffix = (n: number) => {
      if (n > 3 && n < 21) return 'th';
      switch (n % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
      }
    };
    
    // Format time in AM/PM without seconds
    let hours = noteDate.getHours();
    const minutes = noteDate.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    
    const timeString = `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    
    const dateString = `${day}${ordinalSuffix(day)} ${month} ${year}`;
    
    return `${dateString}\n${timeString}`;
  };

  const renderNote = ({ item: note }: { item: Note }) => {
    const tagInfo = NOTE_TAGS[note.tag];
    
    return (
      <TouchableOpacity
        style={styles.noteItem}
        onPress={() => onEditNote(note)}
        activeOpacity={0.7}
      >
        <View style={styles.noteHeader}>
          <View style={styles.tagContainer}>
            <Text style={styles.tagIcon}>{tagInfo.icon}</Text>
            <Text style={[styles.tagLabel, { color: tagInfo.color }]}>
              {tagInfo.label}
            </Text>
          </View>
          <View style={styles.noteDateContainer}>
            <Text style={styles.noteDate}>
              {formatDate(note.createdAt)}
            </Text>
          </View>
        </View>
        
        <Text style={styles.noteContent} numberOfLines={3}>
          {note.content}
        </Text>
        
        <View style={styles.noteFooter}>
          <Text style={styles.noteAuthor}>
            by {note.createdBy}
          </Text>
          {note.callLogId && (
            <View style={styles.callLinked}>
              <Text style={styles.callLinkedIcon}>📞</Text>
              <Text style={styles.callLinkedText}>Call linked</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📝</Text>
      <Text style={styles.emptyTitle}>No notes yet</Text>
      <Text style={styles.emptySubtitle}>
        Add your first note to keep track of important information about this lead
      </Text>
      <TouchableOpacity style={styles.addFirstButton} onPress={onAddNote}>
        <Text style={styles.addFirstButtonText}>Add First Note</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Notes ({notes.length})</Text>
      <TouchableOpacity style={styles.addButton} onPress={onAddNote}>
        <Text style={styles.addButtonIcon}>+</Text>
        <Text style={styles.addButtonText}>Add Note</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      {notes.length === 0 ? (
        renderEmpty()
      ) : (
        <View style={styles.listContainer}>
          {notes
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((note) => (
              <View key={note.id}>
                {renderNote({ item: note })}
              </View>
            ))
          }
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#14B8A6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonIcon: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 4,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  listContainer: {
    gap: 12,
  },
  noteItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F3F4',
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  tagLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  noteDateContainer: {
    alignItems: 'flex-end',
  },
  noteDate: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
    lineHeight: 16,
  },
  noteContent: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noteAuthor: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  callLinked: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  callLinkedIcon: {
    fontSize: 10,
    marginRight: 4,
  },
  callLinkedText: {
    fontSize: 10,
    color: '#1E40AF',
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  addFirstButton: {
    backgroundColor: '#14B8A6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addFirstButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default NotesList;