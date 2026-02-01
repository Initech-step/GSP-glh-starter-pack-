// src/screens/SettingsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { 
  clearAllData,
  getAudioFolderPath,
  pickAudioFolder,
  verifyAudioFolder,
  resetAudioFolder,
  getProgress,
  getNotes,
  saveProgress,
  saveNote,
  getCurrentPosition
} from '../utils/storage';
import {
  isLoggedIn,
  uploadProgress,
  downloadProgress,
  backupNotes,
  retrieveNotes,
} from '../utils/api';
import { useApp } from '../contexts/AppContext';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';


export default function SettingsScreen({ navigation }) {
  const { refreshProgress } = useApp();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [currentPath, setCurrentPath] = useState('Not configured');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCurrentPath();
  }, []);

  const loadCurrentPath = async () => {
    setIsLoading(true);
    const path = await getAudioFolderPath();
    setCurrentPath(path || 'Not configured');
    setIsLoading(false);
  };

  const handleChangeFolder = async () => {
    try {
      const folderPath = await pickAudioFolder();

      if (!folderPath) return;

      const verification = await verifyAudioFolder(folderPath);

      if (!verification.valid) {
        Alert.alert('Invalid Folder', verification.message);
        return;
      }

      Alert.alert('Success', 'Audio folder updated successfully!');
      await loadCurrentPath();
    } catch (error) {
      Alert.alert('Error', 'Could not change folder');
    }
  };

  const handleResetFolder = () => {
    Alert.alert(
      'Reset Audio Folder?',
      'You will need to select the folder again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetAudioFolder();
            await loadCurrentPath();
            Alert.alert('Reset Complete', 'Please select your audio folder again.');
          },
        },
      ]
    );
  };

  const handleResetProgress = () => {
    Alert.alert(
      'Reset Progress',
      'Are you sure you want to reset all your progress? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            await refreshProgress();
            Alert.alert(
              'Success',
              'All progress has been reset',
              [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
            );
          },
        },
      ]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      "God's Lighthouse Starter Kit App",
      'Version 1.0.0\n\nBuilt to help believers grow in their faith through the word.',
      [{ text: 'OK' }]
    );
  };

  const handleUploadProgress = async () => {
    const loggedIn = await isLoggedIn();
    if (!loggedIn) {
      navigation.navigate('LoginOut');
    }else{
      Alert.alert(
        'Upload Progress',
        'Upload your local progress to the cloud?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Upload',
            onPress: async () => {
              try {
                const progress = await getProgress();
                const position = await getCurrentPosition();

                const result = await uploadProgress(
                  progress,
                  position.level,
                  position.weekNumber,
                  position.audioId
                );

                if (result.success) {
                  Alert.alert('Success', 'Progress uploaded successfully!');
                } else {
                  Alert.alert('Error', result.error);
                }
              } catch (error) {
                Alert.alert('Error', 'Failed to upload progress');
              }
            },
          },
        ]
      );
    }
  };

  const handleDownloadProgress = async () => {
    const loggedIn = await isLoggedIn();
    if (!loggedIn) {
      navigation.navigate('LoginOut');
    }else{
      Alert.alert(
        'Download Progress',
        'Download progress from cloud? This will overwrite your local progress.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Download',
            style: 'destructive',
            onPress: async () => {
              try {
                const result = await downloadProgress();

                if (result.success) {
                  const { progress, current_level, current_week, current_audio } = result.data;

                  // Save to local storage
                  for (const [audioId, audioProgress] of Object.entries(progress)) {
                    await saveProgress(
                      audioId,
                      audioProgress.completed,
                      audioProgress.position
                    );
                  }

                  // Refresh the app
                  await refreshProgress();

                  Alert.alert('Success', 'Progress downloaded and synced!');
                } else {
                  Alert.alert('Error', result.error);
                }
              } catch (error) {
                Alert.alert('Error', 'Failed to download progress');
              }
            },
          },
        ]
      );
    }
  };

  const handleBackupNotes = async () => {
    const loggedIn = await isLoggedIn();
    if (!loggedIn) {
      navigation.navigate('LoginOut');
    }else{
      try {
        const notes = await getNotes();
        const result = await backupNotes(notes);

        if (result.success) {
          Alert.alert('Success', 'Notes backed up successfully!');
        } else {
          Alert.alert('Error', result.error);
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to backup notes');
      }
    }
  };

  const handleRestoreNotes = async () => {
    const loggedIn = await isLoggedIn();
    if (!loggedIn) {
      navigation.navigate('LoginOut');
    }else {
      Alert.alert(
        'Restore Notes',
        'Restore notes from cloud? This will overwrite your local notes.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Restore',
            style: 'destructive',
            onPress: async () => {
              try {
                const result = await retrieveNotes();

                if (result.success && result.data.notes) {
                  const notes = result.data.notes;

                  // Save each note locally
                  for (const [audioId, noteData] of Object.entries(notes)) {
                    await saveNote(audioId, noteData.text);
                  }

                  Alert.alert('Success', 'Notes restored successfully!');
                } else {
                  Alert.alert('Info', 'No notes found in cloud');
                }
              } catch (error) {
                Alert.alert('Error', 'Failed to restore notes');
              }
            },
          },
        ]
      );
    }

    
  };

  const settingsSections = [
    // {
    //   title: 'Notifications',
    //   items: [
    //     {
    //       label: 'Daily Reminders',
    //       type: 'switch',
    //       value: notificationsEnabled,
    //       onToggle: setNotificationsEnabled,
    //       description: 'Get reminded to continue your learning',
    //     },
    //   ],
    // },
    // {
    //   title: 'Data & Progress',
    //   items: [
    //     {
    //       label: 'Reset All Progress',
    //       type: 'button',
    //       onPress: handleResetProgress,
    //       icon: '🔄',
    //       description: 'Clear all completed messages and notes',
    //       destructive: true,
    //     },
    //   ],
    // },
    {
      title: 'About',
      items: [
        {
          label: 'About This App',
          type: 'button',
          onPress: handleAbout,
          icon: 'ℹ️',
        },
        {
          label: "God's Lighthouse",
          type: 'link',
          icon: '🌐',
          description: 'Visit our website @ www.g-lh.org',
        },
      ],
    },
    {
      title: 'Cloud Sync',
      items: [
        {
          label: 'Upload Progress',
          type: 'button',
          onPress: handleUploadProgress,
          icon: '☁️',
          description: 'Backup your progress to the cloud',
        },
        {
          label: 'Download Progress',
          type: 'button',
          onPress: handleDownloadProgress,
          icon: '⬇️',
          description: 'Restore progress from cloud',
        },
        {
          label: 'Backup Notes',
          type: 'button',
          onPress: handleBackupNotes,
          icon: '📝',
          description: 'Backup your notes to the cloud',
        },
        {
          label: 'Restore Notes',
          type: 'button',
          onPress: handleRestoreNotes,
          icon: '📥',
          description: 'Restore notes from cloud',
        },
      ],
    }
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            
            {section.items.map((item, itemIndex) => (
              <View key={itemIndex}>
                {item.type === 'switch' ? (
                  <View style={styles.settingRow}>
                    <View style={styles.settingInfo}>
                      <Text style={styles.settingLabel}>{item.label}</Text>
                      {item.description && (
                        <Text style={styles.settingDescription}>
                          {item.description}
                        </Text>
                      )}
                    </View>
                    <Switch
                      value={item.value}
                      onValueChange={item.onToggle}
                      trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
                      thumbColor={item.value ? '#2563EB' : '#F1F5F9'}
                    />
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.settingRow,
                      item.destructive && styles.settingRowDestructive,
                    ]}
                    onPress={item.onPress}
                    activeOpacity={0.7}
                  >
                    {item.icon && (
                      <Text style={styles.settingIcon}>{item.icon}</Text>
                    )}
                    <View style={styles.settingInfo}>
                      <Text
                        style={[
                          styles.settingLabel,
                          item.destructive && styles.settingLabelDestructive,
                        ]}
                      >
                        {item.label}
                      </Text>
                      {item.description && (
                        <Text style={styles.settingDescription}>
                          {item.description}
                        </Text>
                      )}
                    </View>
                    <Text style={styles.chevron}>›</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        ))}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Audio Storage</Text>
          
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="folder" size={24} color="#360f5a" />
              <Text style={styles.cardTitle}>Current Folder</Text>
            </View>
            <Text style={styles.pathText}>
              {currentPath}
            </Text>
          </View>

          {/* <TouchableOpacity style={styles.button} onPress={handleChangeFolder}>
            <MaterialIcons name="folder-open" size={20} color="#fff" />
            <Text style={styles.buttonText}>Change Audio Folder</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonDanger]}
            onPress={handleResetFolder}
          >
            <MaterialIcons name="refresh" size={20} color="#fff" />
            <Text style={styles.buttonText}>Reset Folder</Text>
          </TouchableOpacity> */}
        </View>

        {/* App Info Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            God's Lighthouse Starter Kit
          </Text>
          <Text style={styles.footerSubtext}>
            Offline Edition v1.0.0
          </Text>
          {/* <Text style={styles.footerVerse}>
            "Thy word is a lamp unto my feet,{'\n'}
            and a light unto my path."{'\n'}
            - Psalm 119:105
          </Text> */}
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#64748B',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  settingRow: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  settingRowDestructive: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  settingIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  settingLabelDestructive: {
    color: '#DC2626',
  },
  settingDescription: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  chevron: {
    fontSize: 24,
    color: '#CBD5E1',
    marginLeft: 8,
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 16,
  },
  footerVerse: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  buttonDanger: {
    backgroundColor: '#ef4444',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pathText: {
    fontSize: 13,
    color: '#64748B',
    fontFamily: 'monospace',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#360f5a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#360f5a',
    lineHeight: 20,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EEF2FF',
    padding: 16,
    margin: 20,
    marginTop: 0,
    borderRadius: 12,
    gap: 12,
  },
  pathText: {
    fontSize: 13,
    color: '#64748B',
    fontFamily: 'monospace',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 8,
  },
  section: {
    padding: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
});