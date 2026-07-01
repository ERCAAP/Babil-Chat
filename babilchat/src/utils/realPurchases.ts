import AsyncStorage from '@react-native-async-storage/async-storage';
import { PremiumStatus, savePremiumStatus } from './premium';

// RevenueCat mock - In production, would use @revenuecat/purchases-react-native
interface PurchasesOffering {
  identifier: string;
  serverDescription: string;
  metadata: Record<string, any>;
  availablePackages: PurchasesPackage[];
}

interface PurchasesPackage {
  identifier: string;
  packageType: 'WEEKLY' | 'MONTHLY' | 'ANNUAL' | 'LIFETIME' | 'CUSTOM';
  product: PurchasesProduct;
  offeringIdentifier: string;
}

interface PurchasesProduct {
  identifier: string;
  description: string;
  title: string;
  price: number;
  priceString: string;
  currencyCode: string;
  introPrice?: PurchasesIntroPrice;
}

interface PurchasesIntroPrice {
  price: number;
  priceString: string;
  period: string;
  cycles: number;
  periodUnit: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
  periodNumberOfUnits: number;
}

interface CustomerInfo {
  originalAppUserId: string;
  allPurchaseDates: Record<string, string>;
  firstSeen: string;
  originalApplicationVersion: string;
  requestDate: string;
  latestExpirationDate?: string;
  originalPurchaseDate?: string;
  managementURL?: string;
  activeSubscriptions: string[];
  allPurchasedProductIdentifiers: string[];
  nonSubscriptionTransactions: PurchasesTransaction[];
  entitlements: {
    all: Record<string, EntitlementInfo>;
    active: Record<string, EntitlementInfo>;
  };
}

interface EntitlementInfo {
  identifier: string;
  isActive: boolean;
  willRenew: boolean;
  latestPurchaseDate: string;
  originalPurchaseDate: string;
  expirationDate?: string;
  store: 'APP_STORE' | 'MAC_APP_STORE' | 'PLAY_STORE' | 'STRIPE' | 'PROMOTIONAL';
  productIdentifier: string;
  isSandbox: boolean;
  unsubscribeDetectedAt?: string;
  billingIssueDetectedAt?: string;
}

interface PurchasesTransaction {
  transactionIdentifier: string;
  productIdentifier: string;
  purchaseDate: string;
}

// Purchase Error Types
export enum PurchaseErrorCode {
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  PURCHASE_CANCELLED = 'PURCHASE_CANCELLED',
  STORE_PROBLEM = 'STORE_PROBLEM',
  PURCHASE_NOT_ALLOWED = 'PURCHASE_NOT_ALLOWED',
  PURCHASE_INVALID = 'PURCHASE_INVALID',
  PRODUCT_NOT_AVAILABLE = 'PRODUCT_NOT_AVAILABLE',
  PRODUCT_ALREADY_PURCHASED = 'PRODUCT_ALREADY_PURCHASED',
  RECEIPT_ALREADY_IN_USE = 'RECEIPT_ALREADY_IN_USE',
  INVALID_RECEIPT = 'INVALID_RECEIPT',
  MISSING_RECEIPT_FILE = 'MISSING_RECEIPT_FILE',
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  UNEXPECTED_BACKEND_RESPONSE = 'UNEXPECTED_BACKEND_RESPONSE',
  RECEIPT_IN_USE_BY_OTHER_SUBSCRIBER = 'RECEIPT_IN_USE_BY_OTHER_SUBSCRIBER',
  INVALID_SUBSCRIBER_ATTRIBUTES = 'INVALID_SUBSCRIBER_ATTRIBUTES',
  LOGOUT_CALLED = 'LOGOUT_CALLED'
}

export class PurchaseError extends Error {
  code: PurchaseErrorCode;
  underlyingErrorMessage?: string;

  constructor(code: PurchaseErrorCode, message: string, underlyingErrorMessage?: string) {
    super(message);
    this.name = 'PurchaseError';
    this.code = code;
    this.underlyingErrorMessage = underlyingErrorMessage;
  }
}

