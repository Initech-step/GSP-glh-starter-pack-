import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  StatusBar,
  ImageBackground 
} from "react-native";
import React from 'react';
import { bible_curriculum } from '../data/curriculum';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Feather from '@expo/vector-icons/Feather';

const TESTAMENT_CONFIG = {
  old_testament: {
    accent: '#360f5a',
    accentLight: '#ebdefb',
    label: 'OLD TESTAMENT',
    icon: 'sheep',
    gradient: '#9007df',
    backgroundImage: require('../../assets/old_testament.jpg'),
  },
  new_testament: {
    accent: '#360f5a',
    accentLight: '#ebdefb',
    label: 'NEW TESTAMENT',
    icon: 'cross',
    gradient: '#9007df',
    backgroundImage: require('../../assets/new_testament.jpg'),
  },
};

export default function TestamentBooks({ route, navigation }) {
  const { testament } = route.params;
  // testament = { key, name, color, emoji, description }

  const config = TESTAMENT_CONFIG[testament.key] || {
    accent: '#360f5a',
    accentLight: '#f3eeff',
    label: testament.name?.toUpperCase(),
    icon: 'book-open-variant',
  };

  const books = bible_curriculum[testament.key]?.books ?? [];

  const handleBookPress = (book) => {
    navigation.navigate('BookChapters', { book, testament });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Banner */}
        <ImageBackground
          source={config.backgroundImage}
          style={styles.heroBanner}
          imageStyle={styles.heroBannerImage}
          resizeMode="cover"
        >
          {/* ✅ Add overlay for better text readability */}
          <View style={styles.heroOverlay}>
            <Text style={styles.heroLabel}>{config.label}</Text>
            <Text style={styles.heroTitle}>{testament.name}</Text>
            <Text style={styles.heroSubtitle}>{testament.description}</Text>
            <View style={styles.heroBadge}>
              <Feather name="book-open" size={14} color={config.accent} />
              <Text style={[styles.heroBadgeText, { color: config.accent }]}>
                {books.length} Books
              </Text>
            </View>
          </View>
        </ImageBackground>

        {/* Books Grid */}
        <View style={styles.booksSection}>
          <Text style={styles.sectionTitle}>Select a Book</Text>

          {books.map((book, index) => (
            <TouchableOpacity
              key={book.id}
              style={styles.bookCard}
              onPress={() => handleBookPress(book)}
              activeOpacity={0.72}
            >
              {/* Index pill */}
              <View style={[styles.indexPill, { backgroundColor: config.accentLight }]}>
                <Text style={[styles.indexText, { color: config.accent }]}>
                  {String(index + 1).padStart(2, '0')}
                </Text>
              </View>

              {/* Book info */}
              <View style={styles.bookInfo}>
                <Text style={styles.bookName}>{book.name}</Text>
                <View style={styles.bookMeta}>
                  <Feather name="headphones" size={12} color="#94A3B8" />
                  <Text style={styles.bookMetaText}>
                    {book.audios?.length ?? 0}{' '}
                    {(book.audios?.length ?? 0) === 1 ? 'chapter' : 'chapters'}
                  </Text>
                </View>
              </View>

              {/* Arrow */}
              <View style={[styles.arrowContainer, { backgroundColor: config.accentLight }]}>
                <Feather name="chevron-right" size={18} color={config.accent} />
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

  heroBanner: {
    // ✅ NO padding on parent
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: 28,
    overflow: 'hidden',
    minHeight: 180,
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // ✅ ALL padding is here
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 32,
    justifyContent: 'center',
    backgroundColor: 'rgba(76, 24, 124, 0.75)',  // Dark purple overlay
  },
  heroBannerImage: {
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  heroLabel: {
    fontSize: 11,
    letterSpacing: 2.5,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '700',
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 16,
    lineHeight: 18,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },

  /* Section */
  booksSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 14,
  },

  /* Book Card */
  bookCard: {
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
  indexPill: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indexText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bookInfo: {
    flex: 1,
  },
  bookName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  bookMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bookMetaText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});