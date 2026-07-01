import AsyncStorage from '@react-native-async-storage/async-storage';
import { triggerSuccessHaptic } from './haptics';

export interface VerseOfDay {
  id: string;
  arabic: string;
  translation: string;
  transliteration: string;
  surah: {
    number: number;
    name: string;
    nameArabic: string;
  };
  verse: number;
  dateKey: string; // YYYY-MM-DD format
  theme: string;
  reflection: string;
  benefits: string[];
  tags: string[];
}

export interface UserProgress {
  totalDaysRead: number;
  currentStreak: number;
  longestStreak: number;
  lastReadDate: string;
  readVerses: string[];
  favoriteVerses: string[];
  achievements: string[];
  weeklyGoal: number;
  monthlyGoal: number;
}

// Constants
const DAILY_VERSE_KEY = 'hidayet_daily_verse_';
const USER_PROGRESS_KEY = 'hidayet_user_progress';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Sample verses database (normally would come from API)
const versesDatabase: VerseOfDay[] = [
  {
    id: '1',
    arabic: 'وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا',
    translation: 'Allah\'tan korkan kimse için O, bir çıkış yolu yaratır.',
    transliteration: 'Ve men yettakillâhe yec\'al lehû mahracâ',
    surah: { number: 65, name: 'Talak', nameArabic: 'الطلاق' },
    verse: 2,
    dateKey: '2024-01-01',
    theme: 'Takva ve Çıkış Yolu',
    reflection: 'Allah\'a karşı takva sahibi olan kişi, hayatındaki zorluklardan mutlaka bir çıkış bulur.',
    benefits: ['Sabır öğretir', 'Umut verir', 'Takva kazandırır'],
    tags: ['takva', 'sabır', 'umut', 'çıkış']
  },
  {
    id: '2',
    arabic: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ',
    translation: 'Kim Allah\'a tevekkül ederse, O ona yeter.',
    transliteration: 'Ve men yetevekkel alellâhi fe huve hasbuh',
    surah: { number: 65, name: 'Talak', nameArabic: 'الطلاق' },
    verse: 3,
    dateKey: '2024-01-02',
    theme: 'Tevekkül ve Güven',
    reflection: 'Allah\'a tam güven ile bağlanan kimse, hiçbir şeyden endişe etmez.',
    benefits: ['Tevekkül öğretir', 'Kaygıyı azaltır', 'İçten huzur verir'],
    tags: ['tevekkül', 'güven', 'huzur', 'endişe']
  },
  {
    id: '3',
    arabic: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
    translation: 'Şüphesiz güçlükle beraber kolaylık vardır.',
    transliteration: 'İnne me\'al usri yusrâ',
    surah: { number: 94, name: 'İnşirah', nameArabic: 'الشرح' },
    verse: 6,
    dateKey: '2024-01-03',
    theme: 'Umut ve Kolaylık',
    reflection: 'Her zorluk mutlaka bir kolaylık getirir. Bu Allah\'ın vaadidir.',
    benefits: ['Umut verir', 'Sabır öğretir', 'Motivasyon sağlar'],
    tags: ['umut', 'kolaylık', 'zorluk', 'sabır']
  }
];

// Get today's verse
export async function getTodaysVerse(): Promise<{
  success: boolean;
  verse?: VerseOfDay;
  error?: string;
}> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `${DAILY_VERSE_KEY}${today}`;
    
    // Check cache first
    try {
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) {
        const cachedData = JSON.parse(cached);
        const cacheAge = Date.now() - cachedData.timestamp;
        
        if (cacheAge < CACHE_DURATION) {
          return {
            success: true,
            verse: cachedData.verse
          };
        }
      }
    } catch (cacheError) {
      console.warn('Daily verse cache read error:', cacheError);
    }

    // Generate verse for today
    const dayOfYear = getDayOfYear(new Date());
    const verseIndex = dayOfYear % versesDatabase.length;
    const verse = {
      ...versesDatabase[verseIndex],
      dateKey: today
    };

    // Cache the result
    try {
      await AsyncStorage.setItem(cacheKey, JSON.stringify({
        verse,
        timestamp: Date.now()
      }));
    } catch (cacheError) {
      console.warn('Daily verse cache write error:', cacheError);
    }

    return {
      success: true,
      verse
    };

  } catch (error) {
    console.error('Get today\'s verse error:', error);
    return {
      success: false,
      error: 'Günlük ayet yüklenirken hata oluştu'
    };
  }
}

