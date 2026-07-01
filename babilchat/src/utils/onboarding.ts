import AsyncStorage from '@react-native-async-storage/async-storage';

// Onboarding storage keys
const ONBOARDING_COMPLETED_KEY = 'onboarding_completed';
const ONBOARDING_STEP_KEY = 'onboarding_current_step';
const ONBOARDING_PREFERENCES_KEY = 'onboarding_preferences';

// Onboarding steps
export const ONBOARDING_STEPS = [
  'welcome',
  'language',
  'location', 
  'notifications',
  'features',
  'complete'
] as const;

export type OnboardingStep = typeof ONBOARDING_STEPS[number];

export interface OnboardingPreferences {
  language: string;
  location: {
    latitude?: number;
    longitude?: number;
    city?: string;
    country?: string;
    enabled: boolean;
  };
  notifications: {
    prayerTimes: boolean;
    dailyVerse: boolean;
    general: boolean;
  };
  completedAt: Date;
}

// Check if onboarding is completed
export const isOnboardingCompleted = async (): Promise<boolean> => {
  try {
    const completed = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
    return completed === 'true';
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }
};

// Get current onboarding step
export const getCurrentOnboardingStep = async (): Promise<OnboardingStep> => {
  try {
    const step = await AsyncStorage.getItem(ONBOARDING_STEP_KEY);
    if (step && ONBOARDING_STEPS.includes(step as OnboardingStep)) {
      return step as OnboardingStep;
    }
    return 'welcome';
  } catch (error) {
    console.error('Error getting onboarding step:', error);
    return 'welcome';
  }
};

// Set current onboarding step
export const setCurrentOnboardingStep = async (step: OnboardingStep): Promise<void> => {
  try {
    await AsyncStorage.setItem(ONBOARDING_STEP_KEY, step);
  } catch (error) {
    console.error('Error setting onboarding step:', error);
    throw error;
  }
};

// Get onboarding preferences
export const getOnboardingPreferences = async (): Promise<Partial<OnboardingPreferences>> => {
  try {
    const preferences = await AsyncStorage.getItem(ONBOARDING_PREFERENCES_KEY);
    if (!preferences) return {};
    
    const parsed = JSON.parse(preferences);
    return {
      ...parsed,
      completedAt: parsed.completedAt ? new Date(parsed.completedAt) : undefined
    };
  } catch (error) {
    console.error('Error getting onboarding preferences:', error);
    return {};
  }
};

// Save onboarding preferences
export const saveOnboardingPreferences = async (preferences: Partial<OnboardingPreferences>): Promise<void> => {
  try {
    const existing = await getOnboardingPreferences();
    const updated = {
      ...existing,
      ...preferences
    };
    
    await AsyncStorage.setItem(ONBOARDING_PREFERENCES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving onboarding preferences:', error);
    throw error;
  }
};

// Complete onboarding
export const completeOnboarding = async (): Promise<void> => {
  try {
    const preferences = await getOnboardingPreferences();
    const finalPreferences: OnboardingPreferences = {
      language: preferences.language || 'tr',
      location: preferences.location || {
        enabled: false
      },
      notifications: preferences.notifications || {
        prayerTimes: true,
        dailyVerse: true,
        general: true
      },
      completedAt: new Date()
    };
    
    // Save final preferences
    await AsyncStorage.setItem(ONBOARDING_PREFERENCES_KEY, JSON.stringify(finalPreferences));
    
    // Mark onboarding as completed
    await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
    
    // Clear current step
    await AsyncStorage.removeItem(ONBOARDING_STEP_KEY);
    
  } catch (error) {
    console.error('Error completing onboarding:', error);
    throw error;
  }
};

// Reset onboarding (for development/testing)
export const resetOnboarding = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      ONBOARDING_COMPLETED_KEY,
      ONBOARDING_STEP_KEY,
      ONBOARDING_PREFERENCES_KEY
    ]);
  } catch (error) {
    console.error('Error resetting onboarding:', error);
    throw error;
  }
};

// Get next onboarding step
export const getNextOnboardingStep = (currentStep: OnboardingStep): OnboardingStep | null => {
  const currentIndex = ONBOARDING_STEPS.indexOf(currentStep);
  if (currentIndex === -1 || currentIndex === ONBOARDING_STEPS.length - 1) {
    return null;
  }
  return ONBOARDING_STEPS[currentIndex + 1];
};

// Get previous onboarding step
export const getPreviousOnboardingStep = (currentStep: OnboardingStep): OnboardingStep | null => {
  const currentIndex = ONBOARDING_STEPS.indexOf(currentStep);
  if (currentIndex <= 0) {
    return null;
  }
  return ONBOARDING_STEPS[currentIndex - 1];
};

// Calculate onboarding progress
export const getOnboardingProgress = (currentStep: OnboardingStep): number => {
  const currentIndex = ONBOARDING_STEPS.indexOf(currentStep);
  if (currentIndex === -1) return 0;
  
  return (currentIndex + 1) / ONBOARDING_STEPS.length;
};

// Save language preference
export const saveLanguagePreference = async (language: string): Promise<void> => {
  try {
    await saveOnboardingPreferences({ language });
  } catch (error) {
    console.error('Error saving language preference:', error);
    throw error;
  }
};

// Save location preference
export const saveLocationPreference = async (location: OnboardingPreferences['location']): Promise<void> => {
  try {
    await saveOnboardingPreferences({ location });
  } catch (error) {
    console.error('Error saving location preference:', error);
    throw error;
  }
};

// Save notification preferences
export const saveNotificationPreferences = async (notifications: OnboardingPreferences['notifications']): Promise<void> => {
  try {
    await saveOnboardingPreferences({ notifications });
  } catch (error) {
    console.error('Error saving notification preferences:', error);
    throw error;
  }
};

// Initialize onboarding flow
export const initializeOnboarding = async (): Promise<OnboardingStep> => {
  try {
    const isCompleted = await isOnboardingCompleted();
    
    if (isCompleted) {
      return 'complete';
    }
    
    const currentStep = await getCurrentOnboardingStep();
    return currentStep;
  } catch (error) {
    console.error('Error initializing onboarding:', error);
    return 'welcome';
  }
}; 