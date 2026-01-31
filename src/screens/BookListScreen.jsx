// src/screens/WeekScreen.js
import React, { useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Entypo from '@expo/vector-icons/Entypo';


export default function BookListScreen({ route, navigation }) {
  const { level, title } = route.params;

  const handleBookPress = async (book) => {
    console.log("Book clicked from list page", book);
    navigation.navigate('ReadBook', {
      book,
      title: book.title
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Week Header */}
        <View style={styles.headerCard}>
          <Text style={styles.weekNumber}> {level.title }</Text>
          <Text style={styles.weekTitle}>{level.description }</Text>
        </View>

        {/* Audio List */}
        <View style={styles.audiosSection}>
          <Text style={styles.sectionTitle}>Books</Text>

          { level.books.map((book, index) => {

            return (
              <TouchableOpacity
                key={book.id}
                style={[
                  styles.audioCard
                ]}
                onPress={() => handleBookPress(book)}
                activeOpacity={0.7}
              >
                <View style={styles.audioHeader}>

                  <View style={styles.audioInfo}>
                    <Text style={styles.audioTitle}>{book.title}</Text>
                    <Text style={styles.audioDate}>{book.author}</Text>
                  </View>

                  <View style={styles.playIconContainer}>
                    <Text style={styles.playIcon}>
                      <Entypo name="book" size={30} color="#360f5a" />
                    </Text>
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
  audioNumber: {
    fontSize: 18,
    fontWeight: 'bold',
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
  statusBadgeTextProgress: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },

});