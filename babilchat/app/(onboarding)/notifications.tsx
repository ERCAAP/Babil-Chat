import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { triggerButtonPressHaptic } from '../../src/utils/haptics';
import { hp, rf, wp } from '../../src/utils/responsive';

export default function NotificationsScreen() {
  const [isLoading, setIsLoading] = useState(false);

  const requestNotificationPermission = async () => {
    setIsLoading(true);
    triggerButtonPressHaptic();

    try {
      const { status } = await Notifications.requestPermissionsAsync();
      
      if (status === 'granted') {
        // İzin verildi, bir sonraki adıma geç
        router.push('/(onboarding)/welcome');
      } else {
        Alert.alert(
          'Bildirim İzni',
          'Namaz vakitleri için bildirim almak isterseniz daha sonra ayarlardan açabilirsiniz.',
          [
            {
              text: 'Tamam',
              onPress: () => router.push('/(onboarding)/welcome')
            }
          ]
        );
      }
    } catch (error) {
      console.error('Bildirim izni hatası:', error);
      router.push('/(onboarding)/welcome');
    } finally {
      setIsLoading(false);
    }
  };

  const skipNotifications = () => {
    triggerButtonPressHaptic();
    router.push('/(onboarding)/welcome');
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
                Adım 4/5
              </Text>
              <View style={{
                width: wp(20),
                height: hp(0.5),
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: wp(2),
                marginTop: hp(0.5)
              }}>
                <View style={{
                  width: '80%',
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
              backgroundColor: 'rgba(139, 92, 246, 0.2)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: hp(4)
            }}>
              <Ionicons name="notifications" size={wp(12)} color="#8b5cf6" />
            </View>

            <Text style={{
              fontSize: rf(28),
              fontWeight: 'bold',
              color: '#ffffff',
              textAlign: 'center',
              marginBottom: hp(2)
            }}>
              Bildirimler
            </Text>

            <Text style={{
              fontSize: rf(16),
              color: '#94a3b8',
              textAlign: 'center',
              lineHeight: rf(24),
              marginBottom: hp(4),
              paddingHorizontal: wp(4)
            }}>
              Namaz vakitleri ve önemli hatırlatmalar için bildirim almak ister misiniz?
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
                  backgroundColor: 'rgba(139, 92, 246, 0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: wp(3)
                }}>
                  <Ionicons name="time" size={wp(4)} color="#8b5cf6" />
                </View>
                <Text style={{
                  fontSize: rf(15),
                  color: '#ffffff',
                  flex: 1
                }}>
                  Namaz vakti hatırlatmaları
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
                  backgroundColor: 'rgba(139, 92, 246, 0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: wp(3)
                }}>
                  <Ionicons name="book" size={wp(4)} color="#8b5cf6" />
                </View>
                <Text style={{
                  fontSize: rf(15),
                  color: '#ffffff',
                  flex: 1
                }}>
                  Günlük Kuran okuma hatırlatması
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
                  backgroundColor: 'rgba(139, 92, 246, 0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: wp(3)
                }}>
                  <Ionicons name="heart" size={wp(4)} color="#8b5cf6" />
                </View>
                <Text style={{
                  fontSize: rf(15),
                  color: '#ffffff',
                  flex: 1
                }}>
                  Dua talepleri bildirimeri
                </Text>
              </View>
            </View>
          </View>

          {/* Bottom Buttons */}
          <View style={{ paddingVertical: hp(2) }}>
            <TouchableOpacity
              onPress={requestNotificationPermission}
              disabled={isLoading}
              style={{
                backgroundColor: '#8b5cf6',
                paddingVertical: hp(2),
                borderRadius: wp(4),
                alignItems: 'center',
                marginBottom: hp(2),
                shadowColor: '#8b5cf6',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
                opacity: isLoading ? 0.7 : 1
              }}
              accessibilityRole="button"
              accessibilityLabel="Bildirim izni ver"
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
                  {isLoading ? 'İzin İsteniyor...' : 'Bildirimleri Aç'}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={skipNotifications}
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
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
} 