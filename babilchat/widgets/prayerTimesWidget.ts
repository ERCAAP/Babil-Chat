import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { getDailyVerse } from '../src/utils/dailyVerse';
import { getCurrentLocation } from '../src/utils/qibla';
import { formatPrayerTime, getNextPrayerTime, getRealPrayerTimes } from '../src/utils/realPrayerTimes';

// Widget Configuration
export interface WidgetConfiguration {
  id: string;
  title: string;
  description: string;
  family: 'small' | 'medium' | 'large' | 'extraLarge';
  supportedSizes: ('small' | 'medium' | 'large' | 'extraLarge')[];
  updateInterval: number; // minutes
}

// Widget Data Interfaces
export interface PrayerTimesWidgetData {
  nextPrayer: {
    name: string;
    time: string;
    timeUntil: string;
  };
  todayPrayers: {
    fajr: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
  };
  location: {
    city: string;
    country: string;
  };
  hijriDate: string;
  lastUpdated: string;
}

export interface DailyVerseWidgetData {
  arabic: string;
  translation: string;
  surahName: string;
  verseNumber: number;
  source: string;
  lastUpdated: string;
}

// Widget Configurations
export const WIDGET_CONFIGURATIONS: WidgetConfiguration[] = [
  {
    id: 'prayer_times_small',
    title: 'Namaz Vakitleri (Küçük)',
    description: 'Sonraki namaz vakti ve kalan süre',
    family: 'small',
    supportedSizes: ['small'],
    updateInterval: 15, // 15 minutes
  },
  {
    id: 'prayer_times_medium',
    title: 'Namaz Vakitleri (Orta)',
    description: 'Tüm günlük namaz vakitleri',
    family: 'medium',
    supportedSizes: ['medium'],
    updateInterval: 60, // 1 hour
  },
  {
    id: 'daily_verse_small',
    title: 'Günlük Ayet (Küçük)',
    description: 'Günün ayeti kısa formatta',
    family: 'small',
    supportedSizes: ['small'],
    updateInterval: 1440, // 24 hours
  },
  {
    id: 'daily_verse_medium',
    title: 'Günlük Ayet (Orta)',
    description: 'Günün ayeti Arapça ve Türkçe',
    family: 'medium',
    supportedSizes: ['medium'],
    updateInterval: 1440, // 24 hours
  },
  {
    id: 'combined_widget',
    title: 'Birleşik Widget',
    description: 'Namaz vakitleri ve günlük ayet',
    family: 'large',
    supportedSizes: ['large'],
    updateInterval: 60, // 1 hour
  }
];

// Task Manager Tasks
const PRAYER_TIMES_TASK = 'prayer-times-widget-update';
const DAILY_VERSE_TASK = 'daily-verse-widget-update';

