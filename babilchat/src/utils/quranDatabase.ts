import AsyncStorage from '@react-native-async-storage/async-storage';

// Quran data interfaces
export interface QuranVerse {
  number: number;
  arabic: string;
  translation: string;
  transliteration: string;
  page: number;
  juz: number;
  sajda: boolean;
}

export interface QuranSurah {
  number: number;
  name: string;
  arabicName: string;
  englishName: string;
  revelationType: 'meccan' | 'medinan';
  numberOfVerses: number;
  page: number;
  juz: number;
  verses: QuranVerse[];
}

export interface QuranDatabase {
  metadata: {
    totalSurahs: number;
    totalVerses: number;
    language: string;
    translation: string;
    version: string;
  };
  surahs: QuranSurah[];
  reciters: {
    id: string;
    name: string;
    arabicName: string;
    audioBaseUrl: string;
  }[];
}

// Storage keys
const QURAN_DATABASE_KEY = 'quran_database';
const QURAN_FAVORITES_KEY = 'quran_favorites';
const QURAN_BOOKMARKS_KEY = 'quran_bookmarks';
const QURAN_PROGRESS_KEY = 'quran_reading_progress';

// Sample complete Quran database (in production, load from external source)
const SAMPLE_QURAN_DATABASE: QuranDatabase = {
  metadata: {
    totalSurahs: 114,
    totalVerses: 6236,
    language: 'tr',
    translation: 'Diyanet İşleri Başkanlığı Meali',
    version: '1.0'
  },
  surahs: [
    {
      number: 1,
      name: 'Fatiha',
      arabicName: 'الفاتحة',
      englishName: 'The Opening',
      revelationType: 'meccan',
      numberOfVerses: 7,
      page: 1,
      juz: 1,
      verses: [
        {
          number: 1,
          arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
          translation: 'Rahman ve Rahim olan Allah\'ın adıyla.',
          transliteration: 'Bismillahir-Rahmanir-Rahim',
          page: 1,
          juz: 1,
          sajda: false
        },
        {
          number: 2,
          arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
          translation: 'Hamd, âlemlerin Rabbi Allah\'a mahsustur.',
          transliteration: 'Alhamdu lillahi rabbil-alameen',
          page: 1,
          juz: 1,
          sajda: false
        },
        {
          number: 3,
          arabic: 'الرَّحْمَٰنِ الرَّحِيمِ',
          translation: 'O, Rahman\'dır, Rahim\'dir.',
          transliteration: 'Ar-Rahmanir-Rahim',
          page: 1,
          juz: 1,
          sajda: false
        },
        {
          number: 4,
          arabic: 'مَالِكِ يَوْمِ الدِّينِ',
          translation: 'Din (ceza ve hesap) gününün sahibidir.',
          transliteration: 'Maliki yawmid-deen',
          page: 1,
          juz: 1,
          sajda: false
        },
        {
          number: 5,
          arabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
          translation: 'Ancak sana ibadet eder, yalnız senden yardım dileriz.',
          transliteration: 'Iyyaka na\'budu wa iyyaka nasta\'een',
          page: 1,
          juz: 1,
          sajda: false
        },
        {
          number: 6,
          arabic: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
          translation: 'Bizi doğru yola ilet.',
          transliteration: 'Ihdi nas-siratal-mustaqeem',
          page: 1,
          juz: 1,
          sajda: false
        },
        {
          number: 7,
          arabic: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
          translation: 'Kendilerine nimet verdiklerinin yoluna, gazaba uğrayanların ve sapıtanların yoluna değil.',
          transliteration: 'Siratal-lazeena an\'amta alayhim ghayril-maghdoobi alayhim wa lad-dalleen',
          page: 1,
          juz: 1,
          sajda: false
        }
      ]
    },
    // İkinci sure örneği
    {
      number: 2,
      name: 'Bakara',
      arabicName: 'البقرة',
      englishName: 'The Cow',
      revelationType: 'medinan',
      numberOfVerses: 286,
      page: 2,
      juz: 1,
      verses: [
        {
          number: 1,
          arabic: 'الم',
          translation: 'Elif, Lam, Mim.',
          transliteration: 'Alif-Lam-Meem',
          page: 2,
          juz: 1,
          sajda: false
        },
        {
          number: 2,
          arabic: 'ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ',
          translation: 'Bu Kitap\'ta şüphe yoktur. O, takva sahipleri için bir kılavuzdur.',
          transliteration: 'Zalika al-kitabu la rayba feeh, hudan lil-muttaqeen',
          page: 2,
          juz: 1,
          sajda: false
        },
        {
          number: 3,
          arabic: 'الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ وَمِمَّا رَزَقْنَاهُمْ يُنفِقُونَ',
          translation: 'Onlar gaybe inanır, namazı kılar ve kendilerine verdiğimiz rızıktan harcarlar.',
          transliteration: 'Allazeena yu\'minoona bil-ghayb wa yuqeemoona as-salat wa mimma razaqnahum yunfiqoon',
          page: 2,
          juz: 1,
          sajda: false
        }
      ]
    }
    // Gerçek uygulamada tüm 114 sure burada olacak
  ],
  reciters: [
    {
      id: 'mishary',
      name: 'Mishary Rashid Alafasy',
      arabicName: 'مشاري بن راشد العفاسي',
      audioBaseUrl: 'https://audio.qurancdn.com/mishary/'
    },
    {
      id: 'sudais',
      name: 'Abdul Rahman Al-Sudais',
      arabicName: 'عبد الرحمن السديس',
      audioBaseUrl: 'https://audio.qurancdn.com/sudais/'
    },
    {
      id: 'husary',
      name: 'Mahmoud Khalil Al-Husary',
      arabicName: 'محمود خليل الحصري',
      audioBaseUrl: 'https://audio.qurancdn.com/husary/'
    }
  ]
};

