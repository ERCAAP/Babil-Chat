import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StoreReview from 'expo-store-review';

// Storage keys for review tracking
const REVIEW_REQUESTED_KEY = 'review_requested';
const REVIEW_DECLINED_KEY = 'review_declined';
const APP_USAGE_COUNT_KEY = 'app_usage_count';
const PRAYER_COMPLETED_COUNT_KEY = 'prayer_completed_count';
const STUDY_COMPLETED_COUNT_KEY = 'study_completed_count';
const LAST_REVIEW_REQUEST_KEY = 'last_review_request';
const USER_SATISFACTION_KEY = 'user_satisfaction';

// Review trigger conditions
export interface ReviewTriggerConditions {
  minAppUsageDays: number;
  minPrayerCompletions: number;
  minStudyCompletions: number;
  minDaysBetweenRequests: number;
  userSatisfactionThreshold: number;
}

// Default review trigger conditions
export const defaultReviewConditions: ReviewTriggerConditions = {
  minAppUsageDays: 7,        // User has used app for at least 7 days
  minPrayerCompletions: 10,  // User has completed at least 10 prayers
  minStudyCompletions: 5,    // User has completed at least 5 study sessions
  minDaysBetweenRequests: 30, // Wait at least 30 days between review requests
  userSatisfactionThreshold: 4, // User satisfaction rating >= 4 out of 5
};

// User engagement events
export type EngagementEvent = 
  | 'app_opened'
  | 'prayer_completed'
  | 'study_completed'
  | 'daily_streak_achieved'
  | 'community_prayer_added'
  | 'ai_chat_helpful'
  | 'feature_discovered';

// Track user engagement for review timing
export const trackEngagement = async (event: EngagementEvent): Promise<void> => {
  try {
    switch (event) {
      case 'app_opened':
        await incrementCounter(APP_USAGE_COUNT_KEY);
        break;
      case 'prayer_completed':
        await incrementCounter(PRAYER_COMPLETED_COUNT_KEY);
        break;
      case 'study_completed':
        await incrementCounter(STUDY_COMPLETED_COUNT_KEY);
        break;
      default:
        // Store specific event for additional tracking
        await AsyncStorage.setItem(`last_${event}`, Date.now().toString());
    }
  } catch (error) {
    console.warn('Error tracking engagement:', error);
  }
};

// Increment counter utility
const incrementCounter = async (key: string): Promise<number> => {
  try {
    const current = await AsyncStorage.getItem(key);
    const count = current ? parseInt(current, 10) + 1 : 1;
    await AsyncStorage.setItem(key, count.toString());
    return count;
  } catch (error) {
    console.warn('Error incrementing counter:', error);
    return 0;
  }
};

// Get counter value
const getCounter = async (key: string): Promise<number> => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? parseInt(value, 10) : 0;
  } catch (error) {
    console.warn('Error getting counter:', error);
    return 0;
  }
};

// Check if user meets review conditions
export const shouldRequestReview = async (
  conditions: ReviewTriggerConditions = defaultReviewConditions
): Promise<boolean> => {
  try {
    // Check if already requested or declined
    const hasRequested = await AsyncStorage.getItem(REVIEW_REQUESTED_KEY);
    const hasDeclined = await AsyncStorage.getItem(REVIEW_DECLINED_KEY);
    
    if (hasRequested === 'true' || hasDeclined === 'true') {
      // Check if enough time has passed since last request
      const lastRequest = await AsyncStorage.getItem(LAST_REVIEW_REQUEST_KEY);
      if (lastRequest) {
        const daysSinceRequest = Math.floor(
          (Date.now() - parseInt(lastRequest, 10)) / (1000 * 60 * 60 * 24)
        );
        if (daysSinceRequest < conditions.minDaysBetweenRequests) {
          return false;
        }
      } else {
        return false;
      }
    }

    // Check engagement metrics
    const [appUsageCount, prayerCount, studyCount] = await Promise.all([
      getCounter(APP_USAGE_COUNT_KEY),
      getCounter(PRAYER_COMPLETED_COUNT_KEY),
      getCounter(STUDY_COMPLETED_COUNT_KEY),
    ]);

    // Check user satisfaction if available
    const satisfaction = await getUserSatisfaction();
    if (satisfaction > 0 && satisfaction < conditions.userSatisfactionThreshold) {
      return false;
    }

    // All conditions must be met
    return (
      appUsageCount >= conditions.minAppUsageDays &&
      prayerCount >= conditions.minPrayerCompletions &&
      studyCount >= conditions.minStudyCompletions
    );
  } catch (error) {
    console.warn('Error checking review conditions:', error);
    return false;
  }
};

// Request app store review
export const requestReview = async (): Promise<boolean> => {
  try {
    // Check if store review is available
    const isAvailable = await StoreReview.isAvailableAsync();
    if (!isAvailable) {
      console.warn('Store review not available');
      return false;
    }

    // Request the review
    await StoreReview.requestReview();
    
    // Mark as requested
    await Promise.all([
      AsyncStorage.setItem(REVIEW_REQUESTED_KEY, 'true'),
      AsyncStorage.setItem(LAST_REVIEW_REQUEST_KEY, Date.now().toString()),
    ]);

    return true;
  } catch (error) {
    console.warn('Error requesting review:', error);
    return false;
  }
};

