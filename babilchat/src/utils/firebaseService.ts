import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    createUserWithEmailAndPassword,
    deleteUser,
    onAuthStateChanged,
    sendPasswordResetEmail,
    signInAnonymously,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
    User
} from 'firebase/auth';
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    limit,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where
} from 'firebase/firestore';
import { auth, db } from '../../firebase.config';
import { getUserData } from './auth';

// Firebase User Profile Interface
export interface FirebaseUserProfile {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  isAnonymous: boolean;
  createdAt: Date;
  lastLoginAt: Date;
  preferences: {
    language: string;
    theme: 'light' | 'dark';
    notifications: boolean;
    prayerReminders: boolean;
    calculationMethod: string;
  };
  subscription: {
    isPremium: boolean;
    tier: 'free' | 'premium' | 'ultimate';
    expiresAt?: Date;
    autoRenew: boolean;
  };
  stats: {
    totalPrayers: number;
    totalReadings: number;
    totalStudySessions: number;
    currentStreak: number;
    joinedAt: Date;
  };
}

// Dua Request for Firebase
export interface FirebaseDuaRequest {
  id?: string;
  userId: string;
  userDisplayName: string;
  title: string;
  description: string;
  category: string;
  isAnonymous: boolean;
  isUrgent: boolean;
  status: 'active' | 'fulfilled' | 'closed';
  privacy: 'public' | 'community' | 'private';
  createdAt: any; // Firebase Timestamp
  updatedAt: any; // Firebase Timestamp
  duaCount: number;
  comments: string[];
  tags: string[];
  location?: {
    city: string;
    country: string;
  };
}

// Chat Message for Firebase
export interface FirebaseChatMessage {
  id?: string;
  sessionId: string;
  userId: string;
  text: string;
  isUser: boolean;
  type?: 'verse' | 'hadith' | 'advice' | 'dua';
  metadata?: {
    verseReference?: string;
    hadithReference?: string;
    confidence?: number;
    language?: string;
  };
  createdAt: any; // Firebase Timestamp
}

// Storage keys
const USER_PROFILE_CACHE_KEY = 'firebase_user_profile_cache';
const LAST_SYNC_KEY = 'firebase_last_sync';

// Authentication Service
export class FirebaseAuthService {
  private static instance: FirebaseAuthService;
  private authStateCallbacks: ((user: User | null) => void)[] = [];
  private currentUser: User | null = null;

  static getInstance(): FirebaseAuthService {
    if (!FirebaseAuthService.instance) {
      FirebaseAuthService.instance = new FirebaseAuthService();
    }
    return FirebaseAuthService.instance;
  }

  constructor() {
    this.initializeAuthListener();
  }

