import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function OnboardingLayout() {
  return (
    <>
      <StatusBar style="light" backgroundColor="#0f0f23" />
      <Stack
        screenOptions={{
          headerShown: false,
          gestureEnabled: false, // Prevent back swipe during onboarding
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="welcome" />
        <Stack.Screen name="language" />
        <Stack.Screen name="location" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="features" />
        <Stack.Screen name="complete" />
      </Stack>
    </>
  );
} 