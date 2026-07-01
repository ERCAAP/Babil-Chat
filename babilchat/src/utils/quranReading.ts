import AsyncStorage from '@react-native-async-storage/async-storage';

// Kuran sure bilgileri
export interface Surah {
  number: number;
  name: string;
  arabicName: string;
  englishName: string;
  numberOfAyahs: number;
  revelationType: 'meccan' | 'medinan';
  page: number;
  juz: number;
}

// Ayet bilgileri
export interface Ayah {
  number: number;
  text: string;
  surahNumber: number;
  juzNumber: number;
  pageNumber: number;
  translation?: string;
  transliteration?: string;
}

// Okuma progress interface
export interface ReadingProgress {
  userId?: string;
  currentSurah: number;
  currentAyah: number;
  totalAyahsRead: number;
  dailyGoal: number;
  weeklyGoal: number;
  monthlyGoal: number;
  startDate: Date;
  lastReadDate: Date;
  hatmCount: number; // Hatm sayısı
  currentStreak: number; // Günlük streak
  longestStreak: number;
  readingSessions: ReadingSession[];
}

// Okuma session'ı
export interface ReadingSession {
  id: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  surahsRead: number[];
  ayahsRead: number;
  duration: number; // dakika cinsinden
  reflection?: string; // Kullanıcının notları
}

// Günlük ayet
export interface DailyVerse {
  date: string; // YYYY-MM-DD format
  surah: number;
  ayah: number;
  arabicText: string;
  translation: string;
  transliteration: string;
  category: 'motivation' | 'reflection' | 'guidance' | 'comfort' | 'gratitude';
  explanation?: string;
}

// Favori ayet
export interface FavoriteVerse {
  id: string;
  surah: number;
  ayah: number;
  arabicText: string;
  translation: string;
  note?: string;
  tags: string[];
  addedAt: Date;
}

// Okuma hedefleri
export interface ReadingGoals {
  daily: {
    ayahs: number;
    minutes: number;
    enabled: boolean;
  };
  weekly: {
    surahs: number;
    ayahs: number;
    enabled: boolean;
  };
  monthly: {
    surahs: number;
    ayahs: number;
    enabled: boolean;
  };
  hatm: {
    target: number; // Yılda kaç hatm
    enabled: boolean;
  };
}

// Storage keys
const READING_PROGRESS_KEY = 'quran_reading_progress';
const READING_SESSIONS_KEY = 'quran_reading_sessions';
const DAILY_VERSES_KEY = 'daily_verses';
const FAVORITE_VERSES_KEY = 'favorite_verses';
const READING_GOALS_KEY = 'reading_goals';
const READING_STATISTICS_KEY = 'reading_statistics';

