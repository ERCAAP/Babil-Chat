import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserLocation } from './qibla';

// Namaz vakitleri interface
export interface PrayerTimes {
  fajr: Date;      // İmsak
  sunrise: Date;   // Güneş doğuşu
  dhuhr: Date;     // Öğle
  asr: Date;       // İkindi
  maghrib: Date;   // Akşam
  isha: Date;      // Yatsı
  date: Date;      // Hangi gün için hesaplandı
  location: UserLocation;
}

// Hesaplama metodu seçenekleri
export interface CalculationMethod {
  name: string;
  fajrAngle: number;
  ishaAngle?: number;
  maghribAngle?: number;
  ishaInterval?: number; // dakika cinsinden
}

// Yaygın hesaplama metodları
export const CALCULATION_METHODS: Record<string, CalculationMethod> = {
  // Türkiye Diyanet İşleri Başkanlığı
  TURKEY: {
    name: 'Türkiye Diyanet İşleri',
    fajrAngle: 18,
    ishaAngle: 17,
  },
  
  // İslami Toplum Kuzey Amerika
  ISNA: {
    name: 'Islamic Society of North America',
    fajrAngle: 15,
    ishaAngle: 15,
  },
  
  // Müslüman Dünya Birliği
  MWL: {
    name: 'Muslim World League',
    fajrAngle: 18,
    ishaAngle: 17,
  },
  
  // Mısır Genel Araştırma Kurumu
  EGYPT: {
    name: 'Egyptian General Authority of Survey',
    fajrAngle: 19.5,
    ishaAngle: 17.5,
  },
  
  // Umm al-Qura Üniversitesi (Mekke)
  MECCA: {
    name: 'Umm al-Qura University',
    fajrAngle: 18.5,
    ishaInterval: 90, // Maghrib'den 90 dakika sonra
  },
  
  // Kararchi Üniversitesi
  KARACHI: {
    name: 'University of Islamic Sciences, Karachi',
    fajrAngle: 18,
    ishaAngle: 18,
  },
};

// Varsayılan hesaplama metodu
export const DEFAULT_METHOD = CALCULATION_METHODS.TURKEY;

// Storage keys
const PRAYER_TIMES_KEY = 'prayer_times';
const CALCULATION_METHOD_KEY = 'calculation_method';
const PRAYER_NOTIFICATIONS_KEY = 'prayer_notifications';

// Matematik yardımcı fonksiyonları
const toRadians = (degrees: number): number => degrees * (Math.PI / 180);
const toDegrees = (radians: number): number => radians * (180 / Math.PI);

// Güneş pozisyonu hesaplama
const getSunPosition = (
  julianDay: number,
  latitude: number,
  longitude: number
): { declination: number; timeEquation: number } => {
  const n = julianDay - 2451545.0;
  const L = (280.460 + 0.9856474 * n) % 360;
  const g = toRadians((357.528 + 0.9856003 * n) % 360);
  const lambda = toRadians(L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g));
  
  const declination = Math.asin(0.39782 * Math.sin(lambda));
  const timeEquation = 4 * (L - toDegrees(Math.atan2(Math.tan(lambda) * Math.cos(toRadians(23.44)), 1)));
  
  return { declination, timeEquation };
};

// Julian day hesaplama
const getJulianDay = (date: Date): number => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  let a = Math.floor((14 - month) / 12);
  let y = year - a;
  let m = month + 12 * a - 3;
  
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) + 1721119;
};

// Namaz vakti hesaplama
const calculatePrayerTime = (
  julianDay: number,
  latitude: number,
  longitude: number,
  angle: number,
  isSunrise: boolean = false
): number => {
  const { declination, timeEquation } = getSunPosition(julianDay, latitude, longitude);
  
  const latRad = toRadians(latitude);
  const angleRad = toRadians(angle);
  
  let time: number;
  
  if (isSunrise) {
    // Güneş doğuşu/batışı için
    const cosHour = -Math.tan(latRad) * Math.tan(declination);
    if (Math.abs(cosHour) > 1) {
      // Kutup bölgesi durumu
      return NaN;
    }
    time = 12 - toDegrees(Math.acos(cosHour)) / 15;
  } else {
    // Diğer namaz vakitleri için
    const cosHour = (Math.sin(angleRad) - Math.sin(latRad) * Math.sin(declination)) / 
                   (Math.cos(latRad) * Math.cos(declination));
    
    if (Math.abs(cosHour) > 1) {
      return NaN;
    }
    
    const hourAngle = toDegrees(Math.acos(cosHour));
    time = 12 + hourAngle / 15;
  }
  
  // Zaman denklemi ve boylam düzeltmesi
  time = time - timeEquation / 60 + longitude / 15;
  
  return time;
};

