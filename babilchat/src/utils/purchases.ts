import AsyncStorage from '@react-native-async-storage/async-storage';
import { PremiumStatus, savePremiumStatus } from './premium';

// Mock implementation for expo-in-app-purchases
// In production, this would use actual Expo modules
interface Product {
  productId: string;
  price: string;
  priceAmountMicros: number;
  priceCurrencyCode: string;
  title: string;
  description: string;
  type: 'subscription' | 'product';
}

interface Purchase {
  productId: string;
  purchaseTime: number;
  purchaseToken: string;
  acknowledged: boolean;
  transactionId: string;
}

// Product IDs (these should match your App Store/Play Store configuration)
export const PRODUCT_IDS = {
  BASIC_MONTHLY: 'com.babilchat.basic.monthly',
  PREMIUM_MONTHLY: 'com.babilchat.premium.monthly',
  PREMIUM_YEARLY: 'com.babilchat.premium.yearly',
  ULTIMATE_MONTHLY: 'com.babilchat.ultimate.monthly',
  LIFETIME: 'com.babilchat.lifetime',
} as const;

// Storage keys
const PURCHASE_HISTORY_KEY = 'purchase_history';
const RESTORED_PURCHASES_KEY = 'restored_purchases';

// Purchase state
let isInitialized = false;
let availableProducts: Product[] = [];

// Initialize in-app purchases
export const initializePurchases = async (): Promise<boolean> => {
  try {
    if (isInitialized) return true;
    
    // Mock initialization - in production would use:
    // await IAPurchases.connectAsync();
    console.log('Initializing in-app purchases...');
    
    // Load available products
    await loadProducts();
    
    isInitialized = true;
    return true;
  } catch (error) {
    console.warn('Error initializing purchases:', error);
    return false;
  }
};

// Load available products from store
export const loadProducts = async (): Promise<Product[]> => {
  try {
    // Mock products - in production would fetch from store
    const mockProducts: Product[] = [
      {
        productId: PRODUCT_IDS.BASIC_MONTHLY,
        price: '₺29.99',
        priceAmountMicros: 29990000,
        priceCurrencyCode: 'TRY',
        title: 'Babil Chat Temel - Aylık',
        description: 'Reklamsız deneyim ve temel AI sohbet',
        type: 'subscription',
      },
      {
        productId: PRODUCT_IDS.PREMIUM_MONTHLY,
        price: '₺49.99',
        priceAmountMicros: 49990000,
        priceCurrencyCode: 'TRY',
        title: 'Babil Chat Premium - Aylık',
        description: 'Tüm premium özellikler ve sınırsız AI sohbet',
        type: 'subscription',
      },
      {
        productId: PRODUCT_IDS.PREMIUM_YEARLY,
        price: '₺399.99',
        priceAmountMicros: 399990000,
        priceCurrencyCode: 'TRY',
        title: 'Babil Chat Premium - Yıllık',
        description: 'Premium özellikler - 4 ay ücretsiz!',
        type: 'subscription',
      },
      {
        productId: PRODUCT_IDS.ULTIMATE_MONTHLY,
        price: '₺99.99',
        priceAmountMicros: 99990000,
        priceCurrencyCode: 'TRY',
        title: 'Babil Chat Ultimate - Aylık',
        description: 'Tüm özellikler + aile paylaşımı',
        type: 'subscription',
      },
      {
        productId: PRODUCT_IDS.LIFETIME,
        price: '₺1.999.99',
        priceAmountMicros: 1999990000,
        priceCurrencyCode: 'TRY',
        title: 'Babil Chat Lifetime',
        description: 'Yaşam boyu tüm özelliklere erişim',
        type: 'product',
      },
    ];
    
    availableProducts = mockProducts;
    return mockProducts;
  } catch (error) {
    console.warn('Error loading products:', error);
    return [];
  }
};

// Get available products
export const getAvailableProducts = (): Product[] => {
  return availableProducts;
};

