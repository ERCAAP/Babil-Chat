import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

// Kabe'nin koordinatları (Mekke, Suudi Arabistan)
export const KAABA_COORDINATES = {
  latitude: 21.422487,
  longitude: 39.826206,
};

// Kullanıcı konumu interface
export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

// Kıble bilgisi interface
export interface QiblaInfo {
  direction: number; // derece cinsinden kıble yönü
  distance: number; // km cinsinden mesafe
  userLocation: UserLocation;
  calculatedAt: Date;
}

// Storage key
const LAST_QIBLA_CALCULATION_KEY = 'last_qibla_calculation';
const USER_LOCATION_KEY = 'user_location';

// Konum izni isteme
export const requestLocationPermission = async (): Promise<boolean> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      console.warn('Location permission denied');
      return false;
    }
    
    return true;
  } catch (error) {
    console.warn('Error requesting location permission:', error);
    return false;
  }
};

// Mevcut konumu alma
export const getCurrentLocation = async (): Promise<UserLocation | null> => {
  try {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return null;
    
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    
    const userLocation: UserLocation = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy || undefined,
      timestamp: Date.now(),
    };
    
    // Konumu kaydet
    await AsyncStorage.setItem(USER_LOCATION_KEY, JSON.stringify(userLocation));
    
    return userLocation;
  } catch (error) {
    console.warn('Error getting current location:', error);
    
    // Önceki konumu al
    try {
      const stored = await AsyncStorage.getItem(USER_LOCATION_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Error getting stored location:', e);
    }
    
    return null;
  }
};

// İki nokta arasındaki mesafeyi hesaplama (Haversine formula)
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Dünya'nın yarıçapı (km)
  
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // 2 ondalık basamak
};

// Kıble yönünü hesaplama
export const calculateQiblaDirection = (
  userLat: number,
  userLon: number
): number => {
  const userLatRad = toRadians(userLat);
  const userLonRad = toRadians(userLon);
  const kaabaLatRad = toRadians(KAABA_COORDINATES.latitude);
  const kaabaLonRad = toRadians(KAABA_COORDINATES.longitude);
  
  const dLon = kaabaLonRad - userLonRad;
  
  const y = Math.sin(dLon) * Math.cos(kaabaLatRad);
  const x = Math.cos(userLatRad) * Math.sin(kaabaLatRad) -
           Math.sin(userLatRad) * Math.cos(kaabaLatRad) * Math.cos(dLon);
  
  let bearing = Math.atan2(y, x);
  bearing = toDegrees(bearing);
  bearing = (bearing + 360) % 360; // 0-360 arası normalize et
  
  return Math.round(bearing * 100) / 100; // 2 ondalık basamak
};

// Radyan çevirme yardımcı fonksiyonları
const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

const toDegrees = (radians: number): number => {
  return radians * (180 / Math.PI);
};

// Kıble bilgisini hesaplama (ana fonksiyon)
export const calculateQibla = async (): Promise<QiblaInfo | null> => {
  try {
    const userLocation = await getCurrentLocation();
    if (!userLocation) {
      throw new Error('Konum bilgisi alınamadı');
    }
    
    const direction = calculateQiblaDirection(
      userLocation.latitude,
      userLocation.longitude
    );
    
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      KAABA_COORDINATES.latitude,
      KAABA_COORDINATES.longitude
    );
    
    const qiblaInfo: QiblaInfo = {
      direction,
      distance,
      userLocation,
      calculatedAt: new Date(),
    };
    
    // Sonucu kaydet
    await AsyncStorage.setItem(
      LAST_QIBLA_CALCULATION_KEY,
      JSON.stringify(qiblaInfo)
    );
    
    return qiblaInfo;
  } catch (error) {
    console.warn('Error calculating qibla:', error);
    
    // Önceki hesaplama varsa onu döndür
    try {
      const stored = await AsyncStorage.getItem(LAST_QIBLA_CALCULATION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...parsed,
          calculatedAt: new Date(parsed.calculatedAt),
        };
      }
    } catch (e) {
      console.warn('Error getting stored qibla calculation:', e);
    }
    
    return null;
  }
};

