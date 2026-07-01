import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getDuaRequestById } from '../../../src/utils/duaRequests';
import { triggerButtonPressHaptic } from '../../../src/utils/haptics';
import { hp, rf, wp } from '../../../src/utils/responsive';

interface PrayerRequest {
  id: string;
  title: string;
  content: string;
  author: string;
  category: string;
  timestamp: Date;
  prayerCount: number;
}

export default function PrayerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [prayer, setPrayer] = useState<PrayerRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPrayed, setHasPrayed] = useState(false);

  useEffect(() => {
    if (id) {
      loadPrayerRequest(id);
    }
  }, [id]);

  const loadPrayerRequest = async (prayerId: string) => {
    try {
      setIsLoading(true);
      const prayerData = await getDuaRequestById(prayerId);
      if (prayerData) {
        setPrayer(prayerData);
      } else {
        Alert.alert('Hata', 'Dua talebi bulunamadı');
        router.back();
      }
    } catch (error) {
      console.error('Error loading prayer request:', error);
      Alert.alert('Hata', 'Dua talebi yüklenirken bir hata oluştu');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrayForRequest = () => {
    if (!prayer) return;
    
    triggerButtonPressHaptic();
    setHasPrayed(!hasPrayed);
    
    // Update prayer count
    setPrayer(prev => prev ? {
      ...prev,
      prayerCount: hasPrayed ? prev.prayerCount - 1 : prev.prayerCount + 1
    } : null);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'health': return 'medical';
      case 'family': return 'people';
      case 'work': return 'briefcase';
      case 'education': return 'school';
      case 'financial': return 'wallet';
      case 'guidance': return 'compass';
      default: return 'heart';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'health': return 'Sağlık';
      case 'family': return 'Aile';
      case 'work': return 'İş/Kariyer';
      case 'education': return 'Eğitim';
      case 'financial': return 'Mali Durum';
      case 'guidance': return 'Rehberlik';
      default: return 'Genel';
    }
  };

  if (isLoading) {
    return (
      <LinearGradient colors={['#0f0f23', '#1a1a2e', '#16213e']} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="heart" size={wp(15)} color="#8b5cf6" />
          <Text style={{
            fontSize: rf(16),
            color: '#ffffff',
            marginTop: hp(2),
            textAlign: 'center'
          }}>
            Dua talebi yükleniyor...
          </Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (!prayer) {
    return (
      <LinearGradient colors={['#0f0f23', '#1a1a2e', '#16213e']} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="alert-circle" size={wp(15)} color="#ef4444" />
          <Text style={{
            fontSize: rf(16),
            color: '#ffffff',
            marginTop: hp(2),
            textAlign: 'center'
          }}>
            Dua talebi bulunamadı
          </Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#0f0f23', '#1a1a2e', '#16213e']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: wp(4),
          paddingVertical: hp(2),
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(255, 255, 255, 0.1)',
        }}>
          <TouchableOpacity
            onPress={() => {
              triggerButtonPressHaptic();
              router.back();
            }}
            style={{
              width: wp(10),
              height: wp(10),
              borderRadius: wp(5),
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: wp(3),
            }}
          >
            <Ionicons name="arrow-back" size={wp(5)} color="#ffffff" />
          </TouchableOpacity>
          
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: rf(18),
              fontWeight: '600',
              color: '#ffffff',
            }}>
              Dua Talebi
            </Text>
            <Text style={{
              fontSize: rf(12),
              color: '#94a3b8',
            }}>
              {getCategoryName(prayer.category)}
            </Text>
          </View>
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <View style={{ padding: wp(4) }}>
            {/* Category Badge */}
            <Animated.View entering={FadeInUp.delay(100)}>
              <LinearGradient
                colors={['rgba(139, 92, 246, 0.2)', 'rgba(167, 139, 250, 0.2)']}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  alignSelf: 'flex-start',
                  paddingHorizontal: wp(3),
                  paddingVertical: hp(1),
                  borderRadius: wp(4),
                  marginBottom: hp(3),
                  borderWidth: 1,
                  borderColor: 'rgba(139, 92, 246, 0.3)',
                }}
              >
                <Ionicons 
                  name={getCategoryIcon(prayer.category)} 
                  size={wp(4)} 
                  color="#8b5cf6" 
                />
                <Text style={{
                  color: '#8b5cf6',
                  fontSize: rf(12),
                  fontWeight: '600',
                  marginLeft: wp(1),
                }}>
                  {getCategoryName(prayer.category)}
                </Text>
              </LinearGradient>
            </Animated.View>

            {/* Title */}
            <Animated.View entering={FadeInUp.delay(200)}>
              <Text style={{
                fontSize: rf(20),
                fontWeight: 'bold',
                color: '#ffffff',
                marginBottom: hp(2),
                lineHeight: rf(28),
              }}>
                {prayer.title}
              </Text>
            </Animated.View>

            {/* Content */}
            <Animated.View entering={FadeInUp.delay(300)}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']}
                style={{
                  padding: wp(4),
                  borderRadius: wp(4),
                  marginBottom: hp(3),
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                }}
              >
                <Text style={{
                  fontSize: rf(16),
                  color: '#e2e8f0',
                  lineHeight: rf(24),
                  textAlign: 'justify',
                }}>
                  {prayer.content}
                </Text>
              </LinearGradient>
            </Animated.View>

            {/* Author and Date */}
            <Animated.View entering={FadeInUp.delay(400)}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: hp(3),
              }}>
                <View style={{
                  width: wp(8),
                  height: wp(8),
                  borderRadius: wp(4),
                  backgroundColor: 'rgba(139, 92, 246, 0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: wp(3),
                }}>
                  <Ionicons name="person" size={wp(4)} color="#8b5cf6" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: rf(14),
                    color: '#ffffff',
                    fontWeight: '600',
                  }}>
                    {prayer.author}
                  </Text>
                  <Text style={{
                    fontSize: rf(12),
                    color: '#94a3b8',
                  }}>
                    {new Date(prayer.timestamp).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </View>
              </View>
            </Animated.View>

            {/* Prayer Count */}
            <Animated.View entering={FadeInUp.delay(500)}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                paddingVertical: hp(2),
                paddingHorizontal: wp(4),
                borderRadius: wp(4),
                marginBottom: hp(3),
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.1)',
              }}>
                <Ionicons name="heart" size={wp(5)} color="#ec4899" />
                <Text style={{
                  fontSize: rf(16),
                  color: '#ffffff',
                  fontWeight: '600',
                  marginLeft: wp(2),
                }}>
                  {prayer.prayerCount} kişi dua etti
                </Text>
              </View>
            </Animated.View>

            {/* Action Button */}
            <Animated.View entering={FadeInUp.delay(600)}>
              <TouchableOpacity
                onPress={handlePrayForRequest}
                style={{ marginBottom: hp(4) }}
              >
                <LinearGradient
                  colors={hasPrayed ? ['#10b981', '#34d399'] : ['#8b5cf6', '#a78bfa']}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: hp(2),
                    borderRadius: wp(4),
                    shadowColor: hasPrayed ? '#10b981' : '#8b5cf6',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 8,
                  }}
                >
                  <Ionicons 
                    name={hasPrayed ? "checkmark-circle" : "heart"} 
                    size={wp(5)} 
                    color="#ffffff" 
                  />
                  <Text style={{
                    fontSize: rf(16),
                    fontWeight: '600',
                    color: '#ffffff',
                    marginLeft: wp(2),
                  }}>
                    {hasPrayed ? 'Dua Ettim ✓' : 'Bu Kişi İçin Dua Et'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
} 