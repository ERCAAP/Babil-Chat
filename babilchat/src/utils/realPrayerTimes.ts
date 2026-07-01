import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

// Prayer Times Interface
export interface PrayerTimesResult {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  date: string;
  location: {
    latitude: number;
    longitude: number;
    city?: string;
    country?: string;
  };
  method: CalculationMethod;
}

// Islamic Calculation Methods
export enum CalculationMethod {
  MUSLIM_WORLD_LEAGUE = 'MWL',
  ISLAMIC_SOCIETY_OF_NORTH_AMERICA = 'ISNA',
  EGYPTIAN_GENERAL_AUTHORITY = 'Egypt',
  UMM_AL_QURA_UNIVERSITY = 'Makkah',
  UNIVERSITY_OF_KARACHI = 'Karachi',
  INSTITUTE_OF_GEOPHYSICS_UNIVERSITY_OF_TEHRAN = 'Tehran',
  SHIA_ITHNA_ASHARI = 'Jafari',
  GULF_REGION = 'Gulf',
  KUWAIT = 'Kuwait',
  QATAR = 'Qatar',
  SINGAPORE = 'Singapore',
  FRANCE = 'France',
  TURKEY = 'Turkey',
  RUSSIA = 'Russia'
}

// Calculation Parameters for different methods
interface CalculationParameters {
  fajrAngle: number;
  ishaAngle: number;
  ishaInterval?: number; // minutes after Maghrib
  maghribAngle?: number;
  name: string;
  description: string;
}

const CALCULATION_METHODS: Record<CalculationMethod, CalculationParameters> = {
  [CalculationMethod.MUSLIM_WORLD_LEAGUE]: {
    fajrAngle: 18,
    ishaAngle: 17,
    name: 'Müslüman Dünya Birliği',
    description: 'Dünya genelinde yaygın kullanılan standart method'
  },
  [CalculationMethod.ISLAMIC_SOCIETY_OF_NORTH_AMERICA]: {
    fajrAngle: 15,
    ishaAngle: 15,
    name: 'Kuzey Amerika İslam Cemiyeti',
    description: 'Kuzey Amerika için optimize edilmiş'
  },
  [CalculationMethod.EGYPTIAN_GENERAL_AUTHORITY]: {
    fajrAngle: 19.5,
    ishaAngle: 17.5,
    name: 'Mısır Genel Otoritesi',
    description: 'Mısır ve yakın bölgeler için'
  },
  [CalculationMethod.UMM_AL_QURA_UNIVERSITY]: {
    fajrAngle: 18.5,
    ishaAngle: 0,
    ishaInterval: 90, // 90 minutes after Maghrib
    name: 'Ümmü\'l-Kura Üniversitesi',
    description: 'Suudi Arabistan resmi methodu'
  },
  [CalculationMethod.UNIVERSITY_OF_KARACHI]: {
    fajrAngle: 18,
    ishaAngle: 18,
    name: 'Karaçi Üniversitesi',
    description: 'Pakistan ve Hindistan için'
  },
  [CalculationMethod.INSTITUTE_OF_GEOPHYSICS_UNIVERSITY_OF_TEHRAN]: {
    fajrAngle: 17.7,
    ishaAngle: 14,
    name: 'Tahran Üniversitesi',
    description: 'İran resmi methodu'
  },
  [CalculationMethod.SHIA_ITHNA_ASHARI]: {
    fajrAngle: 16,
    ishaAngle: 14,
    name: 'Şii İsna Aşeri',
    description: 'Şii mezhebinin hesaplama methodu'
  },
  [CalculationMethod.GULF_REGION]: {
    fajrAngle: 19.5,
    ishaAngle: 0,
    ishaInterval: 90,
    name: 'Körfez Bölgesi',
    description: 'BAE, Katar, Kuveyt için'
  },
  [CalculationMethod.KUWAIT]: {
    fajrAngle: 18,
    ishaAngle: 17.5,
    name: 'Kuveyt',
    description: 'Kuveyt resmi methodu'
  },
  [CalculationMethod.QATAR]: {
    fajrAngle: 18,
    ishaAngle: 0,
    ishaInterval: 90,
    name: 'Katar',
    description: 'Katar resmi methodu'
  },
  [CalculationMethod.SINGAPORE]: {
    fajrAngle: 20,
    ishaAngle: 18,
    name: 'Singapur',
    description: 'Singapur ve Malezya için'
  },
  [CalculationMethod.FRANCE]: {
    fajrAngle: 12,
    ishaAngle: 12,
    name: 'Fransa',
    description: 'Fransa İslam Organizasyonu methodu'
  },
  [CalculationMethod.TURKEY]: {
    fajrAngle: 18,
    ishaAngle: 17,
    name: 'Türkiye',
    description: 'Diyanet İşleri Başkanlığı methodu'
  },
  [CalculationMethod.RUSSIA]: {
    fajrAngle: 16,
    ishaAngle: 15,
    name: 'Rusya',
    description: 'Rusya Müslümanları için'
  }
};

