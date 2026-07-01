import AsyncStorage from '@react-native-async-storage/async-storage';

// Premium features list
export interface PremiumFeature {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'content' | 'functionality' | 'customization' | 'analytics';
  requiredTier: 'basic' | 'premium' | 'ultimate';
}

// Premium subscription tiers
export interface SubscriptionTier {
  id: string;
  name: string;
  price: string;
  duration: 'monthly' | 'yearly' | 'lifetime';
  features: string[];
  popular?: boolean;
  discount?: string;
}

// Premium feature definitions
export const premiumFeatures: PremiumFeature[] = [
  // Content Features
  {
    id: 'unlimited_ai_chat',
    name: 'Sınırsız AI Sohbet',
    description: 'AI rehber ile sınırsız sohbet hakkı',
    icon: 'chatbubbles',
    category: 'functionality',
    requiredTier: 'premium',
  },
  {
    id: 'exclusive_content',
    name: 'Özel İçerikler',
    description: 'Premium kullanıcılara özel ayetler ve hadisler',
    icon: 'book',
    category: 'content',
    requiredTier: 'premium',
  },
  {
    id: 'audio_recitations',
    name: 'Sesli Tilavet',
    description: 'Ünlü hafızların sesli Kur\'an tilavetleri',
    icon: 'volume-high',
    category: 'content',
    requiredTier: 'premium',
  },
  {
    id: 'advanced_study_plans',
    name: 'Gelişmiş Çalışma Planları',
    description: 'Kişiselleştirilmiş çalışma programları',
    icon: 'calendar',
    category: 'functionality',
    requiredTier: 'premium',
  },
  {
    id: 'offline_content',
    name: 'Çevrimdışı İçerik',
    description: 'İnternet olmadan da erişim',
    icon: 'cloud-download',
    category: 'functionality',
    requiredTier: 'premium',
  },
  {
    id: 'custom_themes',
    name: 'Özel Temalar',
    description: 'Görsel özelleştirme seçenekleri',
    icon: 'color-palette',
    category: 'customization',
    requiredTier: 'premium',
  },
  {
    id: 'prayer_analytics',
    name: 'Dua Analitikleri',
    description: 'Detaylı istatistik ve ilerleme takibi',
    icon: 'analytics',
    category: 'analytics',
    requiredTier: 'premium',
  },
  {
    id: 'family_sharing',
    name: 'Aile Paylaşımı',
    description: 'Aile üyeleri ile hesap paylaşımı',
    icon: 'people',
    category: 'functionality',
    requiredTier: 'ultimate',
  },
  {
    id: 'priority_support',
    name: 'Öncelikli Destek',
    description: '7/24 öncelikli müşteri desteği',
    icon: 'headset',
    category: 'functionality',
    requiredTier: 'ultimate',
  },
  {
    id: 'ad_free',
    name: 'Reklamlar',
    description: 'Tamamen reklamsız deneyim',
    icon: 'shield-checkmark',
    category: 'functionality',
    requiredTier: 'basic',
  },
];

