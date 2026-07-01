import AsyncStorage from '@react-native-async-storage/async-storage';

// Hadith interfaces
export interface HadithNarrator {
  id: string;
  name: string;
  arabicName: string;
  biography: string;
  reliability: 'sahih' | 'hasan' | 'dhaif';
}

export interface HadithBook {
  id: string;
  title: string;
  arabicTitle: string;
  author: string;
  authorArabic: string;
  description: string;
  totalHadiths: number;
  reliability: 'sahih' | 'hasan' | 'mixed';
  language: string;
}

export interface Hadith {
  id: string;
  bookId: string;
  chapterNumber: number;
  hadithNumber: number;
  arabic: string;
  translation: string;
  transliteration?: string;
  narrator: string;
  chain: string; // Isnad
  grade: 'sahih' | 'hasan' | 'dhaif' | 'maudu';
  source: string;
  topic: string[];
  keywords: string[];
  explanation?: string;
  context?: string;
  references: string[];
  isFavorite?: boolean;
}

export interface HadithCollection {
  books: HadithBook[];
  hadiths: Hadith[];
  narrators: HadithNarrator[];
  topics: string[];
  metadata: {
    totalHadiths: number;
    totalBooks: number;
    languages: string[];
    version: string;
    lastUpdated: string;
  };
}

// Storage keys
const HADITH_DATABASE_KEY = 'hadith_database';
const HADITH_FAVORITES_KEY = 'hadith_favorites';
const HADITH_PROGRESS_KEY = 'hadith_reading_progress';

// Famous Hadith Books
export const HADITH_BOOKS: HadithBook[] = [
  {
    id: 'bukhari',
    title: 'Sahih al-Bukhari',
    arabicTitle: 'صحيح البخاري',
    author: 'Imam Bukhari',
    authorArabic: 'الإمام البخاري',
    description: 'En sahih hadis koleksiyonu',
    totalHadiths: 7563,
    reliability: 'sahih',
    language: 'tr'
  },
  {
    id: 'muslim',
    title: 'Sahih Muslim',
    arabicTitle: 'صحيح مسلم',
    author: 'Imam Muslim',
    authorArabic: 'الإمام مسلم',
    description: 'Bukhari ile birlikte en güvenilir hadis kitabı',
    totalHadiths: 5362,
    reliability: 'sahih',
    language: 'tr'
  },
  {
    id: 'tirmidhi',
    title: 'Jami al-Tirmidhi',
    arabicTitle: 'جامع الترمذي',
    author: 'Imam Tirmidhi',
    authorArabic: 'الإمام الترمذي',
    description: 'Sunen-i Tirmizi olarak da bilinir',
    totalHadiths: 3956,
    reliability: 'mixed',
    language: 'tr'
  },
  {
    id: 'abudawud',
    title: 'Sunan Abu Dawud',
    arabicTitle: 'سنن أبي داود',
    author: 'Imam Abu Dawud',
    authorArabic: 'الإمام أبو داود',
    description: 'Fıkhi konularda önemli hadis koleksiyonu',
    totalHadiths: 5274,
    reliability: 'mixed',
    language: 'tr'
  },
  {
    id: 'nasai',
    title: 'Sunan an-Nasai',
    arabicTitle: 'سنن النسائي',
    author: 'Imam an-Nasai',
    authorArabic: 'الإمام النسائي',
    description: 'Kutub-u Sitte\'nin beşinci kitabı',
    totalHadiths: 5761,
    reliability: 'mixed',
    language: 'tr'
  },
  {
    id: 'ibnmajah',
    title: 'Sunan Ibn Majah',
    arabicTitle: 'سنن ابن ماجه',
    author: 'Imam Ibn Majah',
    authorArabic: 'الإمام ابن ماجه',
    description: 'Kutub-u Sitte\'nin altıncı kitabı',
    totalHadiths: 4341,
    reliability: 'mixed',
    language: 'tr'
  }
];