// Background Task Definitions
TaskManager.defineTask(PRAYER_TIMES_TASK, async () => {
  try {
    console.log('Prayer times widget background update started');
    
    const widgetData = await generatePrayerTimesWidget();
    if (widgetData) {
      await updateWidgetData('prayer_times', widgetData);
      console.log('Prayer times widget updated successfully');
    }

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('Prayer times widget update failed:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

TaskManager.defineTask(DAILY_VERSE_TASK, async () => {
  try {
    console.log('Daily verse widget background update started');
    
    const widgetData = await generateDailyVerseWidget();
    if (widgetData) {
      await updateWidgetData('daily_verse', widgetData);
      console.log('Daily verse widget updated successfully');
    }

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('Daily verse widget update failed:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// Widget Data Generation
export const generatePrayerTimesWidget = async (): Promise<PrayerTimesWidgetData | null> => {
  try {
    // Get current location
    const location = await getCurrentLocation();
    if (!location) {
      throw new Error('Location not available');
    }

    // Get prayer times
    const prayerTimes = await getRealPrayerTimes(location.latitude, location.longitude);
    if (!prayerTimes) {
      throw new Error('Prayer times not available');
    }

    // Get next prayer
    const nextPrayer = getNextPrayerTime(prayerTimes);
    if (!nextPrayer) {
      throw new Error('Next prayer time not available');
    }

    // Format time until next prayer
    const hours = Math.floor(nextPrayer.timeUntil / 60);
    const minutes = nextPrayer.timeUntil % 60;
    const timeUntilString = hours > 0 
      ? `${hours}s ${minutes}d` 
      : `${minutes}d`;

    // Get Hijri date (simplified - would use proper library)
    const hijriDate = formatHijriDate(new Date());

    return {
      nextPrayer: {
        name: nextPrayer.name,
        time: formatPrayerTime(nextPrayer.time),
        timeUntil: timeUntilString
      },
      todayPrayers: {
        fajr: formatPrayerTime(prayerTimes.fajr),
        dhuhr: formatPrayerTime(prayerTimes.dhuhr),
        asr: formatPrayerTime(prayerTimes.asr),
        maghrib: formatPrayerTime(prayerTimes.maghrib),
        isha: formatPrayerTime(prayerTimes.isha)
      },
      location: {
        city: prayerTimes.location.city || 'Bilinmeyen',
        country: prayerTimes.location.country || 'Türkiye'
      },
      hijriDate,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error generating prayer times widget:', error);
    return null;
  }
};

export const generateDailyVerseWidget = async (): Promise<DailyVerseWidgetData | null> => {
  try {
    const dailyVerse = await getDailyVerse();
    if (!dailyVerse) {
      throw new Error('Daily verse not available');
    }

    return {
      arabic: dailyVerse.arabic,
      translation: dailyVerse.translation,
      surahName: dailyVerse.surahName,
      verseNumber: dailyVerse.verseNumber,
      source: dailyVerse.source,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error generating daily verse widget:', error);
    return null;
  }
};

// Widget Data Storage
const WIDGET_DATA_KEY = 'widget_data';

export const updateWidgetData = async (
  widgetType: string, 
  data: PrayerTimesWidgetData | DailyVerseWidgetData
): Promise<void> => {
  try {
    const existingData = await getWidgetData();
    const updatedData = {
      ...existingData,
      [widgetType]: data
    };

    await AsyncStorage.setItem(WIDGET_DATA_KEY, JSON.stringify(updatedData));
    
    // Notify iOS that widget data has been updated
    if (typeof __DEV__ !== 'undefined' && !__DEV__) {
      // This would use native iOS widget update mechanism
      // For now, we log the update
      console.log(`Widget data updated for ${widgetType}`);
    }
  } catch (error) {
    console.error('Error updating widget data:', error);
  }
};

export const getWidgetData = async (): Promise<Record<string, any>> => {
  try {
    const stored = await AsyncStorage.getItem(WIDGET_DATA_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error getting widget data:', error);
    return {};
  }
};

// Widget Management
export const initializeWidgets = async (): Promise<void> => {
  try {
    console.log('Initializing iOS widgets...');

    // Register background tasks
    await BackgroundFetch.registerTaskAsync(PRAYER_TIMES_TASK, {
      minimumInterval: 15 * 60 * 1000, // 15 minutes
      stopOnTerminate: false,
      startOnBoot: true,
    });

    await BackgroundFetch.registerTaskAsync(DAILY_VERSE_TASK, {
      minimumInterval: 24 * 60 * 60 * 1000, // 24 hours
      stopOnTerminate: false,
      startOnBoot: true,
    });

    // Generate initial widget data
    await updateAllWidgets();
    
    console.log('iOS widgets initialized successfully');
  } catch (error) {
    console.error('Error initializing widgets:', error);
  }
};

export const updateAllWidgets = async (): Promise<void> => {
  try {
    console.log('Updating all widgets...');

    // Update prayer times widget
    const prayerData = await generatePrayerTimesWidget();
    if (prayerData) {
      await updateWidgetData('prayer_times', prayerData);
    }

    // Update daily verse widget
    const verseData = await generateDailyVerseWidget();
    if (verseData) {
      await updateWidgetData('daily_verse', verseData);
    }

    console.log('All widgets updated successfully');
  } catch (error) {
    console.error('Error updating all widgets:', error);
  }
};

// Widget Preview Data (for development)
export const getWidgetPreviewData = (widgetId: string): any => {
  switch (widgetId) {
    case 'prayer_times_small':
      return {
        nextPrayer: {
          name: 'Öğle',
          time: '13:15',
          timeUntil: '2s 30d'
        }
      };
    
    case 'prayer_times_medium':
      return {
        todayPrayers: {
          fajr: '05:45',
          dhuhr: '13:15',
          asr: '16:30',
          maghrib: '19:20',
          isha: '21:00'
        },
        location: {
          city: 'İstanbul',
          country: 'Türkiye'
        },
        hijriDate: '15 Recep 1445'
      };
    
    case 'daily_verse_small':
      return {
        translation: 'Allah\'a karşı gelmekten sakının ve Allah\'ın size öğrettiklerini öğrenin.',
        surahName: 'Bakara',
        verseNumber: 282
      };
    
    case 'daily_verse_medium':
      return {
        arabic: 'وَاتَّقُوا اللَّهَ وَيُعَلِّمُكُمُ اللَّهُ',
        translation: 'Allah\'a karşı gelmekten sakının ve Allah\'ın size öğrettiklerini öğrenin.',
        surahName: 'Bakara',
        verseNumber: 282,
        source: 'Bakara Suresi, 282. Ayet'
      };
    
    case 'combined_widget':
      return {
        nextPrayer: {
          name: 'Öğle',
          time: '13:15',
          timeUntil: '2s 30d'
        },
        dailyVerse: {
          translation: 'Allah\'a karşı gelmekten sakının...',
          surahName: 'Bakara'
        }
      };
    
    default:
      return {};
  }
};

// Utility Functions
const formatHijriDate = (date: Date): string => {
  // Simplified Hijri date calculation
  // In production, would use proper Hijri calendar library
  const hijriMonths = [
    'Muharrem', 'Safer', 'Rebiülevvel', 'Rebiülahir', 'Cemaziyelevvel',
    'Cemaziyelahir', 'Recep', 'Şaban', 'Ramazan', 'Şevval', 'Zilkade', 'Zilhicce'
  ];
  
  // Approximate conversion (would be replaced with proper calculation)
  const year = date.getFullYear() - 579;
  const month = hijriMonths[date.getMonth()];
  const day = date.getDate();
  
  return `${day} ${month} ${year}`;
};

// Widget Deep Linking
export const handleWidgetTap = (widgetId: string, action?: string): void => {
  console.log(`Widget tapped: ${widgetId}, action: ${action}`);
  
  // This would handle navigation within the app based on widget tap
  switch (widgetId) {
    case 'prayer_times_small':
    case 'prayer_times_medium':
      // Navigate to prayer times screen
      console.log('Navigate to prayer times');
      break;
    
    case 'daily_verse_small':
    case 'daily_verse_medium':
      // Navigate to Quran screen
      console.log('Navigate to Quran');
      break;
    
    case 'combined_widget':
      if (action === 'prayer') {
        console.log('Navigate to prayer times');
      } else if (action === 'verse') {
        console.log('Navigate to Quran');
      } else {
        console.log('Navigate to home');
      }
      break;
    
    default:
      console.log('Navigate to home');
      break;
  }
};

// Widget Error Handling
export const handleWidgetError = (widgetId: string, error: Error): void => {
  console.error(`Widget error for ${widgetId}:`, error);
  
  // Log error for debugging
  const errorData = {
    widgetId,
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  };
  
  // In production, would send to crash reporting
  console.warn('Widget error data:', errorData);
};

// Cleanup
export const cleanupWidgets = async (): Promise<void> => {
  try {
    await BackgroundFetch.unregisterTaskAsync(PRAYER_TIMES_TASK);
    await BackgroundFetch.unregisterTaskAsync(DAILY_VERSE_TASK);
    console.log('Widgets cleaned up successfully');
  } catch (error) {
    console.error('Error cleaning up widgets:', error);
  }
}; 