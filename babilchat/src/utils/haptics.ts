import * as Haptics from 'expo-haptics';

// Haptic feedback types for different interactions
export const HapticTypes = {
  // Basic impact feedback
  light: Haptics.ImpactFeedbackStyle.Light,
  medium: Haptics.ImpactFeedbackStyle.Medium,
  heavy: Haptics.ImpactFeedbackStyle.Heavy,
  
  // Notification feedback
  success: Haptics.NotificationFeedbackType.Success,
  warning: Haptics.NotificationFeedbackType.Warning,
  error: Haptics.NotificationFeedbackType.Error,
  
  // Selection feedback
  selection: 'selection' as const,
} as const;

// App-specific haptic patterns for spiritual interactions
export const SpiritualHaptics = {
  // Prayer interactions
  prayerStart: HapticTypes.light,
  prayerComplete: HapticTypes.success,
  addPrayer: HapticTypes.medium,
  
  // Verse/Study interactions
  verseRead: HapticTypes.light,
  studyComplete: HapticTypes.success,
  bookmarkAdd: HapticTypes.medium,
  
  // Navigation
  tabSwitch: HapticTypes.selection,
  pageChange: HapticTypes.light,
  
  // Actions
  buttonPress: HapticTypes.light,
  longPress: HapticTypes.medium,
  swipeAction: HapticTypes.light,
  
  // Feedback states
  successAction: HapticTypes.success,
  errorAction: HapticTypes.error,
  warningAction: HapticTypes.warning,
  
  // Special Islamic moments
  adhanTime: HapticTypes.heavy, // For prayer time notifications
  duaComplete: HapticTypes.success, // When finishing a dua
  tasbihCount: HapticTypes.light, // For tasbih counter
} as const;

// Check if haptics are supported
export const isHapticsSupported = (): boolean => {
  // Expo Haptics works on both iOS and Android
  return true;
};

// Basic haptic feedback functions
export const triggerImpactFeedback = async (
  style: Haptics.ImpactFeedbackStyle = HapticTypes.light
): Promise<void> => {
  if (!isHapticsSupported()) return;
  
  try {
    await Haptics.impactAsync(style);
  } catch (error) {
    console.warn('Haptic feedback error:', error);
  }
};

export const triggerNotificationFeedback = async (
  type: Haptics.NotificationFeedbackType
): Promise<void> => {
  if (!isHapticsSupported()) return;
  
  try {
    await Haptics.notificationAsync(type);
  } catch (error) {
    console.warn('Haptic notification error:', error);
  }
};

export const triggerSelectionFeedback = async (): Promise<void> => {
  if (!isHapticsSupported()) return;
  
  try {
    await Haptics.selectionAsync();
  } catch (error) {
    console.warn('Haptic selection error:', error);
  }
};

// Spiritual/Prayer specific haptic patterns
export const triggerPrayerHaptic = async (action: keyof typeof SpiritualHaptics): Promise<void> => {
  if (!isHapticsSupported()) return;
  
  const hapticType = SpiritualHaptics[action];
  
  try {
    if (hapticType === 'selection') {
      await triggerSelectionFeedback();
    } else if (
      hapticType === HapticTypes.success ||
      hapticType === HapticTypes.warning ||
      hapticType === HapticTypes.error
    ) {
      await triggerNotificationFeedback(hapticType);
    } else {
      await triggerImpactFeedback(hapticType);
    }
  } catch (error) {
    console.warn('Prayer haptic error:', error);
  }
};

// Custom haptic patterns for specific Islamic contexts
export const triggerAdhanHaptic = async (): Promise<void> => {
  if (!isHapticsSupported()) return;
  
  try {
    // Special pattern for prayer time: heavy, pause, light, pause, light
    await triggerImpactFeedback(HapticTypes.heavy);
    await new Promise(resolve => setTimeout(resolve, 200));
    await triggerImpactFeedback(HapticTypes.light);
    await new Promise(resolve => setTimeout(resolve, 100));
    await triggerImpactFeedback(HapticTypes.light);
  } catch (error) {
    console.warn('Adhan haptic error:', error);
  }
};

export const triggerTasbihHaptic = async (count: number): Promise<void> => {
  if (!isHapticsSupported()) return;
  
  try {
    // Special feedback for tasbih milestones
    if (count % 33 === 0) {
      // SubhanAllah, Alhamdulillah, Allahu Akbar completion
      await triggerNotificationFeedback(HapticTypes.success);
    } else if (count % 11 === 0) {
      // Every 11th count gets medium feedback
      await triggerImpactFeedback(HapticTypes.medium);
    } else {
      // Regular count gets light feedback
      await triggerImpactFeedback(HapticTypes.light);
    }
  } catch (error) {
    console.warn('Tasbih haptic error:', error);
  }
};

