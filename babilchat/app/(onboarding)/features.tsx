import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { Animated, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { triggerButtonPressHaptic } from '../../src/utils/haptics';
import { hp, rf, wp } from '../../src/utils/responsive';

const features = [
  {
    id: 'ai_guidance',
    title: 'AI Destekli Rehberlik',
    description: 'İslami perspektiften sorularınızı yanıtlayan akıllı asistan',
    icon: 'sparkles',
    gradient: ['#8b5cf6', '#a78bfa'],
  },
  {
    id: 'daily_verses',
    title: 'Günlük Ayetler',
    description: 'Her gün size özel seçilmiş ayetler ve hadisler',
    icon: 'book',
    gradient: ['#10b981', '#34d399'],
  },
  {
    id: 'prayer_times',
    title: 'Namaz Vakitleri',
    description: 'Konumunuza göre hassas namaz vakti hesaplaması',
    icon: 'time',
    gradient: ['#3b82f6', '#60a5fa'],
  },
  {
    id: 'qibla_compass',
    title: 'Dijital Kıble Puslası',
    description: 'GPS tabanlı kıble yönü bulma ve mesafe hesaplama',
    icon: 'compass',
    gradient: ['#ef4444', '#f87171'],
  },
  {
    id: 'prayer_wall',
    title: 'Topluluk Dua Duvarı',
    description: 'Diğer kullanıcılarla dua paylaşımı ve destek',
    icon: 'heart',
    gradient: ['#ec4899', '#f472b6'],
  },
  {
    id: 'study_plans',
    title: 'Kişisel Çalışma Planları',
    description: 'Kur\'an ve hadis çalışmalarınızı organize edin',
    icon: 'library',
    gradient: ['#f59e0b', '#fbbf24'],
  },
];

export default function FeaturesScreen() {
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(30);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleContinue = () => {
    triggerButtonPressHaptic();
    router.push('/(tabs)');
  };

  const handleBack = () => {
    triggerButtonPressHaptic();
    router.back();
  };

  return (
    <LinearGradient colors={['#0f0f23', '#1a1a2e', '#16213e']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1, paddingHorizontal: wp(6) }}>
          {/* Header */}
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            paddingVertical: hp(2),
            marginTop: hp(2)
          }}>
            <TouchableOpacity
              onPress={handleBack}
              style={{
                width: wp(10),
                height: wp(10),
                borderRadius: wp(5),
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Ionicons name="chevron-back" size={wp(6)} color="#ffffff" />
            </TouchableOpacity>

            <View style={{ alignItems: 'center' }}>
              <Text style={{
                fontSize: rf(12),
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: 1
              }}>
                Adım 5/5
              </Text>
              <View style={{
                width: wp(20),
                height: hp(0.5),
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: wp(2),
                marginTop: hp(0.5)
              }}>
                <View style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: '#8b5cf6',
                  borderRadius: wp(2)
                }} />
              </View>
            </View>

            <View style={{ width: wp(10) }} />
          </View>

          {/* Content */}
          <Animated.View style={{
            flex: 1,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}>
            <View style={{ alignItems: 'center', marginTop: hp(2), marginBottom: hp(4) }}>
              <View style={{
                width: wp(20),
                height: wp(20),
                borderRadius: wp(10),
                backgroundColor: 'rgba(139, 92, 246, 0.2)',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: hp(3)
              }}>
                <Ionicons name="star" size={wp(10)} color="#8b5cf6" />
              </View>

              <Text style={{
                fontSize: rf(28),
                fontWeight: 'bold',
                color: '#ffffff',
                textAlign: 'center',
                marginBottom: hp(1)
              }}>
                Özellikler
              </Text>

              <Text style={{
                fontSize: rf(16),
                color: '#94a3b8',
                textAlign: 'center',
                lineHeight: rf(24),
                marginBottom: hp(3),
                paddingHorizontal: wp(4)
              }}>
                Babil Chat ile manevi yolculuğunuzda size yardımcı olacak özellikler
              </Text>
            </View>

            {/* Features List */}
            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: hp(12) }}
            >
              {features.map((feature, index) => (
                <Animated.View
                  key={feature.id}
                  style={{
                    opacity: fadeAnim,
                    transform: [{ 
                      translateY: slideAnim.interpolate({
                        inputRange: [0, 30],
                        outputRange: [0, 30 + (index * 10)]
                      })
                    }],
                    marginBottom: hp(2)
                  }}
                >
                  <LinearGradient
                    colors={['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']}
                    style={{
                      borderRadius: wp(4),
                      padding: wp(4),
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      flexDirection: 'row',
                      alignItems: 'center'
                    }}
                  >
                    <LinearGradient
                      colors={feature.gradient}
                      style={{
                        width: wp(12),
                        height: wp(12),
                        borderRadius: wp(6),
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: wp(4)
                      }}
                    >
                      <Ionicons 
                        name={feature.icon as any} 
                        size={wp(6)} 
                        color="#ffffff" 
                      />
                    </LinearGradient>

                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: rf(16),
                        fontWeight: '600',
                        color: '#ffffff',
                        marginBottom: hp(0.5)
                      }}>
                        {feature.title}
                      </Text>
                      <Text style={{
                        fontSize: rf(13),
                        color: '#94a3b8',
                        lineHeight: rf(18)
                      }}>
                        {feature.description}
                      </Text>
                    </View>
                  </LinearGradient>
                </Animated.View>
              ))}
            </ScrollView>
          </Animated.View>

          {/* Bottom Button */}
          <Animated.View style={{
            opacity: fadeAnim,
            paddingBottom: hp(2)
          }}>
            <TouchableOpacity
              onPress={handleContinue}
              style={{
                backgroundColor: '#8b5cf6',
                paddingVertical: hp(2),
                borderRadius: wp(4),
                alignItems: 'center',
                shadowColor: '#8b5cf6',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
              accessibilityRole="button"
              accessibilityLabel="Uygulamayı başlat"
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
          </Animated.View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
} 