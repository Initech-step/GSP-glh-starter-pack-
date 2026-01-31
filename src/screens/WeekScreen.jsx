// src/screens/WeekScreen.js
import React, { useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useApp } from '../contexts/AppContext';
import AntDesign from '@expo/vector-icons/AntDesign';

export default function WeekScreen({ route, navigation }) {
  const { level, weekNumber, weekData } = route.params;
  const { progress, updateCurrentPosition } = useApp();

  const handleAudioPress = async (audio) => {
    await updateCurrentPosition(level, weekNumber, audio.id);
    
    navigation.navigate('Player', {
      level,
      weekNumber,
      audio,
    });
  };

  const isAudioCompleted = (audioId) => {
    return progress[audioId]?.completed || false;
  };

  const getAudioPosition = (audioId) => {
    return progress[audioId]?.position || 0;
  };


  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Week Header */}
        <View style={styles.headerCard}>
          <Text style={styles.weekNumber}>Week {weekNumber}</Text>
          <Text style={styles.weekTitle}>{weekData.title}</Text>
          <View style={styles.statsRow}>
            <Text style={styles.statsText}>
              {weekData.audios.length} messages in this week
            </Text>
          </View>
        </View>

        {/* Audio List */}
        <View style={styles.audiosSection}>
          <Text style={styles.sectionTitle}>Messages</Text>
          
          {weekData.audios.map((audio, index) => {
            const completed = isAudioCompleted(audio.id);
            const hasProgress = getAudioPosition(audio.id) > 0;

            return (
              <TouchableOpacity
                key={audio.id}
                style={[
                  styles.audioCard,
                  completed && styles.audioCardCompleted,
                ]}
                onPress={() => handleAudioPress(audio)}
                activeOpacity={0.7}
              >
                <View style={styles.audioHeader}>
                  <View style={styles.audioNumberBadge}>
                    {completed ? (
                      <Text style={styles.audioNumberCompleted}>✓</Text>
                    ) : (
                      <Text style={styles.audioNumber}>{index + 1}</Text>
                    )}
                  </View>

                  <View style={styles.audioInfo}>
                    <Text style={styles.audioTitle}>{audio.title}</Text>
                    {audio.date && (
                      <Text style={styles.audioDate}>{audio.date}</Text>
                    )}
                  </View>

                  <View style={styles.playIconContainer}>
                    <Text style={styles.playIcon}>
                      <AntDesign name="play-circle" size={30} color="#360f5a" />
                    </Text>
                  </View>
                </View>

                {/* Status Badge */}
                <View style={styles.statusRow}>
                  {completed && (
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusBadgeText}>✓ Completed</Text>
                    </View>
                  )}
                  {!completed && hasProgress && (
                    <View style={[styles.statusBadge, styles.statusBadgeProgress]}>
                      <Text style={styles.statusBadgeTextProgress}>In Progress</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Completion Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoEmoji}>💡</Text>
          <Text style={styles.infoText}>
            Complete all messages in this week to unlock the next week
          </Text>
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
  weekNumber: {
    fontSize: 14,
    color: '#360f5a',
    fontWeight: 'bold',
    marginBottom: 4,
    letterSpacing: 1,
  },
  weekTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 12,
  },
  statsRow: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  statsText: {
    fontSize: 14,
    color: '#64748B',
  },
  audiosSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  audioCard: {
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
  audioCardCompleted: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#360f5a',
  },
  audioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  audioNumberBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  audioNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#360f5a',
  },
  audioNumberCompleted: {
    fontSize: 20,
    color: '#360f5a',
  },
  audioInfo: {
    flex: 1,
  },
  audioTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
    lineHeight: 20,
  },
  audioDate: {
    fontSize: 12,
    color: '#64748B',
  },
  playIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 20,
  },
  statusRow: {
    marginTop: 12,
  },
  statusBadge: {
    backgroundColor: '#360f5a',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  statusBadgeProgress: {
    backgroundColor: '#F59E0B',
  },
  statusBadgeTextProgress: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
});