// Get product by ID
export const getProduct = (productId: string): Product | undefined => {
  return availableProducts.find(p => p.productId === productId);
};

// Purchase a product
export const purchaseProduct = async (productId: string): Promise<{
  success: boolean;
  purchase?: Purchase;
  error?: string;
}> => {
  try {
    if (!isInitialized) {
      await initializePurchases();
    }
    
    const product = getProduct(productId);
    if (!product) {
      return { success: false, error: 'Product not found' };
    }
    
    // Mock purchase - in production would use:
    // const result = await IAPurchases.purchaseItemAsync(productId);
    console.log('Purchasing product:', productId);
    
    // Simulate purchase success
    const mockPurchase: Purchase = {
      productId,
      purchaseTime: Date.now(),
      purchaseToken: `token_${Date.now()}`,
      acknowledged: true,
      transactionId: `txn_${Date.now()}`,
    };
    
    // Save purchase to history
    await savePurchaseToHistory(mockPurchase);
    
    // Update premium status based on purchase
    await updatePremiumStatusFromPurchase(mockPurchase);
    
    return { success: true, purchase: mockPurchase };
  } catch (error) {
    console.warn('Error purchasing product:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Restore previous purchases
export const restorePurchases = async (): Promise<{
  success: boolean;
  purchases: Purchase[];
  error?: string;
}> => {
  try {
    if (!isInitialized) {
      await initializePurchases();
    }
    
    // Mock restore - in production would use:
    // const result = await IAPurchases.getProductsAsync(['subscription', 'product']);
    console.log('Restoring purchases...');
    
    // Get stored purchases
    const storedPurchases = await getPurchaseHistory();
    
    // Update premium status from latest valid purchase
    if (storedPurchases.length > 0) {
      const latestPurchase = storedPurchases[storedPurchases.length - 1];
      await updatePremiumStatusFromPurchase(latestPurchase);
    }
    
    await AsyncStorage.setItem(RESTORED_PURCHASES_KEY, JSON.stringify(storedPurchases));
    
    return { success: true, purchases: storedPurchases };
  } catch (error) {
    console.warn('Error restoring purchases:', error);
    return { success: false, purchases: [], error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Save purchase to local history
const savePurchaseToHistory = async (purchase: Purchase): Promise<void> => {
  try {
    const history = await getPurchaseHistory();
    history.push(purchase);
    await AsyncStorage.setItem(PURCHASE_HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.warn('Error saving purchase to history:', error);
  }
};

// Get purchase history
export const getPurchaseHistory = async (): Promise<Purchase[]> => {
  try {
    const stored = await AsyncStorage.getItem(PURCHASE_HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.warn('Error getting purchase history:', error);
    return [];
  }
};

// Update premium status based on purchase
const updatePremiumStatusFromPurchase = async (purchase: Purchase): Promise<void> => {
  try {
    let tier: 'basic' | 'premium' | 'ultimate' = 'basic';
    let duration = 30; // days
    
    // Determine tier and duration based on product ID
    switch (purchase.productId) {
      case PRODUCT_IDS.BASIC_MONTHLY:
        tier = 'basic';
        duration = 30;
        break;
      case PRODUCT_IDS.PREMIUM_MONTHLY:
        tier = 'premium';
        duration = 30;
        break;
      case PRODUCT_IDS.PREMIUM_YEARLY:
        tier = 'premium';
        duration = 365;
        break;
      case PRODUCT_IDS.ULTIMATE_MONTHLY:
        tier = 'ultimate';
        duration = 30;
        break;
      case PRODUCT_IDS.LIFETIME:
        tier = 'ultimate';
        duration = 36500; // 100 years
        break;
    }
    
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + duration);
    
    const premiumStatus: PremiumStatus = {
      isActive: true,
      tier,
      expiryDate,
      subscriptionId: purchase.transactionId,
      autoRenew: purchase.productId !== PRODUCT_IDS.LIFETIME,
      trialUsed: true,
    };
    
    await savePremiumStatus(premiumStatus);
  } catch (error) {
    console.warn('Error updating premium status from purchase:', error);
  }
};

// Check if user has active subscription
export const hasActiveSubscription = async (): Promise<boolean> => {
  try {
    const history = await getPurchaseHistory();
    if (history.length === 0) return false;
    
    // Check if latest purchase is still valid
    const latestPurchase = history[history.length - 1];
    
    // For lifetime purchases, always return true
    if (latestPurchase.productId === PRODUCT_IDS.LIFETIME) {
      return true;
    }
    
    // For subscriptions, check expiry (simplified check)
    // In production, you'd verify with store servers
    const purchaseDate = new Date(latestPurchase.purchaseTime);
    const now = new Date();
    const daysSincePurchase = Math.floor((now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Assume monthly subscriptions are valid for 30 days, yearly for 365
    const isYearly = latestPurchase.productId === PRODUCT_IDS.PREMIUM_YEARLY;
    const validDays = isYearly ? 365 : 30;
    
    return daysSincePurchase < validDays;
  } catch (error) {
    console.warn('Error checking active subscription:', error);
    return false;
  }
};

// Get subscription info
export const getSubscriptionInfo = async () => {
  try {
    const history = await getPurchaseHistory();
    if (history.length === 0) return null;
    
    const latestPurchase = history[history.length - 1];
    const product = getProduct(latestPurchase.productId);
    
    if (!product) return null;
    
    const purchaseDate = new Date(latestPurchase.purchaseTime);
    const isActive = await hasActiveSubscription();
    
    let expiryDate: Date | null = null;
    if (latestPurchase.productId !== PRODUCT_IDS.LIFETIME) {
      expiryDate = new Date(purchaseDate);
      const isYearly = latestPurchase.productId === PRODUCT_IDS.PREMIUM_YEARLY;
      expiryDate.setDate(expiryDate.getDate() + (isYearly ? 365 : 30));
    }
    
    return {
      product,
      purchase: latestPurchase,
      purchaseDate,
      expiryDate,
      isActive,
      isLifetime: latestPurchase.productId === PRODUCT_IDS.LIFETIME,
    };
  } catch (error) {
    console.warn('Error getting subscription info:', error);
    return null;
  }
};

// Validate purchase with server (mock implementation)
export const validatePurchase = async (purchase: Purchase): Promise<boolean> => {
  try {
    // In production, this would validate with your backend server
    // which would then verify with Apple/Google servers
    console.log('Validating purchase:', purchase.transactionId);
    
    // Mock validation - always return true for demo
    return true;
  } catch (error) {
    console.warn('Error validating purchase:', error);
    return false;
  }
};

// Clear purchase data (for testing)
export const clearPurchaseData = async (): Promise<void> => {
  try {
    await Promise.all([
      AsyncStorage.removeItem(PURCHASE_HISTORY_KEY),
      AsyncStorage.removeItem(RESTORED_PURCHASES_KEY),
    ]);
  } catch (error) {
    console.warn('Error clearing purchase data:', error);
  }
};

// Get promotional pricing (mock implementation)
export const getPromotionalPricing = async (): Promise<{
  hasPromo: boolean;
  discount?: number;
  promoText?: string;
}> => {
  try {
    // Mock promotional pricing logic
    const isSpecialPeriod = Math.random() > 0.7; // 30% chance of promo
    
    if (isSpecialPeriod) {
      return {
        hasPromo: true,
        discount: 25,
        promoText: 'Ramazan özel %25 indirim!',
      };
    }
    
    return { hasPromo: false };
  } catch (error) {
    console.warn('Error getting promotional pricing:', error);
    return { hasPromo: false };
  }
};

export default {
  PRODUCT_IDS,
  initializePurchases,
  loadProducts,
  getAvailableProducts,
  getProduct,
  purchaseProduct,
  restorePurchases,
  getPurchaseHistory,
  hasActiveSubscription,
  getSubscriptionInfo,
  validatePurchase,
  clearPurchaseData,
  getPromotionalPricing,
}; 