import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuthToken } from './auth';
import { triggerErrorHaptic, triggerPrayerHaptic, triggerSuccessHaptic } from './haptics';
import { DuaCategory } from './types';

// Updated Types with User Integration
export interface DuaRequest {
  id: string;
  userId: string;
  userDisplayName: string;
  userProfilePhoto?: string;
  isAnonymous: boolean;
  category: DuaCategory;
  title: string;
  description: string;
  isUrgent: boolean;
  status: 'active' | 'fulfilled' | 'closed';
  privacy: 'public' | 'community' | 'private';
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  
  // Interaction Stats
  duaCount: number;
  commentCount: number;
  shareCount: number;
  
  // User Interaction State
  hasUserMadeDua: boolean;
  hasUserCommented: boolean;
  hasUserShared: boolean;
  
  // Engagement Data
  lastDuaAt?: Date;
  lastCommentAt?: Date;
  peakDuaTime?: string; // e.g., "14:30" for most active time
  
  // Location (Optional)
  location?: {
    city: string;
    country: string;
    coordinates?: [number, number];
  };
  
  // Tags for better categorization
  tags: string[];
  
  // Verification for urgent requests
  isVerified: boolean;
  verificationNote?: string;
}

// Comments system for dua requests
export interface DuaComment {
  id: string;
  duaRequestId: string;
  userId: string;
  userDisplayName: string;
  userProfilePhoto?: string;
  isAnonymous: boolean;
  content: string;
  type: 'support' | 'prayer' | 'amen' | 'guidance';
  createdAt: Date;
  updatedAt: Date;
  
  // Engagement
  likeCount: number;
  hasUserLiked: boolean;
  
  // Moderation
  isApproved: boolean;
  reportCount: number;
  
  // Special properties
  isPinned: boolean;
  isHighlighted: boolean;
}

// Analytics for dua requests
export interface DuaAnalytics {
  totalRequests: number;
  activeRequests: number;
  fulfilledRequests: number;
  totalPrayers: number;
  averageResponseTime: number; // in hours
  
  // Category breakdown
  categoryStats: Record<string, {
    count: number;
    averagePrayers: number;
    fulfillmentRate: number;
  }>;
  
  // User engagement
  topContributors: Array<{
    userId: string;
    displayName: string;
    prayerCount: number;
    requestCount: number;
  }>;
  
  // Time analysis
  peakTimes: Array<{
    hour: number;
    requestCount: number;
    prayerCount: number;
  }>;
}

// Storage keys
const DUA_REQUESTS_KEY = 'dua_requests';
const DUA_COMMENTS_KEY = 'dua_comments';
const DUA_USER_INTERACTIONS_KEY = 'dua_user_interactions';
const DUA_ANALYTICS_KEY = 'dua_analytics';

// Sample dua requests for development
const SAMPLE_DUA_REQUESTS: Omit<DuaRequest, 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'dua_001',
    userId: 'user_001',
    userDisplayName: 'Ahmet K.',
    isAnonymous: false,
    category: 'health',
    title: 'Annem için şifa duası',
    description: 'Annem kalp rahatsızlığı geçirdi. Ameliyat olacak. Şifa bulması için dua edin.',
    isUrgent: true,
    status: 'active',
    privacy: 'public',
    duaCount: 247,
    commentCount: 23,
    shareCount: 12,
    hasUserMadeDua: false,
    hasUserCommented: false,
    hasUserShared: false,
    tags: ['şifa', 'anne', 'kalp', 'ameliyat'],
    isVerified: true,
    verificationNote: 'Hastane belgesi onaylandı'
  },
  {
    id: 'dua_002',
    userId: 'user_002',
    userDisplayName: 'Fatma Y.',
    isAnonymous: false,
    category: 'work',
    title: 'İş bulabilmem için',
    description: '6 aydır işsizim. Ailemi geçindirmekte zorlanıyorum. Hayırlı bir iş bulabilmem için dua edin.',
    isUrgent: false,
    status: 'active',
    privacy: 'public',
    duaCount: 89,
    commentCount: 15,
    shareCount: 3,
    hasUserMadeDua: false,
    hasUserCommented: false,
    hasUserShared: false,
    tags: ['iş', 'rızık', 'aile'],
    isVerified: false
  },
  {
    id: 'dua_003',
    userId: 'user_003',
    userDisplayName: 'Anonim',
    isAnonymous: true,
    category: 'family',
    title: 'Evlilik için dua',
    description: 'Uzun süredir evlenmek istiyorum ama nasip olmuyor. Hayırlı bir eş nasip olması için dua edin.',
    isUrgent: false,
    status: 'active',
    privacy: 'public',
    duaCount: 156,
    commentCount: 31,
    shareCount: 8,
    hasUserMadeDua: false,
    hasUserCommented: false,
    hasUserShared: false,
    tags: ['evlilik', 'eş', 'nasip'],
    isVerified: false
  }
];

