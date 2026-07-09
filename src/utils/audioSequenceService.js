// src/utils/audioSequenceService.js
import { bible_curriculum } from '../data/curriculum';
import { loadAudioById } from './storage';
import { getPlayableAudioUri } from './audioCacheManager';

const TESTAMENTS = ['old_testament', 'new_testament'];

const testamentName = (key) =>
  key === 'old_testament' ? 'Old Testament' : 'New Testament';

/**
 * Builds the sequential Bible playlist:
 * old_testament → new_testament (testament → book → chapter)
 */
function buildSequentialList() {
  const sequentialList = [];

  for (const testamentKey of TESTAMENTS) {
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
          type: 'bible',
          testament: testamentKey,
          testamentName: testamentName(testamentKey),
          bookId: book.id,
          bookName: book.name,
          chapterIndex: chapterIndex,
          chapterNumber: chapterIndex + 1,
        });
      }
    }
  }

  return sequentialList;
}

// bible_curriculum is static, so the playlist and its index only need building once.
let cachedList = null;
let cachedIndexById = null;

function getSequentialList() {
  if (!cachedList) {
    cachedList = buildSequentialList();
    cachedIndexById = new Map(cachedList.map((audio, i) => [audio.id, i]));
  }
  return cachedList;
}

function indexOfAudio(audioId) {
  getSequentialList();
  const index = cachedIndexById.get(audioId);
  return index === undefined ? -1 : index;
}

/**
 * Get the next audio ID in sequence
 * @param {string} currentAudioId - Current audio ID
 * @returns {string|null} - Next audio ID or null if at end
 */
export function getNextAudioId(currentAudioId) {
  try {
    const sequentialList = getSequentialList();
    const currentIndex = indexOfAudio(currentAudioId);

    if (currentIndex === -1) {
      console.error('❌ Current audio not found in sequence:', currentAudioId);
      return null;
    }

    // Check if there's a next audio
    if (currentIndex >= sequentialList.length - 1) {
      // console.log('📭 End of playlist reached - No more audios');
      return null;
    }

    return sequentialList[currentIndex + 1].id;
  } catch (error) {
    console.error('❌ Error getting next audio:', error);
    return null;
  }
}

/**
 * Get full audio metadata by ID
 * @param {string} audioId - Audio ID to look up
 * @returns {object|null} - Audio metadata object or null
 */
export function getAudioMetadataById(audioId) {
  try {
    for (const testamentKey of TESTAMENTS) {
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
            testamentName: testamentName(testamentKey),
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
 * Build an AudioPro-compatible track object for a Bible chapter.
 * @param {string} audioId - Audio ID to prepare
 * @returns {Promise<object|null>} - Track data, or null if the file can't be resolved
 */
export async function prepareAudioTrack(audioId) {
  try {
    if (!audioId) {
      return null;
    }

    const metadata = getAudioMetadataById(audioId);

    if (!metadata) {
      // console.error('❌ Could not get metadata for:', audioId);
      return null;
    }

    // Load audio URI from storage
    const audioUri = await loadAudioById(audioId);

    if (!audioUri) {
      // console.error('❌ Could not load audio URI for:', audioId);
      return null;
    }

    // Convert to playable URI (handles content:// URIs)
    const playableUri = await getPlayableAudioUri(audioId, audioUri);

    if (!playableUri) {
      // console.error('❌ Could not get playable URI for:', audioId);
      return null;
    }

    return {
      id: audioId,
      url: playableUri,
      title: `${metadata.bookName} - Chapter ${metadata.chapterNumber}`,
      artist: 'ESV Audio Bible',
      artwork: 'https://res.cloudinary.com/dhsnrwwwn/image/upload/v1768211441/SELECT_ME_aevm3j.png',
      metadata: metadata
    };
  } catch (error) {
    // console.error('❌ Error preparing audio track:', error);
    return null;
  }
}

/**
 * Prepare next audio track data for AudioPro
 * @param {string} currentAudioId - Current audio ID
 * @returns {Promise<object|null>} - Next track data or null
 */
export async function prepareNextAudioTrack(currentAudioId) {
  return prepareAudioTrack(getNextAudioId(currentAudioId));
}


export function getPreviousAudioId(currentAudioId) {
  try {
    const sequentialList = getSequentialList();
    const currentIndex = indexOfAudio(currentAudioId);

    if (currentIndex === -1) {
      // console.error('❌ Current audio not found in sequence:', currentAudioId);
      return null;
    }

    if (currentIndex === 0) {
      // console.log('📭 Start of playlist reached');
      return null;
    }

    return sequentialList[currentIndex - 1].id;
  } catch (error) {
    // console.error('❌ Error getting previous audio:', error);
    return null;
  }
}


export async function preparePreviousAudioTrack(currentAudioId) {
  return prepareAudioTrack(getPreviousAudioId(currentAudioId));
}


export function getPlaylistInfo(currentAudioId) {
  try {
    const sequentialList = getSequentialList();
    const currentIndex = indexOfAudio(currentAudioId);

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