// Storage keys
const CUSTOMER_INFO_KEY = 'revenuecat_customer_info';
const PURCHASE_CACHE_KEY = 'purchase_cache';
const SUBSCRIPTION_STATUS_KEY = 'subscription_status';

// Premium Product Identifiers (App Store Connect)
export const PRODUCT_IDS = {
  WEEKLY_PREMIUM: 'com.babilchat.premium.weekly',
  MONTHLY_PREMIUM: 'com.babilchat.premium.monthly',
  YEARLY_PREMIUM: 'com.babilchat.premium.yearly',
  LIFETIME_PREMIUM: 'com.babilchat.premium.lifetime',
  CREDITS_100: 'com.babilchat.credits.100',
  CREDITS_500: 'com.babilchat.credits.500',
  CREDITS_1000: 'com.babilchat.credits.1000'
} as const;

// Entitlement Identifiers
export const ENTITLEMENT_IDS = {
  PREMIUM: 'premium',
  UNLIMITED_AI: 'unlimited_ai_chat',
  OFFLINE_CONTENT: 'offline_content',
  AUDIO_RECITATIONS: 'audio_recitations',
  ADVANCED_FEATURES: 'advanced_features'
} as const;

// RevenueCat Service Class
export class RevenueCatService {
  private static instance: RevenueCatService;
  private isConfigured = false;
  private customerInfo: CustomerInfo | null = null;
  private offerings: PurchasesOffering[] = [];

  static getInstance(): RevenueCatService {
    if (!RevenueCatService.instance) {
      RevenueCatService.instance = new RevenueCatService();
    }
    return RevenueCatService.instance;
  }

