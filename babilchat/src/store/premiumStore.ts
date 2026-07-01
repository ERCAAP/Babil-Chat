import React from 'react';
import { create } from 'zustand';
import {
    PremiumStatus,
    getPremiumStatus,
    isFeatureAvailable,
    savePremiumStatus,
    trackFeatureUsage
} from '../utils/premium';
import {
    hasActiveSubscription,
    initializePurchases,
    purchaseProduct,
    restorePurchases
} from '../utils/purchases';

// Premium store state interface
interface PremiumState {
  // Premium status
  premiumStatus: PremiumStatus | null;
  isLoading: boolean;
  error: string | null;
  
  // Purchase state
  isInitialized: boolean;
  isPurchasing: boolean;
  isRestoring: boolean;
  
  // Feature tracking
  featureUsage: Record<string, number>;
  
  // Actions
  initializePremium: () => Promise<void>;
  refreshPremiumStatus: () => Promise<void>;
  checkFeatureAccess: (featureId: string) => Promise<boolean>;
  useFeature: (featureId: string) => Promise<boolean>;
  startPurchaseFlow: (productId: string) => Promise<boolean>;
  restoreUserPurchases: () => Promise<boolean>;
  updatePremiumStatus: (status: PremiumStatus) => Promise<void>;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

// Create premium store
export const usePremiumStore = create<PremiumState>((set, get) => ({
  // Initial state
  premiumStatus: null,
  isLoading: false,
  error: null,
  isInitialized: false,
  isPurchasing: false,
  isRestoring: false,
  featureUsage: {},

  // Initialize premium system
  initializePremium: async () => {
    const state = get();
    if (state.isInitialized) return;

    set({ isLoading: true, error: null });

    try {
      // Initialize purchases
      const purchaseInitialized = await initializePurchases();
      
      // Load premium status
      const premiumStatus = await getPremiumStatus();
      
      // Check if subscription is still active
      const hasActiveSub = await hasActiveSubscription();
      
      // Update status if subscription expired
      if (premiumStatus.isActive && !hasActiveSub) {
        const updatedStatus: PremiumStatus = {
          ...premiumStatus,
          isActive: false,
          tier: 'free',
        };
        await savePremiumStatus(updatedStatus);
        set({ premiumStatus: updatedStatus });
      } else {
        set({ premiumStatus });
      }

      set({ 
        isInitialized: purchaseInitialized,
        isLoading: false 
      });
    } catch (error) {
      console.warn('Error initializing premium:', error);
      set({ 
        error: 'Premium sistem başlatılamadı',
        isLoading: false 
      });
    }
  },

  // Refresh premium status
  refreshPremiumStatus: async () => {
    set({ isLoading: true, error: null });

    try {
      const premiumStatus = await getPremiumStatus();
      const hasActiveSub = await hasActiveSubscription();
      
      if (premiumStatus.isActive && !hasActiveSub) {
        const updatedStatus: PremiumStatus = {
          ...premiumStatus,
          isActive: false,
          tier: 'free',
        };
        await savePremiumStatus(updatedStatus);
        set({ premiumStatus: updatedStatus });
      } else {
        set({ premiumStatus });
      }

      set({ isLoading: false });
    } catch (error) {
      console.warn('Error refreshing premium status:', error);
      set({ 
        error: 'Premium durum güncellenemedi',
        isLoading: false 
      });
    }
  },

  // Check if feature is accessible
  checkFeatureAccess: async (featureId: string) => {
    try {
      return await isFeatureAvailable(featureId);
    } catch (error) {
      console.warn('Error checking feature access:', error);
      return false;
    }
  },

  // Use a feature (with tracking)
  useFeature: async (featureId: string) => {
    try {
      const hasAccess = await isFeatureAvailable(featureId);
      
      if (!hasAccess) {
        set({ error: `Bu özellik premium üyelik gerektirir: ${featureId}` });
        return false;
      }

      // Track usage
      await trackFeatureUsage(featureId);
      
      // Update local usage tracking
      const currentUsage = get().featureUsage;
      set({ 
        featureUsage: {
          ...currentUsage,
          [featureId]: (currentUsage[featureId] || 0) + 1
        }
      });

      return true;
    } catch (error) {
      console.warn('Error using feature:', error);
      set({ error: 'Özellik kullanılamadı' });
      return false;
    }
  },

  // Start purchase flow
  startPurchaseFlow: async (productId: string) => {
    const state = get();
    if (state.isPurchasing) return false;

    set({ isPurchasing: true, error: null });

    try {
      const result = await purchaseProduct(productId);
      
      if (result.success) {
        // Refresh premium status after successful purchase
        await get().refreshPremiumStatus();
        set({ isPurchasing: false });
        return true;
      } else {
        set({ 
          error: result.error || 'Satın alma işlemi başarısız',
          isPurchasing: false 
        });
        return false;
      }
    } catch (error) {
      console.warn('Error in purchase flow:', error);
      set({ 
        error: 'Satın alma sırasında hata oluştu',
        isPurchasing: false 
      });
      return false;
    }
  },

  // Restore purchases
  restoreUserPurchases: async () => {
    const state = get();
    if (state.isRestoring) return false;

    set({ isRestoring: true, error: null });

    try {
      const result = await restorePurchases();
      
      if (result.success && result.purchases.length > 0) {
        // Refresh premium status after restore
        await get().refreshPremiumStatus();
        set({ isRestoring: false });
        return true;
      } else {
        set({ 
          error: result.error || 'Geri yüklenecek satın alma bulunamadı',
          isRestoring: false 
        });
        return false;
      }
    } catch (error) {
      console.warn('Error restoring purchases:', error);
      set({ 
        error: 'Satın almalar geri yüklenemedi',
        isRestoring: false 
      });
      return false;
    }
  },

  // Update premium status
  updatePremiumStatus: async (status: PremiumStatus) => {
    try {
      await savePremiumStatus(status);
      set({ premiumStatus: status });
    } catch (error) {
      console.warn('Error updating premium status:', error);
      set({ error: 'Premium durum güncellenemedi' });
    }
  },

  // Set error
  setError: (error: string | null) => {
    set({ error });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Reset store
  reset: () => {
    set({
      premiumStatus: null,
      isLoading: false,
      error: null,
      isInitialized: false,
      isPurchasing: false,
      isRestoring: false,
      featureUsage: {},
    });
  },
}));

// Selectors for common use cases
export const usePremiumStatus = () => usePremiumStore(state => state.premiumStatus);
export const useIsPremiumActive = () => usePremiumStore(state => state.premiumStatus?.isActive || false);
export const usePremiumTier = () => usePremiumStore(state => state.premiumStatus?.tier || 'free');
export const useIsPremiumLoading = () => usePremiumStore(state => state.isLoading);
export const usePremiumError = () => usePremiumStore(state => state.error);
export const useIsPurchasing = () => usePremiumStore(state => state.isPurchasing);
export const useIsRestoring = () => usePremiumStore(state => state.isRestoring);

// Hook for feature access checking
export const useFeatureAccess = (featureId: string) => {
  const checkFeatureAccess = usePremiumStore(state => state.checkFeatureAccess);
  const [hasAccess, setHasAccess] = React.useState(false);
  const [isChecking, setIsChecking] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;

    const checkAccess = async () => {
      setIsChecking(true);
      try {
        const access = await checkFeatureAccess(featureId);
        if (isMounted) {
          setHasAccess(access);
        }
      } catch (error) {
        console.warn('Error checking feature access:', error);
        if (isMounted) {
          setHasAccess(false);
        }
      } finally {
        if (isMounted) {
          setIsChecking(false);
        }
      }
    };

    checkAccess();

    return () => {
      isMounted = false;
    };
  }, [featureId, checkFeatureAccess]);