// Initialize Quran database
export const initializeQuranDatabase = async (): Promise<void> => {
  try {
    const stored = await AsyncStorage.getItem(QURAN_DATABASE_KEY);
    
    if (!stored) {
      // First time installation - store sample database
      await AsyncStorage.setItem(QURAN_DATABASE_KEY, JSON.stringify(SAMPLE_QURAN_DATABASE));
      console.log('Quran database initialized');
    }
  } catch (error) {
    console.error('Error initializing Quran database:', error);
  }
};

// Get complete Quran database
export const getQuranDatabase = async (): Promise<QuranDatabase> => {
  try {
    const stored = await AsyncStorage.getItem(QURAN_DATABASE_KEY);
    
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Fallback to sample database
    await initializeQuranDatabase();
    return SAMPLE_QURAN_DATABASE;
  } catch (error) {
    console.error('Error getting Quran database:', error);
    return SAMPLE_QURAN_DATABASE;
  }
};

// Get specific surah
export const getSurah = async (surahNumber: number): Promise<QuranSurah | null> => {
  try {
    const database = await getQuranDatabase();
    const surah = database.surahs.find(s => s.number === surahNumber);
    return surah || null;
  } catch (error) {
    console.error('Error getting surah:', error);
    return null;
  }
};

// Get specific verse
export const getVerse = async (surahNumber: number, verseNumber: number): Promise<QuranVerse | null> => {
  try {
    const surah = await getSurah(surahNumber);
    if (!surah) return null;
    
    const verse = surah.verses.find(v => v.number === verseNumber);
    return verse || null;
  } catch (error) {
    console.error('Error getting verse:', error);
    return null;
  }
};

// Search verses by text
export const searchVerses = async (query: string, language: 'arabic' | 'translation' | 'both' = 'both'): Promise<{
  surah: QuranSurah;
  verse: QuranVerse;
}[]> => {
  try {
    const database = await getQuranDatabase();
    const results: { surah: QuranSurah; verse: QuranVerse }[] = [];
    const searchTerm = query.toLowerCase();
    
    database.surahs.forEach(surah => {
      surah.verses.forEach(verse => {
        let match = false;
        
        if (language === 'arabic' || language === 'both') {
          match = match || verse.arabic.includes(query);
        }
        
        if (language === 'translation' || language === 'both') {
          match = match || verse.translation.toLowerCase().includes(searchTerm);
        }
        
        if (match) {
          results.push({ surah, verse });
        }
      });
    });
    
    return results;
  } catch (error) {
    console.error('Error searching verses:', error);
    return [];
  }
};