// Kuran sureleri (sadece başlıca bilgiler)
export const QURAN_SURAHS: Surah[] = [
  { number: 1, name: 'Fatiha', arabicName: 'الفاتحة', englishName: 'The Opening', numberOfAyahs: 7, revelationType: 'meccan', page: 1, juz: 1 },
  { number: 2, name: 'Bakara', arabicName: 'البقرة', englishName: 'The Cow', numberOfAyahs: 286, revelationType: 'medinan', page: 2, juz: 1 },
  { number: 3, name: 'Ali İmran', arabicName: 'آل عمران', englishName: 'Family of Imran', numberOfAyahs: 200, revelationType: 'medinan', page: 50, juz: 3 },
  { number: 4, name: 'Nisa', arabicName: 'النساء', englishName: 'The Women', numberOfAyahs: 176, revelationType: 'medinan', page: 77, juz: 4 },
  { number: 5, name: 'Maide', arabicName: 'المائدة', englishName: 'The Table Spread', numberOfAyahs: 120, revelationType: 'medinan', page: 106, juz: 6 },
  { number: 6, name: 'Enam', arabicName: 'الأنعام', englishName: 'The Cattle', numberOfAyahs: 165, revelationType: 'meccan', page: 128, juz: 7 },
  { number: 7, name: 'Araf', arabicName: 'الأعراف', englishName: 'The Heights', numberOfAyahs: 206, revelationType: 'meccan', page: 151, juz: 8 },
  { number: 8, name: 'Enfal', arabicName: 'الأنفال', englishName: 'The Spoils of War', numberOfAyahs: 75, revelationType: 'medinan', page: 177, juz: 9 },
  { number: 9, name: 'Tevbe', arabicName: 'التوبة', englishName: 'The Repentance', numberOfAyahs: 129, revelationType: 'medinan', page: 187, juz: 10 },
  { number: 10, name: 'Yunus', arabicName: 'يونس', englishName: 'Jonah', numberOfAyahs: 109, revelationType: 'meccan', page: 208, juz: 11 },
  // ... Diğer sureler (kısaltılmış - gerçek uygulamada tüm 114 sure olacak)
  { number: 36, name: 'Yasin', arabicName: 'يس', englishName: 'Ya-Seen', numberOfAyahs: 83, revelationType: 'meccan', page: 440, juz: 22 },
  { number: 55, name: 'Rahman', arabicName: 'الرحمن', englishName: 'The Beneficent', numberOfAyahs: 78, revelationType: 'meccan', page: 531, juz: 27 },
  { number: 67, name: 'Mülk', arabicName: 'الملك', englishName: 'The Sovereignty', numberOfAyahs: 30, revelationType: 'meccan', page: 562, juz: 29 },
  { number: 112, name: 'İhlas', arabicName: 'الإخلاص', englishName: 'The Sincerity', numberOfAyahs: 4, revelationType: 'meccan', page: 604, juz: 30 },
  { number: 113, name: 'Felak', arabicName: 'الفلق', englishName: 'The Dawn', numberOfAyahs: 5, revelationType: 'meccan', page: 604, juz: 30 },
  { number: 114, name: 'Nas', arabicName: 'الناس', englishName: 'Mankind', numberOfAyahs: 6, revelationType: 'meccan', page: 604, juz: 30 },
];

// Toplam Kuran ayet sayısı
export const TOTAL_AYAHS = 6236;

// Okuma progress'ini alma
export const getReadingProgress = async (): Promise<ReadingProgress> => {
  try {
    const stored = await AsyncStorage.getItem(READING_PROGRESS_KEY);
    if (stored) {
      const progress = JSON.parse(stored);
      return {
        ...progress,
        startDate: new Date(progress.startDate),
        lastReadDate: new Date(progress.lastReadDate),
        readingSessions: progress.readingSessions?.map((session: any) => ({
          ...session,
          date: new Date(session.date),
          startTime: new Date(session.startTime),
          endTime: new Date(session.endTime),
        })) || [],
      };
    }

    // Varsayılan progress
    const defaultProgress: ReadingProgress = {
      currentSurah: 1,
      currentAyah: 1,
      totalAyahsRead: 0,
      dailyGoal: 5, // günde 5 ayet
      weeklyGoal: 35,
      monthlyGoal: 150,
      startDate: new Date(),
      lastReadDate: new Date(),
      hatmCount: 0,
      currentStreak: 0,
      longestStreak: 0,
      readingSessions: [],
    };

    await saveReadingProgress(defaultProgress);
    return defaultProgress;
  } catch (error) {
    console.warn('Error getting reading progress:', error);
    return {
      currentSurah: 1,
      currentAyah: 1,
      totalAyahsRead: 0,
      dailyGoal: 5,
      weeklyGoal: 35,
      monthlyGoal: 150,
      startDate: new Date(),
      lastReadDate: new Date(),
      hatmCount: 0,
      currentStreak: 0,
      longestStreak: 0,
      readingSessions: [],
    };
  }
};

// Okuma progress'ini kaydetme
export const saveReadingProgress = async (progress: ReadingProgress): Promise<void> => {
  try {
    await AsyncStorage.setItem(READING_PROGRESS_KEY, JSON.stringify(progress));
  } catch (error) {
    console.warn('Error saving reading progress:', error);
  }
};

// Okuma session'ı başlatma
export const startReadingSession = async (): Promise<string> => {
  try {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const session: ReadingSession = {
      id: sessionId,
      date: new Date(),
      startTime: new Date(),
      endTime: new Date(),
      surahsRead: [],
      ayahsRead: 0,
      duration: 0,
    };

    // Session'ı geçici olarak kaydet
    await AsyncStorage.setItem(`temp_session_${sessionId}`, JSON.stringify(session));
    
    return sessionId;
  } catch (error) {
    console.warn('Error starting reading session:', error);
    throw new Error('Okuma oturumu başlatılamadı');
  }
};