// Storage keys
const PRAYER_TIMES_CACHE_KEY = 'prayer_times_cache';
const CALCULATION_METHOD_KEY = 'selected_calculation_method';
const LOCATION_CACHE_KEY = 'location_cache';

// Mathematical utilities
class PrayerTimesCalculator {
  private static readonly EARTH_RADIUS = 6371000; // meters
  private static readonly JULIAN_EPOCH = 1721425.5;

  // Convert degrees to radians
  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Convert radians to degrees
  private static toDegrees(radians: number): number {
    return radians * (180 / Math.PI);
  }

  // Calculate Julian Day Number
  private static getJulianDay(date: Date): number {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    let a = Math.floor((14 - month) / 12);
    let y = year - a;
    let m = month + 12 * a - 3;

    return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  }

  // Calculate equation of time
  private static getEquationOfTime(julianDay: number): number {
    const n = julianDay - 2451545.0;
    const L = (280.460 + 0.9856474 * n) % 360;
    const g = this.toRadians((357.528 + 0.9856003 * n) % 360);
    const lambda = this.toRadians(L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g));

    const alpha = this.toDegrees(Math.atan2(Math.cos(this.toRadians(23.439)) * Math.sin(lambda), Math.cos(lambda)));
    const E = L - alpha;

    return 4 * E; // minutes
  }

  // Calculate sun declination
  private static getSunDeclination(julianDay: number): number {
    const n = julianDay - 2451545.0;
    const L = (280.460 + 0.9856474 * n) % 360;
    const g = this.toRadians((357.528 + 0.9856003 * n) % 360);
    const lambda = this.toRadians(L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g));

    return this.toDegrees(Math.asin(Math.sin(this.toRadians(23.439)) * Math.sin(lambda)));
  }

  // Calculate prayer time for a given angle
  private static calculateTime(
    latitude: number,
    declination: number,
    angle: number,
    isAfterNoon: boolean = false
  ): number {
    const latRad = this.toRadians(latitude);
    const decRad = this.toRadians(declination);
    const angleRad = this.toRadians(angle);

    const numerator = Math.sin(angleRad) - Math.sin(latRad) * Math.sin(decRad);
    const denominator = Math.cos(latRad) * Math.cos(decRad);

    if (Math.abs(numerator / denominator) > 1) {
      return NaN; // No prayer time (polar regions)
    }

    const hourAngle = this.toDegrees(Math.acos(numerator / denominator));
    return isAfterNoon ? 12 + hourAngle / 15 : 12 - hourAngle / 15;
  }

  // Calculate all prayer times
  public static calculatePrayerTimes(
    latitude: number,
    longitude: number,
    date: Date,
    method: CalculationMethod = CalculationMethod.TURKEY
  ): PrayerTimesResult {
    const params = CALCULATION_METHODS[method];
    const julianDay = this.getJulianDay(date);
    const eqTime = this.getEquationOfTime(julianDay);
    const declination = this.getSunDeclination(julianDay);

    // Time zone offset
    const timeZone = -longitude / 15;

    // Calculate basic times
    const fajrTime = this.calculateTime(latitude, declination, -params.fajrAngle);
    const sunriseTime = this.calculateTime(latitude, declination, -0.833);
    const dhuhrTime = 12; // Solar noon
    const asrTime = this.calculateTime(latitude, declination, -Math.atan(1 + Math.tan(this.toRadians(Math.abs(latitude - declination)))), true);
    const maghribTime = this.calculateTime(latitude, declination, -0.833, true);
    
    let ishaTime: number;
    if (params.ishaInterval) {
      // Calculate based on interval after Maghrib
      ishaTime = maghribTime + params.ishaInterval / 60;
    } else {
      ishaTime = this.calculateTime(latitude, declination, -params.ishaAngle, true);
    }

    // Adjust for equation of time and longitude
    const times = [fajrTime, sunriseTime, dhuhrTime, asrTime, maghribTime, ishaTime].map(time => {
      if (isNaN(time)) return '00:00';
      
      const adjustedTime = time - eqTime / 60 + timeZone;
      const hours = Math.floor(adjustedTime);
      const minutes = Math.round((adjustedTime - hours) * 60);
      
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    });

    return {
      fajr: times[0],
      sunrise: times[1],
      dhuhr: times[2],
      asr: times[3],
      maghrib: times[4],
      isha: times[5],
      date: date.toISOString().split('T')[0],
      location: { latitude, longitude },
      method
    };
  }
}

