// src/screens/LevelScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useApp } from '../contexts/AppContext';
import { curriculum } from '../data/curriculum';
import { PlayIcon } from '../components/Icons';

export default function LevelScreen({ route, navigation }) {
  const { level, title } = route.params;
  const { progress, isWeekUnlocked } = useApp();
  
  const levelData = curriculum[level];

  const handleWeekPress = (weekNumber) => {
    const unlocked = isWeekUnlocked(level, weekNumber);
    
    if (!unlocked) {
      Alert.alert(
        'Week Locked 🔒',
        'Complete the previous week to unlock this one.',
        [{ text: 'OK' }]
      );
      return;
    }

    const weekData = levelData.weeks.find(w => w.weekNumber === weekNumber);
    navigation.navigate('Week', {
      level,
      weekNumber,
      weekData,
    });
  };

  const getWeekProgress = (week) => {
    const completed = week.audios.filter(
      audio => progress[audio.id]?.completed
    ).length;
    return {
      completed,
      total: week.audios.length,
      percentage: (completed / week.audios.length) * 100,
    };
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Level Info Header */}
        <View style={styles.headerCard}>
          <Text style={styles.levelTitle}>{levelData.title}</Text>
          <Text style={styles.levelDescription}>
            {levelData.description}
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{levelData.weeks.length}</Text>
              <Text style={styles.statLabel}>Weeks</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {levelData.weeks.reduce((sum, w) => sum + w.audios.length, 0)}
              </Text>
              <Text style={styles.statLabel}>Messages</Text>
            </View>
          </View>
        </View>

        {/* Weeks List */}
        <View style={styles.weeksSection}>
          <Text style={styles.sectionTitle}>Weekly Lessons</Text>
          
          {levelData.weeks.map((week, index) => {
            const weekProgress = getWeekProgress(week);
            const unlocked = isWeekUnlocked(level, week.weekNumber);
            const isCompleted = weekProgress.completed === weekProgress.total;

            return (
              <TouchableOpacity
                key={week.weekNumber}
                style={[
                  styles.weekCard,
                  !unlocked && styles.weekCardLocked,
                  isCompleted && styles.weekCardCompleted,
                ]}
                onPress={() => handleWeekPress(week.weekNumber)}
                activeOpacity={unlocked ? 0.7 : 1}
              >
                <View style={styles.weekHeader}>
                  <View style={styles.weekNumberBadge}>
                    <Text style={styles.weekNumberText}>
                      {unlocked ? week.weekNumber : '🔒'}
                    </Text>
                  </View>
                  
                  <View style={styles.weekInfo}>
                    <Text style={[
                      styles.weekTitle,
                      !unlocked && styles.textLocked
                    ]}>
                      Week {week.weekNumber}
                    </Text>
                    <Text style={[
                      styles.weekSubtitle,
                      !unlocked && styles.textLocked
                    ]}>
                      {week.title}
                    </Text>
                  </View>

                  {isCompleted && (
                    <View style={styles.completedBadge}>
                      <Text style={styles.completedIcon}>✓</Text>
                    </View>
                  )}
                </View>

                {unlocked && (
                  <>
                    <View style={styles.weekStats}>
                      <Text style={styles.weekStatsText}>
                        {week.audios.length} messages
                      </Text>
                      <Text style={styles.weekProgressText}>
                        {weekProgress.completed}/{weekProgress.total} completed
                      </Text>
                    </View>

                    {/* Progress Bar */}
                    <View style={styles.progressBarContainer}>
                      <View 
                        style={[
                          styles.progressBar,
                          { width: `${weekProgress.percentage}%` }
                        ]} 
                      />
                    </View>
                  </>
                )}

                {!unlocked && (
                  <Text style={styles.lockedText}>
                    Complete previous week to unlock
                  </Text>
                )}
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  headerCard: {
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
  levelTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  levelDescription: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 16,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#360f5a',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E2E8F0',
  },
  weeksSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  weekCard: {
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
  weekCardLocked: {
    backgroundColor: '#F1F5F9',
    opacity: 0.7,
  },
  weekCardCompleted: {
    borderWidth: 2,
    borderColor: '#360f5a',
  },
  weekHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  weekNumberBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  weekNumberText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#360f5a',
  },
  weekInfo: {
    flex: 1,
  },
  weekTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 2,
  },
  weekSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  textLocked: {
    color: '#94A3B8',
  },
  completedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#360f5a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedIcon: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  weekStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weekStatsText: {
    fontSize: 13,
    color: '#64748B',
  },
  weekProgressText: {
    fontSize: 13,
    color: '#360f5a',
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#360f5a',
    borderRadius: 2,
  },
  lockedText: {
    fontSize: 13,
    color: '#94A3B8',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});