import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import {
    Animated,
    Dimensions,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { triggerButtonPressHaptic } from '../../src/utils/haptics';
import { hp, rf, wp } from '../../src/utils/responsive';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function WelcomeScreen() {
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleContinue = () => {
    triggerButtonPressHaptic();
    router.push('/(onboarding)/language');
  };

  return (
    <LinearGradient
      colors={['#0f0f23', '#1a1a2e', '#16213e']}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ 
          flex: 1, 
          paddingHorizontal: wp(6),
          justifyContent: 'space-between',
          paddingVertical: hp(4)
        }}>
          {/* Header with Logo */}
          <Animated.View 
            style={{ 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              alignItems: 'center',
              marginTop: hp(6)
            }}
          >
            <View style={{
              width: wp(24),
              height: wp(24),
              borderRadius: wp(12),
              backgroundColor: 'rgba(139, 92, 246, 0.2)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: hp(3)
            }}>
              <Ionicons name="moon" size={wp(12)} color="#8b5cf6" />
            </View>
            
            <Text style={{
              fontSize: rf(32),
              fontWeight: 'bold',
              color: '#ffffff',
              textAlign: 'center',
              marginBottom: hp(1)
            }}>
              Babil Chat
            </Text>
            
            <Text style={{
              fontSize: rf(18),
              color: '#e2e8f0',
              textAlign: 'center',
              opacity: 0.8
            }}>
              Manevi Yolculuğunuzun Rehberi
            </Text>
          </Animated.View>

          {/* Main Content */}
          <Animated.View 
            style={{ 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              alignItems: 'center',
              flex: 1,
              justifyContent: 'center'
            }}
          >
            <Text style={{
              fontSize: rf(24),
              fontWeight: '600',
              color: '#ffffff',
              textAlign: 'center',
              marginBottom: hp(2)
            }}>
              Selamu Aleykum
            </Text>
            
            <Text style={{
              fontSize: rf(16),
              color: '#94a3b8',
              textAlign: 'center',
              lineHeight: rf(24),
              marginBottom: hp(4),
              paddingHorizontal: wp(4)
            }}>
              Günlük dualarınızı yapın, ayetler okuyun ve manevi gelişiminizi takip edin. 
              AI destekli rehberlik ile İslami yaşamınızı zenginleştirin.
            </Text>

            {/* Features Preview */}
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-around',
              width: '100%',
              marginBottom: hp(3)
            }}>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <View style={{
                  width: wp(12),
                  height: wp(12),
                  borderRadius: wp(6),
                  backgroundColor: 'rgba(34, 197, 94, 0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: hp(1)
                }}>
                  <Ionicons name="book" size={wp(6)} color="#22c55e" />
                </View>
                <Text style={{
                  fontSize: rf(12),
                  color: '#e2e8f0',
                  textAlign: 'center'
                }}>
                  Günlük{'\n'}Ayetler
                </Text>
              </View>

              <View style={{ alignItems: 'center', flex: 1 }}>
                <View style={{
                  width: wp(12),
                  height: wp(12),
                  borderRadius: wp(6),
                  backgroundColor: 'rgba(251, 146, 60, 0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: hp(1)
                }}>
                  <Ionicons name="time" size={wp(6)} color="#fb923c" />
                </View>
                <Text style={{
                  fontSize: rf(12),
                  color: '#e2e8f0',
                  textAlign: 'center'
                }}>
                  Namaz{'\n'}Vakitleri
                </Text>
              </View>

              <View style={{ alignItems: 'center', flex: 1 }}>
                <View style={{
                  width: wp(12),
                  height: wp(12),
                  borderRadius: wp(6),
                  backgroundColor: 'rgba(139, 92, 246, 0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: hp(1)
                }}>
                  <Ionicons name="chatbubbles" size={wp(6)} color="#8b5cf6" />
                </View>
                <Text style={{
                  fontSize: rf(12),
                  color: '#e2e8f0',
                  textAlign: 'center'
                }}>
                  AI{'\n'}Rehberlik
                </Text>
              </View>

              <View style={{ alignItems: 'center', flex: 1 }}>
                <View style={{
                  width: wp(12),
                  height: wp(12),
                  borderRadius: wp(6),
                  backgroundColor: 'rgba(236, 72, 153, 0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: hp(1)
                }}>
                  <Ionicons name="heart" size={wp(6)} color="#ec4899" />
                </View>
                <Text style={{
                  fontSize: rf(12),
                  color: '#e2e8f0',
                  textAlign: 'center'
                }}>
                  Dua{'\n'}Duvarı
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Bottom Button */}
          <Animated.View 
            style={{ 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <TouchableOpacity
              onPress={handleContinue}
              style={{
                backgroundColor: '#8b5cf6',
                paddingVertical: hp(2),
                paddingHorizontal: wp(8),
                borderRadius: wp(4),
                alignItems: 'center',
                marginBottom: hp(2),
                shadowColor: '#8b5cf6',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
              accessibilityRole="button"
              accessibilityLabel="Devam et"
              accessibilityHint="Onboarding sürecine devam etmek için dokunun"
            >
              <Text style={{
                color: '#ffffff',
                fontSize: rf(16),
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}>
                Başlayalım
              </Text>
            </TouchableOpacity>

            <Text style={{
              fontSize: rf(12),
              color: '#64748b',
              textAlign: 'center',
              marginTop: hp(1)
            }}>
              Bu sadece birkaç dakika sürecek
            </Text>
          </Animated.View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
} 