// Sample Hadiths from different collections
export const SAMPLE_HADITHS: Hadith[] = [
  {
    id: 'bukhari_1',
    bookId: 'bukhari',
    chapterNumber: 1,
    hadithNumber: 1,
    arabic: 'إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى',
    translation: 'Ameller niyetlere göredir ve herkes niyetine göre mükâfat alır.',
    transliteration: 'Innama al-a\'malu bin-niyyat, wa innama li kulli imri\'in ma nawa',
    narrator: 'Ömer ibn el-Hattab (r.a.)',
    chain: 'Alqama - Ömer ibn el-Hattab',
    grade: 'sahih',
    source: 'Bukhari, İman 41',
    topic: ['niyet', 'amel', 'sorumluluk'],
    keywords: ['niyet', 'amel', 'mükâfat'],
    explanation: 'Bu hadis, İslam\'da niyetin önemini vurgular. Yapılan her amelin değeri, o ameli yapanın niyetine bağlıdır.',
    context: 'Hz. Peygamber\'in (s.a.v.) temel öğretilerinden biri',
    references: ['Muslim, İmaret 155', 'Tirmizi, Fezail 16'],
    isFavorite: false
  },
  {
    id: 'muslim_1',
    bookId: 'muslim',
    chapterNumber: 1,
    hadithNumber: 8,
    arabic: 'الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ',
    translation: 'Müslüman, diğer müslümanların dilinden ve elinden emin olduğu kimsedir.',
    transliteration: 'Al-muslimu man salima al-muslimoona min lisanihi wa yadihi',
    narrator: 'Abdullah ibn Amr (r.a.)',
    chain: 'Abdullah ibn Amr - Hz. Peygamber',
    grade: 'sahih',
    source: 'Muslim, İman 64',
    topic: ['müslümanlık', 'ahlak', 'kardeşlik'],
    keywords: ['müslüman', 'dil', 'el', 'zarar'],
    explanation: 'Gerçek müslümanın özelliği, diğer müslümanlara zarar vermemesidir.',
    context: 'Müslümanlar arası ilişkilerde temel prensip',
    references: ['Bukhari, İman 10', 'Tirmizi, İman 12'],
    isFavorite: false
  },
  {
    id: 'bukhari_6018',
    bookId: 'bukhari',
    chapterNumber: 78,
    hadithNumber: 6018,
    arabic: 'مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ',
    translation: 'Allah\'a ve ahiret gününe iman eden kimse, ya hayır söylesin ya da sussun.',
    transliteration: 'Man kana yu\'minu billahi wal-yawm al-akhiri falyaqul khayran aw liyasmut',
    narrator: 'Ebu Hüreyre (r.a.)',
    chain: 'Ebu Hüreyre - Hz. Peygamber',
    grade: 'sahih',
    source: 'Bukhari, Edeb 31',
    topic: ['konuşma', 'adab', 'iman'],
    keywords: ['iman', 'söz', 'susma', 'hayır'],
    explanation: 'Müslümanın konuşmasında dikkatli olması gerektiğini belirten hadis.',
    context: 'Sosyal ilişkilerde doğru davranış rehberi',
    references: ['Muslim, Şuara 74', 'Tirmizi, Birr 23'],
    isFavorite: false
  },
  {
    id: 'tirmidhi_2516',
    bookId: 'tirmidhi',
    chapterNumber: 37,
    hadithNumber: 2516,
    arabic: 'الْعِلْمُ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ',
    translation: 'İlim öğrenmek her müslümana farzdır.',
    transliteration: 'Al-ilmu faridatun ala kulli muslim',
    narrator: 'Enes ibn Malik (r.a.)',
    chain: 'Enes ibn Malik - Hz. Peygamber',
    grade: 'hasan',
    source: 'Tirmizi, İlim 19',
    topic: ['ilim', 'öğrenme', 'farz'],
    keywords: ['ilim', 'farz', 'müslüman', 'öğrenme'],
    explanation: 'İslam\'da ilim öğrenmenin zorunluluğunu belirten önemli hadis.',
    context: 'İslam\'ın ilme verdiği önemi gösteren temel hadis',
    references: ['İbn Majah, Mukaddime 17', 'Darimi, Mukaddime 1'],
    isFavorite: false
  },
  {
    id: 'abudawud_4031',
    bookId: 'abudawud',
    chapterNumber: 34,
    hadithNumber: 4031,
    arabic: 'مَنْ رَأَى مِنْكُمْ مُنْكَرًا فَلْيُغَيِّرْهُ بِيَدِهِ، فَإِنْ لَمْ يَسْتَطِعْ فَبِلِسَانِهِ، فَإِنْ لَمْ يَسْتَطِعْ فَبِقَلْبِهِ، وَذَلِكَ أَضْعَفُ الْإِيمَانِ',
    translation: 'İçinizden kim bir münkeri (kötülüğü) görürse eliyle değiştirsin. Eğer buna gücü yetmezse diliyle, ona da gücü yetmezse kalbiyle (buğz etsin). Bu da imanın en zayıf derecesidir.',
    transliteration: 'Man ra\'a minkum munkaran falyughayyirhu biyadihi, fa in lam yastati\' fabiliasnihi, fa in lam yastati\' fabiqalbihi, wa zalika ad\'af al-iman',
    narrator: 'Ebu Said el-Hudri (r.a.)',
    chain: 'Ebu Said el-Hudri - Hz. Peygamber',
    grade: 'sahih',
    source: 'Abu Dawud, Melahim 17',
    topic: ['emr-i maruf', 'nehy-i münker', 'sorumluluk'],
    keywords: ['münker', 'değiştirme', 'iman', 'sorumluluk'],
    explanation: 'Müslümanın kötülüklere karşı tutumunu belirleyen temel hadis.',
    context: 'Toplumsal sorumluluk ve iman dereceleri',
    references: ['Muslim, İman 78', 'Tirmizi, Fiten 11'],
    isFavorite: false
  },
  {
    id: 'nasai_5039',
    bookId: 'nasai',
    chapterNumber: 47,
    hadithNumber: 5039,
    arabic: 'لَا ضَرَرَ وَلَا ضِرَارَ',
    translation: 'Zarar vermek ve zarar karşılığı zarar vermek yoktur.',
    transliteration: 'La darar wa la dirar',
    narrator: 'Ibn Abbas (r.a.)',
    chain: 'Ibn Abbas - Hz. Peygamber',
    grade: 'hasan',
    source: 'Nasai, Buyuu 72',
    topic: ['hukuk', 'adalet', 'zarar'],
    keywords: ['zarar', 'hukuk', 'adalet'],
    explanation: 'İslam hukukunun temel prensiplerinden biri olan zarar prensibi.',
    context: 'Hukuki ve sosyal ilişkilerde temel kural',
    references: ['Ibn Majah, Ahkam 17', 'Darimi, Mukaddime 28'],
    isFavorite: false
  },
  {
    id: 'ibnmajah_4217',
    bookId: 'ibnmajah',
    chapterNumber: 37,
    hadithNumber: 4217,
    arabic: 'الْحَيَاءُ مِنَ الْإِيمَانِ',
    translation: 'Haya imandandır.',
    transliteration: 'Al-haya\'u min al-iman',
    narrator: 'Ibn Ömer (r.a.)',
    chain: 'Ibn Ömer - Hz. Peygamber',
    grade: 'sahih',
    source: 'İbn Majah, Zuhd 17',
    topic: ['haya', 'iman', 'ahlak'],
    keywords: ['haya', 'iman', 'ahlak'],
    explanation: 'Haya duygusunun imanın bir parçası olduğunu belirten hadis.',
    context: 'İslami ahlakın temel unsurları',
    references: ['Bukhari, İman 16', 'Muslim, İman 57'],
    isFavorite: false
  }
];

