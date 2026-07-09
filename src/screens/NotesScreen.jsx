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
import Feather from '@expo/vector-icons/Feather';

import { saveNote, getNote, getNotes, deleteNote } from '../utils/storage';
import { getAudioMetadataById } from '../utils/audioSequenceService';
import { useTheme, useThemedStyles } from '../theme';
import { Card, GradientButton, SectionHeader, EmptyState } from '../components/ui';
import { NotesEmptyIcon } from '../components/icons';

export default function NotesScreen({ route }) {
  const audioId = route.params?.audioId;
  const { colors, gradients } = useTheme();
  const styles = useThemedStyles(makeStyles);

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
    const notesArray = Object.keys(notes).map((id) => ({
      audioId: id,
      text: notes[id].text,
      updatedAt: notes[id].updatedAt,
    }));

    // Sort by most recent
    notesArray.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    setAllNotes(notesArray);
  };

  const loadCurrentNote = async () => {
    const note = await getNote(audioId);
    setNoteText(note);
  };

  // Notes carried over from the teaching audio no longer resolve to a title.
  const resolveAudioTitle = (targetAudioId) => {
    const audioMetadata = getAudioMetadataById(targetAudioId);
    if (!audioMetadata) {
      return 'Unknown Message';
    }

    if (audioMetadata.bookName && audioMetadata.chapterNumber) {
      return `${audioMetadata.bookName} - Chapter ${audioMetadata.chapterNumber}`;
    }

    return audioMetadata.title || 'Bible Audio';
  };

  const findAudioTitle = () => {
    setCurrentAudioTitle(resolveAudioTitle(audioId));
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
    Alert.alert('Delete Note', 'Are you sure you want to delete this note?', [
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
    ]);
  };

  const handleViewNote = (note) => {
    setNoteText(note.text);
    setCurrentAudioTitle(resolveAudioTitle(note.audioId));
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
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Current Note Editor (if audioId provided) */}
        {audioId && (
          <Card gradient style={styles.editorCard} contentStyle={styles.editorContent}>
            <View style={styles.editorHeader}>
              <Text style={styles.editorTitle}>Note for:</Text>
              <Text style={styles.audioTitle}>{currentAudioTitle}</Text>
            </View>

            <TextInput
              style={styles.textInput}
              placeholder="Write your notes, insights, and revelations here..."
              placeholderTextColor={colors.textFaint}
              value={noteText}
              onChangeText={setNoteText}
              multiline
              numberOfLines={10}
              textAlignVertical="top"
            />

            <GradientButton
              title={isSaving ? 'Saving...' : 'Save Note'}
              onPress={handleSaveNote}
              loading={isSaving}
              size="md"
            />
          </Card>
        )}

        {/* All Notes List */}
        <View style={styles.notesListSection}>
          <SectionHeader title={`All Notes (${allNotes.length})`} />

          {allNotes.length === 0 ? (
            <Card contentStyle={styles.emptyContent}>
              <EmptyState
                icon={<NotesEmptyIcon size={56} gradient={gradients.play} />}
                title="No notes yet"
                subtitle="Start taking notes while listening to messages"
              />
            </Card>
          ) : (
            allNotes.map((note) => {
              const audioTitle = resolveAudioTitle(note.audioId);

              return (
                <Card key={note.audioId} style={styles.noteCard} contentStyle={styles.noteContent}>
                  <View style={styles.noteHeader}>
                    <View style={styles.noteInfo}>
                      <Text style={styles.noteAudioTitle} numberOfLines={2}>
                        {audioTitle}
                      </Text>
                      <Text style={styles.noteDate}>{formatDate(note.updatedAt)}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteNote(note.audioId)}
                      hitSlop={10}
                      accessibilityLabel="Delete note"
                    >
                      <Feather name="trash-2" size={18} color={colors.danger} />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.noteText} numberOfLines={3}>
                    {note.text}
                  </Text>

                  {note.audioId !== audioId && (
                    <TouchableOpacity style={styles.viewButton} onPress={() => handleViewNote(note)}>
                      <Text style={styles.viewButtonText}>View/Edit</Text>
                    </TouchableOpacity>
                  )}
                </Card>
              );
            })
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const makeStyles = ({ colors, typography, spacing, radii }) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    scrollContent: {
      padding: spacing.lg,
      paddingBottom: spacing.xxxl,
    },

    editorCard: {
      marginBottom: spacing.xl,
      borderRadius: radii.lg,
    },
    editorContent: {
      padding: spacing.lg,
    },
    editorHeader: {
      marginBottom: spacing.base,
    },
    editorTitle: {
      ...typography.textStyles.body,
      color: colors.textMuted,
      marginBottom: spacing.xs,
    },
    audioTitle: {
      ...typography.textStyles.bookTitle,
      fontSize: typography.fontSizes.lg,
      color: colors.text,
    },
    textInput: {
      backgroundColor: colors.bg,
      borderRadius: radii.md,
      padding: spacing.base,
      fontFamily: typography.fonts.body,
      fontSize: typography.fontSizes.base,
      color: colors.text,
      minHeight: 150,
      marginBottom: spacing.base,
      borderWidth: 1,
      borderColor: colors.border,
    },

    notesListSection: {
      marginBottom: spacing.lg,
    },
    emptyContent: {
      paddingHorizontal: spacing.lg,
    },

    noteCard: {
      marginBottom: spacing.md,
    },
    noteContent: {
      padding: spacing.base,
    },
    noteHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.md,
    },
    noteInfo: {
      flex: 1,
      marginRight: spacing.md,
    },
    noteAudioTitle: {
      fontFamily: typography.fonts.semibold,
      fontSize: typography.fontSizes.base,
      color: colors.text,
      marginBottom: spacing.xs,
      lineHeight: 20,
    },
    noteDate: {
      ...typography.textStyles.caption,
      fontSize: typography.fontSizes.caption,
      color: colors.textMuted,
    },
    deleteButton: {
      padding: spacing.xs,
    },
    noteText: {
      ...typography.textStyles.body,
      color: colors.textMuted,
      marginBottom: spacing.md,
    },
    viewButton: {
      backgroundColor: colors.primaryTint,
      borderRadius: radii.sm,
      padding: 10,
      alignItems: 'center',
    },
    viewButtonText: {
      fontFamily: typography.fonts.semibold,
      fontSize: typography.fontSizes.body,
      color: colors.primary,
    },
  });
