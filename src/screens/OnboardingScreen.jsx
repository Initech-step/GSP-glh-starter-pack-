import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  pickAudioFolder, 
  isAudioFolderConfigured, 
  setOnboardingCompleted
} from '../utils/storage';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Welcome to GLH Audio Starter Kit',
    description: "God's Lighthouse Messages Starter Pack helps you journey through recommended Christian teachings in an organized way.",
    emoji: '📖',
  },
  {
    id: '2',
    title: 'Three Learning Levels',
    description: 'Progress through Beginners (30 weeks), Intermediary (33 weeks), and Advanced (12 weeks) teachings sequentially.',
    emoji: '🎓',
  },
  {
    id: '3',
    title: 'Track Your Progress',
    description: 'The app remembers where you left off, tracks completed messages, and helps you stay consistent in your learning.',
    emoji: '✅',
  },
  {
    id: '4',
    title: 'Take Notes',
    description: 'Capture insights and revelations as you listen. Your notes are saved for each message.',
    emoji: '📝',
  },
  {
    id: '5',
    title: 'Offline Audio',
    description: 'All audio messages are stored on your memory card. No internet required!',
    emoji: '📱',
  },
  {
    id: '6',
    title: 'Select Audio Folder',
    description: 'Point the app to your audio folder.',
    emoji: '📂',
    isSetup: true,
  },
];

export default function OnboardingScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSelecting, setIsSelecting] = useState(false);
  const [folderSelected, setFolderSelected] = useState(false);
  const flatListRef = useRef(null);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex });
      setCurrentIndex(nextIndex);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  // ============================================
  // FOLDER SELECTION HANDLER
  // ============================================
  const handleSelectFolder = async () => {
    try {
      setIsSelecting(true);

      // Open folder picker
      const folderPath = await pickAudioFolder();

      if (!folderPath) {
        Alert.alert('No Folder Selected', 'Please select a folder to continue.');
        setIsSelecting(false);
        return;
      }

      // Verify folder structure
      // const verification = await verifyAudioFolder(folderPath);

      // if (!verification.valid) {
      //   Alert.alert(
      //     'Invalid Folder',
      //     verification.message,
      //     [{ text: 'Try Again', onPress: handleSelectFolder }]
      //   );
      //   setIsSelecting(false);
      //   return;
      // }

      // Success!
      setFolderSelected(true);
      Alert.alert(
        'Folder Selected! ✅',
        'You can now access all audio messages offline.',
        [{ text: 'Continue', onPress: handleNext }]
      );

    } catch (error) {
      console.error('Error selecting folder:', error);
      Alert.alert(
        'Error',
        'Could not access the folder. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSelecting(false);
    }
  };

  const handleComplete = async () => {
    // Check if folder is configured
    const configured = await isAudioFolderConfigured();

    if (!configured) {
      Alert.alert(
        'Audio Folder Required',
        'Please select the audio folder before continuing.',
        [{ text: 'OK' }]
      );
      return;
    }

    await setOnboardingCompleted();
    navigation.replace('Home');
  };

  const renderItem = ({ item }) => {
    if (item.isSetup) {
      // Special setup slide with folder selection
      return (
        <View style={styles.slide}>
          <View style={styles.emojiContainer}>
            <Text style={styles.emoji}>{item.emoji}</Text>
          </View>
          <Text style={styles.title}>{item.title}</Text>
          {/* Folder Selection Button */}
          <TouchableOpacity
            style={[
              styles.selectFolderButton,
              folderSelected && styles.selectFolderButtonSuccess
            ]}
            onPress={handleSelectFolder}
            disabled={isSelecting}
          >
            {isSelecting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <MaterialIcons 
                  name={folderSelected ? "check-circle" : "folder-open"} 
                  size={24} 
                  color="#fff" 
                />
                <Text style={styles.selectFolderText}>
                  {folderSelected ? 'Folder Selected ✓' : 'Select Audio Folder'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Instructions */}
          <View style={styles.instructionsBox}>
            <Text style={styles.instructionsTitle}>📋 Instructions:</Text>
            <Text style={styles.instructionsText}>
              1. Tap "Select Audio Folder"
            </Text>
            <Text style={styles.instructionsText}>
              2. Navigate to the GLH_Audio folder
            </Text>
            <Text style={styles.instructionsText}>
              3. Select the SELECT ME file
            </Text>
          </View>
        </View>
      );
    }

    // Regular slide
    return (
      <View style={styles.slide}>
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>{item.emoji}</Text>
        </View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        scrollEnabled={!isSelecting}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(
            event.nativeEvent.contentOffset.x / width
          );
          setCurrentIndex(index);
        }}
      />

      {/* Pagination dots */}
      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              currentIndex === index && styles.dotActive,
            ]}
          />
        ))}
      </View>

      {/* Navigation buttons */}
      <View style={styles.buttonContainer}>
        {currentIndex < slides.length - 1 ? (
          <>
            <TouchableOpacity
              style={[
                styles.nextButton,
                isSelecting && styles.buttonDisabled
              ]}
              onPress={handleNext}
              disabled={isSelecting}
            >
              <Text style={styles.nextText}>Next</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={[
              styles.startButton,
              (!folderSelected || isSelecting) && styles.buttonDisabled
            ]}
            onPress={handleComplete}
            disabled={!folderSelected || isSelecting}
          >
            <Text style={styles.startText}>Get Started</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  slide: {
    width,
    height: height * 0.75,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emojiContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#CBC3E3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  emoji: {
    fontSize: 64,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  selectFolderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#360f5a',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  selectFolderButtonSuccess: {
    backgroundColor: '#22c55e',
  },
  selectFolderText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  instructionsBox: {
    backgroundColor: '#F8FAFC',
    padding: 20,
    borderRadius: 12,
    marginTop: 24,
    width: '100%',
    borderLeftWidth: 4,
    borderLeftColor: '#360f5a',
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 6,
    lineHeight: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: '#360f5a',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  skipText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#360f5a',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  nextText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  startButton: {
    flex: 1,
    backgroundColor: '#360f5a',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  startText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: '#CBD5E1',
  },
});