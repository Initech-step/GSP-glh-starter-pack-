// src/screens/SettingsScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Switch, Linking } from 'react-native';
import { AudioPro } from 'react-native-audio-pro';
import Feather from '@expo/vector-icons/Feather';

import {
  clearAllData,
  getAudioFolderPath,
  getProgress,
  getNotes,
  getCurrentPosition,
  getSleepTimerEnabled,
  setSleepTimerEnabled,
  getRemindersEnabled,
  setRemindersEnabled,
  setRepeatCurrentChapterEnabled,
  setOnboardingCompleted,
} from '../utils/storage';
import {
  isLoggedIn,
  uploadProgress,
  downloadProgress,
  backupNotes,
  retrieveNotes,
} from '../utils/api';
import { useApp } from '../contexts/AppContext';
import {
  refreshRepeatCurrentChapterPreference,
  refreshSleepTimerPreference,
} from '../services/audioSetup';
import { ensurePermission, refreshReminderPreference } from '../services/notificationReminders';
import { useTheme, useThemedStyles } from '../theme';
import { ScreenScrollView, Card, Surface, SectionHeader } from '../components/ui';

const WEBSITE_URL = 'https://www.g-lh.org';

const THEME_OPTIONS = [
  { mode: 'system', label: 'System', icon: 'smartphone' },
  { mode: 'light', label: 'Light', icon: 'sun' },
  { mode: 'dark', label: 'Dark', icon: 'moon' },
];

