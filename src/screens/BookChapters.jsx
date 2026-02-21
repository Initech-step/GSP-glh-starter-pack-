import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import React from 'react';
import Feather from '@expo/vector-icons/Feather';
import AntDesign from '@expo/vector-icons/AntDesign';

const TESTAMENT_CONFIG = {
  old_testament: { accent: '#360f5a', accentLight: '#ebdefb' },
  new_testament: { accent: '#360f5a', accentLight: '#ebdefb' },
};

function formatDuration(seconds) {
  if (!seconds) return null;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function BookChapters({ route, navigation }) {
  const { book, testament } = route.params;
  // book = { id, name, audios: [{ id, title, duration, date, filePath, ... }] }

  const config = TESTAMENT_CONFIG[testament?.key] || {
    accent: '#360f5a',
    accentLight: '#f3eeff',
  };

  const audios = book.audios ?? [];

  const handleAudioPress = (audio, index) => {
    navigation.navigate('Player', {
      level: testament?.key,
      weekNumber: null,
      audio: {
        ...audio,
        // normalize title to chapter label if raw filename
        //displayTitle: `Chapter ${index + 1}`,
      },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={[styles.header, { backgroundColor: config.accent }]}>
          <Text style={styles.headerSuper}>{testament?.name ?? 'Bible'}</Text>
          <Text style={styles.headerTitle}>{book.name}</Text>
          <View style={styles.headerBadge}>
            <Feather name="list" size={13} color={config.accent} />
            <Text style={[styles.headerBadgeText, { color: config.accent }]}>
              {audios.length} {audios.length === 1 ? 'Chapter' : 'Chapters'}
            </Text>
          </View>
        </View>

        {/* Chapter List */}
        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>Chapters</Text>

          {audios.length === 0 && (
            <View style={styles.emptyState}>
              <Feather name="inbox" size={40} color="#CBD5E1" />
              <Text style={styles.emptyText}>No chapters available</Text>
            </View>
          )}

          {audios.map((audio, index) => (
            <TouchableOpacity
              key={audio.id}
              style={styles.chapterCard}
              onPress={() => handleAudioPress(audio, index)}
              activeOpacity={0.72}
            >
              {/* Chapter number */}
              <View style={[styles.chapterNum, { backgroundColor: config.accentLight }]}>
                <Text style={[styles.chapterNumText, { color: config.accent }]}>
                  {index + 1}
                </Text>
              </View>

              {/* Info */}
              <View style={styles.chapterInfo}>
                <Text style={styles.chapterTitle}>Chapter {index + 1}</Text>
                {audio.duration ? (
                  <View style={styles.metaRow}>
                    <Feather name="clock" size={11} color="#94A3B8" />
                    <Text style={styles.metaText}>{formatDuration(audio.duration)}</Text>
                    {audio.size ? (
                      <>
                        <Text style={styles.metaDot}>·</Text>
                        <Text style={styles.metaText}>{audio.size}</Text>
                      </>
                    ) : null}
                  </View>
                ) : null}
              </View>

              {/* Play button */}
              <View style={[styles.playBtn, { backgroundColor: config.accentLight }]}>
                <AntDesign name="play-circle" size={14} color={config.accent} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingBottom: 48,
  },

  /* Header */
  header: {
    paddingTop: 32,
    paddingBottom: 28,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    marginBottom: 24,
  },
  headerSuper: {
    fontSize: 11,
    letterSpacing: 2.5,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 14,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  headerBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },

  /* List section */
  listSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 14,
  },

  /* Empty */
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: '#94A3B8',
  },

  /* Chapter card */
  chapterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
    gap: 14,
  },
  chapterNum: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chapterNumText: {
    fontSize: 16,
    fontWeight: '800',
  },
  chapterInfo: {
    flex: 1,
  },
  chapterTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  metaDot: {
    fontSize: 12,
    color: '#CBD5E1',
  },
  playBtn: {
    width: 36,
    height: 36,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
});