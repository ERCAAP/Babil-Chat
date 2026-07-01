import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    FadeInRight,
    FadeInUp,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ProfileStats {
  prayers: number;
  studies: number;
  streak: number;
  level: number;
}

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  type: 'toggle' | 'navigation' | 'action';
  value?: boolean;
  action?: () => void;
}

const userStats: ProfileStats = {
  prayers: 142,
  studies: 28,
  streak: 7,
  level: 5,
};

export default function ProfileScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [prayerReminders, setPrayerReminders] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const settingsData: SettingItem[] = [
    {
      id: 'notifications',
      title: 'Bildirimler',
      subtitle: 'Genel bildirim ayarları',
      icon: 'notifications',
      type: 'toggle',
      value: notificationsEnabled,
      action: () => setNotificationsEnabled(!notificationsEnabled),
    },
    {
      id: 'prayer-reminders',
      title: 'Namaz Hatırlatıcıları',
      subtitle: 'Namaz vakitlerinde bildirim al',
      icon: 'time',
      type: 'toggle',
      value: prayerReminders,
      action: () => setPrayerReminders(!prayerReminders),
    },
    {
      id: 'dark-mode',
      title: 'Karanlık Mod',
      subtitle: 'Gece temasını kullan',
      icon: 'moon',
      type: 'toggle',
      value: darkMode,
      action: () => setDarkMode(!darkMode),
    },
    {
      id: 'language',
      title: 'Dil Ayarları',
      subtitle: 'Türkçe',
      icon: 'language',
      type: 'navigation',
    },
    {
      id: 'backup',
      title: 'Yedekleme',
      subtitle: 'Verilerinizi yedekleyin',
      icon: 'cloud-upload',
      type: 'navigation',
    },
    {
      id: 'privacy',
      title: 'Gizlilik',
      subtitle: 'Gizlilik ayarları',
      icon: 'shield-checkmark',
      type: 'navigation',
    },
    {
      id: 'help',
      title: 'Yardım & Destek',
      subtitle: 'Sık sorulan sorular',
      icon: 'help-circle',
      type: 'navigation',
    },
    {
      id: 'about',
      title: 'Uygulama Hakkında',
      subtitle: 'Versiyon 1.0.0',
      icon: 'information-circle',
      type: 'navigation',
    },
  ];

  const handleSettingPress = (item: SettingItem) => {
    if (item.action) {
      item.action();
    } else if (item.type === 'navigation') {
      // Navigate to specific screen
      Alert.alert('Yakında', `${item.title} sayfası yakında gelecek!`);
    }
  };

  const renderStatCard = (title: string, value: number, icon: keyof typeof Ionicons.glyphMap, gradient: string[], index: number) => (
    <Animated.View entering={FadeInUp.delay(index * 100)} style={styles.statCard}>
      <LinearGradient
        colors={gradient}
        style={styles.statGradient}
      >
        <Ionicons name={icon} size={24} color="#ffffff" />
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </LinearGradient>
    </Animated.View>
  );

  const renderSettingItem = (item: SettingItem, index: number) => (
    <Animated.View key={item.id} entering={FadeInRight.delay(index * 50)}>
      <TouchableOpacity
        style={styles.settingItem}
        onPress={() => handleSettingPress(item)}
        disabled={item.type === 'toggle'}
      >
        <LinearGradient
          colors={['#1a1a1a', '#2d2d2d']}
          style={styles.settingGradient}
        >
          <View style={styles.settingIcon}>
            <LinearGradient
              colors={['#7c3aed', '#8b5cf6']}
              style={styles.settingIconGradient}
            >
              <Ionicons name={item.icon} size={20} color="#ffffff" />
            </LinearGradient>
          </View>
          
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>{item.title}</Text>
            {item.subtitle && (
              <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
            )}
          </View>
          
          <View style={styles.settingAction}>
            {item.type === 'toggle' ? (
              <Switch
                value={item.value}
                onValueChange={item.action}
                trackColor={{ false: '#374151', true: '#8b5cf6' }}
                thumbColor="#ffffff"
                ios_backgroundColor="#374151"
              />
            ) : (
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <LinearGradient
      colors={['#0f0f23', '#1a1a2e', '#16213e']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Header */}
          <Animated.View entering={FadeInUp.delay(100)} style={styles.profileHeader}>
            <LinearGradient
              colors={['#7c3aed', '#8b5cf6']}
              style={styles.profileAvatar}
            >
              <Ionicons name="person" size={48} color="#ffffff" />
            </LinearGradient>
            <Text style={styles.profileName}>Hoş Geldiniz</Text>
            <Text style={styles.profileEmail}>kullanici@email.com</Text>
            
            <TouchableOpacity style={styles.editProfileButton}>
              <LinearGradient
                colors={['#1a1a1a', '#2d2d2d']}
                style={styles.editProfileGradient}
              >
                <Ionicons name="create-outline" size={16} color="#8b5cf6" />
                <Text style={styles.editProfileText}>Profili Düzenle</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Stats Section */}
          <Animated.View entering={FadeInUp.delay(200)} style={styles.statsSection}>
            <Text style={styles.sectionTitle}>İstatistiklerim</Text>
            <View style={styles.statsGrid}>
              {renderStatCard('Dua', userStats.prayers, 'heart', ['#ef4444', '#f87171'], 0)}
              {renderStatCard('Çalışma', userStats.studies, 'book', ['#10b981', '#34d399'], 1)}
              {renderStatCard('Seri', userStats.streak, 'flame', ['#f59e0b', '#fbbf24'], 2)}
              {renderStatCard('Seviye', userStats.level, 'trophy', ['#8b5cf6', '#a78bfa'], 3)}
            </View>
          </Animated.View>

          {/* Achievement Section */}
          <Animated.View entering={FadeInUp.delay(300)} style={styles.achievementSection}>
            <Text style={styles.sectionTitle}>Son Başarılar</Text>
            <LinearGradient
              colors={['#1a1a1a', '#2d2d2d']}
              style={styles.achievementCard}
            >
              <View style={styles.achievementIcon}>
                <LinearGradient
                  colors={['#f59e0b', '#fbbf24']}
                  style={styles.achievementIconGradient}
                >
                  <Ionicons name="star" size={24} color="#ffffff" />
                </LinearGradient>
              </View>
              <View style={styles.achievementContent}>
                <Text style={styles.achievementTitle}>7 Günlük Seri!</Text>
                <Text style={styles.achievementDescription}>
                  Tebrikler! 7 gün üst üste dua ettiniz.
                </Text>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Settings Section */}
          <Animated.View entering={FadeInUp.delay(400)} style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>Ayarlar</Text>
            <View style={styles.settingsList}>
              {settingsData.map((item, index) => renderSettingItem(item, index))}
            </View>
          </Animated.View>

          {/* Logout Section */}
          <Animated.View entering={FadeInUp.delay(500)} style={styles.logoutSection}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={() => Alert.alert('Çıkış', 'Çıkış yapmak istediğinizden emin misiniz?')}
            >
              <LinearGradient
                colors={['#dc2626', '#ef4444']}
                style={styles.logoutGradient}
              >
                <Ionicons name="log-out-outline" size={20} color="#ffffff" />
                <Text style={styles.logoutText}>Çıkış Yap</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: '#94a3b8',
    marginBottom: 20,
  },
  editProfileButton: {
    marginTop: 8,
  },
  editProfileGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  editProfileText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8b5cf6',
    marginLeft: 8,
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
  },
  statGradient: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 8,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  achievementSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  achievementIcon: {
    marginRight: 16,
  },
  achievementIconGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
  },
  settingsSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  settingsList: {
    gap: 12,
  },
  settingItem: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  settingIcon: {
    marginRight: 16,
  },
  settingIconGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
  },
  settingAction: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  logoutButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  logoutGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
}); 