// Son kıble hesaplamasını alma
export const getLastQiblaCalculation = async (): Promise<QiblaInfo | null> => {
  try {
    const stored = await AsyncStorage.getItem(LAST_QIBLA_CALCULATION_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...parsed,
        calculatedAt: new Date(parsed.calculatedAt),
      };
    }
    return null;
  } catch (error) {
    console.warn('Error getting last qibla calculation:', error);
    return null;
  }
};

// Kıble hesaplamasının güncel olup olmadığını kontrol etme
export const isQiblaCalculationFresh = (qiblaInfo: QiblaInfo): boolean => {
  const now = new Date();
  const calculatedAt = new Date(qiblaInfo.calculatedAt);
  const diffInMinutes = (now.getTime() - calculatedAt.getTime()) / (1000 * 60);
  
  // 30 dakikadan eski hesaplamalar güncel değil
  return diffInMinutes < 30;
};

// Konum değişikliğini kontrol etme
export const hasLocationChangedSignificantly = (
  oldLocation: UserLocation,
  newLocation: UserLocation
): boolean => {
  const distance = calculateDistance(
    oldLocation.latitude,
    oldLocation.longitude,
    newLocation.latitude,
    newLocation.longitude
  );
  
  // 1 km'den fazla değişiklik varsa yeniden hesapla
  return distance > 1;
};

// Pusula yönünü normalize etme
export const normalizeCompassDirection = (degrees: number): number => {
  return ((degrees % 360) + 360) % 360;
};

// Kıble yönünü pusula yönüyle karşılaştırma
export const getQiblaAccuracy = (
  qiblaDirection: number,
  compassDirection: number
): {
  difference: number;
  accuracy: 'perfect' | 'good' | 'fair' | 'poor';
  isOnTarget: boolean;
} => {
  const diff = Math.abs(normalizeCompassDirection(qiblaDirection - compassDirection));
  const difference = Math.min(diff, 360 - diff); // En kısa açı farkı
  
  let accuracy: 'perfect' | 'good' | 'fair' | 'poor';
  let isOnTarget = false;
  
  if (difference <= 2) {
    accuracy = 'perfect';
    isOnTarget = true;
  } else if (difference <= 5) {
    accuracy = 'good';
    isOnTarget = true;
  } else if (difference <= 15) {
    accuracy = 'fair';
  } else {
    accuracy = 'poor';
  }
  
  return { difference, accuracy, isOnTarget };
};

// Şehir bazlı sabit kıble yönleri (yedek)
export const getCityQiblaDirection = (cityName: string): number | null => {
  const cityDirections: Record<string, number> = {
    'istanbul': 147,
    'ankara': 149,
    'izmir': 164,
    'bursa': 151,
    'antalya': 174,
    'adana': 187,
    'gaziantep': 194,
    'konya': 169,
    'kayseri': 174,
    'trabzon': 168,
    'erzurum': 181,
    'diyarbakır': 200,
    'van': 209,
    'batman': 203,
    'şanlıurfa': 198,
    'hatay': 191,
    'mersin': 182,
    'çorum': 163,
    'samsun': 161,
    'ordu': 163,
  };
  
  return cityDirections[cityName.toLowerCase()] || null;
};

// Konumu sıfırlama (test için)
export const clearLocationData = async (): Promise<void> => {
  try {
    await Promise.all([
      AsyncStorage.removeItem(USER_LOCATION_KEY),
      AsyncStorage.removeItem(LAST_QIBLA_CALCULATION_KEY),
    ]);
  } catch (error) {
    console.warn('Error clearing location data:', error);
  }
};

export default {
  KAABA_COORDINATES,
  requestLocationPermission,
  getCurrentLocation,
  calculateDistance,
  calculateQiblaDirection,
  calculateQibla,
  getLastQiblaCalculation,
  isQiblaCalculationFresh,
  hasLocationChangedSignificantly,
  normalizeCompassDirection,
  getQiblaAccuracy,
  getCityQiblaDirection,
  clearLocationData,
}; 