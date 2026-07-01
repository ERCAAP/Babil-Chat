import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { triggerButtonPressHaptic, triggerSelectionFeedback } from '../../src/utils/haptics';
import { changeLocale, getAvailableLocales } from '../../src/utils/i18n';
import { saveLanguageSelection } from '../../src/utils/onboarding';
import { hp, rf, wp } from '../../src/utils/responsive';

const languages = getAvailableLocales();

export default function LanguageScreen() {
  const [selectedLanguage, setSelectedLanguage] = useState('tr');

  const handleLanguageSelect = (languageCode: string) => {
    triggerSelectionFeedback();
    setSelectedLanguage(languageCode);
    changeLocale(languageCode);
  };

  const handleContinue = async () => {
    triggerButtonPressHaptic();
    await saveLanguageSelection(selectedLanguage);
    router.push('/(onboarding)/location');
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
                Adım 2/5
              </Text>
              <View style={{
                width: wp(20),
                height: hp(0.5),
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: wp(2),
                marginTop: hp(0.5)
              }}>
                <View style={{
                  width: '40%',
                  height: '100%',
                  backgroundColor: '#8b5cf6',
                  borderRadius: wp(2)
                }} />
              </View>
            </View>

            <View style={{ width: wp(10) }} />
          </View>

          {/* Content */}
          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
            <View style={{ alignItems: 'center', marginTop: hp(4) }}>
              <View style={{
                width: wp(20),
                height: wp(20),
                borderRadius: wp(10),
                backgroundColor: 'rgba(139, 92, 246, 0.2)',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: hp(3)
              }}>
                <Ionicons name="language" size={wp(10)} color="#8b5cf6" />
              </View>

              <Text style={{
                fontSize: rf(28),
                fontWeight: 'bold',
                color: '#ffffff',
                textAlign: 'center',
                marginBottom: hp(1)
              }}>
                Dil Seçimi
              </Text>

              <Text style={{
                fontSize: rf(16),
                color: '#94a3b8',
                textAlign: 'center',
                lineHeight: rf(24),
                marginBottom: hp(4),
                paddingHorizontal: wp(4)
              }}>
                Uygulamayı hangi dilde kullanmak istiyorsunuz?
              </Text>
            </View>

            {/* Language Options */}
            <View style={{ paddingHorizontal: wp(2) }}>
              {languages.map((language) => (
                <TouchableOpacity
                  key={language.code}
                  onPress={() => handleLanguageSelect(language.code)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: selectedLanguage === language.code 
                      ? 'rgba(139, 92, 246, 0.2)' 
                      : 'rgba(255, 255, 255, 0.05)',
                    borderColor: selectedLanguage === language.code 
                      ? '#8b5cf6' 
                      : 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 2,
                    borderRadius: wp(4),
                    paddingVertical: hp(2),
                    paddingHorizontal: wp(4),
                    marginBottom: hp(2)
                  }}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selectedLanguage === language.code }}
                  accessibilityLabel={`${language.name} dili`}
                >
                  <Text style={{
                    fontSize: rf(24),
                    marginRight: wp(3)
                  }}>
                    {language.flag}
                  </Text>

                  <View style={{ flex: 1 }}>
                    <Text style={{
                      fontSize: rf(18),
                      fontWeight: '600',
                      color: '#ffffff',
                      marginBottom: hp(0.5)
                    }}>
                      {language.name}
                    </Text>
                    
                    <Text style={{
                      fontSize: rf(14),
                      color: '#94a3b8'
                    }}>
                      {language.code === 'tr' && 'Türkçe - Ana dil'}
                      {language.code === 'en' && 'English - International'}
                      {language.code === 'ar' && 'العربية - لغة القرآن'}
                    </Text>
                  </View>

                  {selectedLanguage === language.code && (
                    <View style={{
                      width: wp(6),
                      height: wp(6),
                      borderRadius: wp(3),
                      backgroundColor: '#8b5cf6',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Ionicons name="checkmark" size={wp(4)} color="#ffffff" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Info Card */}
            <View style={{
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              borderColor: 'rgba(34, 197, 94, 0.3)',
              borderWidth: 1,
              borderRadius: wp(3),
              padding: wp(4),
              marginTop: hp(2),
              marginBottom: hp(4)
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: hp(1) }}>
                <Ionicons name="information-circle" size={wp(5)} color="#22c55e" />
                <Text style={{
                  fontSize: rf(14),
                  fontWeight: '600',
                  color: '#22c55e',
                  marginLeft: wp(2)
                }}>
                  Bilgi
                </Text>
              </View>
              <Text style={{
                fontSize: rf(13),
                color: '#dcfce7',
                lineHeight: rf(18)
              }}>
                Dil seçiminizi daha sonra Ayarlar bölümünden değiştirebilirsiniz. 
                Arapça seçildiğinde uygulama sağdan sola düzende görüntülenir.
              </Text>
            </View>
          </ScrollView>

          {/* Bottom Button */}
          <View style={{ paddingVertical: hp(2) }}>
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
              accessibilityLabel="Devam et"
            >
              <Text style={{
                color: '#ffffff',
                fontSize: rf(16),
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}>
                Devam Et
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
} 