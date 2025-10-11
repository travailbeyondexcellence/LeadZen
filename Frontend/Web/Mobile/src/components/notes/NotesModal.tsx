import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { Note, NoteTag, NOTE_TAGS } from '../../types/notes';

interface NotesModalProps {
  visible: boolean;
  leadId: string;
  callLogId?: string;
  existingNote?: Note;
  onClose: () => void;
  onSave: (note: Omit<Note, 'id' | 'createdAt'>) => void;
}

const NotesModal: React.FC<NotesModalProps> = ({
  visible,
  leadId,
  callLogId,
  existingNote,
  onClose,
  onSave,
}) => {
  const [content, setContent] = useState(existingNote?.content || '');
  const [selectedTag, setSelectedTag] = useState<NoteTag>(
    existingNote?.tag || (callLogId ? 'call-related' : 'general')
  );

  const handleSave = () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please enter note content');
      return;
    }

    const noteData = {
      content: content.trim(),
      tag: selectedTag,
      createdBy: 'User', // Placeholder until user system implemented
      leadId,
      callLogId,
    };

    onSave(noteData);
    handleClose();
  };

  const handleClose = () => {
    setContent(existingNote?.content || '');
    setSelectedTag(existingNote?.tag || (callLogId ? 'call-related' : 'general'));
    onClose();
  };

  const renderTagSelector = () => (
    <View style={styles.tagSection}>
      <Text style={styles.sectionTitle}>Tag</Text>
      <View style={styles.tagGrid}>
        {Object.values(NOTE_TAGS).map((tag) => (
          <TouchableOpacity
            key={tag.id}
            style={[
              styles.tagOption,
              selectedTag === tag.id && styles.tagOptionSelected,
              { borderColor: tag.color }
            ]}
            onPress={() => setSelectedTag(tag.id)}
          >
            <Text style={styles.tagIcon}>{tag.icon}</Text>
            <Text style={[
              styles.tagLabel,
              selectedTag === tag.id && styles.tagLabelSelected
            ]}>
              {tag.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>
            {existingNote ? 'Edit Note' : 'Add Note'}
          </Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.saveButton}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {callLogId && (
            <View style={styles.callInfo}>
              <Text style={styles.callInfoIcon}>📞</Text>
              <Text style={styles.callInfoText}>
                This note will be linked to a call
              </Text>
            </View>
          )}

          <View style={styles.contentSection}>
            <Text style={styles.sectionTitle}>Note Content</Text>
            <TextInput
              style={styles.contentInput}
              value={content}
              onChangeText={setContent}
              placeholder="Enter your note here..."
              placeholderTextColor="#999999"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              autoFocus
            />
          </View>

          {renderTagSelector()}

          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>Note Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Created by:</Text>
              <Text style={styles.infoValue}>User</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date:</Text>
              <Text style={styles.infoValue}>
                {new Date().toLocaleDateString()}
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E5E9',
  },
  cancelButton: {
    fontSize: 16,
    color: '#6B7280',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#14B8A6',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  callInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  callInfoIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  callInfoText: {
    fontSize: 14,
    color: '#1E40AF',
    flex: 1,
  },
  contentSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  contentInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1E5E9',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#1E293B',
    minHeight: 120,
    maxHeight: 200,
  },
  tagSection: {
    marginBottom: 24,
  },
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tagOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    minWidth: '45%',
  },
  tagOptionSelected: {
    backgroundColor: '#F0F9FF',
  },
  tagIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  tagLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  tagLabelSelected: {
    color: '#1E40AF',
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E5E9',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
  },
});

export default NotesModal;