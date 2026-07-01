import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { getCurrentLocale } from './i18n';

// Prayer times calculation (simplified - would use proper library in production)
export interface PrayerTimes {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  date: string;
}

export interface DailyVerse {
  arabic: string;
  translation: string;
  reference: string;
  date: string;
}

// Prayer times storage keys
const PRAYER_TIMES_KEY = 'prayer_times_cache';
const DAILY_VERSE_KEY = 'daily_verse_cache';
const USER_LOCATION_KEY = 'user_location';

// Get user location for prayer times
export const getUserLocation = async (): Promise<Location.LocationObject | null> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      // Fallback to cached location or default (Istanbul)
      const cached = await AsyncStorage.getItem(USER_LOCATION_KEY);
      return cached ? JSON.parse(cached) : null;
    }

    const location = await Location.getCurrentPositionAsync({});
    await AsyncStorage.setItem(USER_LOCATION_KEY, JSON.stringify(location));
    return location;
  } catch (error) {
    console.warn('Error getting location:', error);
    return null;
  }
};

// Calculate prayer times based on location
export const calculatePrayerTimes = async (
  latitude: number,
  longitude: number,
  date: Date = new Date()
): Promise<PrayerTimes> => {
  // Simplified calculation - in production would use proper Islamic prayer time library
  const dateStr = date.toISOString().split('T')[0];
  
  // Mock prayer times (would be calculated based on sun position)
  const mockTimes: PrayerTimes = {
    fajr: '05:30',
    sunrise: '07:15',
    dhuhr: '13:00',
    asr: '16:30',
    maghrib: '19:45',
    isha: '21:15',
    date: dateStr,
  };

  return mockTimes;
};

// Get daily prayer times
export const getDailyPrayerTimes = async (): Promise<PrayerTimes> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Check cache first
    const cached = await AsyncStorage.getItem(PRAYER_TIMES_KEY);
    if (cached) {
      const cachedData: PrayerTimes = JSON.parse(cached);
      if (cachedData.date === today) {
        return cachedData;
      }
    }

    // Get fresh prayer times
    const location = await getUserLocation();
    let prayerTimes: PrayerTimes;

    if (location) {
      prayerTimes = await calculatePrayerTimes(
        location.coords.latitude,
        location.coords.longitude
      );
    } else {
      // Default to Istanbul coordinates
      prayerTimes = await calculatePrayerTimes(41.0082, 28.9784);
    }

    // Cache the result
    await AsyncStorage.setItem(PRAYER_TIMES_KEY, JSON.stringify(prayerTimes));
    return prayerTimes;
  } catch (error) {
    console.warn('Error getting prayer times:', error);
    // Return default times
    return {
      fajr: '05:30',
      sunrise: '07:15',
      dhuhr: '13:00',
      asr: '16:30',
      maghrib: '19:45',
      isha: '21:15',
      date: new Date().toISOString().split('T')[0],
    };
  }
};

// Get next prayer time
export const getNextPrayerTime = (prayerTimes: PrayerTimes): { name: string; time: string } => {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const prayers = [
    { name: 'Fajr', time: prayerTimes.fajr, key: 'fajr' },
    { name: 'Sunrise', time: prayerTimes.sunrise, key: 'sunrise' },
    { name: 'Dhuhr', time: prayerTimes.dhuhr, key: 'dhuhr' },
    { name: 'Asr', time: prayerTimes.asr, key: 'asr' },
    { name: 'Maghrib', time: prayerTimes.maghrib, key: 'maghrib' },
    { name: 'Isha', time: prayerTimes.isha, key: 'isha' },
  ];

  for (const prayer of prayers) {
    const [hours, minutes] = prayer.time.split(':').map(Number);
    const prayerTime = hours * 60 + minutes;
    
    if (prayerTime > currentTime) {
      return { name: prayer.name, time: prayer.time };
    }
  }

  // If no prayer left today, return first prayer of tomorrow
  return { name: 'Fajr', time: prayerTimes.fajr };
};