// Main API functions
export const getRealPrayerTimes = async (
  latitude?: number,
  longitude?: number,
  date: Date = new Date(),
  method?: CalculationMethod
): Promise<PrayerTimesResult | null> => {
  try {
    // Get location if not provided
    let coords = { latitude, longitude };
    
    if (!latitude || !longitude) {
      const location = await getCurrentLocation();
      if (!location) {
        throw new Error('Location not available');
      }
      coords = location;
    }

    // Get calculation method
    const calcMethod = method || await getSelectedCalculationMethod();
    
    // Check cache first
    const cacheKey = `${coords.latitude}_${coords.longitude}_${date.toISOString().split('T')[0]}_${calcMethod}`;
    const cached = await getCachedPrayerTimes(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    // Calculate prayer times
    const prayerTimes = PrayerTimesCalculator.calculatePrayerTimes(
      coords.latitude,
      coords.longitude,
      date,
      calcMethod
    );
    
    // Cache result
    await cachePrayerTimes(cacheKey, prayerTimes);
    
    return prayerTimes;
  } catch (error) {
    console.error('Error calculating real prayer times:', error);
    return null;
  }
};

// Get current location
const getCurrentLocation = async (): Promise<{ latitude: number; longitude: number } | null> => {
  try {
    // Check cached location first
    const cached = await AsyncStorage.getItem(LOCATION_CACHE_KEY);
    if (cached) {
      const { location, timestamp } = JSON.parse(cached);
      const hourAgo = Date.now() - 60 * 60 * 1000;
      
      if (timestamp > hourAgo) {
        return location;
      }
    }
    
    // Request location permission
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Location permission denied');
    }
    
    // Get current position
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 10000
    });
    
    const location = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    };
    
    // Cache location
    await AsyncStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify({
      location,
      timestamp: Date.now()
    }));
    
    return location;
  } catch (error) {
    console.error('Error getting current location:', error);
    return null;
  }
};

// Calculation method management
export const getSelectedCalculationMethod = async (): Promise<CalculationMethod> => {
  try {
    const stored = await AsyncStorage.getItem(CALCULATION_METHOD_KEY);
    return stored ? (stored as CalculationMethod) : CalculationMethod.TURKEY;
  } catch (error) {
    console.error('Error getting calculation method:', error);
    return CalculationMethod.TURKEY;
  }
};

export const setCalculationMethod = async (method: CalculationMethod): Promise<void> => {
  try {
    await AsyncStorage.setItem(CALCULATION_METHOD_KEY, method);
    // Clear cache when method changes
    await clearPrayerTimesCache();
  } catch (error) {
    console.error('Error setting calculation method:', error);
  }
};

export const getAvailableCalculationMethods = (): Array<{
  value: CalculationMethod;
  name: string;
  description: string;
}> => {
  return Object.entries(CALCULATION_METHODS).map(([key, params]) => ({
    value: key as CalculationMethod,
    name: params.name,
    description: params.description
  }));
};

// Cache management
const getCachedPrayerTimes = async (cacheKey: string): Promise<PrayerTimesResult | null> => {
  try {
    const cached = await AsyncStorage.getItem(`${PRAYER_TIMES_CACHE_KEY}_${cacheKey}`);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('Error getting cached prayer times:', error);
    return null;
  }
};

const cachePrayerTimes = async (cacheKey: string, prayerTimes: PrayerTimesResult): Promise<void> => {
  try {
    await AsyncStorage.setItem(`${PRAYER_TIMES_CACHE_KEY}_${cacheKey}`, JSON.stringify(prayerTimes));
  } catch (error) {
    console.error('Error caching prayer times:', error);
  }
};

