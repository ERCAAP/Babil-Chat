// Common types for Hidayet App

// Dua kategorileri
export type DuaCategory = 
  | 'health'         // Sağlık
  | 'work'           // İş/Kariyer
  | 'family'         // Aile
  | 'education'      // Eğitim
  | 'financial'      // Mali durum
  | 'general'        // Genel
  | 'spiritual'      // Manevi
  | 'marriage'       // Evlilik
  | 'health_mental'  // Ruh Sağlığı
  | 'travel'         // Seyahat
  | 'community'      // Toplum
  | 'guidance';      // Hidayet

// Kategori bilgileri mapping
export const DUA_CATEGORIES: Record<DuaCategory, {
  name: string;
  arabicName: string;
  emoji: string;
  color: string;
  description: string;
}> = {
  health: {
    name: 'Sağlık',
    arabicName: 'الصحة',
    emoji: '🏥',
    color: '#ef4444',
    description: 'Sağlık ile ilgili dua talepleri',
  },
  work: {
    name: 'İş/Kariyer',
    arabicName: 'العمل',
    emoji: '💼',
    color: '#3b82f6',
    description: 'İş ve kariyer ile ilgili dua talepleri',
  },
  family: {
    name: 'Aile',
    arabicName: 'الأسرة',
    emoji: '👨‍👩‍👧‍👦',
    color: '#8b5cf6',
    description: 'Aile ile ilgili dua talepleri',
  },
  education: {
    name: 'Eğitim',
    arabicName: 'التعليم',
    emoji: '📚',
    color: '#f59e0b',
    description: 'Eğitim ile ilgili dua talepleri',
  },
  financial: {
    name: 'Mali Durum',
    arabicName: 'المال',
    emoji: '💰',
    color: '#22c55e',
    description: 'Mali durum ile ilgili dua talepleri',
  },
  general: {
    name: 'Genel',
    arabicName: 'عام',
    emoji: '🤲',
    color: '#ec4899',
    description: 'Genel dua talepleri',
  },
  spiritual: {
    name: 'Manevi',
    arabicName: 'الروحانية',
    emoji: '🕌',
    color: '#6366f1',
    description: 'Manevi gelişim ile ilgili dua talepleri',
  },
  marriage: {
    name: 'Evlilik',
    arabicName: 'الزواج',
    emoji: '💒',
    color: '#f97316',
    description: 'Evlilik ile ilgili dua talepleri',
  },
  health_mental: {
    name: 'Ruh Sağlığı',
    arabicName: 'الصحة النفسية',
    emoji: '🧠',
    color: '#84cc16',
    description: 'Ruh sağlığı ile ilgili dua talepleri',
  },
  travel: {
    name: 'Seyahat',
    arabicName: 'السفر',
    emoji: '✈️',
    color: '#06b6d4',
    description: 'Seyahat ile ilgili dua talepleri',
  },
  community: {
    name: 'Toplum',
    arabicName: 'المجتمع',
    emoji: '🏘️',
    color: '#a855f7',
    description: 'Toplum ile ilgili dua talepleri',
  },
  guidance: {
    name: 'Hidayet',
    arabicName: 'الهداية',
    emoji: '🌟',
    color: '#eab308',
    description: 'Hidayet ile ilgili dua talepleri',
  },
};

// API Response türleri
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
  totalPages: number;
}

// Location türleri
export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
}

export interface LocationInfo {
  coordinates: Location;
  city?: string;
  country?: string;
  address?: string;
  timestamp: Date;
}

// User interaction türleri
export interface UserInteraction {
  userId: string;
  userDisplayName: string;
  userProfilePhoto?: string;
  isAnonymous: boolean;
  createdAt: Date;
}

// Notification türleri
export interface NotificationData {
  id: string;
  type: 'prayer_time' | 'dua_request' | 'comment' | 'reminder' | 'general';
  title: string;
  body: string;
  data?: Record<string, any>;
  scheduledFor?: Date;
  isRead: boolean;
  createdAt: Date;
}

// Analytics türleri
export interface AnalyticsEvent {
  event: string;
  userId?: string;
  properties?: Record<string, any>;
  timestamp: Date;
}

// Error türleri
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
  userId?: string;
  context?: string;
}

// Feed filtering types
export interface FeedSortOption {
  key: 'recent' | 'popular' | 'trending' | 'nearby';
  label: string;
  icon: string;
}

export interface FeedTimeRange {
  key: 'today' | 'week' | 'month' | 'all';
  label: string;
  value: number; // milliseconds
}

export const FEED_SORT_OPTIONS: FeedSortOption[] = [
  { key: 'recent', label: 'En Yeni', icon: 'time' },
  { key: 'popular', label: 'Popüler', icon: 'heart' },
  { key: 'trending', label: 'Trend', icon: 'trending-up' },
  { key: 'nearby', label: 'Yakınımdaki', icon: 'location' },
];

export const FEED_TIME_RANGES: FeedTimeRange[] = [
  { key: 'today', label: 'Bugün', value: 24 * 60 * 60 * 1000 },
  { key: 'week', label: 'Bu Hafta', value: 7 * 24 * 60 * 60 * 1000 },
  { key: 'month', label: 'Bu Ay', value: 30 * 24 * 60 * 60 * 1000 },
  { key: 'all', label: 'Tümü', value: 0 },
]; 