  return { hasAccess, isChecking };
};

// Hook for premium actions
export const usePremiumActions = () => {
  const store = usePremiumStore();
  
  return {
    initializePremium: store.initializePremium,
    refreshPremiumStatus: store.refreshPremiumStatus,
    checkFeatureAccess: store.checkFeatureAccess,
    useFeature: store.useFeature,
    startPurchaseFlow: store.startPurchaseFlow,
    restoreUserPurchases: store.restoreUserPurchases,
    updatePremiumStatus: store.updatePremiumStatus,
    setError: store.setError,
    clearError: store.clearError,
    reset: store.reset,
  };
};

// Hook to get premium statistics
export const usePremiumStats = () => {
  const premiumStatus = usePremiumStatus();
  const featureUsage = usePremiumStore(state => state.featureUsage);
  
  return React.useMemo(() => {
    if (!premiumStatus) {
      return {
        isActive: false,
        tier: 'free',
        daysRemaining: null,
        featuresUsed: 0,
        totalUsage: 0,
      };
    }

    let daysRemaining: number | null = null;
    if (premiumStatus.expiryDate) {
      const now = new Date();
      const expiry = new Date(premiumStatus.expiryDate);
      const diffTime = expiry.getTime() - now.getTime();
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    const featuresUsed = Object.keys(featureUsage).length;
    const totalUsage = Object.values(featureUsage).reduce((sum, count) => sum + count, 0);

    return {
      isActive: premiumStatus.isActive,
      tier: premiumStatus.tier,
      daysRemaining: daysRemaining > 0 ? daysRemaining : null,
      featuresUsed,
      totalUsage,
    };
  }, [premiumStatus, featureUsage]);
};

export default usePremiumStore; 