import AsyncStorage from '@react-native-async-storage/async-storage';
import { logEvent } from '../../firebase.config';
import { triggerSelectionFeedback, triggerSuccessHaptic } from './haptics';

// Types
export interface ActivityProgress {
  id: string;
  type: 'prayer' | 'reading' | 'study' | 'chat' | 'dua';
  date: string;
  duration?: number; // in minutes
  details: {
    content?: string;
    chapter?: string;
    verses?: number;
    pages?: number;
    category?: string;
  };
  completed: boolean;
  timestamp: Date;
}

export interface UserStats {
  totalDays: number;
  currentStreak: number;
  longestStreak: number;
  totalMinutes: number;
  lastActiveDate: string;
  
  // Activity-specific stats
  prayerStats: {
    totalPrayers: number;
    duaRequests: number;
    favorites: number;
  };
  
  readingStats: {
    totalVerses: number;
    totalSurahs: number;
    completedSurahs: string[];
    totalPages: number;
    averageDaily: number;
  };
  
  studyStats: {
    totalSessions: number;
    totalMinutes: number;
    completedCourses: string[];
    currentCourse?: string;
    courseProgress: Record<string, number>;
  };
  
  chatStats: {
    totalMessages: number;
    totalSessions: number;
    averageSessionLength: number;
    favoriteTopics: string[];
  };
  
  // Weekly and monthly goals
  goals: {
    dailyReading: number; // minutes
    weeklyPrayers: number;
    monthlyCompletion: number; // percentage
  };
  
  // Achievements
  achievements: Achievement[];
  nextMilestones: Milestone[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  unlockedAt: Date;
  category: 'reading' | 'prayer' | 'study' | 'engagement' | 'streak';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  type: 'reading' | 'prayer' | 'study' | 'streak';
  reward?: string;
}

// Constants
const PROGRESS_KEY = 'hidayet_user_progress';
const ACTIVITY_LOG_KEY = 'hidayet_activity_log';
const STATS_KEY = 'hidayet_user_stats';

// Log user activity
export async function logActivity(activity: Omit<ActivityProgress, 'id' | 'timestamp'>): Promise<{
  success: boolean;
  newAchievements?: Achievement[];
  error?: string;
}> {
  try {
    const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newActivity: ActivityProgress = {
      ...activity,
      id,
      timestamp: new Date()
    };

    // Get existing activities
    const activities = await getActivityLog();
    activities.push(newActivity);

    // Keep only last 1000 activities
    if (activities.length > 1000) {
      activities.splice(0, activities.length - 1000);
    }

    // Save activities
    await AsyncStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(activities));

    // Update user stats
    const stats = await updateUserStats(newActivity);

    // Check for new achievements
    const newAchievements = await checkForAchievements(stats, newActivity);

    // Update stats with new achievements
    if (newAchievements.length > 0) {
      stats.achievements = [...stats.achievements, ...newAchievements];
      await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
      
      // Trigger haptic feedback for achievements
      triggerSuccessHaptic();
    }

    // Log to analytics
    logEvent('activity_logged', {
      activity_type: activity.type,
      completed: activity.completed,
      duration: activity.duration || 0
    });

    return {
      success: true,
      newAchievements: newAchievements.length > 0 ? newAchievements : undefined
    };

  } catch (error) {
    console.error('Log activity error:', error);
    return {
      success: false,
      error: 'Aktivite kaydedilirken hata oluştu'
    };
  }
}

// Get activity log
export async function getActivityLog(days: number = 30): Promise<ActivityProgress[]> {
  try {
    const stored = await AsyncStorage.getItem(ACTIVITY_LOG_KEY);
    if (!stored) return [];

    const activities: ActivityProgress[] = JSON.parse(stored);
    
    // Filter by date range
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return activities.filter(activity => 
      new Date(activity.timestamp) >= cutoffDate
    );

  } catch (error) {
    console.error('Get activity log error:', error);
    return [];
  }
}

// Get user statistics
export async function getUserStats(): Promise<UserStats> {
  try {
    const stored = await AsyncStorage.getItem(STATS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }

    // Create default stats
    const defaultStats: UserStats = {
      totalDays: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalMinutes: 0,
      lastActiveDate: '',
      
      prayerStats: {
        totalPrayers: 0,
        duaRequests: 0,
        favorites: 0
      },
      
      readingStats: {
        totalVerses: 0,
        totalSurahs: 0,
        completedSurahs: [],
        totalPages: 0,
        averageDaily: 0
      },
      
      studyStats: {
        totalSessions: 0,
        totalMinutes: 0,
        completedCourses: [],
        courseProgress: {}
      },
      
      chatStats: {
        totalMessages: 0,
        totalSessions: 0,
        averageSessionLength: 0,
        favoriteTopics: []
      },
      
      goals: {
        dailyReading: 15, // 15 minutes default
        weeklyPrayers: 10,
        monthlyCompletion: 80
      },
      
      achievements: [],
      nextMilestones: getDefaultMilestones()
    };

    await AsyncStorage.setItem(STATS_KEY, JSON.stringify(defaultStats));
    return defaultStats;

  } catch (error) {
    console.error('Get user stats error:', error);
    return {
      totalDays: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalMinutes: 0,
      lastActiveDate: '',
      prayerStats: { totalPrayers: 0, duaRequests: 0, favorites: 0 },
      readingStats: { totalVerses: 0, totalSurahs: 0, completedSurahs: [], totalPages: 0, averageDaily: 0 },
      studyStats: { totalSessions: 0, totalMinutes: 0, completedCourses: [], courseProgress: {} },
      chatStats: { totalMessages: 0, totalSessions: 0, averageSessionLength: 0, favoriteTopics: [] },
      goals: { dailyReading: 15, weeklyPrayers: 10, monthlyCompletion: 80 },
      achievements: [],
      nextMilestones: []
    };
  }
}