// Okuma session'ını sonlandırma
export const endReadingSession = async (
  sessionId: string,
  ayahsRead: number,
  surahsRead: number[],
  reflection?: string
): Promise<void> => {
  try {
    const tempKey = `temp_session_${sessionId}`;
    const stored = await AsyncStorage.getItem(tempKey);
    
    if (!stored) {
      throw new Error('Session bulunamadı');
    }

    const session: ReadingSession = JSON.parse(stored);
    session.endTime = new Date();
    session.ayahsRead = ayahsRead;
    session.surahsRead = surahsRead;
    session.duration = Math.floor((session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60));
    session.reflection = reflection;

    // Progress'i güncelle
    const progress = await getReadingProgress();
    progress.totalAyahsRead += ayahsRead;
    progress.lastReadDate = new Date();
    progress.readingSessions.push(session);

    // Streak hesapla
    const today = new Date().toDateString();
    const lastRead = progress.lastReadDate.toDateString();
    
    if (today === lastRead) {
      // Bugün zaten okumuş, streak'i koru
    } else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastRead === yesterday.toDateString()) {
        progress.currentStreak += 1;
      } else {
        progress.currentStreak = 1; // Streak yeniden başlasın
      }
    }

    progress.longestStreak = Math.max(progress.longestStreak, progress.currentStreak);

    // Hatm kontrolü
    if (progress.totalAyahsRead >= TOTAL_AYAHS) {
      progress.hatmCount += 1;
      progress.totalAyahsRead = progress.totalAyahsRead % TOTAL_AYAHS;
    }

    await saveReadingProgress(progress);
    await AsyncStorage.removeItem(tempKey);
  } catch (error) {
    console.warn('Error ending reading session:', error);
    throw new Error('Okuma oturumu sonlandırılamadı');
  }
};

// Günlük ayet alma
export const getDailyVerse = async (date?: Date): Promise<DailyVerse> => {
  try {
    const targetDate = date || new Date();
    const dateStr = targetDate.toISOString().split('T')[0];
    
    const stored = await AsyncStorage.getItem(`${DAILY_VERSES_KEY}_${dateStr}`);
    if (stored) {
      return JSON.parse(stored);
    }

    // Yeni günlük ayet oluştur (mock implementation)
    const dailyVerse = generateDailyVerse(targetDate);
    await AsyncStorage.setItem(`${DAILY_VERSES_KEY}_${dateStr}`, JSON.stringify(dailyVerse));
    
    return dailyVerse;
  } catch (error) {
    console.warn('Error getting daily verse:', error);
    return generateDailyVerse(new Date());
  }
};