// Get random verse
export const getRandomVerse = async (): Promise<{ surah: QuranSurah; verse: QuranVerse } | null> => {
  try {
    const database = await getQuranDatabase();
    const randomSurahIndex = Math.floor(Math.random() * database.surahs.length);
    const randomSurah = database.surahs[randomSurahIndex];
    const randomVerseIndex = Math.floor(Math.random() * randomSurah.verses.length);
    const randomVerse = randomSurah.verses[randomVerseIndex];
    
    return { surah: randomSurah, verse: randomVerse };
  } catch (error) {
    console.error('Error getting random verse:', error);
    return null;
  }
};

// Bookmark management
export const addBookmark = async (surahNumber: number, verseNumber: number): Promise<void> => {
  try {
    const stored = await AsyncStorage.getItem(QURAN_BOOKMARKS_KEY);
    const bookmarks = stored ? JSON.parse(stored) : [];
    
    const bookmark = {
      surahNumber,
      verseNumber,
      addedAt: new Date().toISOString()
    };
    
    bookmarks.push(bookmark);
    await AsyncStorage.setItem(QURAN_BOOKMARKS_KEY, JSON.stringify(bookmarks));
  } catch (error) {
    console.error('Error adding bookmark:', error);
  }
};

export const getBookmarks = async (): Promise<{
  surahNumber: number;
  verseNumber: number;
  addedAt: string;
}[]> => {
  try {
    const stored = await AsyncStorage.getItem(QURAN_BOOKMARKS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error getting bookmarks:', error);
    return [];
  }
};

// Reading progress tracking
export const updateReadingProgress = async (surahNumber: number, verseNumber: number): Promise<void> => {
  try {
    const progress = {
      lastSurah: surahNumber,
      lastVerse: verseNumber,
      updatedAt: new Date().toISOString()
    };
    
    await AsyncStorage.setItem(QURAN_PROGRESS_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error('Error updating reading progress:', error);
  }
};

export const getReadingProgress = async (): Promise<{
  lastSurah: number;
  lastVerse: number;
  updatedAt: string;
} | null> => {
  try {
    const stored = await AsyncStorage.getItem(QURAN_PROGRESS_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error getting reading progress:', error);
    return null;
  }
};

// Audio URL generation
export const getVerseAudioUrl = (reciterId: string, surahNumber: number, verseNumber: number): string => {
  const reciter = SAMPLE_QURAN_DATABASE.reciters.find(r => r.id === reciterId);
  if (!reciter) return '';
  
  const surahPadded = surahNumber.toString().padStart(3, '0');
  const versePadded = verseNumber.toString().padStart(3, '0');
  
  return `${reciter.audioBaseUrl}${surahPadded}${versePadded}.mp3`;
};

// Load external Quran database (for production)
export const loadExternalQuranDatabase = async (apiUrl: string): Promise<boolean> => {
  try {
    const response = await fetch(apiUrl);
    const database: QuranDatabase = await response.json();
    
    // Validate database structure
    if (database.surahs && database.surahs.length === 114) {
      await AsyncStorage.setItem(QURAN_DATABASE_KEY, JSON.stringify(database));
      console.log('External Quran database loaded successfully');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error loading external Quran database:', error);
    return false;
  }
};

// Export database statistics
export const getQuranStatistics = async (): Promise<{
  totalSurahs: number;
  totalVerses: number;
  readingProgress: number; // percentage
  bookmarkCount: number;
}> => {
  try {
    const database = await getQuranDatabase();
    const bookmarks = await getBookmarks();
    const progress = await getReadingProgress();
    
    let readingProgress = 0;
    if (progress) {
      // Calculate reading progress percentage based on verses read
      const totalVerses = database.metadata.totalVerses;
      let versesRead = 0;
      
      // Count verses up to current position
      for (let i = 0; i < database.surahs.length; i++) {
        const surah = database.surahs[i];
        if (surah.number < progress.lastSurah) {
          versesRead += surah.numberOfVerses;
        } else if (surah.number === progress.lastSurah) {
          versesRead += progress.lastVerse;
          break;
        }
      }
      
      readingProgress = Math.round((versesRead / totalVerses) * 100);
    }
    
    return {
      totalSurahs: database.metadata.totalSurahs,
      totalVerses: database.metadata.totalVerses,
      readingProgress,
      bookmarkCount: bookmarks.length
    };
  } catch (error) {
    console.error('Error getting Quran statistics:', error);
    return {
      totalSurahs: 114,
      totalVerses: 6236,
      readingProgress: 0,
      bookmarkCount: 0
    };
  }
}; 