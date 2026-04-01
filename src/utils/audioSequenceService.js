// src/utils/audioSequenceService.js
import { curriculum, bible_curriculum } from '../data/curriculum';
import { loadAudioById } from './storage';
import { getPlayableAudioUri } from './audioCacheManager';

/**
 * Builds a unified sequential list from ALL audio sources:
 * 1. Curriculum: beginners → intermediary → advanced (with weeks)
 * 2. Bible: old_testament → new_testament (testament → book → chapter)
 */
function buildUnifiedSequentialList() {
  const sequentialList = [];
  
  // ============================================
  // PART 1: CURRICULUM AUDIOS (beginners, intermediary, advanced)
  // ============================================
  const curriculumLevels = ['beginners', 'intermediary', 'advanced'];
  
  for (const levelKey of curriculumLevels) {
    const level = curriculum[levelKey];
    
    if (!level || !level.weeks) continue;
    
    // Sort weeks by week number
    const sortedWeeks = [...level.weeks].sort((a, b) => a.weekNumber - b.weekNumber);
    
    for (const week of sortedWeeks) {
      if (!week.audios) continue;
      
      // Add all audio IDs from this week
      for (const audio of week.audios) {
        sequentialList.push({
          id: audio.id,
          title: audio.title,
          type: 'curriculum', // ✅ Mark as curriculum audio
          level: levelKey,
          weekNumber: week.weekNumber,
          weekTitle: week.title,
          date: audio.date,
        });
      }
    }
  }
  
  // ============================================
  // PART 2: BIBLE AUDIOS (old_testament, new_testament)
  // ============================================
  const testaments = ['old_testament', 'new_testament'];
  
  for (const testamentKey of testaments) {
    const testament = bible_curriculum[testamentKey];
    
    if (!testament || !testament.books) continue;
    
    // Iterate through each book in order
    for (const book of testament.books) {
      if (!book.audios) continue;
      
      // Add all chapter audios from this book
      for (let chapterIndex = 0; chapterIndex < book.audios.length; chapterIndex++) {
        const audio = book.audios[chapterIndex];
        
        sequentialList.push({
          id: audio.id,
          title: audio.title || `${book.name} Chapter ${chapterIndex + 1}`,
          type: 'bible', // ✅ Mark as Bible audio
          testament: testamentKey,
          testamentName: testamentKey === 'old_testament' ? 'Old Testament' : 'New Testament',
          bookId: book.id,
          bookName: book.name,
          chapterIndex: chapterIndex,
          chapterNumber: chapterIndex + 1,
        });
      }
    }
  }
  
  // console.log(`📋 Built unified sequential list with ${sequentialList.length} audios`);
  // console.log(`   - Curriculum: ${sequentialList.filter(a => a.type === 'curriculum').length} audios`);
  // console.log(`   - Bible: ${sequentialList.filter(a => a.type === 'bible').length} audios`);
  
  return sequentialList;
}

/**
 * Get the next audio ID in sequence
 * Works for BOTH curriculum and Bible audios
 * @param {string} currentAudioId - Current audio ID
 * @returns {string|null} - Next audio ID or null if at end
 */
export function getNextAudioId(currentAudioId) {
  try {
    // Build the unified sequential list
    const sequentialList = buildUnifiedSequentialList();
    
    // Find current audio index
    const currentIndex = sequentialList.findIndex(audio => audio.id === currentAudioId);
    
    if (currentIndex === -1) {
      console.error('❌ Current audio not found in sequence:', currentAudioId);
      return null;
    }
    
    // Check if there's a next audio
    if (currentIndex >= sequentialList.length - 1) {
      // console.log('📭 End of playlist reached - No more audios');
      return null;
    }
    
    // Return next audio ID
    const nextAudio = sequentialList[currentIndex + 1];
    // console.log(`➡️ Next audio: ${nextAudio.id}`);
    // console.log(`   Type: ${nextAudio.type}`);
    // if (nextAudio.type === 'curriculum') {
    //   console.log(`   ${nextAudio.level} - Week ${nextAudio.weekNumber}: ${nextAudio.title}`);
    // } else {
    //   console.log(`   ${nextAudio.testamentName} - ${nextAudio.bookName} Chapter ${nextAudio.chapterNumber}`);
    // }
    
    return nextAudio.id;
  } catch (error) {
    console.error('❌ Error getting next audio:', error);
    return null;
  }
}

/**
 * Get full audio metadata by ID
 * Searches BOTH curriculum and Bible sources
 * @param {string} audioId - Audio ID to look up
 * @returns {object|null} - Audio metadata object or null
 */
export function getAudioMetadataById(audioId) {
  try {
    // ============================================
    // SEARCH 1: CURRICULUM AUDIOS
    // ============================================
    const curriculumLevels = ['beginners', 'intermediary', 'advanced'];
    
    for (const levelKey of curriculumLevels) {
      const level = curriculum[levelKey];
      
      if (!level || !level.weeks) continue;
      
      for (const week of level.weeks) {
        if (!week.audios) continue;
        
        const audio = week.audios.find(a => a.id === audioId);
        
        if (audio) {
          return {
            ...audio,
            type: 'curriculum',
            level: levelKey,
            weekNumber: week.weekNumber,
            weekTitle: week.title,
          };
        }
      }
    }
    
    // ============================================
    // SEARCH 2: BIBLE AUDIOS
    // ============================================
    const testaments = ['old_testament', 'new_testament'];
    
    for (const testamentKey of testaments) {
      const testament = bible_curriculum[testamentKey];
      
      if (!testament || !testament.books) continue;
      
      for (const book of testament.books) {
        if (!book.audios) continue;
        
        const chapterIndex = book.audios.findIndex(a => a.id === audioId);
        
        if (chapterIndex !== -1) {
          const audio = book.audios[chapterIndex];
          
          return {
            ...audio,
            type: 'bible',
            testament: testamentKey,
            testamentName: testamentKey === 'old_testament' ? 'Old Testament' : 'New Testament',
            bookId: book.id,
            bookName: book.name,
            chapterIndex: chapterIndex,
            chapterNumber: chapterIndex + 1,
          };
        }
      }
    }
    
    // console.error('❌ Audio metadata not found:', audioId);
    return null;
  } catch (error) {
    // console.error('❌ Error getting audio metadata:', error);
    return null;
  }
}