// Subscription tier definitions
export const subscriptionTiers: SubscriptionTier[] = [
  {
    id: 'basic',
    name: 'Temel',
    price: '₺29.99',
    duration: 'monthly',
    features: [
      'Reklamsız deneyim',
      'Temel AI sohbet (10 mesaj/gün)',
      'Temel istatistikler',
      'Standart temalar',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '₺49.99',
    duration: 'monthly',
    popular: true,
    features: [
      'Tüm Temel özellikler',
      'Sınırsız AI sohbet',
      'Özel içerikler',
      'Sesli tilavet',
      'Gelişmiş çalışma planları',
      'Çevrimdışı içerik',
      'Özel temalar',
      'Detaylı analitikler',
    ],
  },
  {
    id: 'premium_yearly',
    name: 'Premium Yıllık',
    price: '₺399.99',
    duration: 'yearly',
    discount: '33% indirim',
    features: [
      'Tüm Premium özellikler',
      '4 ay ücretsiz',
      'Öncelikli destek',
    ],
  },
  {
    id: 'ultimate',
    name: 'Ultimate',
    price: '₺99.99',
    duration: 'monthly',
    features: [
      'Tüm Premium özellikler',
      'Aile paylaşımı (6 kişiye kadar)',
      '7/24 öncelikli destek',
      'Beta özelliklere erken erişim',
      'Kişisel manevi danışman',
    ],
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    price: '₺1.999.99',
    duration: 'lifetime',
    features: [
      'Tüm özellikler',
      'Yaşam boyu erişim',
      'Gelecekteki tüm güncellemeler',
      'VIP destek',
    ],
  },
];

// Storage keys
const PREMIUM_STATUS_KEY = 'premium_status';
const SUBSCRIPTION_DATA_KEY = 'subscription_data';
const PREMIUM_FEATURES_USAGE_KEY = 'premium_features_usage';

// Premium status interface
export interface PremiumStatus {
  isActive: boolean;
  tier: 'free' | 'basic' | 'premium' | 'ultimate';
  expiryDate?: Date;
  subscriptionId?: string;
  autoRenew: boolean;
  trialUsed: boolean;
  trialEndDate?: Date;
}

// Get current premium status
export const getPremiumStatus = async (): Promise<PremiumStatus> => {
  try {
    const stored = await AsyncStorage.getItem(PREMIUM_STATUS_KEY);
    if (stored) {
      const status = JSON.parse(stored);
      return {
        ...status,
        expiryDate: status.expiryDate ? new Date(status.expiryDate) : undefined,
        trialEndDate: status.trialEndDate ? new Date(status.trialEndDate) : undefined,
      };
    }
    
    // Default free status
    return {
      isActive: false,
      tier: 'free',
      autoRenew: false,
      trialUsed: false,
    };
  } catch (error) {
    console.warn('Error getting premium status:', error);
    return {
      isActive: false,
      tier: 'free',
      autoRenew: false,
      trialUsed: false,
    };
  }
};

// Save premium status
export const savePremiumStatus = async (status: PremiumStatus): Promise<void> => {
  try {
    await AsyncStorage.setItem(PREMIUM_STATUS_KEY, JSON.stringify(status));
  } catch (error) {
    console.warn('Error saving premium status:', error);
  }
};

// Check if specific feature is available
export const isFeatureAvailable = async (featureId: string): Promise<boolean> => {
  try {
    const status = await getPremiumStatus();
    const feature = premiumFeatures.find(f => f.id === featureId);
    
    if (!feature) return false;
    
    // Free users get no premium features
    if (status.tier === 'free') return false;
    
    // Check if user's tier covers this feature
    const tierLevels = { basic: 1, premium: 2, ultimate: 3 };
    const userLevel = tierLevels[status.tier as keyof typeof tierLevels] || 0;
    const requiredLevel = tierLevels[feature.requiredTier as keyof typeof tierLevels] || 99;
    
    return status.isActive && userLevel >= requiredLevel;
  } catch (error) {
    console.warn('Error checking feature availability:', error);
    return false;
  }
};

// Get features by category for a specific tier
export const getFeaturesByCategory = (tier: 'basic' | 'premium' | 'ultimate') => {
  const tierLevels = { basic: 1, premium: 2, ultimate: 3 };
  const userLevel = tierLevels[tier];
  
  const availableFeatures = premiumFeatures.filter(feature => {
    const requiredLevel = tierLevels[feature.requiredTier as keyof typeof tierLevels] || 99;
    return userLevel >= requiredLevel;
  });
  
  const categorized = availableFeatures.reduce((acc, feature) => {
    if (!acc[feature.category]) acc[feature.category] = [];
    acc[feature.category].push(feature);
    return acc;
  }, {} as Record<string, PremiumFeature[]>);
  
  return categorized;
};

// Track premium feature usage
export const trackFeatureUsage = async (featureId: string): Promise<void> => {
  try {
    const key = `${PREMIUM_FEATURES_USAGE_KEY}_${featureId}`;
    const current = await AsyncStorage.getItem(key);
    const count = current ? parseInt(current, 10) + 1 : 1;
    
    await AsyncStorage.setItem(key, count.toString());
    await AsyncStorage.setItem(`${key}_last_used`, Date.now().toString());
  } catch (error) {
    console.warn('Error tracking feature usage:', error);
  }
};

// Get feature usage statistics
export const getFeatureUsageStats = async (featureId: string) => {
  try {
    const key = `${PREMIUM_FEATURES_USAGE_KEY}_${featureId}`;
    const countStr = await AsyncStorage.getItem(key);
    const lastUsedStr = await AsyncStorage.getItem(`${key}_last_used`);
    
    return {
      count: countStr ? parseInt(countStr, 10) : 0,
      lastUsed: lastUsedStr ? new Date(parseInt(lastUsedStr, 10)) : null,
    };
  } catch (error) {
    console.warn('Error getting feature usage stats:', error);
    return { count: 0, lastUsed: null };
  }
};

// Check if trial is available
export const isTrialAvailable = async (): Promise<boolean> => {
  try {
    const status = await getPremiumStatus();
    return !status.trialUsed && status.tier === 'free';
  } catch (error) {
    console.warn('Error checking trial availability:', error);
    return false;
  }
};

// Start free trial
export const startFreeTrial = async (durationDays: number = 7): Promise<boolean> => {
  try {
    const isAvailable = await isTrialAvailable();
    if (!isAvailable) return false;
    
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + durationDays);
    
    const newStatus: PremiumStatus = {
      isActive: true,
      tier: 'premium',
      expiryDate: trialEndDate,
      autoRenew: false,
      trialUsed: true,
      trialEndDate,
    };
    
    await savePremiumStatus(newStatus);
    return true;
  } catch (error) {
    console.warn('Error starting free trial:', error);
    return false;
  }
};

// Check if subscription has expired
export const isSubscriptionExpired = async (): Promise<boolean> => {
  try {
    const status = await getPremiumStatus();
    if (!status.isActive || !status.expiryDate) return false;
    
    return new Date() > status.expiryDate;
  } catch (error) {
    console.warn('Error checking subscription expiry:', error);
    return true;
  }
};

// Get days until subscription expires
export const getDaysUntilExpiry = async (): Promise<number | null> => {
  try {
    const status = await getPremiumStatus();
    if (!status.isActive || !status.expiryDate) return null;
    
    const now = new Date();
    const diffTime = status.expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  } catch (error) {
    console.warn('Error calculating days until expiry:', error);
    return null;
  }
};

// Reset premium status (for testing)
export const resetPremiumStatus = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(PREMIUM_STATUS_KEY);
    await AsyncStorage.removeItem(SUBSCRIPTION_DATA_KEY);
  } catch (error) {
    console.warn('Error resetting premium status:', error);
  }
};

export default {
  premiumFeatures,
  subscriptionTiers,
  getPremiumStatus,
  savePremiumStatus,
  isFeatureAvailable,
  getFeaturesByCategory,
  trackFeatureUsage,
  getFeatureUsageStats,
  isTrialAvailable,
  startFreeTrial,
  isSubscriptionExpired,
  getDaysUntilExpiry,
  resetPremiumStatus,
}; 