import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { triggerButtonPressHaptic, triggerSuccessHaptic } from '../../src/utils/haptics';
import {
    getCurrentPrayer,
    getNextPrayer,
    getTodayPrayerTimes,
    PrayerTimes
} from '../../src/utils/prayerTimes';
import { getCurrentLocation } from '../../src/utils/qibla';
import { hp, rf, wp } from '../../src/utils/responsive';

export default function PrayerTimesScreen() {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [nextPrayer, setNextPrayer] = useState<any>(null);
  const [currentPrayer, setCurrentPrayer] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [location, setLocation] = useState<{ city: string; country: string } | null>(null);

  useEffect(() => {
    loadPrayerTimes();
    
    // Her dakika güncelle
    const interval = setInterval(() => {
      if (prayerTimes) {
        updateCurrentAndNext();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (prayerTimes) {
      updateCurrentAndNext();
    }
  }, [prayerTimes]);

  const loadPrayerTimes = async () => {
    try {
      setIsLoading(true);
      const locationData = await getCurrentLocation();
      
      if (locationData) {
        setLocation({
          city: 'İstanbul', // locationData.city || 'Bilinmeyen Şehir',
          country: 'Türkiye' // locationData.country || 'Türkiye'
        });
        
        const times = await getTodayPrayerTimes(locationData);
        if (times) {
          setPrayerTimes(times);
        }
      }
    } catch (error) {
      console.warn('Error loading prayer times:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateCurrentAndNext = () => {
    if (!prayerTimes) return;
    
    const current = getCurrentPrayer(prayerTimes);
    const next = getNextPrayer(prayerTimes);
    
    setCurrentPrayer(current);
    setNextPrayer(next);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPrayerTimes();
    setRefreshing(false);
    triggerSuccessHaptic();
  };

  const prayerData = [
    { name: 'İmsak', arabicName: 'الفجر', time: prayerTimes?.fajr, icon: 'moon', color: '#8b5cf6' },
    { name: 'Güneş', arabicName: 'الشروق', time: prayerTimes?.sunrise, icon: 'sunny', color: '#f59e0b' },
    { name: 'Öğle', arabicName: 'الظهر', time: prayerTimes?.dhuhr, icon: 'sunny-outline', color: '#22c55e' },
    { name: 'İkindi', arabicName: 'العصر', time: prayerTimes?.asr, icon: 'partly-sunny', color: '#f97316' },
    { name: 'Akşam', arabicName: 'المغرب', time: prayerTimes?.maghrib, icon: 'moon-outline', color: '#ef4444' },
    { name: 'Yatsı', arabicName: 'العشاء', time: prayerTimes?.isha, icon: 'moon', color: '#6366f1' },
  ];

  const getTimeRemaining = () => {
    if (!nextPrayer || !nextPrayer.time) return null;
    
    const now = new Date();
    const [hours, minutes] = nextPrayer.time.split(':');
    const prayerTime = new Date();
    prayerTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    if (prayerTime < now) {
      prayerTime.setDate(prayerTime.getDate() + 1);
    }
    
    const diff = prayerTime.getTime() - now.getTime();
    const hoursRemaining = Math.floor(diff / (1000 * 60 * 60));
    const minutesRemaining = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return { hours: hoursRemaining, minutes: minutesRemaining };
  };

  const timeRemaining = getTimeRemaining();

  if (isLoading) {
    return (
      <LinearGradient colors={['#0f0f23', '#1a1a2e', '#16213e']} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="time" size={wp(15)} color="#8b5cf6" />
          <Text style={{
            fontSize: rf(18),
            color: '#ffffff',
            marginTop: hp(2),
            textAlign: 'center'
          }}>
            Namaz vakitleri yükleniyor...
          </Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#0f0f23', '#1a1a2e', '#16213e']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingVertical: hp(2) }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8b5cf6" />
          }
        >
          {/* Header */}
          <Animated.View 
            entering={FadeInUp.delay(100)}
            style={{
              paddingHorizontal: wp(6),
              marginBottom: hp(3)
            }}
          >
            <Text style={{
              fontSize: rf(28),
              fontWeight: 'bold',
              color: '#ffffff',
              marginBottom: hp(1)
            }}>
              Namaz Vakitleri
            </Text>
            
            {location && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="location" size={wp(4)} color="#94a3b8" />
                <Text style={{
                  fontSize: rf(16),
                  color: '#94a3b8',
                  marginLeft: wp(2)
                }}>
                  {location.city}, {location.country}
                </Text>
              </View>
            )}
          </Animated.View>

          {/* Current & Next Prayer Card */}
          {nextPrayer && (
            <Animated.View entering={FadeInUp.delay(200)} style={{ paddingHorizontal: wp(6), marginBottom: hp(3) }}>
              <LinearGradient
                colors={['rgba(139, 92, 246, 0.2)', 'rgba(59, 130, 246, 0.1)']}
                style={{
                  borderRadius: wp(4),
                  padding: wp(5),
                  borderWidth: 1,
                  borderColor: 'rgba(139, 92, 246, 0.3)'
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      fontSize: rf(14),
                      color: '#c4b5fd',
                      marginBottom: hp(1)
                    }}>
                      Sıradaki Namaz
                    </Text>
                    <Text style={{
                      fontSize: rf(24),
                      fontWeight: 'bold',
                      color: '#ffffff',
                      marginBottom: hp(0.5)
                    }}>
                      {nextPrayer.name}
                    </Text>
                    <Text style={{
                      fontSize: rf(20),
                      color: '#8b5cf6',
                      fontWeight: '600'
                    }}>
                      {nextPrayer.time}
                    </Text>
                  </View>
                  
                  {timeRemaining && (
                    <View style={{ alignItems: 'center' }}>
                      <Text style={{
                        fontSize: rf(14),
                        color: '#c4b5fd',
                        marginBottom: hp(1)
                      }}>
                        Kalan Süre
                      </Text>
                      <Text style={{
                        fontSize: rf(18),
                        fontWeight: 'bold',
                        color: '#ffffff'
                      }}>
                        {timeRemaining.hours}sa {timeRemaining.minutes}dk
                      </Text>
                    </View>
                  )}
                </View>
              </LinearGradient>
            </Animated.View>
          )}

          {/* Prayer Times List */}
          <View style={{ paddingHorizontal: wp(6) }}>
            {prayerData.map((prayer, index) => (
              <Animated.View
                key={prayer.name}
                entering={FadeInUp.delay(300 + index * 100)}
                style={{ marginBottom: hp(2) }}
              >
                <TouchableOpacity
                  onPress={() => {
                    triggerButtonPressHaptic();
                    // Namaz detay sayfasına git
                  }}
                >
                  <LinearGradient
                    colors={
                      currentPrayer?.name === prayer.name
                        ? [prayer.color + '40', prayer.color + '20']
                        : ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']
                    }
                    style={{
                      borderRadius: wp(4),
                      padding: wp(4),
                      borderWidth: 1,
                      borderColor: currentPrayer?.name === prayer.name 
                        ? prayer.color + '80' 
                        : 'rgba(255, 255, 255, 0.1)',
                      flexDirection: 'row',
                      alignItems: 'center'
                    }}
                  >
                    {/* Prayer Icon */}
                    <View style={{
                      width: wp(12),
                      height: wp(12),
                      borderRadius: wp(6),
                      backgroundColor: prayer.color + '30',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: wp(4)
                    }}>
                      <Ionicons name={prayer.icon as any} size={wp(6)} color={prayer.color} />
                    </View>

                    {/* Prayer Info */}
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: rf(18),
                        fontWeight: '600',
                        color: '#ffffff',
                        marginBottom: hp(0.5)
                      }}>
                        {prayer.name}
                      </Text>
                      <Text style={{
                        fontSize: rf(14),
                        color: '#94a3b8',
                        fontFamily: 'serif'
                      }}>
                        {prayer.arabicName}
                      </Text>
                    </View>

                    {/* Prayer Time */}
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{
                        fontSize: rf(20),
                        fontWeight: 'bold',
                        color: currentPrayer?.name === prayer.name ? prayer.color : '#ffffff'
                      }}>
                        {prayer.time || '--:--'}
                      </Text>
                      
                      {currentPrayer?.name === prayer.name && (
                        <View style={{
                          backgroundColor: prayer.color,
                          paddingHorizontal: wp(2),
                          paddingVertical: hp(0.3),
                          borderRadius: wp(2),
                          marginTop: hp(0.5)
                        }}>
                          <Text style={{
                            fontSize: rf(10),
                            color: '#ffffff',
                            fontWeight: '600'
                          }}>
                            ŞİMDİ
                          </Text>
                        </View>
                      )}
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>

          {/* Prayer Information */}
          <Animated.View 
            entering={FadeInUp.delay(900)}
            style={{ paddingHorizontal: wp(6), marginTop: hp(3) }}
          >
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']}
              style={{
                borderRadius: wp(4),
                padding: wp(4),
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.1)'
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: hp(2) }}>
                <Ionicons name="information-circle" size={wp(5)} color="#8b5cf6" />
                <Text style={{
                  fontSize: rf(16),
                  fontWeight: '600',
                  color: '#ffffff',
                  marginLeft: wp(2)
                }}>
                  Namaz Vakitleri Hakkında
                </Text>
              </View>
              
              <Text style={{
                fontSize: rf(14),
                color: '#94a3b8',
                lineHeight: rf(20)
              }}>
                Namaz vakitleri bulunduğunuz konuma göre hesaplanmaktadır. 
                Vakit girdiğinde bildirim almak için ayarlardan bildirimleri açabilirsiniz.
              </Text>
            </LinearGradient>
          </Animated.View>

          <View style={{ height: hp(4) }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
} 