// Hadith topics for categorization
export const HADITH_TOPICS = [
  'iman', 'ibadet', 'ahlak', 'muamelat', 'aile', 'niyet', 'dua', 'zikir',
  'sabır', 'şükür', 'tevazu', 'adalet', 'merhamet', 'ilim', 'öğretim',
  'ticaret', 'hukuk', 'savaş', 'barış', 'fitne', 'ahiret', 'cennet', 'cehennem'
];

// Initialize Hadith Database
export const initializeHadithDatabase = async (): Promise<void> => {
  try {
    const stored = await AsyncStorage.getItem(HADITH_DATABASE_KEY);
    
    if (!stored) {
      const hadithCollection: HadithCollection = {
        books: HADITH_BOOKS,
        hadiths: SAMPLE_HADITHS,
        narrators: [], // Will be populated with narrator data
        topics: HADITH_TOPICS,
        metadata: {
          totalHadiths: SAMPLE_HADITHS.length,
          totalBooks: HADITH_BOOKS.length,
          languages: ['tr', 'ar'],
          version: '1.0.0',
          lastUpdated: new Date().toISOString()
        }
      };
      
      await AsyncStorage.setItem(HADITH_DATABASE_KEY, JSON.stringify(hadithCollection));
      console.log('Hadith database initialized');
    }
  } catch (error) {
    console.error('Error initializing hadith database:', error);
  }
};

