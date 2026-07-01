import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { triggerButtonPressHaptic } from '../../src/utils/haptics';
import { hp, rf, wp } from '../../src/utils/responsive';

export default function LocationScreen() {
  const [isLoading, setIsLoading] = useState(false);

  const requestLocationPermission = async () => {
    setIsLoading(true);
    triggerButtonPressHaptic();

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status === 'granted') {
        // İzin verildi, bir sonraki adıma geç
        router.push('/(onboarding)/notifications');
      } else if (status === 'denied') {
        Alert.alert(
          'Lokasyon İzni',
          'Namaz vakitlerini doğru hesaplayabilmek için konum bilginize ihtiyacımız var. İsteğe bağlı olarak daha sonra ayarlardan açabilirsiniz.',
          [
            {
              text: 'Daha Sonra',
              style: 'cancel',
              onPress: () => router.push('/(onboarding)/notifications')
            },
            {
              text: 'Ayarlara Git',
              onPress: () => {
                // Open device settings
                router.push('/(onboarding)/notifications');
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Lokasyon izni hatası:', error);
      Alert.alert('Hata', 'Bir hata oluştu. Daha sonra ayarlardan izin verebilirsiniz.');
      router.push('/(onboarding)/notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const skipLocation = () => {
    triggerButtonPressHaptic();
    router.push('/(onboarding)/notifications');
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
                Adım 3/5
              </Text>
              <View style={{
                width: wp(20),
                height: hp(0.5),
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: wp(2),
                marginTop: hp(0.5)
              }}>
                <View style={{
                  width: '60%',
                  height: '100%',
                  backgroundColor: '#8b5cf6',
                  borderRadius: wp(2)
                }} />
              </View>
            </View>

            <View style={{ width: wp(10) }} />
          </View>

          {/* Content */}
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{
              width: wp(24),
              height: wp(24),
              borderRadius: wp(12),
              backgroundColor: 'rgba(34, 197, 94, 0.2)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: hp(4)
            }}>
              <Ionicons name="location" size={wp(12)} color="#22c55e" />
            </View>

            <Text style={{
              fontSize: rf(28),
              fontWeight: 'bold',
              color: '#ffffff',
              textAlign: 'center',
              marginBottom: hp(2)
            }}>
              Konum İzni
            </Text>

            <Text style={{
              fontSize: rf(16),
              color: '#94a3b8',
              textAlign: 'center',
              lineHeight: rf(24),
              marginBottom: hp(4),
              paddingHorizontal: wp(4)
            }}>
              Bulunduğunuz konuma göre doğru namaz vakitlerini hesaplayabilmemiz için konum bilginize ihtiyacımız var.
            </Text>

            {/* Features */}
            <View style={{ width: '100%', marginBottom: hp(6) }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: hp(3),
                paddingHorizontal: wp(4)
              }}>
                <View style={{
                  width: wp(8),
                  height: wp(8),
                  borderRadius: wp(4),
                  backgroundColor: 'rgba(34, 197, 94, 0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: wp(3)
                }}>
                  <Ionicons name="time" size={wp(4)} color="#22c55e" />
                </View>
                <Text style={{
                  fontSize: rf(15),
                  color: '#ffffff',
                  flex: 1
                }}>
                  Doğru namaz vakitleri hesaplaması
                </Text>
              </View>

              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: hp(3),
                paddingHorizontal: wp(4)
              }}>
                <View style={{
                  width: wp(8),
                  height: wp(8),
                  borderRadius: wp(4),
                  backgroundColor: 'rgba(34, 197, 94, 0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: wp(3)
                }}>
                  <Ionicons name="compass" size={wp(4)} color="#22c55e" />
                </View>
                <Text style={{
                  fontSize: rf(15),
                  color: '#ffffff',
                  flex: 1
                }}>
                  Kıble yönü göstergesi
                </Text>
              </View>

              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: wp(4)
              }}>
                <View style={{
                  width: wp(8),
                  height: wp(8),
                  borderRadius: wp(4),
                  backgroundColor: 'rgba(34, 197, 94, 0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: wp(3)
                }}>
                  <Ionicons name="notifications" size={wp(4)} color="#22c55e" />
                </View>
                <Text style={{
                  fontSize: rf(15),
                  color: '#ffffff',
                  flex: 1
                }}>
                  Otomatik namaz vakti bildirimleri
                </Text>
              </View>
            </View>
          </View>

          {/* Bottom Buttons */}
          <View style={{ paddingVertical: hp(2) }}>
            <TouchableOpacity
              onPress={requestLocationPermission}
              disabled={isLoading}
              style={{
                backgroundColor: '#22c55e',
                paddingVertical: hp(2),
                borderRadius: wp(4),
                alignItems: 'center',
                marginBottom: hp(2),
                shadowColor: '#22c55e',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
                opacity: isLoading ? 0.7 : 1
              }}
              accessibilityRole="button"
              accessibilityLabel="Konum izni ver"
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {isLoading && (
                  <Ionicons name="refresh" size={wp(5)} color="#ffffff" style={{ marginRight: wp(2) }} />
                )}
                <Text style={{
                  color: '#ffffff',
                  fontSize: rf(16),
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}>
                  {isLoading ? 'İzin İsteniyor...' : 'İzin Ver'}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={skipLocation}
              style={{
                backgroundColor: 'transparent',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                borderWidth: 1,
                paddingVertical: hp(2),
                borderRadius: wp(4),
                alignItems: 'center',
              }}
              accessibilityRole="button"
              accessibilityLabel="Daha sonra"
            >
              <Text style={{
                color: '#94a3b8',
                fontSize: rf(14),
                fontWeight: '500',
              }}>
                Daha Sonra
              </Text>
            </TouchableOpacity>
          </View>

          {/* Privacy Note */}
          <View style={{
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderColor: 'rgba(59, 130, 246, 0.3)',
            borderWidth: 1,
            borderRadius: wp(3),
            padding: wp(3),
            marginBottom: hp(2)
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: hp(0.5) }}>
              <Ionicons name="shield-checkmark" size={wp(4)} color="#3b82f6" />
              <Text style={{
                fontSize: rf(12),
                fontWeight: '600',
                color: '#3b82f6',
                marginLeft: wp(1)
              }}>
                Gizlilik
              </Text>
            </View>
            <Text style={{
              fontSize: rf(11),
              color: '#dbeafe',
              lineHeight: rf(16)
            }}>
              Konum bilginiz sadece namaz vakitleri hesaplaması için kullanılır ve hiçbir yere gönderilmez.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
} 