// Daily verse collection (would be fetched from API in production)
const dailyVerses: DailyVerse[] = [
  {
    arabic: 'وَادْعُوهُ خَوْفًا وَطَمَعًا ۚ إِنَّ رَحْمَتَ اللَّهِ قَرِيبٌ مِّنَ الْمُحْسِنِينَ',
    translation: 'And pray to Him with fear and hope. Indeed, the mercy of Allah is near to the doers of good.',
    reference: 'Al-A\'raf 7:56',
    date: '2024-01-01',
  },
  {
    arabic: 'وَقُل رَّبِّ زِدْنِي عِلْمًا',
    translation: 'And say: My Lord, increase me in knowledge.',
    reference: 'Ta-Ha 20:114',
    date: '2024-01-02',
  },
  {
    arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
    translation: 'Our Lord, give us good in this world and good in the hereafter, and save us from the punishment of the Fire.',
    reference: 'Al-Baqarah 2:201',
    date: '2024-01-03',
  },
];

// Get daily verse
export const getDailyVerse = async (): Promise<DailyVerse> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Check cache first
    const cached = await AsyncStorage.getItem(DAILY_VERSE_KEY);
    if (cached) {
      const cachedData: DailyVerse = JSON.parse(cached);
      if (cachedData.date === today) {
        return cachedData;
      }
    }

    // Get verse for today (simple rotation based on day)
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const verseIndex = dayOfYear % dailyVerses.length;
    const verse = { ...dailyVerses[verseIndex], date: today };

    // Translate reference based on locale
    const locale = getCurrentLocale();
    if (locale === 'tr') {
      verse.reference = verse.reference.replace('Al-A\'raf', 'A\'raf Suresi')
                                     .replace('Ta-Ha', 'Ta-Ha Suresi')
                                     .replace('Al-Baqarah', 'Bakara Suresi');
    } else if (locale === 'ar') {
      verse.reference = verse.reference.replace('Al-A\'raf 7:56', 'سورة الأعراف 7:56')
                                     .replace('Ta-Ha 20:114', 'سورة طه 20:114')
                                     .replace('Al-Baqarah 2:201', 'سورة البقرة 2:201');
    }

    // Cache the result
    await AsyncStorage.setItem(DAILY_VERSE_KEY, JSON.stringify(verse));
    return verse;
  } catch (error) {
    console.warn('Error getting daily verse:', error);
    return dailyVerses[0];
  }
};

// Widget data structure for iOS widgets
export interface WidgetData {
  prayerTimes: PrayerTimes;
  nextPrayer: { name: string; time: string };
  dailyVerse: DailyVerse;
  lastUpdated: string;
}

// Get complete widget data
export const getWidgetData = async (): Promise<WidgetData> => {
  const [prayerTimes, dailyVerse] = await Promise.all([
    getDailyPrayerTimes(),
    getDailyVerse(),
  ]);

  const nextPrayer = getNextPrayerTime(prayerTimes);

  return {
    prayerTimes,
    nextPrayer,
    dailyVerse,
    lastUpdated: new Date().toISOString(),
  };
};

// Time remaining until next prayer
export const getTimeUntilNextPrayer = (nextPrayerTime: string): string => {
  const now = new Date();
  const [hours, minutes] = nextPrayerTime.split(':').map(Number);
  
  const nextPrayer = new Date();
  nextPrayer.setHours(hours, minutes, 0, 0);
  
  // If prayer time has passed today, set it for tomorrow
  if (nextPrayer < now) {
    nextPrayer.setDate(nextPrayer.getDate() + 1);
  }
  
  const diffMs = nextPrayer.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (diffHours > 0) {
    return `${diffHours}sa ${diffMinutes}dk`;
  } else {
    return `${diffMinutes}dk`;
  }
};

// Schedule prayer time notifications
export const schedulePrayerNotifications = async () => {
  try {
    const prayerTimes = await getDailyPrayerTimes();
    
    // This would integrate with expo-notifications to schedule
    // prayer time reminders throughout the day
    console.log('Prayer notifications scheduled:', prayerTimes);
  } catch (error) {
    console.warn('Error scheduling notifications:', error);
  }
};

// Update widget data (called from background tasks)
export const updateWidgetData = async (): Promise<void> => {
  try {
    const widgetData = await getWidgetData();
    
    // Store data for widgets to access
    await AsyncStorage.setItem('widget_data', JSON.stringify(widgetData));
    
    // Schedule next update
    await schedulePrayerNotifications();
  } catch (error) {
    console.warn('Error updating widget data:', error);
  }
};

export default {
  getDailyPrayerTimes,
  getNextPrayerTime,
  getDailyVerse,
  getWidgetData,
  getTimeUntilNextPrayer,
  schedulePrayerNotifications,
  updateWidgetData,
  getUserLocation,
}; 