import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, Animated, Text, TouchableOpacity, View } from 'react-native';
import { triggerButtonPressHaptic, triggerSuccessHaptic } from '../utils/haptics';
import {
    calculateQibla,
    getQiblaAccuracy,
    QiblaInfo
} from '../utils/qibla';
import { hp, rf, wp } from '../utils/responsive';

interface QiblaCompassProps {
  style?: any;
  size?: number;
  showDetails?: boolean;
}

export default function QiblaCompass({ 
  style = {}, 
  size = wp(80), 
  showDetails = true 
}: QiblaCompassProps) {
  const [qiblaInfo, setQiblaInfo] = useState<QiblaInfo | null>(null);
  const [currentHeading, setCurrentHeading] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [accuracy, setAccuracy] = useState<{
    difference: number;
    accuracy: 'perfect' | 'good' | 'fair' | 'poor';
    isOnTarget: boolean;
  } | null>(null);

  // Animasyonlar
  const compassRotation = new Animated.Value(0);
  const qiblaRotation = new Animated.Value(0);
  const pulseAnimation = new Animated.Value(1);

  useEffect(() => {
    loadQiblaInfo();
    startPulseAnimation();
  }, []);

  useEffect(() => {
    if (qiblaInfo) {
      updateAccuracy();
      animateCompass();
    }
  }, [currentHeading, qiblaInfo]);

  const loadQiblaInfo = async () => {
    try {
      setIsLoading(true);
      const qibla = await calculateQibla();
      
      if (qibla) {
        setQiblaInfo(qibla);
        triggerSuccessHaptic();
      } else {
        Alert.alert(
          'Konum Hatası',
          'Kıble yönü hesaplanamadı. Konum servislerinin açık olduğundan emin olun.',
          [{ text: 'Tamam' }]
        );
      }
    } catch (error) {
      console.warn('Error loading qibla info:', error);
      Alert.alert(
        'Hata',
        'Kıble bilgisi alınamadı. Lütfen tekrar deneyin.',
        [{ text: 'Tamam' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const updateAccuracy = () => {
    if (!qiblaInfo) return;
    
    const acc = getQiblaAccuracy(qiblaInfo.direction, currentHeading);
    setAccuracy(acc);
    
    // Perfect alignment feedback
    if (acc.isOnTarget && acc.accuracy === 'perfect') {
      triggerSuccessHaptic();
    }
  };

  const animateCompass = () => {
    // Pusula rotasyonu
    Animated.timing(compassRotation, {
      toValue: -currentHeading,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Kıble ok rotasyonu
    if (qiblaInfo) {
      Animated.timing(qiblaRotation, {
        toValue: qiblaInfo.direction - currentHeading,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handleRefresh = () => {
    triggerButtonPressHaptic();
    loadQiblaInfo();
  };

  const getAccuracyColor = () => {
    if (!accuracy) return '#94a3b8';
    
    switch (accuracy.accuracy) {
      case 'perfect': return '#22c55e';
      case 'good': return '#84cc16';
      case 'fair': return '#f59e0b';
      case 'poor': return '#ef4444';
      default: return '#94a3b8';
    }
  };

  const getAccuracyText = () => {
    if (!accuracy) return 'Hesaplanıyor...';
    
    switch (accuracy.accuracy) {
      case 'perfect': return 'Mükemmel! Kıbleye tam yönlendiniz';
      case 'good': return 'İyi! Kıbleye yakınsınız';
      case 'fair': return 'Kıble yönünü ayarlayın';
      case 'poor': return 'Kıble yönünden uzaksınız';
      default: return 'Hesaplanıyor...';
    }
  };

  return (
    <View style={[{
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: wp(4),
      padding: wp(6),
    }, style]}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: hp(3)
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="compass" size={wp(6)} color="#ef4444" />
          <Text style={{
            fontSize: rf(18),
            fontWeight: '600',
            color: '#ffffff',
            marginLeft: wp(2)
          }}>
            Kıble Bulucu
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleRefresh}
          disabled={isLoading}
          style={{
            width: wp(10),
            height: wp(10),
            borderRadius: wp(5),
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Ionicons 
            name={isLoading ? "hourglass" : "refresh"} 
            size={wp(5)} 
            color="#ffffff" 
          />
        </TouchableOpacity>
      </View>

      {/* Compass Container */}
      <View style={{
        width: size,
        height: size,
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: hp(3)
      }}>
        {/* Compass Background */}
        <Animated.View style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderWidth: 3,
          borderColor: 'rgba(255, 255, 255, 0.2)',
          position: 'absolute',
          transform: [{ rotate: compassRotation.interpolate({
            inputRange: [0, 360],
            outputRange: ['0deg', '360deg']
          }) }]
        }}>
          {/* Cardinal directions */}
          <View style={{
            position: 'absolute',
            top: wp(2),
            left: 0,
            right: 0,
            alignItems: 'center'
          }}>
            <Text style={{
              fontSize: rf(16),
              fontWeight: 'bold',
              color: '#ef4444'
            }}>
              N
            </Text>
          </View>

          <View style={{
            position: 'absolute',
            bottom: wp(2),
            left: 0,
            right: 0,
            alignItems: 'center'
          }}>
            <Text style={{
              fontSize: rf(14),
              fontWeight: '600',
              color: '#94a3b8'
            }}>
              S
            </Text>
          </View>

          <View style={{
            position: 'absolute',
            left: wp(2),
            top: 0,
            bottom: 0,
            justifyContent: 'center'
          }}>
            <Text style={{
              fontSize: rf(14),
              fontWeight: '600',
              color: '#94a3b8'
            }}>
              W
            </Text>
          </View>

          <View style={{
            position: 'absolute',
            right: wp(2),
            top: 0,
            bottom: 0,
            justifyContent: 'center'
          }}>
            <Text style={{
              fontSize: rf(14),
              fontWeight: '600',
              color: '#94a3b8'
            }}>
              E
            </Text>
          </View>
        </Animated.View>

        {/* Qibla Arrow */}
        {qiblaInfo && (
          <Animated.View style={{
            position: 'absolute',
            transform: [
              { rotate: qiblaRotation.interpolate({
                inputRange: [0, 360],
                outputRange: ['0deg', '360deg']
              }) },
              { scale: pulseAnimation }
            ]
          }}>
            <Ionicons 
              name="arrow-up" 
              size={wp(12)} 
              color={getAccuracyColor()} 
            />
          </Animated.View>
        )}

        {/* Center Dot */}
        <View style={{
          width: wp(4),
          height: wp(4),
          borderRadius: wp(2),
          backgroundColor: '#ffffff',
          position: 'absolute'
        }} />

        {/* Kaaba Icon */}
        {qiblaInfo && accuracy?.isOnTarget && (
          <Animated.View style={{
            position: 'absolute',
            top: wp(8),
            transform: [{ scale: pulseAnimation }]
          }}>
            <Ionicons name="business" size={wp(6)} color="#fbbf24" />
          </Animated.View>
        )}
      </View>

      {/* Details Section */}
      {showDetails && qiblaInfo && (
        <View style={{ width: '100%' }}>
          {/* Accuracy Status */}
          <View style={{
            backgroundColor: accuracy?.isOnTarget 
              ? 'rgba(34, 197, 94, 0.1)' 
              : 'rgba(239, 68, 68, 0.1)',
            borderColor: accuracy?.isOnTarget 
              ? 'rgba(34, 197, 94, 0.3)' 
              : 'rgba(239, 68, 68, 0.3)',
            borderWidth: 1,
            borderRadius: wp(3),
            padding: wp(3),
            marginBottom: hp(2),
            alignItems: 'center'
          }}>
            <Text style={{
              fontSize: rf(14),
              fontWeight: '600',
              color: getAccuracyColor(),
              textAlign: 'center'
            }}>
              {getAccuracyText()}
            </Text>
            
            {accuracy && (
              <Text style={{
                fontSize: rf(12),
                color: '#94a3b8',
                marginTop: hp(0.5)
              }}>
                Fark: {accuracy.difference.toFixed(1)}°
              </Text>
            )}
          </View>

          {/* Info Cards */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between'
          }}>
            <View style={{
              flex: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: wp(3),
              padding: wp(3),
              marginRight: wp(2),
              alignItems: 'center'
            }}>
              <Text style={{
                fontSize: rf(12),
                color: '#94a3b8',
                marginBottom: hp(0.5)
              }}>
                Kıble Yönü
              </Text>
              <Text style={{
                fontSize: rf(16),
                fontWeight: '600',
                color: '#ffffff'
              }}>
                {qiblaInfo.direction.toFixed(1)}°
              </Text>
            </View>

            <View style={{
              flex: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: wp(3),
              padding: wp(3),
              marginLeft: wp(2),
              alignItems: 'center'
            }}>
              <Text style={{
                fontSize: rf(12),
                color: '#94a3b8',
                marginBottom: hp(0.5)
              }}>
                Kabe Mesafesi
              </Text>
              <Text style={{
                fontSize: rf(16),
                fontWeight: '600',
                color: '#ffffff'
              }}>
                {qiblaInfo.distance.toLocaleString()} km
              </Text>
            </View>
          </View>

          {/* Last Update */}
          <Text style={{
            fontSize: rf(11),
            color: '#64748b',
            textAlign: 'center',
            marginTop: hp(1)
          }}>
            Son güncelleme: {qiblaInfo.calculatedAt.toLocaleTimeString('tr-TR')}
          </Text>
        </View>
      )}

      {/* Loading State */}
      {isLoading && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: wp(4)
        }}>
          <Ionicons name="hourglass" size={wp(8)} color="#8b5cf6" />
          <Text style={{
            fontSize: rf(14),
            color: '#ffffff',
            marginTop: hp(1)
          }}>
            Hesaplanıyor...
          </Text>
        </View>
      )}
    </View>
  );
} 