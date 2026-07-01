import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QiblaCompass from '../../src/components/QiblaCompass';
import { hp, rf, wp } from '../../src/utils/responsive';

export default function QiblaScreen() {
  return (
    <LinearGradient colors={['#0f0f23', '#1a1a2e', '#16213e']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: wp(6),
            paddingVertical: hp(2)
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={{ marginBottom: hp(4), marginTop: hp(2) }}>
            <Text style={{
              fontSize: rf(28),
              fontWeight: 'bold',
              color: '#ffffff',
              marginBottom: hp(1),
              textAlign: 'center'
            }}>
              Kıble Puslası
            </Text>
            <Text style={{
              fontSize: rf(16),
              color: '#94a3b8',
              textAlign: 'center'
            }}>
              Kabe yönünü bulmak için telefonunuzu düz tutun
            </Text>
          </View>

          {/* Qibla Compass */}
          <QiblaCompass 
            size={wp(80)}
            showDetails={true}
            style={{ marginBottom: hp(4) }}
          />

          {/* Instructions */}
          <View style={{
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderColor: 'rgba(59, 130, 246, 0.3)',
            borderWidth: 1,
            borderRadius: wp(4),
            padding: wp(4),
            marginBottom: hp(3)
          }}>
            <Text style={{
              fontSize: rf(16),
              fontWeight: '600',
              color: '#3b82f6',
              marginBottom: hp(2),
              textAlign: 'center'
            }}>
              📱 Nasıl Kullanılır?
            </Text>
            
            <View style={{ marginBottom: hp(2) }}>
              <Text style={{
                fontSize: rf(14),
                color: '#dbeafe',
                lineHeight: rf(20),
                marginBottom: hp(1)
              }}>
                1. Telefonunuzu düz ve sabit tutun
              </Text>
              <Text style={{
                fontSize: rf(14),
                color: '#dbeafe',
                lineHeight: rf(20),
                marginBottom: hp(1)
              }}>
                2. Yeşil ok Kabe yönünü gösterir
              </Text>
              <Text style={{
                fontSize: rf(14),
                color: '#dbeafe',
                lineHeight: rf(20),
                marginBottom: hp(1)
              }}>
                3. Pusula kırmızı N harfini kuzeye çevirin
              </Text>
              <Text style={{
                fontSize: rf(14),
                color: '#dbeafe',
                lineHeight: rf(20)
              }}>
                4. Yeşil ok tam ortada olduğunda kıbleye yönlenmiş olursunuz
              </Text>
            </View>
          </View>

          {/* Tips */}
          <View style={{
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            borderColor: 'rgba(34, 197, 94, 0.3)',
            borderWidth: 1,
            borderRadius: wp(4),
            padding: wp(4),
            marginBottom: hp(3)
          }}>
            <Text style={{
              fontSize: rf(16),
              fontWeight: '600',
              color: '#22c55e',
              marginBottom: hp(2),
              textAlign: 'center'
            }}>
              💡 İpuçları
            </Text>
            
            <Text style={{
              fontSize: rf(14),
              color: '#dcfce7',
              lineHeight: rf(20),
              textAlign: 'center'
            }}>
              • Metal objelerden uzak durun{'\n'}
              • Açık alanda daha iyi çalışır{'\n'}
              • Telefonunuzu kalibre etmek için 8 şeklinde hareket ettirin{'\n'}
              • GPS sinyali güçlü olduğundan emin olun
            </Text>
          </View>

          {/* Privacy Note */}
          <View style={{
            backgroundColor: 'rgba(107, 114, 128, 0.1)',
            borderColor: 'rgba(107, 114, 128, 0.3)',
            borderWidth: 1,
            borderRadius: wp(4),
            padding: wp(4),
            marginBottom: hp(4)
          }}>
            <Text style={{
              fontSize: rf(12),
              color: '#9ca3af',
              textAlign: 'center',
              lineHeight: rf(18)
            }}>
              🔒 Gizlilik: Konum bilginiz sadece kıble yönü hesaplaması için kullanılır ve hiçbir yere gönderilmez.
            </Text>
          </View>

          {/* Bottom padding */}
          <View style={{ height: hp(4) }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
} 