import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAnalytics } from 'firebase/analytics';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with platform-specific persistence
import { getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { Platform } from 'react-native';

export const auth = Platform.OS === 'web' 
  ? getAuth(app)
  : initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
export const db = getFirestore(app);
export const messaging = getMessaging(app);
export const analytics = getAnalytics(app);

// Notification token management
export const getFCMToken = async () => {
  try {
    const token = await getToken(messaging, {
      vapidKey: process.env.EXPO_PUBLIC_FIREBASE_VAPID_KEY
    });
    
    if (token) {
      // Store token locally
      await AsyncStorage.setItem('fcm_token', token);
      
      // Send token to your backend
      await sendTokenToServer(token);
      
      return token;
    }
  } catch (error) {
    console.error('FCM Token Error:', error);
    return null;
  }
};

// Send FCM token to backend
const sendTokenToServer = async (token) => {
  try {
    const authToken = await AsyncStorage.getItem('hidayet_auth_token');
    if (!authToken) return;

    await fetch('https://api.hidayet.app/v1/users/fcm-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ fcmToken: token })
    });
  } catch (error) {
    console.error('Send FCM token error:', error);
  }
};

// Listen for foreground messages
export const onForegroundMessage = (callback) => {
  return onMessage(messaging, callback);
};

// Analytics helper functions
export const logEvent = (eventName, parameters) => {
  try {
    analytics.logEvent(eventName, parameters);
  } catch (error) {
    console.error('Analytics error:', error);
  }
};

// Prayer-specific analytics
export const logPrayerEvent = (prayerType, action) => {
  logEvent('prayer_interaction', {
    prayer_type: prayerType,
    action: action,
    timestamp: new Date().toISOString()
  });
};

// Reading progress analytics
export const logReadingProgress = (contentType, duration, completion) => {
  logEvent('reading_progress', {
    content_type: contentType,
    reading_duration: duration,
    completion_percentage: completion,
    timestamp: new Date().toISOString()
  });
};

// User engagement analytics
export const logUserEngagement = (feature, duration) => {
  logEvent('user_engagement', {
    feature: feature,
    engagement_duration: duration,
    timestamp: new Date().toISOString()
  });
};

// Firebase connection test
export const testFirebaseConnection = async () => {
  try {
    // Test Firestore connection
    const testDoc = db.collection('test').doc('connection');
    await testDoc.set({ timestamp: new Date().toISOString() });
    console.log('✅ Firebase bağlantısı başarılı!');
    return true;
  } catch (error) {
    console.error('❌ Firebase bağlantı hatası:', error);
    return false;
  }
};

export default app; 