// Mark verse as read
export async function markVerseAsRead(verseId: string): Promise<{
  success: boolean;
  progress?: UserProgress;
  newAchievements?: string[];
  error?: string;
}> {
  try {
    const progress = await getUserProgress();
    const today = new Date().toISOString().split('T')[0];
    
    // Don't mark if already read today
    if (progress.lastReadDate === today) {
      return {
        success: true,
        progress
      };
    }

    // Update progress
    const newProgress = {
      ...progress,
      totalDaysRead: progress.totalDaysRead + 1,
      lastReadDate: today,
      readVerses: [...progress.readVerses, verseId],
      currentStreak: calculateNewStreak(progress.lastReadDate, today, progress.currentStreak),
    };

    // Update longest streak
    if (newProgress.currentStreak > progress.longestStreak) {
      newProgress.longestStreak = newProgress.currentStreak;
    }

    // Check for new achievements
    const newAchievements = checkForNewAchievements(progress, newProgress);
    newProgress.achievements = [...progress.achievements, ...newAchievements];

    // Save progress
    await AsyncStorage.setItem(USER_PROGRESS_KEY, JSON.stringify(newProgress));

    // Trigger success haptic
    triggerSuccessHaptic();

    return {
      success: true,
      progress: newProgress,
      newAchievements
    };

  } catch (error) {
    console.error('Mark verse as read error:', error);
    return {
      success: false,
      error: 'İlerleme kaydedilirken hata oluştu'
    };
  }
}

// Get user progress
export async function getUserProgress(): Promise<UserProgress> {
  try {
    const stored = await AsyncStorage.getItem(USER_PROGRESS_KEY);
    
    if (stored) {
      return JSON.parse(stored);
    }

    // Default progress
    const defaultProgress: UserProgress = {
      totalDaysRead: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastReadDate: '',
      readVerses: [],
      favoriteVerses: [],
      achievements: [],
      weeklyGoal: 7,
      monthlyGoal: 30
    };

    await AsyncStorage.setItem(USER_PROGRESS_KEY, JSON.stringify(defaultProgress));
    return defaultProgress;

  } catch (error) {
    console.error('Get user progress error:', error);
    return {
      totalDaysRead: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastReadDate: '',
      readVerses: [],
      favoriteVerses: [],
      achievements: [],
      weeklyGoal: 7,
      monthlyGoal: 30
    };
  }
}

// Add verse to favorites
export async function toggleVerseFavorite(verseId: string): Promise<{
  success: boolean;
  isFavorite: boolean;
  error?: string;
}> {
  try {
    const progress = await getUserProgress();
    const isFavorite = progress.favoriteVerses.includes(verseId);
    
    let newFavorites;
    if (isFavorite) {
      newFavorites = progress.favoriteVerses.filter(id => id !== verseId);
    } else {
      newFavorites = [...progress.favoriteVerses, verseId];
    }

    const newProgress = {
      ...progress,
      favoriteVerses: newFavorites
    };

    await AsyncStorage.setItem(USER_PROGRESS_KEY, JSON.stringify(newProgress));

    return {
      success: true,
      isFavorite: !isFavorite
    };

  } catch (error) {
    console.error('Toggle verse favorite error:', error);
    return {
      success: false,
      isFavorite: false,
      error: 'Favori güncelleme hatası'
    };
  }
}

// Get verses by date range
export async function getVersesByDateRange(
  startDate: string, 
  endDate: string
): Promise<{
  success: boolean;
  verses?: VerseOfDay[];
  error?: string;
}> {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const verses: VerseOfDay[] = [];

    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dateKey = date.toISOString().split('T')[0];
      const dayOfYear = getDayOfYear(date);
      const verseIndex = dayOfYear % versesDatabase.length;
      
      verses.push({
        ...versesDatabase[verseIndex],
        dateKey
      });
    }

    return {
      success: true,
      verses
    };

  } catch (error) {
    console.error('Get verses by date range error:', error);
    return {
      success: false,
      error: 'Ayetler yüklenirken hata oluştu'
    };
  }
}

