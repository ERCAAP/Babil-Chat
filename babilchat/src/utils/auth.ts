import AsyncStorage from '@react-native-async-storage/async-storage';

// Authentication storage keys
const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';
const AUTH_REFRESH_TOKEN_KEY = 'refresh_token';

export interface User {
  id: string;
  email: string;
  name: string;
  profilePhoto?: string;
  isAnonymous: boolean;
  createdAt: Date;
  lastLoginAt: Date;
  preferences: {
    language: string;
    notifications: boolean;
    prayerReminders: boolean;
    location?: {
      latitude: number;
      longitude: number;
      city: string;
      country: string;
    };
  };
  subscription: {
    isPremium: boolean;
    tier: 'free' | 'basic' | 'premium' | 'ultimate';
    expiresAt?: Date;
  };
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  refreshToken: string | null;
}

// Get authentication token
export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Save authentication token
export const saveAuthToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch (error) {
    console.error('Error saving auth token:', error);
    throw error;
  }
};

// Get refresh token
export const getRefreshToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(AUTH_REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting refresh token:', error);
    return null;
  }
};

// Save refresh token
export const saveRefreshToken = async (refreshToken: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(AUTH_REFRESH_TOKEN_KEY, refreshToken);
  } catch (error) {
    console.error('Error saving refresh token:', error);
    throw error;
  }
};

// Get user data
export const getUserData = async (): Promise<User | null> => {
  try {
    const userData = await AsyncStorage.getItem(USER_DATA_KEY);
    if (!userData) return null;
    
    const parsed = JSON.parse(userData);
    return {
      ...parsed,
      createdAt: new Date(parsed.createdAt),
      lastLoginAt: new Date(parsed.lastLoginAt),
      subscription: {
        ...parsed.subscription,
        expiresAt: parsed.subscription.expiresAt ? new Date(parsed.subscription.expiresAt) : undefined
      }
    };
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

// Save user data
export const saveUserData = async (user: User): Promise<void> => {
  try {
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user data:', error);
    throw error;
  }
};

// Create anonymous user
export const createAnonymousUser = (): User => {
  const now = new Date();
  return {
    id: `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    email: '',
    name: 'Misafir Kullanıcı',
    isAnonymous: true,
    createdAt: now,
    lastLoginAt: now,
    preferences: {
      language: 'tr',
      notifications: true,
      prayerReminders: true,
    },
    subscription: {
      isPremium: false,
      tier: 'free'
    }
  };
};

// Initialize anonymous session
export const initializeAnonymousSession = async (): Promise<User> => {
  try {
    let user = await getUserData();
    
    if (!user) {
      user = createAnonymousUser();
      await saveUserData(user);
    }
    
    // Update last login
    user.lastLoginAt = new Date();
    await saveUserData(user);
    
    return user;
  } catch (error) {
    console.error('Error initializing anonymous session:', error);
    throw error;
  }
};

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const token = await getAuthToken();
    const user = await getUserData();
    
    return !!(token || (user && user.isAnonymous));
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

// Get current auth state
export const getAuthState = async (): Promise<AuthState> => {
  try {
    const token = await getAuthToken();
    const refreshToken = await getRefreshToken();
    const user = await getUserData();
    
    return {
      isAuthenticated: !!(token || (user && user.isAnonymous)),
      user,
      token,
      refreshToken
    };
  } catch (error) {
    console.error('Error getting auth state:', error);
    return {
      isAuthenticated: false,
      user: null,
      token: null,
      refreshToken: null
    };
  }
};

// Logout user
export const logout = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      AUTH_TOKEN_KEY,
      USER_DATA_KEY,
      AUTH_REFRESH_TOKEN_KEY
    ]);
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
};

// Update user preferences
export const updateUserPreferences = async (preferences: Partial<User['preferences']>): Promise<void> => {
  try {
    const user = await getUserData();
    if (!user) throw new Error('No user found');
    
    const updatedUser: User = {
      ...user,
      preferences: {
        ...user.preferences,
        ...preferences
      }
    };
    
    await saveUserData(updatedUser);
  } catch (error) {
    console.error('Error updating user preferences:', error);
    throw error;
  }
};

// Update subscription status
export const updateSubscription = async (subscription: Partial<User['subscription']>): Promise<void> => {
  try {
    const user = await getUserData();
    if (!user) throw new Error('No user found');
    
    const updatedUser: User = {
      ...user,
      subscription: {
        ...user.subscription,
        ...subscription
      }
    };
    
    await saveUserData(updatedUser);
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
};

// Validate token (mock implementation)
export const validateToken = async (token: string): Promise<boolean> => {
  try {
    // In a real implementation, this would make an API call to validate the token
    // For now, we'll just check if it exists and is not expired
    if (!token) return false;
    
    // Mock token validation logic
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) return false;
    
    // In real implementation, decode JWT and check expiration
    return true;
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
};

// Refresh authentication token
export const refreshAuthToken = async (): Promise<string | null> => {
  try {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) return null;
    
    // Mock API call to refresh token
    // In real implementation, this would make an API call
    const newToken = `new_token_${Date.now()}`;
    await saveAuthToken(newToken);
    
    return newToken;
  } catch (error) {
    console.error('Error refreshing auth token:', error);
    return null;
  }
};

// Initialize authentication system
export const initializeAuth = async (): Promise<AuthState> => {
  try {
    const authState = await getAuthState();
    
    if (!authState.isAuthenticated) {
      // Create anonymous user if no authentication exists
      const anonymousUser = await initializeAnonymousSession();
      return {
        isAuthenticated: true,
        user: anonymousUser,
        token: null,
        refreshToken: null
      };
    }
    
    return authState;
  } catch (error) {
    console.error('Error initializing auth:', error);
    // Fallback to anonymous user
    const anonymousUser = createAnonymousUser();
    await saveUserData(anonymousUser);
    
    return {
      isAuthenticated: true,
      user: anonymousUser,
      token: null,
      refreshToken: null
    };
  }
}; 