// Get Hadith Database
export const getHadithDatabase = async (): Promise<HadithCollection> => {
  try {
    const stored = await AsyncStorage.getItem(HADITH_DATABASE_KEY);
    
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Initialize if not exists
    await initializeHadithDatabase();
    return {
      books: HADITH_BOOKS,
      hadiths: SAMPLE_HADITHS,
      narrators: [],
      topics: HADITH_TOPICS,
      metadata: {
        totalHadiths: SAMPLE_HADITHS.length,
        totalBooks: HADITH_BOOKS.length,
        languages: ['tr', 'ar'],
        version: '1.0.0',
        lastUpdated: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Error getting hadith database:', error);
    return {
      books: [],
      hadiths: [],
      narrators: [],
      topics: [],
      metadata: {
        totalHadiths: 0,
        totalBooks: 0,
        languages: [],
        version: '1.0.0',
        lastUpdated: new Date().toISOString()
      }
    };
  }
};

// Get Hadiths by Book
export const getHadithsByBook = async (bookId: string): Promise<Hadith[]> => {
  try {
    const database = await getHadithDatabase();
    return database.hadiths.filter(hadith => hadith.bookId === bookId);
  } catch (error) {
    console.error('Error getting hadiths by book:', error);
    return [];
  }
};

// Search Hadiths
export const searchHadiths = async (
  query: string,
  filters?: {
    bookId?: string;
    topic?: string;
    grade?: string;
    language?: string;
  }
): Promise<Hadith[]> => {
  try {
    const database = await getHadithDatabase();
    let results = database.hadiths;
    
    // Apply filters
    if (filters?.bookId) {
      results = results.filter(hadith => hadith.bookId === filters.bookId);
    }
    
    if (filters?.topic) {
      results = results.filter(hadith => hadith.topic.includes(filters.topic!));
    }
    
    if (filters?.grade) {
      results = results.filter(hadith => hadith.grade === filters.grade);
    }
    
    // Search in text
    if (query.trim()) {
      const searchTerm = query.toLowerCase();
      results = results.filter(hadith => 
        hadith.translation.toLowerCase().includes(searchTerm) ||
        hadith.arabic.includes(query) ||
        hadith.topic.some(topic => topic.toLowerCase().includes(searchTerm)) ||
        hadith.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm))
      );
    }
    
    return results;
  } catch (error) {
    console.error('Error searching hadiths:', error);
    return [];
  }
};

// Get Random Hadith
export const getRandomHadith = async (): Promise<Hadith | null> => {
  try {
    const database = await getHadithDatabase();
    if (database.hadiths.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * database.hadiths.length);
    return database.hadiths[randomIndex];
  } catch (error) {
    console.error('Error getting random hadith:', error);
    return null;
  }
};

// Favorite Management
export const getFavoriteHadiths = async (): Promise<string[]> => {
  try {
    const stored = await AsyncStorage.getItem(HADITH_FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error getting favorite hadiths:', error);
    return [];
  }
};

export const toggleHadithFavorite = async (hadithId: string): Promise<void> => {
  try {
    const favorites = await getFavoriteHadiths();
    
    if (favorites.includes(hadithId)) {
      // Remove from favorites
      const updated = favorites.filter(id => id !== hadithId);
      await AsyncStorage.setItem(HADITH_FAVORITES_KEY, JSON.stringify(updated));
    } else {
      // Add to favorites
      favorites.push(hadithId);
      await AsyncStorage.setItem(HADITH_FAVORITES_KEY, JSON.stringify(favorites));
    }
  } catch (error) {
    console.error('Error toggling hadith favorite:', error);
  }
};

// Hadith by ID
export const getHadithById = async (hadithId: string): Promise<Hadith | null> => {
  try {
    const database = await getHadithDatabase();
    return database.hadiths.find(hadith => hadith.id === hadithId) || null;
  } catch (error) {
    console.error('Error getting hadith by ID:', error);
    return null;
  }
};

// Daily Hadith
export const getDailyHadith = async (): Promise<Hadith | null> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const stored = await AsyncStorage.getItem(`daily_hadith_${today}`);
    
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Generate daily hadith based on date
    const database = await getHadithDatabase();
    if (database.hadiths.length === 0) return null;
    
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const hadithIndex = dayOfYear % database.hadiths.length;
    const dailyHadith = database.hadiths[hadithIndex];
    
    // Cache for today
    await AsyncStorage.setItem(`daily_hadith_${today}`, JSON.stringify(dailyHadith));
    
    return dailyHadith;
  } catch (error) {
    console.error('Error getting daily hadith:', error);
    return null;
  }
};

// Hadith Statistics
export const getHadithStatistics = async (): Promise<{
  totalHadiths: number;
  favoriteCount: number;
  readCount: number;
  bookCounts: Record<string, number>;
}> => {
  try {
    const database = await getHadithDatabase();
    const favorites = await getFavoriteHadiths();
    
    // Count hadiths by book
    const bookCounts: Record<string, number> = {};
    database.hadiths.forEach(hadith => {
      bookCounts[hadith.bookId] = (bookCounts[hadith.bookId] || 0) + 1;
    });
    
    return {
      totalHadiths: database.hadiths.length,
      favoriteCount: favorites.length,
      readCount: 0, // Would track reading progress
      bookCounts
    };
  } catch (error) {
    console.error('Error getting hadith statistics:', error);
    return {
      totalHadiths: 0,
      favoriteCount: 0,
      readCount: 0,
      bookCounts: {}
    };
  }
}; 