// Search verses
export async function searchVerses(query: string): Promise<{
  success: boolean;
  verses?: VerseOfDay[];
  error?: string;
}> {
  try {
    if (!query.trim()) {
      return {
        success: false,
        error: 'Arama sorgusu gereklidir'
      };
    }

    const searchTerm = query.toLowerCase().trim();
    const filteredVerses = versesDatabase.filter(verse => 
      verse.translation.toLowerCase().includes(searchTerm) ||
      verse.theme.toLowerCase().includes(searchTerm) ||
      verse.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      verse.surah.name.toLowerCase().includes(searchTerm)
    );

    return {
      success: true,
      verses: filteredVerses
    };

  } catch (error) {
    console.error('Search verses error:', error);
    return {
      success: false,
      error: 'Arama yapılırken hata oluştu'
    };
  }
}

// Helper functions
function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function calculateNewStreak(lastReadDate: string, today: string, currentStreak: number): number {
  if (!lastReadDate) return 1;
  
  const last = new Date(lastReadDate);
  const current = new Date(today);
  const diffTime = Math.abs(current.getTime() - last.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) {
    return currentStreak + 1;
  } else {
    return 1; // Reset streak
  }
}

function checkForNewAchievements(oldProgress: UserProgress, newProgress: UserProgress): string[] {
  const achievements: string[] = [];
  
  // First verse achievement
  if (oldProgress.totalDaysRead === 0 && newProgress.totalDaysRead === 1) {
    achievements.push('first_verse');
  }
  
  // Streak achievements
  if (newProgress.currentStreak === 7 && !oldProgress.achievements.includes('week_streak')) {
    achievements.push('week_streak');
  }
  
  if (newProgress.currentStreak === 30 && !oldProgress.achievements.includes('month_streak')) {
    achievements.push('month_streak');
  }
  
  if (newProgress.currentStreak === 100 && !oldProgress.achievements.includes('hundred_streak')) {
    achievements.push('hundred_streak');
  }
  
  // Reading milestones
  if (newProgress.totalDaysRead === 50 && !oldProgress.achievements.includes('fifty_days')) {
    achievements.push('fifty_days');
  }
  
  if (newProgress.totalDaysRead === 100 && !oldProgress.achievements.includes('hundred_days')) {
    achievements.push('hundred_days');
  }
  
  return achievements;
}

// Get achievement info
export function getAchievementInfo(achievementId: string): {
  title: string;
  description: string;
  icon: string;
  color: string;
} {
  const achievements = {
    first_verse: {
      title: 'İlk Adım',
      description: 'İlk günlük ayetini okudun!',
      icon: '🌟',
      color: '#fbbf24'
    },
    week_streak: {
      title: 'Haftalık Kararlılık',
      description: '7 gün üst üste ayet okudun!',
      icon: '🔥',
      color: '#ef4444'
    },
    month_streak: {
      title: 'Aylık Sebat',
      description: '30 gün üst üste ayet okudun!',
      icon: '💎',
      color: '#8b5cf6'
    },
    hundred_streak: {
      title: 'Yüzlük Şampiyon',
      description: '100 gün üst üste ayet okudun!',
      icon: '👑',
      color: '#f59e0b'
    },
    fifty_days: {
      title: 'Yarım Yüzyıl',
      description: 'Toplam 50 gün ayet okudun!',
      icon: '📚',
      color: '#22c55e'
    },
    hundred_days: {
      title: 'Yüzlük Kulüp',
      description: 'Toplam 100 gün ayet okudun!',
      icon: '🏆',
      color: '#dc2626'
    }
  };
  
  return achievements[achievementId] || {
    title: 'Bilinmeyen Başarı',
    description: '',
    icon: '⭐',
    color: '#64748b'
  };
}

// Update user goals
export async function updateUserGoals(weeklyGoal: number, monthlyGoal: number): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const progress = await getUserProgress();
    const newProgress = {
      ...progress,
      weeklyGoal,
      monthlyGoal
    };
    
    await AsyncStorage.setItem(USER_PROGRESS_KEY, JSON.stringify(newProgress));
    
    return { success: true };
  } catch (error) {
    console.error('Update user goals error:', error);
    return {
      success: false,
      error: 'Hedefler güncellenirken hata oluştu'
    };
  }
} 