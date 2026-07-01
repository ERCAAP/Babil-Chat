import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Alert, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { triggerButtonPressHaptic, triggerSelectionFeedback } from '../../src/utils/haptics';
import { changeLocale, getCurrentLocale } from '../../src/utils/i18n';
import { hp, rf, wp } from '../../src/utils/responsive';

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  type: 'toggle' | 'navigation' | 'action';
  value?: boolean;
  action?: () => void;
  gradient?: string[];
}

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [prayerReminders, setPrayerReminders] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState(getCurrentLocale());

  const handleLanguageChange = () => {
    triggerSelectionFeedback();
    
    Alert.alert(
      'Dil Seçimi',
      'Hangi dili kullanmak istiyorsunuz?',
      [
        { text: 'Türkçe', onPress: () => changeLanguage('tr') },
        { text: 'English', onPress: () => changeLanguage('en') },
        { text: 'العربية', onPress: () => changeLanguage('ar') },
        { text: 'İptal', style: 'cancel' }
      ]
    );
  };

  const changeLanguage = (locale: string) => {
    changeLocale(locale);
    setCurrentLanguage(locale);
  };

  const handleBackup = () => {
    triggerButtonPressHaptic();
    Alert.alert('Yedekleme', 'Verileriniz buluta yedekleniyor...', [{ text: 'Tamam' }]);
  };

  const handlePrivacy = () => {
    triggerButtonPressHaptic();
    Alert.alert('Gizlilik', 'Gizlilik ayarları yakında eklenecek.', [{ text: 'Tamam' }]);
  };

  const handleHelp = () => {
    triggerButtonPressHaptic();
    Alert.alert('Yardım', 'Destek sayfası yakında eklenecek.', [{ text: 'Tamam' }]);
  };

  const handleAbout = () => {
    triggerButtonPressHaptic();
    Alert.alert(
      'Babil Chat',
      'Versiyon 1.0.0\n\nManevi rehberlik uygulaması\n\n© 2024 Babil Chat',
      [{ text: 'Tamam' }]
    );
  };

  const settingsData: SettingItem[] = [
    // Notification Settings
    {
      id: 'notifications',
      title: 'Bildirimler',
      subtitle: 'Genel bildirim ayarları',
      icon: 'notifications',
      type: 'toggle',
      value: notificationsEnabled,
      action: () => {
        triggerSelectionFeedback();
        setNotificationsEnabled(!notificationsEnabled);
      },
      gradient: ['#8b5cf6', '#a78bfa']
    },
    {
      id: 'prayer-reminders',
      title: 'Namaz Hatırlatıcıları',
      subtitle: 'Namaz vakitlerinde bildirim al',
      icon: 'time',
      type: 'toggle',
      value: prayerReminders,
      action: () => {
        triggerSelectionFeedback();
        setPrayerReminders(!prayerReminders);
      },
      gradient: ['#22c55e', '#16a34a']
    },
    {
      id: 'dark-mode',
      title: 'Karanlık Mod',
      subtitle: 'Gece temasını kullan',
      icon: 'moon',
      type: 'toggle',
      value: darkMode,
      action: () => {
        triggerSelectionFeedback();
        setDarkMode(!darkMode);
      },
      gradient: ['#1f2937', '#374151']
    },
    // App Settings
    {
      id: 'language',
      title: 'Dil Ayarları',
      subtitle: currentLanguage === 'tr' ? 'Türkçe' : currentLanguage === 'en' ? 'English' : 'العربية',
      icon: 'language',
      type: 'navigation',
      action: handleLanguageChange,
      gradient: ['#3b82f6', '#60a5fa']
    },
    {
      id: 'calculation-method',
      title: 'Hesaplama Metodu',
      subtitle: 'Türkiye Diyanet İşleri',
      icon: 'calculator',
      type: 'navigation',
      gradient: ['#f59e0b', '#fbbf24']
    },
    {
      id: 'backup',
      title: 'Yedekleme',
      subtitle: 'Verilerinizi buluta yedekleyin',
      icon: 'cloud-upload',
      type: 'navigation',
      action: handleBackup,
      gradient: ['#10b981', '#34d399']
    },
    // Support & Info
    {
      id: 'privacy',
      title: 'Gizlilik',
      subtitle: 'Gizlilik ayarları ve veri kullanımı',
      icon: 'shield-checkmark',
      type: 'navigation',
      action: handlePrivacy,
      gradient: ['#ef4444', '#f87171']
    },
    {
      id: 'help', 
      title: 'Yardım & Destek',
      subtitle: 'SSS ve destek merkezi',
      icon: 'help-circle',
      type: 'navigation',
      action: handleHelp,
      gradient: ['#8b5cf6', '#a78bfa']
    },
    {
      id: 'about',
      title: 'Uygulama Hakkında',
      subtitle: 'Versiyon bilgileri ve lisanslar',
      icon: 'information-circle',
      type: 'navigation',
      action: handleAbout,
      gradient: ['#6b7280', '#9ca3af']
    }
  ];

  const renderSettingItem = (item: SettingItem, index: number) => (
    <Animated.View key={item.id} entering={FadeInUp.delay(index * 50)}>
      <TouchableOpacity
        style={{
          marginBottom: hp(2),
          borderRadius: wp(4),
          overflow: 'hidden'
        }}
        onPress={item.action}
        disabled={item.type === 'toggle'}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: wp(4),
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.1)'
          }}
        >
          {/* Icon */}
          <LinearGradient
            colors={item.gradient || ['#8b5cf6', '#a78bfa']}
            style={{
              width: wp(12),
              height: wp(12),
              borderRadius: wp(6),
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: wp(4)
            }}
          >
            <Ionicons name={item.icon as any} size={wp(6)} color="#ffffff" />
          </LinearGradient>

          {/* Content */}
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: rf(16),
              fontWeight: '600',
              color: '#ffffff',
              marginBottom: hp(0.5)
            }}>
              {item.title}
            </Text>
            {item.subtitle && (
              <Text style={{
                fontSize: rf(13),
                color: '#94a3b8',
                lineHeight: rf(18)
              }}>
                {item.subtitle}
              </Text>
            )}
          </View>

          {/* Action */}
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            {item.type === 'toggle' ? (
              <Switch
                value={item.value}
                onValueChange={item.action}
                trackColor={{ false: '#374151', true: '#8b5cf6' }}
                thumbColor="#ffffff"
                ios_backgroundColor="#374151"
              />
            ) : (
              <Ionicons name="chevron-forward" size={wp(5)} color="#94a3b8" />
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

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
              marginBottom: hp(1)
            }}>
              Ayarlar
            </Text>
            <Text style={{
              fontSize: rf(16),
              color: '#94a3b8'
            }}>
              Uygulamayı kişiselleştirin
            </Text>
          </View>

          {/* Settings Sections */}
          
          {/* Notifications Section */}
          <View style={{ marginBottom: hp(4) }}>
            <Text style={{
              fontSize: rf(18),
              fontWeight: '600',
              color: '#ffffff',
              marginBottom: hp(2),
              paddingLeft: wp(2)
            }}>
              🔔 Bildirimler
            </Text>
            {settingsData.slice(0, 3).map((item, index) => renderSettingItem(item, index))}
          </View>

          {/* App Settings Section */}
          <View style={{ marginBottom: hp(4) }}>
            <Text style={{
              fontSize: rf(18),
              fontWeight: '600',
              color: '#ffffff',
              marginBottom: hp(2),
              paddingLeft: wp(2)
            }}>
              ⚙️ Uygulama
            </Text>
            {settingsData.slice(3, 6).map((item, index) => renderSettingItem(item, index + 3))}
          </View>

          {/* Support Section */}
          <View style={{ marginBottom: hp(4) }}>
            <Text style={{
              fontSize: rf(18),
              fontWeight: '600',
              color: '#ffffff',
              marginBottom: hp(2),
              paddingLeft: wp(2)
            }}>
              📞 Destek
            </Text>
            {settingsData.slice(6).map((item, index) => renderSettingItem(item, index + 6))}
          </View>

          {/* App Info */}
          <View style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: wp(4),
            padding: wp(4),
            marginBottom: hp(4),
            alignItems: 'center'
          }}>
            <Text style={{
              fontSize: rf(14),
              color: '#94a3b8',
              textAlign: 'center',
              lineHeight: rf(20)
            }}>
              Babil Chat v1.0.0{'\n'}
              Manevi rehberlik uygulaması{'\n'}
              © 2024 Tüm hakları saklıdır
            </Text>
          </View>

          {/* Bottom padding */}
          <View style={{ height: hp(4) }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
} 