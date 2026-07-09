// src/screens/HomeScreen.js
import React, { useLayoutEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ImageBackground,
} from 'react-native';
import { useApp } from '../contexts/AppContext';
import { book_curriculum } from '../data/curriculum';
import { getAudioMetadataById } from '../utils/audioSequenceService';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AntDesign from '@expo/vector-icons/AntDesign';

const BIBLE_TESTAMENTS = [
  {
    key: 'old_testament',
    name: 'Old Testament',
    color: '#04642c',
    emoji: '🐑',
    description: 'English Standard Version (ESV)',
  },
  {
    key: 'new_testament',
    name: 'New Testament',
    color: '#067e0e',
    emoji: '˗ˏˋ ✞ ˎˊ˗',
    description: 'English Standard Version (ESV)',
  },
];

const BOOK_LEVELS = [
  { key: 'beginner', color: '#360f5a', emoji: '📗' },
  { key: 'intermediate', color: '#360f5a', emoji: '📘' },
  { key: 'advanced', color: '#360f5a', emoji: '📙' },
];

const TESTAMENT_BACKGROUND_IMAGES = {
  old_testament: require('../../assets/old_testament.jpg'),
  new_testament: require('../../assets/new_testament.jpg'),
};

export default function HomeScreen({ navigation }) {
  const { currentAudioId, currentStreak, loading } = useApp();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Notes')}
            hitSlop={12}
            accessibilityLabel="My Notes"
          >
            <MaterialIcons name="edit-note" size={28} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Settings')}
            hitSlop={12}
            accessibilityLabel="Settings"
          >
            <AntDesign name="setting" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation]);

  // The Continue card resolves its label from the audio id, since Bible
  // chapters carry no level/week.
  const currentChapter = useMemo(
    () => (currentAudioId ? getAudioMetadataById(currentAudioId) : null),
    [currentAudioId]
  );
  const continueCardBackground = currentChapter
    ? TESTAMENT_BACKGROUND_IMAGES[currentChapter.testament]
    : null;

  const handleContinue = () => {
    if (!currentChapter) return;

    navigation.navigate('Player', {
      level: currentChapter.testament,
      weekNumber: null,
      audio: currentChapter,
    });
  };

  const handleTestamentPress = (testament) => {
    navigation.navigate('TestamentBooks', { testament, title: testament.name });
  };

  const handleBookLevelPress = (levelData) => {
    navigation.navigate('BooksByLevel', { level: levelData, title: levelData.title });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Daily streak */}
        <View style={styles.streakCard}>
          <AntDesign
            name="star"
            size={34}
            color={currentStreak > 0 ? '#F59E0B' : '#CBD5E1'}
          />
          <View style={styles.streakInfo}>
            <Text style={styles.streakCount}>{currentStreak}</Text>
            <Text style={styles.streakLabel}>day streak</Text>
          </View>
          <Text style={styles.streakHint}>
            {currentStreak > 0
              ? 'Finish a chapter today to keep it going.'
              : 'Finish a chapter to start your streak.'}
          </Text>
        </View>

        {/* Continue Section */}
        {currentChapter && (
          <TouchableOpacity
            style={styles.continueCard}
            onPress={handleContinue}
            activeOpacity={0.7}
          >
            {continueCardBackground && (
              <ImageBackground
                source={continueCardBackground}
                style={styles.continueBackground}
                imageStyle={styles.continueBackgroundImage}
              />
            )}
            <View style={styles.continueOverlay} />
            <View style={styles.continueContent}>
              <View style={styles.continueHeader}>
                <Text style={styles.continueLabel}>CONTINUE LISTENING</Text>
                <AntDesign name="play-circle" size={30} color="#ffff" />
              </View>
              <Text style={styles.continueLevel}>{currentChapter.bookName}</Text>
              <Text style={styles.continueWeek}>
                Chapter {currentChapter.chapterNumber} · {currentChapter.testamentName}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* AUDIO BIBLE DRAMATISED */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Audio Bible Dramatised</Text>

          {BIBLE_TESTAMENTS.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[styles.levelCard, { borderLeftColor: item.color }]}
              onPress={() => handleTestamentPress(item)}
              activeOpacity={0.7}
            >
              <View style={styles.levelHeader}>
                <View style={styles.levelTitleRow}>
                  <Text style={styles.levelEmoji}>{item.emoji}</Text>
                  <View style={styles.levelInfo}>
                    <Text style={styles.levelTitle}>{item.name}</Text>
                    <Text style={styles.levelDescription}>{item.description}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Spiritual Books */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended Books</Text>

          {BOOK_LEVELS.map((item) => {
            const levelData = book_curriculum[item.key];

            return (
              <TouchableOpacity
                key={item.key}
                style={[styles.levelCard, { borderLeftColor: item.color }]}
                onPress={() => handleBookLevelPress(levelData)}
                activeOpacity={0.7}
              >
                <View style={styles.levelHeader}>
                  <View style={styles.levelTitleRow}>
                    <Text style={styles.levelEmoji}>{item.emoji}</Text>
                    <View style={styles.levelInfo}>
                      <Text style={styles.levelTitle}>{levelData.title}</Text>
                      <Text style={styles.levelDescription}>{levelData.description}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    fontSize: 16,
    color: '#6a329f',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  streakCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  streakInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginLeft: 12,
    gap: 6,
  },
  streakCount: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1E293B',
  },
  streakLabel: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '600',
  },
  streakHint: {
    flexBasis: '100%',
    marginTop: 10,
    fontSize: 13,
    color: '#94A3B8',
  },
  continueCard: {
    backgroundColor: '#360f5a',
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#6a329f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
    position: 'relative',
  },
  continueBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  continueBackgroundImage: {
    opacity: 0.22,
    resizeMode: 'cover',
  },
  continueOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(54, 15, 90, 0.72)',
  },
  continueContent: {
    padding: 20,
  },
  continueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  continueLabel: {
    fontSize: 12,
    color: '#ffff',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  continueLevel: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffff',
    marginBottom: 4,
  },
  continueWeek: {
    fontSize: 16,
    color: '#ffff',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  levelCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#0000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  levelHeader: {
    marginBottom: 12,
  },
  levelTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  levelInfo: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  levelDescription: {
    fontSize: 14,
    color: '#64748B',
  },
});