  private initializeAuthListener(): void {
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      this.authStateCallbacks.forEach(callback => callback(user));
      
      if (user) {
        this.syncUserProfile(user);
      }
    });
  }

  // Auth state management
  public onAuthStateChange(callback: (user: User | null) => void): () => void {
    this.authStateCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.authStateCallbacks = this.authStateCallbacks.filter(cb => cb !== callback);
    };
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Anonymous Sign In
  public async signInAnonymously(): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const result = await signInAnonymously(auth);
      
      // Create user profile
      await this.createUserProfile(result.user, {
        displayName: 'Anonim Kullanıcı',
        isAnonymous: true,
        preferences: {
          language: 'tr',
          theme: 'dark',
          notifications: true,
          prayerReminders: true,
          calculationMethod: 'turkey'
        }
      });
      
      return { success: true, user: result.user };
    } catch (error) {
      console.error('Anonymous sign in error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Giriş yapılamadı' 
      };
    }
  }

  // Email/Password Sign Up
  public async signUpWithEmail(
    email: string, 
    password: string, 
    displayName: string
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name
      await updateProfile(result.user, { displayName });
      
      // Create user profile
      await this.createUserProfile(result.user, {
        displayName,
        email,
        isAnonymous: false,
        preferences: {
          language: 'tr',
          theme: 'dark',
          notifications: true,
          prayerReminders: true,
          calculationMethod: 'turkey'
        }
      });
      
      return { success: true, user: result.user };
    } catch (error) {
      console.error('Email sign up error:', error);
      return { 
        success: false, 
        error: this.getFirebaseErrorMessage(error) 
      };
    }
  }

  // Email/Password Sign In
  public async signInWithEmail(
    email: string, 
    password: string
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Update last login
      await this.updateUserLastLogin(result.user.uid);
      
      return { success: true, user: result.user };
    } catch (error) {
      console.error('Email sign in error:', error);
      return { 
        success: false, 
        error: this.getFirebaseErrorMessage(error) 
      };
    }
  }

  // Sign Out
  public async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem(USER_PROFILE_CACHE_KEY);
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Çıkış yapılamadı' 
      };
    }
  }

  // Password Reset
  public async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
      return { 
        success: false, 
        error: this.getFirebaseErrorMessage(error) 
      };
    }
  }

  // Delete Account
  public async deleteAccount(): Promise<{ success: boolean; error?: string }> {
    try {
      const user = this.currentUser;
      if (!user) {
        throw new Error('Kullanıcı bulunamadı');
      }

      // Delete user profile from Firestore
      await deleteDoc(doc(db, 'users', user.uid));
      
      // Delete user from Firebase Auth
      await deleteUser(user);
      
      // Clear local cache
      await AsyncStorage.removeItem(USER_PROFILE_CACHE_KEY);
      
      return { success: true };
    } catch (error) {
      console.error('Delete account error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Hesap silinemedi' 
      };
    }
  }

  // User Profile Management
  private async createUserProfile(
    user: User, 
    additionalData: Partial<FirebaseUserProfile>
  ): Promise<void> {
    try {
      const userProfile: FirebaseUserProfile = {
        uid: user.uid,
        email: user.email || undefined,
        displayName: user.displayName || additionalData.displayName || 'Kullanıcı',
        photoURL: user.photoURL || undefined,
        isAnonymous: user.isAnonymous,
        createdAt: new Date(),
        lastLoginAt: new Date(),
        preferences: {
          language: 'tr',
          theme: 'dark',
          notifications: true,
          prayerReminders: true,
          calculationMethod: 'turkey',
          ...additionalData.preferences
        },
        subscription: {
          isPremium: false,
          tier: 'free',
          autoRenew: false,
          ...additionalData.subscription
        },
        stats: {
          totalPrayers: 0,
          totalReadings: 0,
          totalStudySessions: 0,
          currentStreak: 0,
          joinedAt: new Date(),
          ...additionalData.stats
        }
      };

      await setDoc(doc(db, 'users', user.uid), {
        ...userProfile,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        'stats.joinedAt': serverTimestamp()
      });

      // Cache locally
      await AsyncStorage.setItem(USER_PROFILE_CACHE_KEY, JSON.stringify(userProfile));
    } catch (error) {
      console.error('Error creating user profile:', error);
    }
  }

  private async syncUserProfile(user: User): Promise<void> {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        const profile = userDoc.data() as FirebaseUserProfile;
        await AsyncStorage.setItem(USER_PROFILE_CACHE_KEY, JSON.stringify(profile));
      } else {
        // Create profile if doesn't exist
        await this.createUserProfile(user, {});
      }
    } catch (error) {
      console.error('Error syncing user profile:', error);
    }
  }

  private async updateUserLastLogin(uid: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', uid), {
        lastLoginAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  }

  private getFirebaseErrorMessage(error: any): string {
    const errorCode = error.code;
    
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı';
      case 'auth/wrong-password':
        return 'Hatalı şifre';
      case 'auth/email-already-in-use':
        return 'Bu e-posta adresi zaten kullanımda';
      case 'auth/weak-password':
        return 'Şifre çok zayıf, en az 6 karakter olmalı';
      case 'auth/invalid-email':
        return 'Geçersiz e-posta adresi';
      case 'auth/too-many-requests':
        return 'Çok fazla deneme yapıldı, lütfen daha sonra tekrar deneyin';
      case 'auth/network-request-failed':
        return 'İnternet bağlantınızı kontrol edin';
      default:
        return error.message || 'Bilinmeyen bir hata oluştu';
    }
  }
}

// Firestore Data Service
export class FirebaseDataService {
  private static instance: FirebaseDataService;

  static getInstance(): FirebaseDataService {
    if (!FirebaseDataService.instance) {
      FirebaseDataService.instance = new FirebaseDataService();
    }
    return FirebaseDataService.instance;
  }

