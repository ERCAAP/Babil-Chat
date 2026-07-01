import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

// Import translation files
import ar from '../locales/ar.json';
import en from '../locales/en.json';
import tr from '../locales/tr.json';

// Translation interface
interface Translations {
  [key: string]: any;
}

// Available locales with their translations
const AVAILABLE_LOCALES = {
  tr: { name: 'Türkçe', flag: '🇹🇷', translations: tr },
  en: { name: 'English', flag: '🇺🇸', translations: en },
  ar: { name: 'العربية', flag: '🇸🇦', translations: ar }
};

// Storage key
const LOCALE_STORAGE_KEY = 'app_locale';

// Current locale state
let currentLocale = 'tr';
let currentTranslations: Translations = tr;

// Initialize locale from device or storage
export const initializeLocale = async (): Promise<void> => {
  try {
    // Try to get saved locale first
    const savedLocale = await AsyncStorage.getItem(LOCALE_STORAGE_KEY);
    
    if (savedLocale && AVAILABLE_LOCALES[savedLocale as keyof typeof AVAILABLE_LOCALES]) {
      currentLocale = savedLocale;
      currentTranslations = AVAILABLE_LOCALES[savedLocale as keyof typeof AVAILABLE_LOCALES].translations;
      return;
    }

    // Get device locale
    const locales = Localization.getLocales();
    const deviceLocale = locales[0]?.languageCode || 'tr';
    
    // Check if device locale is supported
    if (AVAILABLE_LOCALES[deviceLocale as keyof typeof AVAILABLE_LOCALES]) {
      currentLocale = deviceLocale;
      currentTranslations = AVAILABLE_LOCALES[deviceLocale as keyof typeof AVAILABLE_LOCALES].translations;
      await AsyncStorage.setItem(LOCALE_STORAGE_KEY, deviceLocale);
    } else {
      // Fallback to Turkish
      currentLocale = 'tr';
      currentTranslations = tr;
      await AsyncStorage.setItem(LOCALE_STORAGE_KEY, 'tr');
    }
  } catch (error) {
    console.warn('Error initializing locale:', error);
    // Fallback to Turkish
    currentLocale = 'tr';
    currentTranslations = tr;
  }
};

// Get current locale
export const getCurrentLocale = (): string => {
  return currentLocale;
};

// Change locale
export const changeLocale = async (locale: string): Promise<void> => {
  try {
    if (!AVAILABLE_LOCALES[locale as keyof typeof AVAILABLE_LOCALES]) {
      console.warn(`Locale ${locale} not supported`);
      return;
    }

    currentLocale = locale;
    currentTranslations = AVAILABLE_LOCALES[locale as keyof typeof AVAILABLE_LOCALES].translations;
    
    await AsyncStorage.setItem(LOCALE_STORAGE_KEY, locale);
    console.log(`Locale changed to ${locale}`);
  } catch (error) {
    console.error('Error changing locale:', error);
  }
};

// Get available locales
export const getAvailableLocales = () => {
  return Object.keys(AVAILABLE_LOCALES).map(key => ({
    code: key,
    name: AVAILABLE_LOCALES[key as keyof typeof AVAILABLE_LOCALES].name,
    flag: AVAILABLE_LOCALES[key as keyof typeof AVAILABLE_LOCALES].flag,
    isRTL: key === 'ar'
  }));
};

// Translation function
export const t = (key: string, params?: Record<string, string | number>): string => {
  try {
    const keys = key.split('.');
    let value = currentTranslations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key "${key}" not found for locale "${currentLocale}"`);
        return key; // Return key as fallback
      }
    }
    
    if (typeof value !== 'string') {
      console.warn(`Translation value for "${key}" is not a string`);
      return key;
    }
    
    // Replace parameters if provided
    if (params && typeof value === 'string') {
      return value.replace(/\{\{(\w+)\}\}/g, (match: string, paramKey: string) => {
        return params[paramKey]?.toString() || match;
      });
    }
    
    return value;
  } catch (error) {
    console.error(`Error getting translation for key "${key}":`, error);
    return key;
  }
};

// Check if current locale is RTL
export const isRTL = (): boolean => {
  return currentLocale === 'ar';
};

// Get locale info
export const getLocaleInfo = (locale?: string) => {
  const loc = locale || currentLocale;
  return AVAILABLE_LOCALES[loc as keyof typeof AVAILABLE_LOCALES] || AVAILABLE_LOCALES.tr;
};

// Format number according to locale
export const formatNumber = (number: number): string => {
  try {
    return new Intl.NumberFormat(currentLocale === 'tr' ? 'tr-TR' : currentLocale === 'ar' ? 'ar-SA' : 'en-US').format(number);
  } catch (error) {
    return number.toString();
  }
};

// Format date according to locale
export const formatDate = (date: Date): string => {
  try {
    return new Intl.DateTimeFormat(currentLocale === 'tr' ? 'tr-TR' : currentLocale === 'ar' ? 'ar-SA' : 'en-US').format(date);
  } catch (error) {
    return date.toLocaleDateString();
  }
};

// Default export for easier usage
export default {
  t,
  getCurrentLocale,
  changeLocale,
  getAvailableLocales,
  isRTL,
  getLocaleInfo,
  formatNumber,
  formatDate,
  initializeLocale
}; 