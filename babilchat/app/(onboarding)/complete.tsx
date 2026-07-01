import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import LottieView from 'lottie-react-native';
import React, { useEffect, useRef } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    FadeInUp,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { triggerButtonPressHaptic, triggerSuccessHaptic } from '../../src/utils/haptics';
import { completeOnboarding } from '../../src/utils/onboarding';
import { hp, rf, wp } from '../../src/utils/responsive';

export default function CompleteScreen() {
  const scaleValue = useSharedValue(0);
  const rotateValue = useSharedValue(0);
  const lottieRef = useRef<LottieView>(null);

  useEffect(() => {
    // Trigger success haptic and start animations
    triggerSuccessHaptic();
    
    // Scale animation for the main icon
    scaleValue.value = withSequence(
      withSpring(1.2, { duration: 800 }),
      withSpring(1, { duration: 400 })
    );
    
    // Rotation animation for sparkles
    rotateValue.value = withRepeat(
      withTiming(360, { duration: 3000 }),
      -1,
      false
    );
    
    // Start lottie animation
    setTimeout(() => {
      lottieRef.current?.play();
    }, 500);
  }, []);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scaleValue.value },
      { rotate: `${rotateValue.value}deg` }
    ]
  }));

  const handleComplete = async () => {
    try {
      triggerButtonPressHaptic();
      
      // Complete onboarding
      await completeOnboarding();
      
      // Navigate to main app
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const celebrationFeatures = [
    {
      id: 'ai_ready',
      icon: 'sparkles',
      title: 'AI Rehber Hazır',
      description: 'İslami sorularınızı sormaya başlayabilirsiniz',
      color: '#8b5cf6'
    },
    {
      id: 'prayer_times',
      icon: 'time',
      title: 'Namaz Vakitleri',
      description: 'Bulunduğunuz konuma göre doğru vakitler',
      color: '#22c55e'
    },
    {
      id: 'daily_content',
      icon: 'book',
      title: 'Günlük İçerik',
      description: 'Her gün yeni ayet ve hadisler',
      color: '#f59e0b'
    },
    {
      id: 'qibla_compass',
      icon: 'compass',
      title: 'Kıble Pusula',
      description: 'Her yerden doğru kıble yönü',
      color: '#3b82f6'
    }
  ];

  return (
    <LinearGradient 
      colors={['#0f0f23', '#1a1a2e', '#16213e']} 
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{
          flex: 1,
          paddingHorizontal: wp(8),
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          {/* Celebration Icon */}
          <Animated.View 
            entering={FadeInUp.delay(200)}
            style={[
              {
                width: wp(32),
                height: wp(32),
                borderRadius: wp(16),
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: hp(4)
              },
              animatedIconStyle
            ]}
          >
            <LinearGradient
              colors={['#22c55e', '#16a34a']}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: wp(16),
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#22c55e',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
                elevation: 16
              }}
            >
              <Ionicons name="checkmark-done" size={wp(16)} color="#ffffff" />
            </LinearGradient>
          </Animated.View>

          {/* Lottie Celebration Animation */}
          <View style={{
            position: 'absolute',
            top: hp(15),
            width: wp(80),
            height: hp(40),
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <LottieView
              ref={lottieRef}
              source={require('../../assets/animations/celebration.json')}
              style={{
                width: wp(80),
                height: hp(40)
              }}
              loop={false}
              autoPlay={false}
            />
          </View>

          {/* Success Message */}
          <Animated.View 
            entering={FadeInUp.delay(400)}
            style={{ alignItems: 'center', marginBottom: hp(4) }}
          >
            <Text style={{
              fontSize: rf(32),
              fontWeight: 'bold',
              color: '#ffffff',
              textAlign: 'center',
              marginBottom: hp(2)
            }}>
              🎉 Tebrikler!
            </Text>
            
            <Text style={{
              fontSize: rf(20),
              fontWeight: '600',
              color: '#22c55e',
              textAlign: 'center',
              marginBottom: hp(1)
            }}>
              Kurulum Tamamlandı
            </Text>
            
            <Text style={{
              fontSize: rf(16),
              color: '#94a3b8',
              textAlign: 'center',
              lineHeight: rf(24),
              paddingHorizontal: wp(4)
            }}>
              Babil Chat artık kullanıma hazır! İslami yaşamınızı destekleyecek tüm özellikler aktif.
            </Text>
          </Animated.View>

          {/* Features Grid */}
          <Animated.View 
            entering={FadeInUp.delay(600)}
            style={{
              width: '100%',
              marginBottom: hp(6)
            }}
          >
            <View style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between'
            }}>
              {celebrationFeatures.map((feature, index) => (
                <Animated.View
                  key={feature.id}
                  entering={FadeInUp.delay(800 + index * 100)}
                  style={{
                    width: wp(38),
                    marginBottom: hp(2)
                  }}
                >
                  <LinearGradient
                    colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
                    style={{
                      borderRadius: wp(4),
                      padding: wp(4),
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      minHeight: hp(12)
                    }}
                  >
                    <View style={{
                      width: wp(12),
                      height: wp(12),
                      borderRadius: wp(6),
                      backgroundColor: feature.color,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: hp(1),
                      shadowColor: feature.color,
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: 8
                    }}>
                      <Ionicons name={feature.icon as any} size={wp(6)} color="#ffffff" />
                    </View>
                    
                    <Text style={{
                      fontSize: rf(14),
                      fontWeight: '600',
                      color: '#ffffff',
                      textAlign: 'center',
                      marginBottom: hp(0.5)
                    }}>
                      {feature.title}
                    </Text>
                    
                    <Text style={{
                      fontSize: rf(12),
                      color: '#94a3b8',
                      textAlign: 'center',
                      lineHeight: rf(16)
                    }}>
                      {feature.description}
                    </Text>
                  </LinearGradient>
                </Animated.View>
              ))}
            </View>
          </Animated.View>

          {/* Statistics */}
          <Animated.View 
            entering={FadeInUp.delay(1200)}
            style={{
              width: '100%',
              marginBottom: hp(4)
            }}
          >
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.2)', 'rgba(59, 130, 246, 0.1)']}
              style={{
                borderRadius: wp(4),
                padding: wp(4),
                borderWidth: 1,
                borderColor: 'rgba(139, 92, 246, 0.3)'
              }}
            >
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
                alignItems: 'center'
              }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{
                    fontSize: rf(24),
                    fontWeight: 'bold',
                    color: '#8b5cf6'
                  }}>
                    10K+
                  </Text>
                  <Text style={{
                    fontSize: rf(12),
                    color: '#c4b5fd'
                  }}>
                    Dua
                  </Text>
                </View>
                
                <View style={{ alignItems: 'center' }}>
                  <Text style={{
                    fontSize: rf(24),
                    fontWeight: 'bold',
                    color: '#22c55e'
                  }}>
                    6236
                  </Text>
                  <Text style={{
                    fontSize: rf(12),
                    color: '#86efac'
                  }}>
                    Ayet
                  </Text>
                </View>
                
                <View style={{ alignItems: 'center' }}>
                  <Text style={{
                    fontSize: rf(24),
                    fontWeight: 'bold',
                    color: '#f59e0b'
                  }}>
                    7000+
                  </Text>
                  <Text style={{
                    fontSize: rf(12),
                    color: '#fbbf24'
                  }}>
                    Hadis
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>
        </View>

        {/* Action Button */}
        <Animated.View 
          entering={FadeInUp.delay(1400)}
          style={{
            paddingHorizontal: wp(8),
            paddingBottom: hp(4)
          }}
        >
          <TouchableOpacity
            onPress={handleComplete}
            style={{ width: '100%' }}
          >
            <LinearGradient
              colors={['#22c55e', '#16a34a']}
              style={{
                borderRadius: wp(4),
                paddingVertical: hp(2),
                alignItems: 'center',
                shadowColor: '#22c55e',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
                elevation: 16
              }}
            >
              <View style={{
                flexDirection: 'row',
                alignItems: 'center'
              }}>
                <Text style={{
                  fontSize: rf(18),
                  fontWeight: 'bold',
                  color: '#ffffff',
                  marginRight: wp(2)
                }}>
                  Uygulamayı Başlat
                </Text>
                <Ionicons name="arrow-forward" size={wp(6)} color="#ffffff" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
          
          <Text style={{
            fontSize: rf(14),
            color: '#64748b',
            textAlign: 'center',
            marginTop: hp(2),
            lineHeight: rf(20)
          }}>
            İstediğiniz zaman ayarlardan tercihlerinizi değiştirebilirsiniz
          </Text>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
} 