// Initialize sample data
const initializeSampleData = async (): Promise<void> => {
  try {
    const existing = await AsyncStorage.getItem(DUA_REQUESTS_KEY);
    if (!existing) {
      const requests = SAMPLE_DUA_REQUESTS.map(req => ({
        ...req,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random date within last week
        updatedAt: new Date()
      }));
      
      await AsyncStorage.setItem(DUA_REQUESTS_KEY, JSON.stringify(requests));
      console.log('Sample dua requests initialized');
    }
  } catch (error) {
    console.error('Error initializing sample data:', error);
  }
};

// Get all dua requests
export const getDuaRequests = async (
  category?: DuaCategory,
  limit?: number,
  status: 'active' | 'fulfilled' | 'closed' | 'all' = 'active'
): Promise<DuaRequest[]> => {
  try {
    // Initialize sample data if needed
    await initializeSampleData();
    
    const stored = await AsyncStorage.getItem(DUA_REQUESTS_KEY);
    if (!stored) return [];
    
    let requests: DuaRequest[] = JSON.parse(stored).map((req: any) => ({
      ...req,
      createdAt: new Date(req.createdAt),
      updatedAt: new Date(req.updatedAt),
      expiresAt: req.expiresAt ? new Date(req.expiresAt) : undefined,
      lastDuaAt: req.lastDuaAt ? new Date(req.lastDuaAt) : undefined,
      lastCommentAt: req.lastCommentAt ? new Date(req.lastCommentAt) : undefined
    }));
    
    // Filter by category
    if (category && category !== 'all') {
      requests = requests.filter(req => req.category === category);
    }
    
    // Filter by status
    if (status !== 'all') {
      requests = requests.filter(req => req.status === status);
    }
    
    // Sort by urgency and creation date
    requests.sort((a, b) => {
      if (a.isUrgent && !b.isUrgent) return -1;
      if (!a.isUrgent && b.isUrgent) return 1;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
    
    // Apply limit
    if (limit && limit > 0) {
      requests = requests.slice(0, limit);
    }
    
    return requests;
  } catch (error) {
    console.error('Error getting dua requests:', error);
    return [];
  }
};

// Get specific dua request by ID
export const getDuaRequestById = async (id: string): Promise<DuaRequest | null> => {
  try {
    const requests = await getDuaRequests();
    return requests.find(req => req.id === id) || null;
  } catch (error) {
    console.error('Error getting dua request by ID:', error);
    return null;
  }
};

// Create new dua request
export const createDuaRequest = async (
  duaData: Omit<DuaRequest, 'id' | 'createdAt' | 'updatedAt' | 'duaCount' | 'commentCount' | 'shareCount' | 'hasUserMadeDua' | 'hasUserCommented' | 'hasUserShared'>
): Promise<{ success: boolean; duaRequest?: DuaRequest; error?: string }> => {
  try {
    triggerPrayerHaptic('addPrayer');
    
    const authToken = await getAuthToken();
    if (!authToken) {
      return { success: false, error: 'Dua talebi oluşturmak için giriş yapmalısınız' };
    }
    
    const newDuaRequest: DuaRequest = {
      ...duaData,
      id: `dua_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      duaCount: 0,
      commentCount: 0,
      shareCount: 0,
      hasUserMadeDua: false,
      hasUserCommented: false,
      hasUserShared: false
    };
    
    const requests = await getDuaRequests();
    requests.unshift(newDuaRequest);
    
    await AsyncStorage.setItem(DUA_REQUESTS_KEY, JSON.stringify(requests));
    
    triggerSuccessHaptic();
    return { success: true, duaRequest: newDuaRequest };
  } catch (error) {
    console.error('Error creating dua request:', error);
    triggerErrorHaptic();
    return { success: false, error: 'Dua talebi oluşturulurken bir hata oluştu' };
  }
};

// Update dua request
export const updateDuaRequest = async (
  id: string,
  updates: Partial<DuaRequest>
): Promise<{ success: boolean; error?: string }> => {
  try {
    const stored = await AsyncStorage.getItem(DUA_REQUESTS_KEY);
    if (!stored) return { success: false, error: 'Dua talebi bulunamadı' };
    
    const requests: DuaRequest[] = JSON.parse(stored);
    const requestIndex = requests.findIndex(req => req.id === id);
    
    if (requestIndex === -1) {
      return { success: false, error: 'Dua talebi bulunamadı' };
    }
    
    requests[requestIndex] = {
      ...requests[requestIndex],
      ...updates,
      updatedAt: new Date()
    };
    
    await AsyncStorage.setItem(DUA_REQUESTS_KEY, JSON.stringify(requests));
    return { success: true };
  } catch (error) {
    console.error('Error updating dua request:', error);
    return { success: false, error: 'Dua talebi güncellenirken bir hata oluştu' };
  }
};

// Make dua for a request
export const makeDuaForRequest = async (
  duaRequestId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    triggerPrayerHaptic('prayerComplete');
    
    const authToken = await getAuthToken();
    if (!authToken) {
      return { success: false, error: 'Dua etmek için giriş yapmalısınız' };
    }
    
    const stored = await AsyncStorage.getItem(DUA_REQUESTS_KEY);
    if (!stored) return { success: false, error: 'Dua talebi bulunamadı' };
    
    const requests: DuaRequest[] = JSON.parse(stored);
    const requestIndex = requests.findIndex(req => req.id === duaRequestId);
    
    if (requestIndex === -1) {
      return { success: false, error: 'Dua talebi bulunamadı' };
    }
    
    // Update dua count and user interaction
    requests[requestIndex] = {
      ...requests[requestIndex],
      duaCount: requests[requestIndex].duaCount + 1,
      hasUserMadeDua: true,
      lastDuaAt: new Date(),
      updatedAt: new Date()
    };
    
    await AsyncStorage.setItem(DUA_REQUESTS_KEY, JSON.stringify(requests));
    
    // Track user interaction
    await trackUserInteraction(duaRequestId, 'dua');
    
    triggerSuccessHaptic();
    return { success: true };
  } catch (error) {
    console.error('Error making dua for request:', error);
    triggerErrorHaptic();
    return { success: false, error: 'Dua ederken bir hata oluştu' };
  }
};

// Get user's dua requests
export const getUserDuaRequests = async (userId?: string): Promise<DuaRequest[]> => {
  try {
    const authToken = await getAuthToken();
    const targetUserId = userId || authToken?.userId;
    
    if (!targetUserId) return [];
    
    const allRequests = await getDuaRequests();
    return allRequests.filter(req => req.userId === targetUserId);
  } catch (error) {
    console.error('Error getting user dua requests:', error);
    return [];
  }
};

// Search dua requests
export const searchDuaRequests = async (
  query: string,
  filters?: {
    category?: DuaCategory;
    isUrgent?: boolean;
    status?: 'active' | 'fulfilled' | 'closed';
  }
): Promise<DuaRequest[]> => {
  try {
    let requests = await getDuaRequests();
    
    // Apply filters
    if (filters?.category && filters.category !== 'all') {
      requests = requests.filter(req => req.category === filters.category);
    }
    
    if (filters?.isUrgent !== undefined) {
      requests = requests.filter(req => req.isUrgent === filters.isUrgent);
    }
    
    if (filters?.status) {
      requests = requests.filter(req => req.status === filters.status);
    }
    
    // Search in title, description, and tags
    if (query.trim()) {
      const searchTerm = query.toLowerCase();
      requests = requests.filter(req =>
        req.title.toLowerCase().includes(searchTerm) ||
        req.description.toLowerCase().includes(searchTerm) ||
        req.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }
    
    return requests;
  } catch (error) {
    console.error('Error searching dua requests:', error);
    return [];
  }
};

// Get dua analytics
export const getDuaAnalytics = async (): Promise<DuaAnalytics> => {
  try {
    const requests = await getDuaRequests();
    
    const analytics: DuaAnalytics = {
      totalRequests: requests.length,
      activeRequests: requests.filter(r => r.status === 'active').length,
      fulfilledRequests: requests.filter(r => r.status === 'fulfilled').length,
      totalPrayers: requests.reduce((sum, r) => sum + r.duaCount, 0),
      averageResponseTime: 0, // Calculate based on actual data
      categoryStats: {},
      topContributors: [],
      peakTimes: []
    };
    
    // Calculate category stats
    const categories = ['health', 'work', 'family', 'education', 'financial', 'general'];
    categories.forEach(category => {
      const categoryRequests = requests.filter(r => r.category === category);
      if (categoryRequests.length > 0) {
        analytics.categoryStats[category] = {
          count: categoryRequests.length,
          averagePrayers: categoryRequests.reduce((sum, r) => sum + r.duaCount, 0) / categoryRequests.length,
          fulfillmentRate: categoryRequests.filter(r => r.status === 'fulfilled').length / categoryRequests.length
        };
      }
    });
    
    return analytics;
  } catch (error) {
    console.error('Error getting dua analytics:', error);
    return {
      totalRequests: 0,
      activeRequests: 0,
      fulfilledRequests: 0,
      totalPrayers: 0,
      averageResponseTime: 0,
      categoryStats: {},
      topContributors: [],
      peakTimes: []
    };
  }
};

// Track user interaction
const trackUserInteraction = async (
  duaRequestId: string,
  interaction: 'dua' | 'comment' | 'share'
): Promise<void> => {
  try {
    const authToken = await getAuthToken();
    if (!authToken) return;
    
    const interactionKey = `${DUA_USER_INTERACTIONS_KEY}_${authToken.userId}`;
    const stored = await AsyncStorage.getItem(interactionKey);
    const interactions = stored ? JSON.parse(stored) : {};
    
    if (!interactions[duaRequestId]) {
      interactions[duaRequestId] = {
        dua: false,
        comment: false,
        share: false,
        timestamps: {}
      };
    }
    
    interactions[duaRequestId][interaction] = true;
    interactions[duaRequestId].timestamps[interaction] = new Date().toISOString();
    
    await AsyncStorage.setItem(interactionKey, JSON.stringify(interactions));
  } catch (error) {
    console.error('Error tracking user interaction:', error);
  }
};

// Delete dua request
export const deleteDuaRequest = async (id: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const stored = await AsyncStorage.getItem(DUA_REQUESTS_KEY);
    if (!stored) return { success: false, error: 'Dua talebi bulunamadı' };
    
    const requests: DuaRequest[] = JSON.parse(stored);
    const filteredRequests = requests.filter(req => req.id !== id);
    
    await AsyncStorage.setItem(DUA_REQUESTS_KEY, JSON.stringify(filteredRequests));
    return { success: true };
  } catch (error) {
    console.error('Error deleting dua request:', error);
    return { success: false, error: 'Dua talebi silinirken bir hata oluştu' };
  }
};

// Report dua request
export const reportDuaRequest = async (
  duaRequestId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const authToken = await getAuthToken();
    if (!authToken) {
      return { success: false, error: 'Rapor etmek için giriş yapmalısınız' };
    }
    
    // In a real app, this would send the report to moderation system
    console.log('Dua request reported:', { duaRequestId, reason, userId: authToken.userId });
    
    return { success: true };
  } catch (error) {
    console.error('Error reporting dua request:', error);
    return { success: false, error: 'Rapor gönderilirken bir hata oluştu' };
  }
}; 