// Favori ayet ekleme
export const addFavoriteVerse = async (
  surah: number,
  ayah: number,
  arabicText: string,
  translation: string,
  note?: string,
  tags: string[] = []
): Promise<void> => {
  try {
    const favorites = await getFavoriteVerses();
    
    const favorite: FavoriteVerse = {
      id: `fav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      surah,
      ayah,
      arabicText,
      translation,
      note,
      tags,
      addedAt: new Date(),
    };

    favorites.push(favorite);
    await AsyncStorage.setItem(FAVORITE_VERSES_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.warn('Error adding favorite verse:', error);
  }
};

// Favori ayetleri alma
export const getFavoriteVerses = async (): Promise<FavoriteVerse[]> => {
  try {
    const stored = await AsyncStorage.getItem(FAVORITE_VERSES_KEY);
    if (stored) {
      const favorites = JSON.parse(stored);
      return favorites.map((fav: any) => ({
        ...fav,
        addedAt: new Date(fav.addedAt),
      }));
    }
    return [];
  } catch (error) {
    console.warn('Error getting favorite verses:', error);
    return [];
  }
};

// Okuma hedeflerini alma
export const getReadingGoals = async (): Promise<ReadingGoals> => {
  try {
    const stored = await AsyncStorage.getItem(READING_GOALS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }

    const defaultGoals: ReadingGoals = {
      daily: { ayahs: 5, minutes: 15, enabled: true },
      weekly: { surahs: 1, ayahs: 35, enabled: true },
      monthly: { surahs: 4, ayahs: 150, enabled: true },
      hatm: { target: 2, enabled: true }, // Yılda 2 hatm
    };

    await saveReadingGoals(defaultGoals);
    return defaultGoals;
  } catch (error) {
    console.warn('Error getting reading goals:', error);
    return {
      daily: { ayahs: 5, minutes: 15, enabled: true },
      weekly: { surahs: 1, ayahs: 35, enabled: true },
      monthly: { surahs: 4, ayahs: 150, enabled: true },
      hatm: { target: 2, enabled: true },
    };
  }
};

// Okuma hedeflerini kaydetme
export const saveReadingGoals = async (goals: ReadingGoals): Promise<void> => {
  try {
    await AsyncStorage.setItem(READING_GOALS_KEY, JSON.stringify(goals));
  } catch (error) {
    console.warn('Error saving reading goals:', error);
  }
};

// İstatistikler alma
export const getReadingStatistics = async (): Promise<{
  totalDays: number;
  totalSessions: number;
  totalMinutes: number;
  averageDaily: number;
  completionRate: number;
  hatmProgress: number;
}> => {
  try {
    const progress = await getReadingProgress();
    const goals = await getReadingGoals();
    
    const totalDays = Math.floor((Date.now() - progress.startDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalSessions = progress.readingSessions.length;
    const totalMinutes = progress.readingSessions.reduce((sum, session) => sum + session.duration, 0);
    const averageDaily = totalDays > 0 ? progress.totalAyahsRead / totalDays : 0;
    const completionRate = goals.daily.enabled ? (averageDaily / goals.daily.ayahs) * 100 : 0;
    const hatmProgress = (progress.totalAyahsRead % TOTAL_AYAHS) / TOTAL_AYAHS * 100;

    return {
      totalDays,
      totalSessions,
      totalMinutes,
      averageDaily: Math.round(averageDaily * 100) / 100,
      completionRate: Math.min(100, Math.round(completionRate)),
      hatmProgress: Math.round(hatmProgress * 100) / 100,
    };
  } catch (error) {
    console.warn('Error getting reading statistics:', error);
    return {
      totalDays: 0,
      totalSessions: 0,
      totalMinutes: 0,
      averageDaily: 0,
      completionRate: 0,
      hatmProgress: 0,
    };
  }
};

// Sure bilgisi alma
export const getSurahInfo = (surahNumber: number): Surah | undefined => {
  return QURAN_SURAHS.find(surah => surah.number === surahNumber);
};

// Rastgele günlük ayet oluşturma (mock)
const generateDailyVerse = (date: Date): DailyVerse => {
  const seed = date.getDate() + date.getMonth() * 31 + date.getFullYear() * 365;
  const surahIndex = seed % QURAN_SURAHS.length;
  const surah = QURAN_SURAHS[surahIndex];
  const ayahNumber = (seed % surah.numberOfAyahs) + 1;
  
  const categories: DailyVerse['category'][] = ['motivation', 'reflection', 'guidance', 'comfort', 'gratitude'];
  const category = categories[seed % categories.length];

  return {
    date: date.toISOString().split('T')[0],
    surah: surah.number,
    ayah: ayahNumber,
    arabicText: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', // Placeholder
    translation: 'Rahman ve Rahim olan Allah\'ın adıyla', // Placeholder
    transliteration: 'Bismillahir-Rahmanir-Rahim',
    category,
    explanation: 'Bu günlük ayet size hidayet ve bereket getirebilir.',
  };
};

// Tüm verileri temizleme (test için)
export const clearReadingData = async (): Promise<void> => {
  try {
    await Promise.all([
      AsyncStorage.removeItem(READING_PROGRESS_KEY),
      AsyncStorage.removeItem(READING_SESSIONS_KEY),
      AsyncStorage.removeItem(FAVORITE_VERSES_KEY),
      AsyncStorage.removeItem(READING_GOALS_KEY),
      AsyncStorage.removeItem(READING_STATISTICS_KEY),
    ]);
  } catch (error) {
    console.warn('Error clearing reading data:', error);
  }
};

export default {
  QURAN_SURAHS,
  TOTAL_AYAHS,
  getReadingProgress,
  saveReadingProgress,
  startReadingSession,
  endReadingSession,
  getDailyVerse,
  addFavoriteVerse,
  getFavoriteVerses,
  getReadingGoals,
  saveReadingGoals,
  getReadingStatistics,
  getSurahInfo,
  clearReadingData,
}; 