  // Initialize RevenueCat
  public async configure(apiKey: string, appUserId?: string): Promise<void> {
    try {
      console.log('Configuring RevenueCat with API key:', apiKey.substring(0, 8) + '...');
      
      // Mock RevenueCat configuration
      // In production: await Purchases.configure({ apiKey, appUserId });
      
      // Load cached customer info
      await this.loadCachedCustomerInfo();
      
      // Fetch latest customer info
      await this.fetchCustomerInfo();
      
      // Load offerings
      await this.fetchOfferings();
      
      this.isConfigured = true;
      console.log('RevenueCat configured successfully');
    } catch (error) {
      console.error('RevenueCat configuration failed:', error);
      throw new PurchaseError(
        PurchaseErrorCode.UNKNOWN_ERROR,
        'RevenueCat yapılandırması başarısız oldu',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  // Get Customer Info
  public async getCustomerInfo(): Promise<CustomerInfo | null> {
    try {
      if (!this.isConfigured) {
        throw new Error('RevenueCat not configured');
      }

      // Mock customer info - in production would call RevenueCat API
      const mockCustomerInfo: CustomerInfo = {
        originalAppUserId: 'user_123',
        allPurchaseDates: {},
        firstSeen: new Date().toISOString(),
        originalApplicationVersion: '1.0.0',
        requestDate: new Date().toISOString(),
        activeSubscriptions: [],
        allPurchasedProductIdentifiers: [],
        nonSubscriptionTransactions: [],
        entitlements: {
          all: {},
          active: {}
        }
      };

      this.customerInfo = mockCustomerInfo;
      await this.cacheCustomerInfo(mockCustomerInfo);
      
      return mockCustomerInfo;
    } catch (error) {
      console.error('Error getting customer info:', error);
      return null;
    }
  }

  // Get Offerings
  public async getOfferings(): Promise<PurchasesOffering[]> {
    try {
      if (!this.isConfigured) {
        throw new Error('RevenueCat not configured');
      }

      // Mock offerings - in production would fetch from RevenueCat
      const mockOfferings: PurchasesOffering[] = [
        {
          identifier: 'default',
          serverDescription: 'Premium Subscription Options',
          metadata: {},
          availablePackages: [
            {
              identifier: PRODUCT_IDS.WEEKLY_PREMIUM,
              packageType: 'WEEKLY',
              offeringIdentifier: 'default',
              product: {
                identifier: PRODUCT_IDS.WEEKLY_PREMIUM,
                description: 'Haftalık Premium Abonelik',
                title: 'Babil Chat Premium - Haftalık',
                price: 9.99,
                priceString: '₺9,99',
                currencyCode: 'TRY',
                introPrice: {
                  price: 0,
                  priceString: 'Ücretsiz',
                  period: 'P1W',
                  cycles: 1,
                  periodUnit: 'WEEK',
                  periodNumberOfUnits: 1
                }
              }
            },
            {
              identifier: PRODUCT_IDS.MONTHLY_PREMIUM,
              packageType: 'MONTHLY',
              offeringIdentifier: 'default',
              product: {
                identifier: PRODUCT_IDS.MONTHLY_PREMIUM,
                description: 'Aylık Premium Abonelik',
                title: 'Babil Chat Premium - Aylık',
                price: 29.99,
                priceString: '₺29,99',
                currencyCode: 'TRY'
              }
            },
            {
              identifier: PRODUCT_IDS.YEARLY_PREMIUM,
              packageType: 'ANNUAL',
              offeringIdentifier: 'default',
              product: {
                identifier: PRODUCT_IDS.YEARLY_PREMIUM,
                description: 'Yıllık Premium Abonelik',
                title: 'Babil Chat Premium - Yıllık',
                price: 199.99,
                priceString: '₺199,99',
                currencyCode: 'TRY'
              }
            },
            {
              identifier: PRODUCT_IDS.LIFETIME_PREMIUM,
              packageType: 'LIFETIME',
              offeringIdentifier: 'default',
              product: {
                identifier: PRODUCT_IDS.LIFETIME_PREMIUM,
                description: 'Yaşam Boyu Premium Erişim',
                title: 'Babil Chat Premium - Yaşam Boyu',
                price: 499.99,
                priceString: '₺499,99',
                currencyCode: 'TRY'
              }
            }
          ]
        }
      ];

      this.offerings = mockOfferings;
      return mockOfferings;
    } catch (error) {
      console.error('Error getting offerings:', error);
      throw new PurchaseError(
        PurchaseErrorCode.PRODUCT_NOT_AVAILABLE,
        'Ürün bilgileri alınamadı',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  // Purchase Product
  public async purchaseProduct(productId: string): Promise<{
    customerInfo: CustomerInfo;
    productIdentifier: string;
  }> {
    try {
      if (!this.isConfigured) {
        throw new Error('RevenueCat not configured');
      }

      console.log('Starting purchase for product:', productId);

      // Mock purchase process
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay

      // Simulate purchase success
      const updatedCustomerInfo: CustomerInfo = {
        originalAppUserId: 'user_123',
        allPurchaseDates: {
          [productId]: new Date().toISOString()
        },
        firstSeen: new Date().toISOString(),
        originalApplicationVersion: '1.0.0',
        requestDate: new Date().toISOString(),
        latestExpirationDate: this.calculateExpirationDate(productId),
        originalPurchaseDate: new Date().toISOString(),
        activeSubscriptions: [productId],
        allPurchasedProductIdentifiers: [productId],
        nonSubscriptionTransactions: [],
        entitlements: {
          all: {
            [ENTITLEMENT_IDS.PREMIUM]: this.createEntitlementInfo(productId)
          },
          active: {
            [ENTITLEMENT_IDS.PREMIUM]: this.createEntitlementInfo(productId)
          }
        }
      };

      this.customerInfo = updatedCustomerInfo;
      await this.cacheCustomerInfo(updatedCustomerInfo);

      // Update premium status
      await this.updatePremiumStatus(updatedCustomerInfo);

      console.log('Purchase completed successfully:', productId);

      return {
        customerInfo: updatedCustomerInfo,
        productIdentifier: productId
      };
    } catch (error) {
      console.error('Purchase failed:', error);
      
      if (error instanceof Error && error.message.includes('cancelled')) {
        throw new PurchaseError(
          PurchaseErrorCode.PURCHASE_CANCELLED,
          'Satın alma işlemi iptal edildi'
        );
      }

      throw new PurchaseError(
        PurchaseErrorCode.UNKNOWN_ERROR,
        'Satın alma işlemi başarısız oldu',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  // Restore Purchases
  public async restorePurchases(): Promise<CustomerInfo> {
    try {
      if (!this.isConfigured) {
        throw new Error('RevenueCat not configured');
      }

      console.log('Restoring purchases...');

      // Mock restore process
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Get cached customer info or create new one
      const customerInfo = this.customerInfo || await this.getCustomerInfo();
      
      if (customerInfo && customerInfo.activeSubscriptions.length > 0) {
        await this.updatePremiumStatus(customerInfo);
        console.log('Purchases restored successfully');
      } else {
        console.log('No purchases to restore');
      }

      return customerInfo!;
    } catch (error) {
      console.error('Restore purchases failed:', error);
      throw new PurchaseError(
        PurchaseErrorCode.UNKNOWN_ERROR,
        'Satın alma geçmişi geri yüklenemedi',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  // Check Subscription Status
  public async isSubscriptionActive(entitlementId: string = ENTITLEMENT_IDS.PREMIUM): Promise<boolean> {
    try {
      const customerInfo = await this.getCustomerInfo();
      if (!customerInfo) return false;

      const entitlement = customerInfo.entitlements.active[entitlementId];
      return entitlement?.isActive || false;
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return false;
    }
  }

  // Get Subscription Status
  public async getSubscriptionStatus(): Promise<{
    isActive: boolean;
    productId?: string;
    expirationDate?: string;
    willRenew?: boolean;
  }> {
    try {
      const customerInfo = await this.getCustomerInfo();
      if (!customerInfo) {
        return { isActive: false };
      }

      const premiumEntitlement = customerInfo.entitlements.active[ENTITLEMENT_IDS.PREMIUM];
      
      if (!premiumEntitlement) {
        return { isActive: false };
      }

      return {
        isActive: premiumEntitlement.isActive,
        productId: premiumEntitlement.productIdentifier,
        expirationDate: premiumEntitlement.expirationDate,
        willRenew: premiumEntitlement.willRenew
      };
    } catch (error) {
      console.error('Error getting subscription status:', error);
      return { isActive: false };
    }
  }

  // Helper Methods
  private async loadCachedCustomerInfo(): Promise<void> {
    try {
      const cached = await AsyncStorage.getItem(CUSTOMER_INFO_KEY);
      if (cached) {
        this.customerInfo = JSON.parse(cached);
      }
    } catch (error) {
      console.error('Error loading cached customer info:', error);
    }
  }

  private async cacheCustomerInfo(customerInfo: CustomerInfo): Promise<void> {
    try {
      await AsyncStorage.setItem(CUSTOMER_INFO_KEY, JSON.stringify(customerInfo));
    } catch (error) {
      console.error('Error caching customer info:', error);
    }
  }

  private async fetchCustomerInfo(): Promise<void> {
    try {
      // Mock API call - in production would call RevenueCat
      console.log('Fetching customer info from RevenueCat...');
    } catch (error) {
      console.error('Error fetching customer info:', error);
    }
  }

  private async fetchOfferings(): Promise<void> {
    try {
      // Mock API call - in production would call RevenueCat
      console.log('Fetching offerings from RevenueCat...');
    } catch (error) {
      console.error('Error fetching offerings:', error);
    }
  }

  private calculateExpirationDate(productId: string): string {
    const now = new Date();
    
    switch (productId) {
      case PRODUCT_IDS.WEEKLY_PREMIUM:
        now.setDate(now.getDate() + 7);
        break;
      case PRODUCT_IDS.MONTHLY_PREMIUM:
        now.setMonth(now.getMonth() + 1);
        break;
      case PRODUCT_IDS.YEARLY_PREMIUM:
        now.setFullYear(now.getFullYear() + 1);
        break;
      case PRODUCT_IDS.LIFETIME_PREMIUM:
        now.setFullYear(now.getFullYear() + 100); // Lifetime
        break;
      default:
        now.setDate(now.getDate() + 30); // Default 30 days
    }
    
    return now.toISOString();
  }

  private createEntitlementInfo(productId: string): EntitlementInfo {
    const now = new Date().toISOString();
    const expirationDate = this.calculateExpirationDate(productId);
    
    return {
      identifier: ENTITLEMENT_IDS.PREMIUM,
      isActive: true,
      willRenew: productId !== PRODUCT_IDS.LIFETIME_PREMIUM,
      latestPurchaseDate: now,
      originalPurchaseDate: now,
      expirationDate: productId === PRODUCT_IDS.LIFETIME_PREMIUM ? undefined : expirationDate,
      store: 'APP_STORE',
      productIdentifier: productId,
      isSandbox: __DEV__ // Sandbox in development
    };
  }

  private async updatePremiumStatus(customerInfo: CustomerInfo): Promise<void> {
    try {
      const premiumEntitlement = customerInfo.entitlements.active[ENTITLEMENT_IDS.PREMIUM];
      
      if (premiumEntitlement?.isActive) {
        const premiumStatus: PremiumStatus = {
          isActive: true,
          tier: 'premium',
          subscriptionType: this.getSubscriptionType(premiumEntitlement.productIdentifier),
          startDate: new Date(premiumEntitlement.originalPurchaseDate),
          expirationDate: premiumEntitlement.expirationDate ? new Date(premiumEntitlement.expirationDate) : undefined,
          autoRenew: premiumEntitlement.willRenew,
          productId: premiumEntitlement.productIdentifier,
          store: 'app_store',
          originalTransactionId: premiumEntitlement.productIdentifier,
          features: {
            unlimitedAIChat: true,
            audioRecitations: true,
            offlineContent: true,
            advancedFeatures: true,
            customThemes: true,
            prioritySupport: true
          },
          usageStats: {
            aiChatCount: 0,
            downloadCount: 0,
            featureUsage: {}
          }
        };
        
        await savePremiumStatus(premiumStatus);
      }
    } catch (error) {
      console.error('Error updating premium status:', error);
    }
  }

  private getSubscriptionType(productId: string): 'weekly' | 'monthly' | 'yearly' | 'lifetime' {
    switch (productId) {
      case PRODUCT_IDS.WEEKLY_PREMIUM:
        return 'weekly';
      case PRODUCT_IDS.MONTHLY_PREMIUM:
        return 'monthly';
      case PRODUCT_IDS.YEARLY_PREMIUM:
        return 'yearly';
      case PRODUCT_IDS.LIFETIME_PREMIUM:
        return 'lifetime';
      default:
        return 'monthly';
    }
  }
}

// Export singleton instance
export const revenueCat = RevenueCatService.getInstance();

// Initialize RevenueCat
export const initializeRevenueCat = async (apiKey: string, userId?: string): Promise<void> => {
  try {
    await revenueCat.configure(apiKey, userId);
    console.log('RevenueCat initialized successfully');
  } catch (error) {
    console.error('RevenueCat initialization failed:', error);
    throw error;
  }
};

// Purchase helpers
export const purchasePremium = async (packageType: 'weekly' | 'monthly' | 'yearly' | 'lifetime'): Promise<boolean> => {
  try {
    const productId = {
      weekly: PRODUCT_IDS.WEEKLY_PREMIUM,
      monthly: PRODUCT_IDS.MONTHLY_PREMIUM,
      yearly: PRODUCT_IDS.YEARLY_PREMIUM,
      lifetime: PRODUCT_IDS.LIFETIME_PREMIUM
    }[packageType];

    await revenueCat.purchaseProduct(productId);
    return true;
  } catch (error) {
    console.error('Purchase failed:', error);
    return false;
  }
};

export const restoreAllPurchases = async (): Promise<boolean> => {
  try {
    await revenueCat.restorePurchases();
    return true;
  } catch (error) {
    console.error('Restore failed:', error);
    return false;
  }
};

export const checkPremiumStatus = async (): Promise<boolean> => {
  try {
    return await revenueCat.isSubscriptionActive();
  } catch (error) {
    console.error('Status check failed:', error);
    return false;
  }
}; 