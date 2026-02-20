// src/screens/HomeScreen.js
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useApp } from '../contexts/AppContext';
import { curriculum, book_curriculum } from '../data/curriculum';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AntDesign from '@expo/vector-icons/AntDesign';

export default function HomeScreen({ navigation }) {
  const { 
    currentLevel, 
    currentWeek, 
    currentAudioId,
    getCompletionStats,
    loading 
  } = useApp();

  const levels = [
    { key: 'beginners', color: '#360f5a', emoji: '🌱' },
    { key: 'intermediary', color: '#360f5a', emoji: '🌿' },
    { key: 'advanced', color: '#360f5a', emoji: '🌳' },
  ];
  
  const book_levels = [
    { key: 'beginner', color: '#360f5a', emoji: '📗' },
    { key: 'intermediate', color: '#360f5a', emoji: '📘' },
    { key: 'advanced', color: '#360f5a', emoji: '📙' },
  ];

  const bible_levels = [
    { 
      key: 'old_testament', 
      name: 'Old Testament', 
      color: '#04642c', 
      emoji: '🐑', 
      description: 'English Standard Version (ESV)'
    },
    { 
      key: 'new_testament', 
      name: 'New Testament', 
      color: '#067e0e', 
      emoji: '˗ˏˋ ✞ ˎˊ˗' , 
      description: 'English Standard Version (ESV)'
    },
  ];

  const handleContinue = () => {
    if (currentAudioId) {
      const levelData = curriculum[currentLevel];
      const weekData = levelData.weeks.find(w => w.weekNumber === currentWeek);
      const audioData = weekData?.audios.find(a => a.id === currentAudioId);

      if (audioData) {
        navigation.navigate('Player', {
          level: currentLevel,
          weekNumber: currentWeek,
          audio: audioData,
        });
      }
    } else {
      // Navigate to first audio if no current audio
      navigation.navigate('Level', {
        level: 'beginners',
        title: curriculum.beginners.title,
      });
    }
  };

  const handleLevelPress = (levelKey) => {
    navigation.navigate('Level', {
      level: levelKey,
      title: curriculum[levelKey].title,
    });
  };

  const handleBookLevelPress = (levelData) => {
    navigation.navigate('BooksByLevel', {
      level: levelData,
      title: levelData.title,});
  };

  const handleBibleTestamentPress = (testamentData) => {
    navigation.navigate('TestamentBooks', {
      testament: testamentData,
      title: testamentData.title,});
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
        {/* Continue Section */}
        {currentAudioId && (
          <TouchableOpacity 
            style={styles.continueCard}
            onPress={handleContinue}
            activeOpacity={0.7}
          >
            <View style={styles.continueHeader}>
              <Text style={styles.continueLabel}>CONTINUE LISTENING</Text>
              <AntDesign name="play-circle" size={30} color="#ffff" />
            </View>
            <Text style={styles.continueLevel}>
              {curriculum[currentLevel].title}
            </Text>
            <Text style={styles.continueWeek}>
              Week {currentWeek}
            </Text>
          </TouchableOpacity>
        )}

        {/* Levels Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Learning Paths</Text>
          
          {levels.map((item) => {
            const levelData = curriculum[item.key];
            const stats = getCompletionStats(item.key);
            const isCurrentLevel = item.key === currentLevel;

            return (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.levelCard,
                  { borderLeftColor: item.color },
                  isCurrentLevel && styles.levelCardActive
                ]}
                onPress={() => handleLevelPress(item.key)}
                activeOpacity={0.7}
              >
                <View style={styles.levelHeader}>
                  <View style={styles.levelTitleRow}>
                    <Text style={styles.levelEmoji}>{item.emoji}</Text>
                    <View style={styles.levelInfo}>
                      <Text style={styles.levelTitle}>{levelData.title}</Text>
                      <Text style={styles.levelDescription}>
                        {levelData.description}
                      </Text>
                    </View>
                  </View>
                  {isCurrentLevel && (
                    <View style={styles.currentBadge}>
                      <Text style={styles.currentBadgeText}>Current</Text>
                    </View>
                  )}
                </View>

                <View style={styles.levelStats}>
                  <Text style={styles.statsText}>
                    {levelData.weeks.length} weeks • {stats.total} messages
                  </Text>
                  <Text style={[styles.statsProgress, { color: item.color }]}>
                    {stats.completed}/{stats.total} completed
                  </Text>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressBarContainer}>
                  <View 
                    style={[
                      styles.progressBar,
                      { 
                        width: `${stats.percentage}%`,
                        backgroundColor: item.color 
                      }
                    ]} 
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
        
        {/* Spiritual Books */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended Books</Text>
          
          {book_levels.map((item) => {
            const levelData = book_curriculum[item.key];

            return (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.levelCard,
                  { borderLeftColor: item.color },
                ]}
                onPress={() => handleBookLevelPress(levelData)}
                activeOpacity={0.7}
              >
                <View style={styles.levelHeader}>
                  <View style={styles.levelTitleRow}>
                    <Text style={styles.levelEmoji}>{item.emoji}</Text>
                    <View style={styles.levelInfo}>
                      <Text style={styles.levelTitle}>{levelData.title}</Text>
                      <Text style={styles.levelDescription}>
                        {levelData.description}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* AUDIO BIBLE DRAMATISED */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Audio Bible Dramatised</Text>
          
          {bible_levels.map((item) => {

            return (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.levelCard,
                  { borderLeftColor: item.color },
                ]}
                onPress={() => handleBibleTestamentPress(item)}
                activeOpacity={0.7}
              >
                <View style={styles.levelHeader}>
                  <View style={styles.levelTitleRow}>
                    <Text style={styles.levelEmoji}>{item.emoji}</Text>
                    <View style={styles.levelInfo}>
                      <Text style={styles.levelTitle}>{item.name}</Text>
                      <Text style={styles.levelDescription}>
                        {item.description}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.quickActionsRow}>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('Notes')}
            >
              <MaterialIcons style={styles.quickActionEmoji} name="notes" size={24} color="#360f5a" />
              <Text style={styles.quickActionText}>My Notes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('Settings')}
            >
              <AntDesign style={styles.quickActionEmoji} name="setting" size={30} color="#360f5a" />
              <Text style={styles.quickActionText}>Settings</Text>
            </TouchableOpacity>
          </View>
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
  header: {
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
  },
  continueCard: {
    backgroundColor: '#360f5a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#6a329f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
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
  continueIcon: {
    fontSize: 20,
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
  levelCardActive: {
    borderWidth: 2,
    borderColor: '#6a329f',
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
  currentBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#6a329f',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  currentBadgeText: {
    fontSize: 9,
    color: '#fff',
    fontWeight: 'bold',
  },
  levelStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statsText: {
    fontSize: 13,
    color: '#64748B',
  },
  statsProgress: {
    fontSize: 13,
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6a329f',
  },
});