// İkindi vakti hesaplama (özel)
const calculateAsrTime = (
  julianDay: number,
  latitude: number,
  longitude: number,
  shadowFactor: number = 1
): number => {
  const { declination } = getSunPosition(julianDay, latitude, longitude);
  const latRad = toRadians(latitude);
  
  const tanAltitude = 1 / (shadowFactor + Math.tan(Math.abs(latRad - declination)));
  const altitude = Math.atan(tanAltitude);
  
  return calculatePrayerTime(julianDay, latitude, longitude, 90 - toDegrees(altitude));
};

// Ana namaz vakitleri hesaplama fonksiyonu
export const calculatePrayerTimes = async (
  date: Date,
  location: UserLocation,
  method: CalculationMethod = DEFAULT_METHOD
): Promise<PrayerTimes> => {
  const julianDay = getJulianDay(date);
  const { latitude, longitude } = location;
  
  // Güneş doğuşu ve batışı
  const sunrise = calculatePrayerTime(julianDay, latitude, longitude, -0.833, true);
  const sunset = calculatePrayerTime(julianDay, latitude, longitude, -0.833, true);
  
  // İmsak (Fajr)
  const fajr = calculatePrayerTime(julianDay, latitude, longitude, -method.fajrAngle);
  
  // Öğle (Dhuhr) - güneş tepe noktasında + 5 dakika
  const dhuhr = 12 + (longitude / 15) + 5/60;
  
  // İkindi (Asr)
  const asr = calculateAsrTime(julianDay, latitude, longitude);
  
  // Akşam (Maghrib) - güneş batışı + 5 dakika
  const maghrib = sunset + 5/60;
  
  // Yatsı (Isha)
  let isha: number;
  if (method.ishaInterval) {
    // Sabit dakika aralığı kullan
    isha = maghrib + method.ishaInterval / 60;
  } else if (method.ishaAngle) {
    // Açı kullan
    isha = calculatePrayerTime(julianDay, latitude, longitude, -method.ishaAngle);
  } else {
    // Fallback: fajr açısını kullan
    isha = calculatePrayerTime(julianDay, latitude, longitude, -method.fajrAngle);
  }
  
  // Saatleri Date objesine çevir
  const timeToDate = (timeInHours: number): Date => {
    const hours = Math.floor(timeInHours);
    const minutes = Math.floor((timeInHours - hours) * 60);
    const resultDate = new Date(date);
    resultDate.setHours(hours, minutes, 0, 0);
    return resultDate;
  };
  
  const prayerTimes: PrayerTimes = {
    fajr: timeToDate(fajr),
    sunrise: timeToDate(sunrise),
    dhuhr: timeToDate(dhuhr),
    asr: timeToDate(asr),
    maghrib: timeToDate(maghrib),
    isha: timeToDate(isha),
    date: new Date(date),
    location,
  };
  
  return prayerTimes;
};

// Günlük namaz vakitlerini alma (cache ile)
export const getTodayPrayerTimes = async (
  location: UserLocation,
  method?: CalculationMethod
): Promise<PrayerTimes | null> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Cache'den kontrol et
    const cacheKey = `${PRAYER_TIMES_KEY}_${today.toISOString()}_${location.latitude}_${location.longitude}`;
    const cached = await AsyncStorage.getItem(cacheKey);
    
    if (cached) {
      const parsed = JSON.parse(cached);
      return {
        ...parsed,
        fajr: new Date(parsed.fajr),
        sunrise: new Date(parsed.sunrise),
        dhuhr: new Date(parsed.dhuhr),
        asr: new Date(parsed.asr),
        maghrib: new Date(parsed.maghrib),
        isha: new Date(parsed.isha),
        date: new Date(parsed.date),
      };
    }
    
    // Yeni hesapla
    const usedMethod = method || DEFAULT_METHOD;
    const prayerTimes = await calculatePrayerTimes(today, location, usedMethod);
    
    // Cache'e kaydet
    await AsyncStorage.setItem(cacheKey, JSON.stringify(prayerTimes));
    
    return prayerTimes;
  } catch (error) {
    console.warn('Error getting today prayer times:', error);
    return null;
  }
};