  // User Profile Operations
  public async getUserProfile(uid: string): Promise<FirebaseUserProfile | null> {
    try {
      // Try cache first
      const cached = await AsyncStorage.getItem(USER_PROFILE_CACHE_KEY);
      if (cached) {
        const profile = JSON.parse(cached);
        if (profile.uid === uid) {
          return profile;
        }
      }

      // Fetch from Firestore
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const profile = userDoc.data() as FirebaseUserProfile;
        await AsyncStorage.setItem(USER_PROFILE_CACHE_KEY, JSON.stringify(profile));
        return profile;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  public async updateUserProfile(
    uid: string, 
    updates: Partial<FirebaseUserProfile>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await updateDoc(doc(db, 'users', uid), {
        ...updates,
        updatedAt: serverTimestamp()
      });

      // Update cache
      const cached = await AsyncStorage.getItem(USER_PROFILE_CACHE_KEY);
      if (cached) {
        const profile = JSON.parse(cached);
        const updatedProfile = { ...profile, ...updates };
        await AsyncStorage.setItem(USER_PROFILE_CACHE_KEY, JSON.stringify(updatedProfile));
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating user profile:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Profil güncellenemedi' 
      };
    }
  }

  // Dua Requests Operations
  public async createDuaRequest(
    duaRequest: Omit<FirebaseDuaRequest, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const docRef = await addDoc(collection(db, 'duaRequests'), {
        ...duaRequest,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error creating dua request:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Dua talebi oluşturulamadı' 
      };
    }
  }

  public async getDuaRequests(
    filters?: {
      category?: string;
      status?: string;
      userId?: string;
      limit?: number;
    }
  ): Promise<FirebaseDuaRequest[]> {
    try {
      let q = query(
        collection(db, 'duaRequests'),
        orderBy('createdAt', 'desc')
      );

      if (filters?.category) {
        q = query(q, where('category', '==', filters.category));
      }

      if (filters?.status) {
        q = query(q, where('status', '==', filters.status));
      }

      if (filters?.userId) {
        q = query(q, where('userId', '==', filters.userId));
      }

      if (filters?.limit) {
        q = query(q, limit(filters.limit));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as FirebaseDuaRequest));
    } catch (error) {
      console.error('Error getting dua requests:', error);
      return [];
    }
  }

  public async updateDuaRequest(
    id: string,
    updates: Partial<FirebaseDuaRequest>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await updateDoc(doc(db, 'duaRequests', id), {
        ...updates,
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating dua request:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Dua talebi güncellenemedi' 
      };
    }
  }

  // Real-time subscriptions
  public subscribeToDuaRequests(
    callback: (duaRequests: FirebaseDuaRequest[]) => void,
    filters?: {
      category?: string;
      status?: string;
      limit?: number;
    }
  ): () => void {
    try {
      let q = query(
        collection(db, 'duaRequests'),
        orderBy('createdAt', 'desc')
      );

      if (filters?.category) {
        q = query(q, where('category', '==', filters.category));
      }

      if (filters?.status) {
        q = query(q, where('status', '==', filters.status));
      }

      if (filters?.limit) {
        q = query(q, limit(filters.limit));
      }

      return onSnapshot(q, (snapshot) => {
        const duaRequests = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as FirebaseDuaRequest));
        
        callback(duaRequests);
      });
    } catch (error) {
      console.error('Error subscribing to dua requests:', error);
      return () => {};
    }
  }

  // Chat Messages Operations
  public async saveChatMessage(
    message: Omit<FirebaseChatMessage, 'id' | 'createdAt'>
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const docRef = await addDoc(collection(db, 'chatMessages'), {
        ...message,
        createdAt: serverTimestamp()
      });

      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error saving chat message:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Mesaj kaydedilemedi' 
      };
    }
  }

  public async getChatHistory(
    userId: string,
    sessionId?: string,
    limitCount: number = 50
  ): Promise<FirebaseChatMessage[]> {
    try {
      let q = query(
        collection(db, 'chatMessages'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      if (sessionId) {
        q = query(q, where('sessionId', '==', sessionId));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as FirebaseChatMessage)).reverse(); // Reverse to get chronological order
    } catch (error) {
      console.error('Error getting chat history:', error);
      return [];
    }
  }
}

// Export singleton instances
export const firebaseAuth = FirebaseAuthService.getInstance();
export const firebaseData = FirebaseDataService.getInstance();

// Initialize Firebase services
export const initializeFirebaseServices = async (): Promise<void> => {
  try {
    console.log('Firebase services initialized');
    
    // Check if user is already authenticated
    const user = firebaseAuth.getCurrentUser();
    if (!user) {
      // Sign in anonymously if no user
      await firebaseAuth.signInAnonymously();
    }
  } catch (error) {
    console.error('Error initializing Firebase services:', error);
  }
};

// Sync local data with Firebase
export const syncLocalDataWithFirebase = async (): Promise<void> => {
  try {
    const user = firebaseAuth.getCurrentUser();
    if (!user) return;

    // Get local user data
    const localUserData = await getUserData();
    if (!localUserData) return;

    // Update Firebase profile with local data
    await firebaseData.updateUserProfile(user.uid, {
      preferences: localUserData.preferences,
      subscription: localUserData.subscription,
      stats: {
        totalPrayers: localUserData.stats?.totalPrayers || 0,
        totalReadings: localUserData.stats?.totalReadings || 0,
        totalStudySessions: localUserData.stats?.totalStudySessions || 0,
        currentStreak: localUserData.stats?.currentStreak || 0,
        joinedAt: localUserData.stats?.joinedAt || new Date()
      }
    });

    // Mark sync complete
    await AsyncStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
    
    console.log('Local data synced with Firebase');
  } catch (error) {
    console.error('Error syncing local data with Firebase:', error);
  }
}; 