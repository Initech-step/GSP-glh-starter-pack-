// src/screens/NotesScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  saveNote,
  getNote,
  getNotes,
  deleteNote,
} from '../utils/storage';
import { curriculum } from '../data/curriculum';

export default function NotesScreen({ route, navigation }) {
  const audioId = route.params?.audioId;
  
  const [noteText, setNoteText] = useState('');
  const [allNotes, setAllNotes] = useState([]);
  const [currentAudioTitle, setCurrentAudioTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadNotes();
    if (audioId) {
      loadCurrentNote();
      findAudioTitle();
    }
  }, [audioId]);

  const loadNotes = async () => {
    const notes = await getNotes();
    const notesArray = Object.keys(notes).map(id => ({
      audioId: id,
      text: notes[id].text,
      updatedAt: notes[id].updatedAt,
    }));
    
    // Sort by most recent
    notesArray.sort((a, b) => 
      new Date(b.updatedAt) - new Date(a.updatedAt)
    );
    
    setAllNotes(notesArray);
  };

  const loadCurrentNote = async () => {
    const note = await getNote(audioId);
    setNoteText(note);
  };

  const findAudioTitle = () => {
    // Search through curriculum to find audio title
    for (const level of Object.values(curriculum)) {
      for (const week of level.weeks) {
        const audio = week.audios.find(a => a.id === audioId);
        if (audio) {
          setCurrentAudioTitle(audio.title);
          return;
        }
      }
    }
  };

  const handleSaveNote = async () => {
    if (!audioId) {
      Alert.alert('Error', 'No audio selected');
      return;
    }

    if (!noteText.trim()) {
      Alert.alert('Empty Note', 'Please enter some text before saving');
      return;
    }

    setIsSaving(true);
    try {
      await saveNote(audioId, noteText.trim());
      await loadNotes();
      Alert.alert('Success', 'Note saved successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save note');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteNote = (noteAudioId) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteNote(noteAudioId);
            await loadNotes();
            if (noteAudioId === audioId) {
              setNoteText('');
            }
          },
        },
      ]
    );
  };

  const handleViewNote = (note) => {
    setNoteText(note.text);
    // Find and display audio title
    for (const level of Object.values(curriculum)) {
      for (const week of level.weeks) {
        const audio = week.audios.find(a => a.id === note.audioId);
        if (audio) {
          setCurrentAudioTitle(audio.title);
          return;
        }
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Current Note Editor (if audioId provided) */}
        {audioId && (
          <View style={styles.editorSection}>
            <View style={styles.editorHeader}>
              <Text style={styles.editorTitle}>Note for:</Text>
              <Text style={styles.audioTitle}>{currentAudioTitle}</Text>
            </View>

            <TextInput
              style={styles.textInput}
              placeholder="Write your notes, insights, and revelations here..."
              placeholderTextColor="#94A3B8"
              value={noteText}
              onChangeText={setNoteText}
              multiline
              numberOfLines={10}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
              onPress={handleSaveNote}
              disabled={isSaving}
            >
              <Text style={styles.saveButtonText}>
                {isSaving ? 'Saving...' : 'Save Note'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* All Notes List */}
        <View style={styles.notesListSection}>
          <Text style={styles.sectionTitle}>
            All Notes ({allNotes.length})
          </Text>

          {allNotes.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📝</Text>
              <Text style={styles.emptyText}>No notes yet</Text>
              <Text style={styles.emptySubtext}>
                Start taking notes while listening to messages
              </Text>
            </View>
          ) : (
            allNotes.map((note) => {
              // Find audio title for this note
              let audioTitle = 'Unknown Message';
              for (const level of Object.values(curriculum)) {
                for (const week of level.weeks) {
                  const audio = week.audios.find(a => a.id === note.audioId);
                  if (audio) {
                    audioTitle = audio.title;
                    break;
                  }
                }
              }

              return (
                <View key={note.audioId} style={styles.noteCard}>
                  <View style={styles.noteHeader}>
                    <View style={styles.noteInfo}>
                      <Text style={styles.noteAudioTitle} numberOfLines={2}>
                        {audioTitle}
                      </Text>
                      <Text style={styles.noteDate}>
                        {formatDate(note.updatedAt)}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteNote(note.audioId)}
                    >
                      <Text style={styles.deleteIcon}>🗑️</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.noteText} numberOfLines={3}>
                    {note.text}
                  </Text>

                  {note.audioId !== audioId && (
                    <TouchableOpacity
                      style={styles.viewButton}
                      onPress={() => handleViewNote(note)}
                    >
                      <Text style={styles.viewButtonText}>View/Edit</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  editorSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  editorHeader: {
    marginBottom: 16,
  },
  editorTitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  audioTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    lineHeight: 22,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#1E293B',
    minHeight: 150,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  saveButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  notesListSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  noteCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  noteInfo: {
    flex: 1,
    marginRight: 12,
  },
  noteAudioTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
    lineHeight: 20,
  },
  noteDate: {
    fontSize: 12,
    color: '#64748B',
  },
  deleteButton: {
    padding: 4,
  },
  deleteIcon: {
    fontSize: 20,
  },
  noteText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 12,
  },
  viewButton: {
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  viewButtonText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '600',
  },
});