export const triggerDuaCompleteHaptic = async (): Promise<void> => {
  if (!isHapticsSupported()) return;
  
  try {
    // Special completion pattern: medium, pause, success
    await triggerImpactFeedback(HapticTypes.medium);
    await new Promise(resolve => setTimeout(resolve, 150));
    await triggerNotificationFeedback(HapticTypes.success);
  } catch (error) {
    console.warn('Dua complete haptic error:', error);
  }
};

// Navigation haptic helpers
export const triggerTabSwitchHaptic = async (): Promise<void> => {
  await triggerPrayerHaptic('tabSwitch');
};

export const triggerPageChangeHaptic = async (): Promise<void> => {
  await triggerPrayerHaptic('pageChange');
};

// Button interaction haptics
export const triggerButtonPressHaptic = async (): Promise<void> => {
  await triggerPrayerHaptic('buttonPress');
};

export const triggerLongPressHaptic = async (): Promise<void> => {
  await triggerPrayerHaptic('longPress');
};

// Action feedback haptics
export const triggerSuccessHaptic = async (): Promise<void> => {
  await triggerPrayerHaptic('successAction');
};

export const triggerErrorHaptic = async (): Promise<void> => {
  await triggerPrayerHaptic('errorAction');
};

export const triggerWarningHaptic = async (): Promise<void> => {
  await triggerPrayerHaptic('warningAction');
};

// Prayer Wall specific haptics
export const triggerPrayForHaptic = async (): Promise<void> => {
  await triggerPrayerHaptic('prayerComplete');
};

export const triggerAddPrayerHaptic = async (): Promise<void> => {
  await triggerPrayerHaptic('addPrayer');
};

// Study specific haptics
export const triggerVerseReadHaptic = async (): Promise<void> => {
  await triggerPrayerHaptic('verseRead');
};

export const triggerStudyCompleteHaptic = async (): Promise<void> => {
  await triggerPrayerHaptic('studyComplete');
};

export const triggerBookmarkHaptic = async (): Promise<void> => {
  await triggerPrayerHaptic('bookmarkAdd');
};

// Chat specific haptics
export const triggerMessageSentHaptic = async (): Promise<void> => {
  await triggerImpactFeedback(HapticTypes.light);
};

export const triggerMessageReceivedHaptic = async (): Promise<void> => {
  await triggerImpactFeedback(HapticTypes.light);
};

// Swipe actions
export const triggerSwipeActionHaptic = async (): Promise<void> => {
  await triggerPrayerHaptic('swipeAction');
};

// Utility function to create haptic-enabled button props
export const createHapticButtonProps = (
  onPress: () => void,
  hapticType: keyof typeof SpiritualHaptics = 'buttonPress'
) => {
  return {
    onPress: () => {
      triggerPrayerHaptic(hapticType);
      onPress();
    },
  };
};

// Utility function to create haptic-enabled long press props
export const createHapticLongPressProps = (
  onLongPress: () => void,
  hapticType: keyof typeof SpiritualHaptics = 'longPress'
) => {
  return {
    onLongPress: () => {
      triggerPrayerHaptic(hapticType);
      onLongPress();
    },
  };
};

// Settings helper to check if user has haptics enabled
export const getHapticPreference = (): boolean => {
  // This would integrate with user preferences/settings
  // For now, return true if haptics are supported
  return isHapticsSupported();
};

export default {
  HapticTypes,
  SpiritualHaptics,
  isHapticsSupported,
  triggerImpactFeedback,
  triggerNotificationFeedback,
  triggerSelectionFeedback,
  triggerPrayerHaptic,
  triggerAdhanHaptic,
  triggerTasbihHaptic,
  triggerDuaCompleteHaptic,
  triggerTabSwitchHaptic,
  triggerPageChangeHaptic,
  triggerButtonPressHaptic,
  triggerLongPressHaptic,
  triggerSuccessHaptic,
  triggerErrorHaptic,
  triggerWarningHaptic,
  triggerPrayForHaptic,
  triggerAddPrayerHaptic,
  triggerVerseReadHaptic,
  triggerStudyCompleteHaptic,
  triggerBookmarkHaptic,
  triggerMessageSentHaptic,
  triggerMessageReceivedHaptic,
  triggerSwipeActionHaptic,
  createHapticButtonProps,
  createHapticLongPressProps,
  getHapticPreference,
}; 