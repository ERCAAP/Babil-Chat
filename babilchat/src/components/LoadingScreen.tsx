import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { hp, rf, wp } from '../utils/responsive';

// Loading Screen Props
interface LoadingScreenProps {
  isVisible: boolean;
  loadingText?: string;
  subText?: string;
  progress?: number; // 0-100
  showProgress?: boolean;
  animationType?: 'loading' | 'celebration' | 'dots' | 'fade';
  onLoadingComplete?: () => void;
  backgroundColor?: string[];
  textColor?: string;
  duration?: number; // milliseconds
}

// Default Props
const defaultProps: Partial<LoadingScreenProps> = {
  loadingText: 'Hidayet yükleniyor...',
  subText: 'Manevi yolculuğunuza hazırlanıyoruz',
  showProgress: false,
  animationType: 'loading',
  backgroundColor: ['#0f0f23', '#1a1a2e', '#16213e'],
  textColor: '#ffffff',
  duration: 3000
};

const LoadingScreen: React.FC<LoadingScreenProps> = (props) => {
  const {
    isVisible,
    loadingText,
    subText,
    progress = 0,
    showProgress,
    animationType,
    onLoadingComplete,
    backgroundColor,
    textColor,
    duration
  } = { ...defaultProps, ...props };

  // Animation values
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const progressValue = useSharedValue(0);
  const dotAnimation = useSharedValue(0);

  // State
  const [currentMessage, setCurrentMessage] = useState(loadingText);
  const [messageIndex, setMessageIndex] = useState(0);

  // Loading messages array
  const loadingMessages = [
    'Hidayet yükleniyor...',
    'Namaz vakitleri hesaplanıyor...',
    'Günlük ayetler hazırlanıyor...',
    'AI rehber aktifleştiriliyor...',
    'Son dokunuşlar yapılıyor...'
  ];

  // Handle visibility change
  useEffect(() => {
    if (isVisible) {
      // Fade in
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withTiming(1, { duration: 300 });
      
      // Start progress animation if needed
      if (showProgress) {
        progressValue.value = withTiming(progress / 100, { duration: 500 });
      }
      
      // Start dot animation
      dotAnimation.value = withRepeat(
        withTiming(1, { duration: 1000 }),
        -1,
        true
      );
      
      // Start message rotation
      startMessageRotation();
    } else {
      // Fade out
      opacity.value = withTiming(0, { duration: 300 });
      scale.value = withTiming(0.8, { duration: 300 });
      
      // Reset animations
      progressValue.value = 0;
      dotAnimation.value = 0;
    }
  }, [isVisible, progress, showProgress]);

  // Auto-hide after duration
  useEffect(() => {
    if (isVisible && duration && onLoadingComplete) {
      const timer = setTimeout(() => {
        onLoadingComplete();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onLoadingComplete]);

  // Message rotation
  const startMessageRotation = useCallback(() => {
    if (!isVisible) return;
    
    const interval = setInterval(() => {
      setMessageIndex((prev) => {
        const next = (prev + 1) % loadingMessages.length;
        setCurrentMessage(loadingMessages[next]);
        return next;
      });
    }, 2000);
    
    return () => clearInterval(interval);
  }, [isVisible, loadingMessages]);

  // Animated styles
  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }]
  }));

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${interpolate(progressValue.value, [0, 1], [0, 100])}%`
  }));

  const dotStyle = useAnimatedStyle(() => ({
    opacity: interpolate(dotAnimation.value, [0, 0.5, 1], [0.3, 1, 0.3])
  }));

  // Render different animation types
  const renderAnimation = () => {
    switch (animationType) {
      case 'celebration':
        return (
          <LottieView
            source={require('../../assets/animations/celebration.json')}
            autoPlay
            loop
            style={{
              width: wp(40),
              height: wp(40)
            }}
            resizeMode="contain"
          />
        );
      
      case 'loading':
        return (
          <LottieView
            source={require('../../assets/animations/loading.json')}
            autoPlay
            loop
            style={{
              width: wp(30),
              height: wp(30)
            }}
            resizeMode="contain"
          />
        );
      
      case 'dots':
        return (
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {[0, 1, 2].map((index) => (
              <Animated.View
                key={index}
                style={[
                  {
                    width: wp(3),
                    height: wp(3),
                    borderRadius: wp(1.5),
                    backgroundColor: textColor,
                    marginHorizontal: wp(1)
                  },
                  dotStyle
                ]}
              />
            ))}
          </View>
        );
      
      case 'fade':
      default:
        return (
          <View style={{
            width: wp(20),
            height: wp(20),
            borderRadius: wp(10),
            backgroundColor: 'rgba(139, 92, 246, 0.2)',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <View style={{
              width: wp(10),
              height: wp(10),
              borderRadius: wp(5),
              backgroundColor: '#8b5cf6'
            }} />
          </View>
        );
    }
  };

  // Don't render if not visible
  if (!isVisible) return null;

  return (
    <View style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999
    }}>
      <LinearGradient
        colors={backgroundColor || ['#0f0f23', '#1a1a2e', '#16213e']}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <Animated.View style={[
            {
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: wp(8)
            },
            containerStyle
          ]}>
            {/* Animation */}
            <View style={{
              alignItems: 'center',
              marginBottom: hp(4)
            }}>
              {renderAnimation()}
            </View>

            {/* Main Loading Text */}
            <Text style={{
              fontSize: rf(20),
              fontWeight: '600',
              color: textColor,
              textAlign: 'center',
              marginBottom: hp(2)
            }}>
              {currentMessage}
            </Text>

            {/* Sub Text */}
            {subText && (
              <Text style={{
                fontSize: rf(14),
                color: `${textColor}80`,
                textAlign: 'center',
                marginBottom: hp(4),
                lineHeight: rf(20)
              }}>
                {subText}
              </Text>
            )}

            {/* Progress Bar */}
            {showProgress && (
              <View style={{
                width: wp(70),
                height: hp(0.5),
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: hp(0.25),
                overflow: 'hidden',
                marginBottom: hp(2)
              }}>
                <Animated.View style={[
                  {
                    height: '100%',
                    backgroundColor: '#8b5cf6',
                    borderRadius: hp(0.25)
                  },
                  progressBarStyle
                ]} />
              </View>
            )}

            {/* Progress Percentage */}
            {showProgress && (
              <Text style={{
                fontSize: rf(12),
                color: `${textColor}80`,
                marginBottom: hp(4)
              }}>
                %{Math.round(progress)}
              </Text>
            )}

            {/* Islamic Quote */}
            <View style={{
              position: 'absolute',
              bottom: hp(10),
              left: wp(8),
              right: wp(8),
              alignItems: 'center'
            }}>
              <Text style={{
                fontSize: rf(12),
                color: `${textColor}60`,
                textAlign: 'center',
                fontStyle: 'italic',
                lineHeight: rf(18)
              }}>
                "Ve Allah'a tevekkül et. Allah, tevekkül edenlere yeter."
              </Text>
              <Text style={{
                fontSize: rf(10),
                color: `${textColor}40`,
                textAlign: 'center',
                marginTop: hp(1)
              }}>
                - Talak 3
              </Text>
            </View>
          </Animated.View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

// Loading Hook for easier state management
export const useLoadingScreen = (initialState: boolean = false) => {
  const [isLoading, setIsLoading] = useState(initialState);
  const [loadingConfig, setLoadingConfig] = useState<Partial<LoadingScreenProps>>({});

  const showLoading = useCallback((config?: Partial<LoadingScreenProps>) => {
    if (config) {
      setLoadingConfig(config);
    }
    setIsLoading(true);
  }, []);

  const hideLoading = useCallback(() => {
    setIsLoading(false);
    // Clear config after hiding
    setTimeout(() => setLoadingConfig({}), 300);
  }, []);

  const updateProgress = useCallback((progress: number) => {
    setLoadingConfig(prev => ({ ...prev, progress, showProgress: true }));
  }, []);

  const updateMessage = useCallback((message: string, subText?: string) => {
    setLoadingConfig(prev => ({ ...prev, loadingText: message, subText }));
  }, []);

  return {
    isLoading,
    loadingConfig,
    showLoading,
    hideLoading,
    updateProgress,
    updateMessage
  };
};

// Loading Screen with timeout
export const LoadingScreenWithTimeout: React.FC<LoadingScreenProps & {
  timeout: number;
  onTimeout: () => void;
}> = ({ timeout, onTimeout, ...props }) => {
  useEffect(() => {
    if (props.isVisible) {
      const timer = setTimeout(onTimeout, timeout);
      return () => clearTimeout(timer);
    }
  }, [props.isVisible, timeout, onTimeout]);

  return <LoadingScreen {...props} />;
};

// Splash Screen component for app initialization
export const SplashScreen: React.FC<{
  onComplete: () => void;
}> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { message: 'Uygulama başlatılıyor...', duration: 800 },
    { message: 'Namaz vakitleri yükleniyor...', duration: 1000 },
    { message: 'Günlük ayetler hazırlanıyor...', duration: 600 },
    { message: 'AI rehber aktifleştiriliyor...', duration: 1200 },
    { message: 'Hazır!', duration: 400 }
  ];

  useEffect(() => {
    let totalDuration = 0;
    
    const runSteps = async () => {
      for (let i = 0; i < steps.length; i++) {
        setCurrentStep(i);
        setProgress((i / steps.length) * 100);
        
        await new Promise(resolve => setTimeout(resolve, steps[i].duration));
        totalDuration += steps[i].duration;
      }
      
      setProgress(100);
      setTimeout(onComplete, 500);
    };
    
    runSteps();
  }, [onComplete]);

  return (
    <LoadingScreen
      isVisible={true}
      loadingText={steps[currentStep]?.message}
      subText="Manevi yolculuğunuza hoş geldiniz"
      progress={progress}
      showProgress={true}
      animationType="loading"
      backgroundColor={['#0f0f23', '#1a1a2e', '#16213e']}
    />
  );
};

export default LoadingScreen; 