const clearPrayerTimesCache = async (): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith(PRAYER_TIMES_CACHE_KEY));
    await AsyncStorage.multiRemove(cacheKeys);
  } catch (error) {
    console.error('Error clearing prayer times cache:', error);
  }
};

// External API fallback (optional)
export const getPrayerTimesFromAPI = async (
  latitude: number,
  longitude: number,
  date: Date = new Date(),
  method: CalculationMethod = CalculationMethod.TURKEY
): Promise<PrayerTimesResult | null> => {
  try {
    // Example API call to AlAdhan or similar service
    const methodNumber = getAPIMethodNumber(method);
    const dateString = date.toISOString().split('T')[0];
    
    const response = await fetch(
      `https://api.aladhan.com/v1/timings/${dateString}?latitude=${latitude}&longitude=${longitude}&method=${methodNumber}`,
      {
        headers: {
          'Accept': 'application/json',
        },
        timeout: 10000
      }
    );
    
    if (!response.ok) {
      throw new Error(`API response not ok: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.code === 200 && data.data) {
      const timings = data.data.timings;
      
      return {
        fajr: timings.Fajr,
        sunrise: timings.Sunrise,
        dhuhr: timings.Dhuhr,
        asr: timings.Asr,
        maghrib: timings.Maghrib,
        isha: timings.Isha,
        date: dateString,
        location: { latitude, longitude },
        method
      };
    }
    
    throw new Error('Invalid API response format');
  } catch (error) {
    console.error('Error fetching prayer times from API:', error);
    return null;
  }
};

// Map internal methods to API method numbers
const getAPIMethodNumber = (method: CalculationMethod): number => {
  const methodMap: Record<CalculationMethod, number> = {
    [CalculationMethod.MUSLIM_WORLD_LEAGUE]: 3,
    [CalculationMethod.ISLAMIC_SOCIETY_OF_NORTH_AMERICA]: 2,
    [CalculationMethod.EGYPTIAN_GENERAL_AUTHORITY]: 5,
    [CalculationMethod.UMM_AL_QURA_UNIVERSITY]: 4,
    [CalculationMethod.UNIVERSITY_OF_KARACHI]: 1,
    [CalculationMethod.INSTITUTE_OF_GEOPHYSICS_UNIVERSITY_OF_TEHRAN]: 7,
    [CalculationMethod.SHIA_ITHNA_ASHARI]: 0,
    [CalculationMethod.GULF_REGION]: 8,
    [CalculationMethod.KUWAIT]: 9,
    [CalculationMethod.QATAR]: 10,
    [CalculationMethod.SINGAPORE]: 11,
    [CalculationMethod.FRANCE]: 12,
    [CalculationMethod.TURKEY]: 13,
    [CalculationMethod.RUSSIA]: 14
  };
  
  return methodMap[method] || 13; // Default to Turkey
};

// Utility functions
export const formatPrayerTime = (time: string): string => {
  try {
    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    
    return date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } catch (error) {
    return time;
  }
};

export const getNextPrayerTime = (prayerTimes: PrayerTimesResult): {
  name: string;
  time: string;
  timeUntil: number; // minutes
} | null => {
  try {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const prayers = [
      { name: 'İmsak', time: prayerTimes.fajr },
      { name: 'Güneş', time: prayerTimes.sunrise },
      { name: 'Öğle', time: prayerTimes.dhuhr },
      { name: 'İkindi', time: prayerTimes.asr },
      { name: 'Akşam', time: prayerTimes.maghrib },
      { name: 'Yatsı', time: prayerTimes.isha }
    ];
    
    for (const prayer of prayers) {
      const [hours, minutes] = prayer.time.split(':').map(Number);
      const prayerMinutes = hours * 60 + minutes;
      
      if (prayerMinutes > currentTime) {
        return {
          name: prayer.name,
          time: prayer.time,
          timeUntil: prayerMinutes - currentTime
        };
      }
    }
    
    // Next day's first prayer
    const [hours, minutes] = prayers[0].time.split(':').map(Number);
    const fajrMinutes = hours * 60 + minutes;
    
    return {
      name: prayers[0].name,
      time: prayers[0].time,
      timeUntil: (24 * 60) - currentTime + fajrMinutes
    };
  } catch (error) {
    console.error('Error getting next prayer time:', error);
    return null;
  }
}; 