// Mark review as declined by user
export const markReviewDeclined = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(REVIEW_DECLINED_KEY, 'true');
    await AsyncStorage.setItem(LAST_REVIEW_REQUEST_KEY, Date.now().toString());
  } catch (error) {
    console.warn('Error marking review declined:', error);
  }
};

// Save user satisfaction rating (1-5 stars)
export const saveUserSatisfaction = async (rating: number): Promise<void> => {
  try {
    if (rating >= 1 && rating <= 5) {
      await AsyncStorage.setItem(USER_SATISFACTION_KEY, rating.toString());
    }
  } catch (error) {
    console.warn('Error saving user satisfaction:', error);
  }
};

// Get user satisfaction rating
export const getUserSatisfaction = async (): Promise<number> => {
  try {
    const rating = await AsyncStorage.getItem(USER_SATISFACTION_KEY);
    return rating ? parseInt(rating, 10) : 0;
  } catch (error) {
    console.warn('Error getting user satisfaction:', error);
    return 0;
  }
};

// Get engagement statistics
export const getEngagementStats = async () => {
  try {
    const [appUsage, prayers, studies, satisfaction] = await Promise.all([
      getCounter(APP_USAGE_COUNT_KEY),
      getCounter(PRAYER_COMPLETED_COUNT_KEY),
      getCounter(STUDY_COMPLETED_COUNT_KEY),
      getUserSatisfaction(),
    ]);

    return {
      appUsageCount: appUsage,
      prayerCompletions: prayers,
      studyCompletions: studies,
      userSatisfaction: satisfaction,
    };
  } catch (error) {
    console.warn('Error getting engagement stats:', error);
    return {
      appUsageCount: 0,
      prayerCompletions: 0,
      studyCompletions: 0,
      userSatisfaction: 0,
    };
  }
};

// Smart review request - checks conditions and requests if appropriate
export const smartReviewRequest = async (): Promise<{
  requested: boolean;
  reason?: string;
}> => {
  try {
    const shouldRequest = await shouldRequestReview();
    
    if (!shouldRequest) {
      const stats = await getEngagementStats();
      const conditions = defaultReviewConditions;
      
      let reason = 'Conditions not met: ';
      const reasons: string[] = [];
      
      if (stats.appUsageCount < conditions.minAppUsageDays) {
        reasons.push(`need ${conditions.minAppUsageDays - stats.appUsageCount} more days`);
      }
      
      if (stats.prayerCompletions < conditions.minPrayerCompletions) {
        reasons.push(`need ${conditions.minPrayerCompletions - stats.prayerCompletions} more prayers`);
      }
      
      if (stats.studyCompletions < conditions.minStudyCompletions) {
        reasons.push(`need ${conditions.minStudyCompletions - stats.studyCompletions} more studies`);
      }
      
      reason += reasons.join(', ');
      
      return { requested: false, reason };
    }

    const success = await requestReview();
    return { 
      requested: success,
      reason: success ? 'Review requested successfully' : 'Failed to request review'
    };
  } catch (error) {
    console.warn('Error in smart review request:', error);
    return { requested: false, reason: 'Error occurred' };
  }
};

// Trigger review after positive user actions
export const triggerReviewAfterPositiveAction = async (action: EngagementEvent): Promise<void> => {
  try {
    // Track the engagement
    await trackEngagement(action);
    
    // Only trigger review for highly positive actions
    const positiveActions: EngagementEvent[] = [
      'daily_streak_achieved',
      'ai_chat_helpful',
      'prayer_completed'
    ];
    
    if (positiveActions.includes(action)) {
      const result = await smartReviewRequest();
      if (result.requested) {
        console.log('Review requested after positive action:', action);
      }
    }
  } catch (error) {
    console.warn('Error triggering review after action:', error);
  }
};

// Reset review status (for testing)
export const resetReviewStatus = async (): Promise<void> => {
  try {
    await Promise.all([
      AsyncStorage.removeItem(REVIEW_REQUESTED_KEY),
      AsyncStorage.removeItem(REVIEW_DECLINED_KEY),
      AsyncStorage.removeItem(LAST_REVIEW_REQUEST_KEY),
      AsyncStorage.removeItem(USER_SATISFACTION_KEY),
    ]);
  } catch (error) {
    console.warn('Error resetting review status:', error);
  }
};

// Get review status
export const getReviewStatus = async () => {
  try {
    const [requested, declined, lastRequest, satisfaction] = await Promise.all([
      AsyncStorage.getItem(REVIEW_REQUESTED_KEY),
      AsyncStorage.getItem(REVIEW_DECLINED_KEY),
      AsyncStorage.getItem(LAST_REVIEW_REQUEST_KEY),
      getUserSatisfaction(),
    ]);

    return {
      hasRequested: requested === 'true',
      hasDeclined: declined === 'true',
      lastRequestDate: lastRequest ? new Date(parseInt(lastRequest, 10)) : null,
      userSatisfaction: satisfaction,
      canRequestAgain: await shouldRequestReview(),
    };
  } catch (error) {
    console.warn('Error getting review status:', error);
    return {
      hasRequested: false,
      hasDeclined: false,
      lastRequestDate: null,
      userSatisfaction: 0,
      canRequestAgain: false,
    };
  }
};

export default {
  trackEngagement,
  shouldRequestReview,
  requestReview,
  markReviewDeclined,
  saveUserSatisfaction,
  getUserSatisfaction,
  getEngagementStats,
  smartReviewRequest,
  triggerReviewAfterPositiveAction,
  resetReviewStatus,
  getReviewStatus,
  defaultReviewConditions,
}; 