import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LoadingScreen from '../src/components/LoadingScreen';
import { isOnboardingCompleted } from '../src/utils/onboarding';
import { rf } from '../src/utils/responsive';

export default function AppEntryPoint() {
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkAppStatus();
  }, []);

  const checkAppStatus = async () => {
    try {
      setIsChecking(true);
      
      // Check if onboarding is completed
      const onboardingComplete = await isOnboardingCompleted();
      
      if (!onboardingComplete) {
        // Redirect to onboarding
        router.replace('/(onboarding)/welcome');
      } else {
        // Redirect to main app
        router.replace('/(tabs)');
      }
      
    } catch (error) {
      console.error('Error checking app status:', error);
      // Default to onboarding if there's an error
      router.replace('/(onboarding)/welcome');
    } finally {
      setIsChecking(false);
    }
  };

  if (isChecking) {
    return <LoadingScreen text="Uygulama başlatılıyor..." />;
  }

  // This should rarely be reached since we're redirecting
  return (
    <LinearGradient colors={['#0f0f23', '#1a1a2e', '#16213e']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{
          fontSize: rf(18),
          color: '#ffffff',
          textAlign: 'center'
        }}>
          Hidayet yükleniyor...
        </Text>
      </SafeAreaView>
    </LinearGradient>
  );
}