// Update user statistics
async function updateUserStats(activity: ActivityProgress): Promise<UserStats> {
  const stats = await getUserStats();
  const today = new Date().toISOString().split('T')[0];
  
  // Update basic stats
  if (stats.lastActiveDate !== today) {
    stats.totalDays += 1;
    stats.currentStreak = calculateStreak(stats.lastActiveDate, today, stats.currentStreak);
    stats.longestStreak = Math.max(stats.longestStreak, stats.currentStreak);
    stats.lastActiveDate = today;
  }
  
  if (activity.duration) {
    stats.totalMinutes += activity.duration;
  }

  // Update activity-specific stats
  switch (activity.type) {
    case 'prayer':
      stats.prayerStats.totalPrayers += 1;
      break;
      
    case 'reading':
      if (activity.details.verses) {
        stats.readingStats.totalVerses += activity.details.verses;
      }
      if (activity.details.pages) {
        stats.readingStats.totalPages += activity.details.pages;
      }
      if (activity.completed && activity.details.chapter) {
        if (!stats.readingStats.completedSurahs.includes(activity.details.chapter)) {
          stats.readingStats.completedSurahs.push(activity.details.chapter);
          stats.readingStats.totalSurahs += 1;
        }
      }
      break;
      
    case 'study':
      stats.studyStats.totalSessions += 1;
      if (activity.duration) {
        stats.studyStats.totalMinutes += activity.duration;
      }
      break;
      
    case 'chat':
      stats.chatStats.totalMessages += 1;
      if (activity.duration) {
        const newAvg = (stats.chatStats.averageSessionLength * stats.chatStats.totalSessions + activity.duration) / (stats.chatStats.totalSessions + 1);
        stats.chatStats.averageSessionLength = Math.round(newAvg);
        stats.chatStats.totalSessions += 1;
      }
      break;
  }

  // Update averages
  if (stats.totalDays > 0) {
    stats.readingStats.averageDaily = Math.round(stats.readingStats.totalVerses / stats.totalDays);
  }

  // Update milestones
  stats.nextMilestones = updateMilestones(stats);

  // Save updated stats
  await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
  return stats;
}

// Check for new achievements
async function checkForAchievements(stats: UserStats, activity: ActivityProgress): Promise<Achievement[]> {
  const newAchievements: Achievement[] = [];
  const existingIds = stats.achievements.map(a => a.id);

  // First activity achievement
  if (stats.totalDays === 1 && !existingIds.includes('first_day')) {
    newAchievements.push({
      id: 'first_day',
      title: 'Başlangıç',
      description: 'İlk aktiviteni tamamladın!',
      icon: '🌟',
      color: '#fbbf24',
      unlockedAt: new Date(),
      category: 'engagement',
      rarity: 'common'
    });
  }

  // Streak achievements
  if (stats.currentStreak === 7 && !existingIds.includes('week_streak')) {
    newAchievements.push({
      id: 'week_streak',
      title: 'Haftalık Kararlılık',
      description: '7 gün üst üste aktif oldun!',
      icon: '🔥',
      color: '#ef4444',
      unlockedAt: new Date(),
      category: 'streak',
      rarity: 'rare'
    });
  }

  if (stats.currentStreak === 30 && !existingIds.includes('month_streak')) {
    newAchievements.push({
      id: 'month_streak',
      title: 'Aylık Sebat',
      description: '30 gün üst üste aktif oldun!',
      icon: '💎',
      color: '#8b5cf6',
      unlockedAt: new Date(),
      category: 'streak',
      rarity: 'epic'
    });
  }

  // Reading achievements
  if (stats.readingStats.totalSurahs === 1 && !existingIds.includes('first_surah')) {
    newAchievements.push({
      id: 'first_surah',
      title: 'İlk Sure',
      description: 'İlk sureyi tamamladın!',
      icon: '📖',
      color: '#22c55e',
      unlockedAt: new Date(),
      category: 'reading',
      rarity: 'common'
    });
  }

  if (stats.readingStats.totalVerses >= 100 && !existingIds.includes('hundred_verses')) {
    newAchievements.push({
      id: 'hundred_verses',
      title: 'Yüzlük Okuyucu',
      description: '100 ayet okudun!',
      icon: '📚',
      color: '#3b82f6',
      unlockedAt: new Date(),
      category: 'reading',
      rarity: 'rare'
    });
  }

  // Prayer achievements
  if (stats.prayerStats.totalPrayers >= 50 && !existingIds.includes('prayer_warrior')) {
    newAchievements.push({
      id: 'prayer_warrior',
      title: 'Dua Savaşçısı',
      description: '50 kez dua ettin!',
      icon: '🤲',
      color: '#ec4899',
      unlockedAt: new Date(),
      category: 'prayer',
      rarity: 'rare'
    });
  }

  // Study achievements
  if (stats.studyStats.totalMinutes >= 600 && !existingIds.includes('scholar')) {
    newAchievements.push({
      id: 'scholar',
      title: 'Alim',
      description: '10 saat çalıştın!',
      icon: '🎓',
      color: '#f59e0b',
      unlockedAt: new Date(),
      category: 'study',
      rarity: 'epic'
    });
  }

  return newAchievements;
}