// Gelecek namaz vaktini bulma
export const getNextPrayer = (prayerTimes: PrayerTimes): {
  name: string;
  time: Date;
  arabicName: string;
  timeUntil: number; // dakika cinsinden
} | null => {
  const now = new Date();
  const prayers = [
    { name: 'İmsak', time: prayerTimes.fajr, arabicName: 'الفجر' },
    { name: 'Güneş', time: prayerTimes.sunrise, arabicName: 'الشروق' },
    { name: 'Öğle', time: prayerTimes.dhuhr, arabicName: 'الظهر' },
    { name: 'İkindi', time: prayerTimes.asr, arabicName: 'العصر' },
    { name: 'Akşam', time: prayerTimes.maghrib, arabicName: 'المغرب' },
    { name: 'Yatsı', time: prayerTimes.isha, arabicName: 'العشاء' },
  ];
  
  // Bugün kalan namaz vakitlerini bul
  for (const prayer of prayers) {
    if (prayer.time > now) {
      const timeUntil = Math.floor((prayer.time.getTime() - now.getTime()) / (1000 * 60));
      return { ...prayer, timeUntil };
    }
  }
  
  // Bugün kalan namaz yoksa, yarının ilk namazı
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const timeUntil = Math.floor((tomorrow.getTime() - now.getTime()) / (1000 * 60));
  
  return {
    name: 'İmsak',
    time: tomorrow,
    arabicName: 'الفجر',
    timeUntil,
  };
};

// Mevcut namaz vaktini bulma
export const getCurrentPrayer = (prayerTimes: PrayerTimes): {
  name: string;
  time: Date;
  arabicName: string;
  timeRemaining: number; // dakika cinsinden
} | null => {
  const now = new Date();
  const prayers = [
    { name: 'İmsak', time: prayerTimes.fajr, arabicName: 'الفجر', endTime: prayerTimes.sunrise },
    { name: 'Güneş', time: prayerTimes.sunrise, arabicName: 'الشروق', endTime: prayerTimes.dhuhr },
    { name: 'Öğle', time: prayerTimes.dhuhr, arabicName: 'الظهر', endTime: prayerTimes.asr },
    { name: 'İkindi', time: prayerTimes.asr, arabicName: 'العصر', endTime: prayerTimes.maghrib },
    { name: 'Akşam', time: prayerTimes.maghrib, arabicName: 'المغرب', endTime: prayerTimes.isha },
    { name: 'Yatsı', time: prayerTimes.isha, arabicName: 'العشاء', endTime: null },
  ];
  
  for (const prayer of prayers) {
    if (now >= prayer.time && (prayer.endTime === null || now < prayer.endTime)) {
      const endTime = prayer.endTime || new Date(prayer.time.getTime() + 2 * 60 * 60 * 1000); // Yatsı için 2 saat
      const timeRemaining = Math.floor((endTime.getTime() - now.getTime()) / (1000 * 60));
      
      return {
        name: prayer.name,
        time: prayer.time,
        arabicName: prayer.arabicName,
        timeRemaining: Math.max(0, timeRemaining),
      };
    }
  }
  
  return null;
};

// Namaz vakti formatı
export const formatPrayerTime = (time: Date): string => {
  return time.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Hesaplama metodunu kaydetme
export const saveCalculationMethod = async (method: CalculationMethod): Promise<void> => {
  try {
    await AsyncStorage.setItem(CALCULATION_METHOD_KEY, JSON.stringify(method));
  } catch (error) {
    console.warn('Error saving calculation method:', error);
  }
};

// Hesaplama metodunu alma
export const getCalculationMethod = async (): Promise<CalculationMethod> => {
  try {
    const stored = await AsyncStorage.getItem(CALCULATION_METHOD_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return DEFAULT_METHOD;
  } catch (error) {
    console.warn('Error getting calculation method:', error);
    return DEFAULT_METHOD;
  }
};

// Namaz vakitleri cache'ini temizleme
export const clearPrayerTimesCache = async (): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const prayerKeys = keys.filter(key => key.startsWith(PRAYER_TIMES_KEY));
    await AsyncStorage.multiRemove(prayerKeys);
  } catch (error) {
    console.warn('Error clearing prayer times cache:', error);
  }
};

export default {
  CALCULATION_METHODS,
  DEFAULT_METHOD,
  calculatePrayerTimes,
  getTodayPrayerTimes,
  getNextPrayer,
  getCurrentPrayer,
  formatPrayerTime,
  saveCalculationMethod,
  getCalculationMethod,
  clearPrayerTimesCache,
}; 