/**
 * Prepare next audio track data for AudioPro
 * @param {string} currentAudioId - Current audio ID
 * @returns {Promise<object|null>} - Next track data or null
 */
export async function prepareNextAudioTrack(currentAudioId) {
  try {
    // Get next audio ID
    const nextAudioId = getNextAudioId(currentAudioId);
    
    if (!nextAudioId) {
      return null;
    }
    
    // Get metadata for next audio
    const metadata = getAudioMetadataById(nextAudioId);
    
    if (!metadata) {
      // console.error('❌ Could not get metadata for next audio');
      return null;
    }
    
    // Load audio URI from storage
    const audioUri = await loadAudioById(nextAudioId);
    
    if (!audioUri) {
      // console.error('❌ Could not load audio URI for:', nextAudioId);
      return null;
    }
    
    // Convert to playable URI (handles content:// URIs)
    const playableUri = await getPlayableAudioUri(nextAudioId, audioUri);
    
    if (!playableUri) {
      // console.error('❌ Could not get playable URI for:', nextAudioId);
      return null;
    }
    
    // Create display title based on audio type
    let displayTitle = metadata.title;
    if (metadata.type === 'bible') {
      displayTitle = `${metadata.bookName} - Chapter ${metadata.chapterNumber}`;
    }
    
    // Return AudioPro-compatible track object
    return {
      id: nextAudioId,
      url: playableUri,
      title: displayTitle,
      artist: metadata.type === 'bible' ? 'ESV Audio Bible' : 'Pst. Ita Udoh',
      artwork: 'https://res.cloudinary.com/dhsnrwwwn/image/upload/v1768211441/SELECT_ME_aevm3j.png',
      // Store metadata for future use
      metadata: metadata
    };
  } catch (error) {
    // console.error('❌ Error preparing next audio track:', error);
    return null;
  }
}


export function getPreviousAudioId(currentAudioId) {
  try {
    const sequentialList = buildUnifiedSequentialList();
    const currentIndex = sequentialList.findIndex(audio => audio.id === currentAudioId);
    
    if (currentIndex === -1) {
      // console.error('❌ Current audio not found in sequence:', currentAudioId);
      return null;
    }
    
    if (currentIndex === 0) {
      // console.log('📭 Start of playlist reached');
      return null;
    }
    
    const previousAudio = sequentialList[currentIndex - 1];
    // console.log(`⬅️ Previous audio: ${previousAudio.id}`);
    
    return previousAudio.id;
  } catch (error) {
    // console.error('❌ Error getting previous audio:', error);
    return null;
  }
}


export async function preparePreviousAudioTrack(currentAudioId) {
  try {
    const previousAudioId = getPreviousAudioId(currentAudioId);
    if (!previousAudioId) {
      return null;
    }
    
    // Use prepareNextAudioTrack logic but with previous ID
    // (It's the same preparation process, just different ID)
    const metadata = getAudioMetadataById(previousAudioId);
    
    if (!metadata) {
      // console.error('❌ Could not get metadata for previous audio');
      return null;
    }
    
    const audioUri = await loadAudioById(previousAudioId);

    if (!audioUri) {
      // console.error('❌ Could not load audio URI for:', previousAudioId);
      return null;
    }
    
    const playableUri = await getPlayableAudioUri(previousAudioId, audioUri);
    
    if (!playableUri) {
      // console.error('❌ Could not get playable URI for:', previousAudioId);
      return null;
    }
    
    let displayTitle = metadata.title;
    if (metadata.type === 'bible') {
      displayTitle = `${metadata.bookName} - Chapter ${metadata.chapterNumber}`;
    }
    
    return {
      id: previousAudioId,
      url: playableUri,
      title: displayTitle,
      artist: metadata.type === 'bible' ? 'ESV Audio Bible' : 'Pst. Ita Udoh',
      artwork: 'https://res.cloudinary.com/dhsnrwwwn/image/upload/v1768211441/SELECT_ME_aevm3j.png',
      metadata: metadata
    };
  } catch (error) {
    // console.error('❌ Error preparing previous audio track:', error);
    return null;
  }
}


export function getPlaylistInfo(currentAudioId) {
  try {
    const sequentialList = buildUnifiedSequentialList();
    const currentIndex = sequentialList.findIndex(audio => audio.id === currentAudioId);
    
    if (currentIndex === -1) {
      return {
        currentPosition: 0,
        totalAudios: sequentialList.length,
        hasNext: false,
        hasPrevious: false,
      };
    }
    
    return {
      currentPosition: currentIndex + 1,
      totalAudios: sequentialList.length,
      hasNext: currentIndex < sequentialList.length - 1,
      hasPrevious: currentIndex > 0,
      currentAudio: sequentialList[currentIndex],
    };
  } catch (error) {
    // console.error('❌ Error getting playlist info:', error);
    return {
      currentPosition: 0,
      totalAudios: 0,
      hasNext: false,
      hasPrevious: false,
    };
  }
}