/** Segmented control for light / dark / follow-system. */
function ThemeToggle() {
  const { colors, gradients, mode, setMode, radii } = useTheme();
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={styles.themeToggle}>
      {THEME_OPTIONS.map((option) => {
        const selected = mode === option.mode;
        const tint = selected ? colors.onGradient : colors.textMuted;

        return (
          <TouchableOpacity
            key={option.mode}
            style={styles.themeSegment}
            onPress={() => setMode(option.mode)}
            activeOpacity={0.8}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
          >
            <Surface
              gradient={selected ? gradients.play : undefined}
              backgroundColor={colors.surface}
              elevation={false}
              radius={radii.sm + 2}
              innerStyle={styles.themeSegmentInner}
            >
              <Feather name={option.icon} size={18} color={tint} />
              <Text style={[styles.themeSegmentText, { color: tint }]}>{option.label}</Text>
            </Surface>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function SettingsScreen({ navigation }) {
  const { refreshProgress } = useApp();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [currentPath, setCurrentPath] = useState('Not configured');
  const [isLoading, setIsLoading] = useState(true);
  const [sleepTimerEnabled, setSleepTimerEnabledState] = useState(false);

  useEffect(() => {
    loadCurrentPath();
    loadSleepTimerPreference();
    loadReminderPreference();
  }, []);

  const loadSleepTimerPreference = async () => {
    const enabled = await getSleepTimerEnabled();
    setSleepTimerEnabledState(enabled);
  };

  const loadReminderPreference = async () => {
    const enabled = await getRemindersEnabled();
    setNotificationsEnabled(enabled);
  };

  const loadCurrentPath = async () => {
    setIsLoading(true);
    const path = await getAudioFolderPath();
    setCurrentPath(path || 'Not configured');
    setIsLoading(false);
  };

  const handleResetAllData = () => {
    Alert.alert(
      'Reset App Data',
      'This will clear progress, your listening streak and listen counts, notes, cached audio files, saved audio and PDF URIs, folder selection, sleep timer preference, onboarding state, and other local app data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              AudioPro.clear();
              await clearAllData();
              await setRepeatCurrentChapterEnabled(false);
              await setOnboardingCompleted(false);
              await refreshSleepTimerPreference();
              await refreshRepeatCurrentChapterPreference();
              await refreshReminderPreference();
              await refreshProgress();
              await loadCurrentPath();
              await loadSleepTimerPreference();
              await loadReminderPreference();
              Alert.alert('Reset Complete', 'All local app data has been cleared.', [
                { text: 'OK', onPress: () => navigation.navigate('Home') },
              ]);
            } catch (error) {
              Alert.alert('Error', 'Failed to clear app data.');
            }
          },
        },
      ]
    );
  };

  const handleSleepTimerToggle = async (value) => {
    setSleepTimerEnabledState(value);
    await setSleepTimerEnabled(value);
    // Tell audioSetup.js to arm or disarm the timer immediately
    await refreshSleepTimerPreference();
  };

  const handleNotificationsToggle = async (value) => {
    // Turning the switch on is the user asking for reminders, so this is the
    // right moment to request permission. The OS won't prompt twice.
    if (value && !(await ensurePermission({ request: true }))) {
      setNotificationsEnabled(false);
      await setRemindersEnabled(false);
      Alert.alert(
        'Notifications are blocked',
        'Enable notifications for this app in system settings to get listening reminders.',
        [
          { text: 'Not now', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]
      );
      return;
    }

    setNotificationsEnabled(value);
    await setRemindersEnabled(value);
    // Arms the 4-hour idle reminder, or cancels ours if switched off.
    await refreshReminderPreference();
  };

  const handleAbout = () => {
    Alert.alert(
      "God's Lighthouse Starter Kit App",
      'Version 1.0.0\n\nBuilt to help believers grow in their faith through the word.',
      [{ text: 'OK' }]
    );
  };

  const handleOpenWebsite = () => {
    Linking.openURL(WEBSITE_URL).catch(() =>
      Alert.alert('Error', 'Could not open the website.')
    );
  };

  const handleUploadProgress = async () => {
    const loggedIn = await isLoggedIn();
    if (!loggedIn) {
      navigation.navigate('LoginOut');
    } else {
      Alert.alert('Upload Progress', 'Upload your local progress to the cloud?', [
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
      ]);
    }
  };

  const handleDownloadProgress = async () => {
    const loggedIn = await isLoggedIn();
    if (!loggedIn) {
      navigation.navigate('LoginOut');
    } else {
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
    } else {
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
    } else {
      Alert.alert('Restore Notes', 'Restore notes from cloud? This will overwrite your local notes.', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await retrieveNotes();

              if (result.success) {
                Alert.alert('Success', 'Notes restored successfully!');
              } else {
                Alert.alert('Info', 'No notes found in cloud');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to restore notes');
            }
          },
        },
      ]);
    }
  };

  const settingsSections = [
    {
      title: 'Audio',
      items: [
        {
          label: 'Sleep Timer',
          type: 'switch',
          value: sleepTimerEnabled,
          onToggle: handleSleepTimerToggle,
          description: 'Pause playback automatically after 60 minutes of listening.',
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          label: 'Listening Reminders',
          type: 'switch',
          value: notificationsEnabled,
          onToggle: handleNotificationsToggle,
          description:
            'Remind me 4 hours after I last listened. Never between 10pm and 7am, and never once I have finished a chapter that day.',
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          label: 'About This App',
          type: 'button',
          onPress: handleAbout,
          icon: 'info',
        },
        {
          label: "God's Lighthouse",
          type: 'button',
          onPress: handleOpenWebsite,
          icon: 'globe',
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
          icon: 'upload-cloud',
          description: 'Backup your progress to the cloud',
        },
        {
          label: 'Download Progress',
          type: 'button',
          onPress: handleDownloadProgress,
          icon: 'download-cloud',
          description: 'Restore progress from cloud',
        },
        {
          label: 'Backup Notes',
          type: 'button',
          onPress: handleBackupNotes,
          icon: 'file-text',
          description: 'Backup your notes to the cloud',
        },
        {
          label: 'Restore Notes',
          type: 'button',
          onPress: handleRestoreNotes,
          icon: 'inbox',
          description: 'Restore notes from cloud',
        },
      ],
    },
    {
      title: 'Data',
      items: [
        {
          label: 'Reset App Data',
          type: 'button',
          onPress: handleResetAllData,
          icon: 'trash-2',
          description: 'Clear local progress, notes, cache, onboarding, and saved media paths.',
          destructive: true,
        },
      ],
    },
  ];

  return (
    <ScreenScrollView>
      <View style={styles.section}>
        <SectionHeader title="Appearance" />
        <ThemeToggle />
      </View>

      {settingsSections.map((section) => (
        <View key={section.title} style={styles.section}>
          <SectionHeader title={section.title} />

          {section.items.map((item) =>
            item.type === 'switch' ? (
              <Card key={item.label} elevation="sm" style={styles.row} contentStyle={styles.rowContent}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>{item.label}</Text>
                  {item.description && (
                    <Text style={styles.settingDescription}>{item.description}</Text>
                  )}
                </View>
                <Switch
                  value={item.value}
                  onValueChange={item.onToggle}
                  trackColor={{ false: colors.switchTrackOff, true: colors.switchTrackOn }}
                  thumbColor={item.value ? colors.switchThumbOn : colors.switchThumbOff}
                />
              </Card>
            ) : (
              <Card
                key={item.label}
                onPress={item.onPress}
                elevation="sm"
                style={styles.row}
                contentStyle={[
                  styles.rowContent,
                  item.destructive && styles.rowContentDestructive,
                ]}
              >
                <Feather
                  name={item.icon}
                  size={20}
                  color={item.destructive ? colors.danger : colors.primary}
                  style={styles.settingIcon}
                />
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
                    <Text style={styles.settingDescription}>{item.description}</Text>
                  )}
                </View>
                <Feather
                  name="chevron-right"
                  size={20}
                  color={item.destructive ? colors.danger : colors.borderStrong}
                />
              </Card>
            )
          )}
        </View>
      ))}

      <View style={styles.section}>
        <SectionHeader title="Audio Storage" />

        <Card elevation="sm" contentStyle={styles.storageContent}>
          <View style={styles.cardHeader}>
            <Feather name="folder" size={20} color={colors.primary} />
            <Text style={styles.cardTitle}>Current Folder</Text>
          </View>
          <Text style={styles.pathText}>{isLoading ? 'Loading…' : currentPath}</Text>
        </Card>
      </View>

      {/* App Info Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>God&apos;s Lighthouse Starter Kit</Text>
        <Text style={styles.footerSubtext}>Offline Edition v1.0.0</Text>
      </View>
    </ScreenScrollView>
  );
}

const makeStyles = ({ colors, typography, spacing, radii }) =>
  StyleSheet.create({
    section: {
      marginBottom: spacing.xxl,
    },

    /* Theme toggle */
    themeToggle: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    themeSegment: {
      flex: 1,
    },
    themeSegmentInner: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs + 2,
      paddingVertical: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    themeSegmentText: {
      fontFamily: typography.fonts.semibold,
      fontSize: typography.fontSizes.small,
    },

    /* Setting rows */
    row: {
      marginBottom: spacing.md,
    },
    rowContent: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.base,
    },
    rowContentDestructive: {
      backgroundColor: colors.dangerTint,
      borderWidth: 1,
      borderColor: colors.dangerBorder,
      borderRadius: radii.md,
    },
    settingIcon: {
      marginRight: spacing.md,
    },
    settingInfo: {
      flex: 1,
      marginRight: spacing.md,
    },
    settingLabel: {
      fontFamily: typography.fonts.semibold,
      fontSize: typography.fontSizes.md,
      color: colors.text,
    },
    settingLabelDestructive: {
      color: colors.danger,
    },
    settingDescription: {
      ...typography.textStyles.caption,
      color: colors.textMuted,
      marginTop: 2,
    },

    /* Audio storage */
    storageContent: {
      padding: spacing.base,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    cardTitle: {
      fontFamily: typography.fonts.semibold,
      fontSize: typography.fontSizes.md,
      color: colors.text,
    },
    pathText: {
      fontFamily: typography.fonts.mono,
      fontSize: typography.fontSizes.caption,
      color: colors.textMuted,
    },

    /* Footer */
    footer: {
      alignItems: 'center',
      paddingVertical: spacing.lg,
    },
    footerText: {
      fontFamily: typography.fonts.semibold,
      fontSize: typography.fontSizes.body,
      color: colors.textMuted,
    },
    footerSubtext: {
      ...typography.textStyles.caption,
      color: colors.textFaint,
      marginTop: spacing.xs,
    },
  });