// Calculate streak
function calculateStreak(lastDate: string, currentDate: string, currentStreak: number): number {
  if (!lastDate) return 1;
  
  const last = new Date(lastDate);
  const current = new Date(currentDate);
  const diffTime = Math.abs(current.getTime() - last.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) {
    return currentStreak + 1;
  } else {
    return 1; // Reset streak
  }
}

// Get default milestones
function getDefaultMilestones(): Milestone[] {
  return [
    {
      id: 'first_week',
      title: 'İlk Hafta',
      description: '7 gün üst üste aktif ol',
      target: 7,
      current: 0,
      type: 'streak',
      reward: 'Özel rozet'
    },
    {
      id: 'hundred_verses',
      title: 'Yüz Ayet',
      description: '100 ayet oku',
      target: 100,
      current: 0,
      type: 'reading',
      reward: 'Okuyucu rozeti'
    },
    {
      id: 'ten_prayers',
      title: 'On Dua',
      description: '10 kez dua et',
      target: 10,
      current: 0,
      type: 'prayer',
      reward: 'Dua rozeti'
    }
  ];
}

// Update milestones based on current stats
function updateMilestones(stats: UserStats): Milestone[] {
  const milestones = stats.nextMilestones || getDefaultMilestones();
  
  return milestones.map(milestone => {
    switch (milestone.type) {
      case 'streak':
        return { ...milestone, current: stats.currentStreak };
      case 'reading':
        return { ...milestone, current: stats.readingStats.totalVerses };
      case 'prayer':
        return { ...milestone, current: stats.prayerStats.totalPrayers };
      case 'study':
        return { ...milestone, current: stats.studyStats.totalSessions };
      default:
        return milestone;
    }
  }).filter(milestone => milestone.current < milestone.target);
}

// Get weekly progress summary
export async function getWeeklyProgress(): Promise<{
  success: boolean;
  data?: {
    dailyActivities: { date: string; count: number; duration: number }[];
    totalActivities: number;
    totalDuration: number;
    goalsAchieved: number;
    goalsTotal: number;
  };
  error?: string;
}> {
  try {
    const activities = await getActivityLog(7);
    const stats = await getUserStats();
    
    // Group activities by date
    const dailyMap = new Map();
    let totalDuration = 0;
    
    activities.forEach(activity => {
      const date = activity.date;
      if (!dailyMap.has(date)) {
        dailyMap.set(date, { count: 0, duration: 0 });
      }
      
      const day = dailyMap.get(date);
      day.count += 1;
      day.duration += activity.duration || 0;
      totalDuration += activity.duration || 0;
    });
    
    // Convert to array
    const dailyActivities = Array.from(dailyMap.entries()).map(([date, data]) => ({
      date,
      count: data.count,
      duration: data.duration
    }));
    
    // Calculate goals achieved
    let goalsAchieved = 0;
    const goalsTotal = 3;
    
    if (totalDuration >= stats.goals.dailyReading * 7) goalsAchieved++;
    if (stats.prayerStats.totalPrayers >= stats.goals.weeklyPrayers) goalsAchieved++;
    if (activities.length >= 7) goalsAchieved++;
    
    return {
      success: true,
      data: {
        dailyActivities,
        totalActivities: activities.length,
        totalDuration,
        goalsAchieved,
        goalsTotal
      }
    };
    
  } catch (error) {
    console.error('Get weekly progress error:', error);
    return {
      success: false,
      error: 'Haftalık ilerleme yüklenirken hata oluştu'
    };
  }
}

// Update user goals
export async function updateUserGoals(goals: Partial<UserStats['goals']>): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const stats = await getUserStats();
    stats.goals = { ...stats.goals, ...goals };
    
    await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
    
    triggerSelectionFeedback();
    return { success: true };
    
  } catch (error) {
    console.error('Update user goals error:', error);
    return {
      success: false,
      error: 'Hedefler güncellenirken hata oluştu'
    };
  }
} 