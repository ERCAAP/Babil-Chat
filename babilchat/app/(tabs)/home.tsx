import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DailyVerseCard from '../../src/components/DailyVerseCard';
import { VerseOfDay } from '../../src/utils/dailyVerse';
import { triggerButtonPressHaptic } from '../../src/utils/haptics';
import { getUserStats, getWeeklyProgress } from '../../src/utils/progressTracking';
import { hp, rf, wp } from '../../src/utils/responsive';

interface QuickAction {
  id: string;
  title: string;
  icon: string;
  color: string;
  route: string;
  gradient: string[];
}

const quickActions: QuickAction[] = [
  {
    id: 'qibla',
    title: 'Kıble',
    icon: 'compass',
    color: '#22c55e',
    route: '/(tabs)/qibla',
    gradient: ['#22c55e', '#16a34a']
  },
  {
    id: 'prayer-times',
    title: 'Namaz Vakitleri',
    icon: 'time',
    color: '#3b82f6',
    route: '/(tabs)/prayer-times',
    gradient: ['#3b82f6', '#2563eb']
  },
  {
    id: 'quran',
    title: 'Kuran',
    icon: 'book',
    color: '#8b5cf6',
    route: '/(tabs)/quran',
    gradient: ['#8b5cf6', '#7c3aed']
  },
  {
    id: 'dua',
    title: 'Dualar',
    icon: 'heart',
    color: '#ef4444',
    route: '/(tabs)/dua',
    gradient: ['#ef4444', '#dc2626']
  },
  {
    id: 'chat',
    title: 'AI Rehber',
    icon: 'chatbubble',
    color: '#f59e0b',
    route: '/(tabs)/chat',
    gradient: ['#f59e0b', '#d97706']
  },
  {
    id: 'settings',
    title: 'Ayarlar',
    icon: 'settings',
    color: '#64748b',
    route: '/(tabs)/settings',
    gradient: ['#64748b', '#475569']
  }
];

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [userStats, setUserStats] = useState(null);
  const [weeklyProgress, setWeeklyProgress] = useState(null);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    loadUserData();
    setGreeting(getGreeting());
  }, []);

  const loadUserData = async () => {
    try {
      const [stats, weekly] = await Promise.all([
        getUserStats(),
        getWeeklyProgress()
      ]);
      
      setUserStats(stats);
      if (weekly.success) {
        setWeeklyProgress(weekly.data);
      }
    } catch (error) {
      console.error('Load user data error:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  };

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Günaydın';
    if (hour < 17) return 'İyi öğleden sonralar';
    if (hour < 20) return 'İyi akşamlar';
    return 'İyi geceler';
  };

  const handleQuickAction = (action: QuickAction) => {
    triggerButtonPressHaptic();
    console.log('Quick action:', action.id);
    
    // Navigate to the specific route
    if (action.route.startsWith('/(tabs)/')) {
      router.push(action.route as any);
    }
  };

  const handleVerseRead = (verse: VerseOfDay) => {
    // Refresh stats when verse is read
    loadUserData();
  };

  const handleAchievementUnlocked = (achievements: string[]) => {
    // Show achievement notification
    console.log('New achievements:', achievements);
    // You could show a modal or toast here
  };

  return (
    <LinearGradient colors={['#0f0f23', '#1a1a2e', '#16213e']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: wp(4) }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#8b5cf6"
            />
          }
        >
          {/* Header */}
          <View style={{ 
            paddingVertical: hp(2),
            marginTop: hp(1)
          }}>
            <Text style={{
              fontSize: rf(24),
              fontWeight: 'bold',
              color: '#ffffff',
              marginBottom: hp(0.5)
            }}>
              {greeting} 👋
            </Text>
            <Text style={{
              fontSize: rf(14),
              color: '#94a3b8'
            }}>
              Selamu Aleykum, manevi yolculuğunuza hoş geldiniz
            </Text>
          </View>

          {/* Daily Verse Card */}
          <DailyVerseCard 
            onVerseRead={handleVerseRead}
            onAchievementUnlocked={handleAchievementUnlocked}
          />

          {/* Progress Stats */}
          {userStats && (
            <View style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: wp(4),
              padding: wp(4),
              marginBottom: hp(2),
              borderColor: 'rgba(255, 255, 255, 0.1)',
              borderWidth: 1
            }}>
              <Text style={{
                fontSize: rf(16),
                fontWeight: '600',
                color: '#ffffff',
                marginBottom: hp(2)
              }}>
                📊 Bu Hafta
              </Text>
              
              <View style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between',
                marginBottom: hp(2)
              }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{
                    fontSize: rf(20),
                    fontWeight: 'bold',
                    color: '#22c55e'
                  }}>
                    {userStats.currentStreak}
                  </Text>
                  <Text style={{
                    fontSize: rf(11),
                    color: '#94a3b8',
                    textAlign: 'center'
                  }}>
                    Günlük{'\n'}Seri
                  </Text>
                </View>
                
                <View style={{ alignItems: 'center' }}>
                  <Text style={{
                    fontSize: rf(20),
                    fontWeight: 'bold',
                    color: '#3b82f6'
                  }}>
                    {Math.floor(userStats.totalMinutes / 60)}h
                  </Text>
                  <Text style={{
                    fontSize: rf(11),
                    color: '#94a3b8',
                    textAlign: 'center'
                  }}>
                    Toplam{'\n'}Süre
                  </Text>
                </View>
                
                <View style={{ alignItems: 'center' }}>
                  <Text style={{
                    fontSize: rf(20),
                    fontWeight: 'bold',
                    color: '#8b5cf6'
                  }}>
                    {userStats.readingStats.totalVerses}
                  </Text>
                  <Text style={{
                    fontSize: rf(11),
                    color: '#94a3b8',
                    textAlign: 'center'
                  }}>
                    Okunan{'\n'}Ayet
                  </Text>
                </View>
                
                <View style={{ alignItems: 'center' }}>
                  <Text style={{
                    fontSize: rf(20),
                    fontWeight: 'bold',
                    color: '#ef4444'
                  }}>
                    {userStats.prayerStats.totalPrayers}
                  </Text>
                  <Text style={{
                    fontSize: rf(11),
                    color: '#94a3b8',
                    textAlign: 'center'
                  }}>
                    Yapılan{'\n'}Dua
                  </Text>
                </View>
              </View>

              {/* Progress Bar */}
              {weeklyProgress && (
                <View>
                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: hp(1)
                  }}>
                    <Text style={{
                      fontSize: rf(12),
                      color: '#94a3b8'
                    }}>
                      Haftalık Hedef
                    </Text>
                    <Text style={{
                      fontSize: rf(12),
                      color: '#8b5cf6',
                      fontWeight: '600'
                    }}>
                      {weeklyProgress.goalsAchieved}/{weeklyProgress.goalsTotal}
                    </Text>
                  </View>
                  
                  <View style={{
                    height: hp(0.8),
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: wp(2),
                    overflow: 'hidden'
                  }}>
                    <View style={{
                      height: '100%',
                      width: `${(weeklyProgress.goalsAchieved / weeklyProgress.goalsTotal) * 100}%`,
                      backgroundColor: '#8b5cf6',
                      borderRadius: wp(2)
                    }} />
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Quick Actions */}
          <View style={{ marginBottom: hp(3) }}>
            <Text style={{
              fontSize: rf(18),
              fontWeight: '600',
              color: '#ffffff',
              marginBottom: hp(2)
            }}>
              ⚡ Hızlı Erişim
            </Text>
            
            <View style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between'
            }}>
              {quickActions.map((action, index) => (
                <TouchableOpacity
                  key={action.id}
                  onPress={() => handleQuickAction(action)}
                  style={{
                    width: wp(28),
                    marginBottom: hp(2)
                  }}
                >
                  <LinearGradient
                    colors={action.gradient}
                    style={{
                      aspectRatio: 1,
                      borderRadius: wp(4),
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: hp(1),
                      shadowColor: action.color,
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: 8
                    }}
                  >
                    <Ionicons 
                      name={action.icon as any} 
                      size={wp(8)} 
                      color="#ffffff" 
                    />
                  </LinearGradient>
                  
                  <Text style={{
                    fontSize: rf(12),
                    color: '#ffffff',
                    textAlign: 'center',
                    fontWeight: '500'
                  }}>
                    {action.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Recent Achievements */}
          {userStats && userStats.achievements.length > 0 && (
            <View style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: wp(4),
              padding: wp(4),
              marginBottom: hp(3),
              borderColor: 'rgba(255, 255, 255, 0.1)',
              borderWidth: 1
            }}>
              <Text style={{
                fontSize: rf(16),
                fontWeight: '600',
                color: '#ffffff',
                marginBottom: hp(2)
              }}>
                🏆 Son Başarılar
              </Text>
              
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: wp(4) }}
              >
                {userStats.achievements.slice(-3).map((achievement, index) => (
                  <View
                    key={achievement.id}
                    style={{
                      backgroundColor: 'rgba(139, 92, 246, 0.2)',
                      borderRadius: wp(3),
                      padding: wp(3),
                      marginRight: wp(2),
                      minWidth: wp(32),
                      borderColor: '#8b5cf6',
                      borderWidth: 1
                    }}
                  >
                    <Text style={{
                      fontSize: rf(20),
                      textAlign: 'center',
                      marginBottom: hp(0.5)
                    }}>
                      {achievement.icon}
                    </Text>
                    <Text style={{
                      fontSize: rf(12),
                      fontWeight: '600',
                      color: '#ffffff',
                      textAlign: 'center',
                      marginBottom: hp(0.5)
                    }}>
                      {achievement.title}
                    </Text>
                    <Text style={{
                      fontSize: rf(10),
                      color: '#c4b5fd',
                      textAlign: 'center'
                    }}>
                      {achievement.description}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Footer Spacing */}
          <View style={{ height: hp(2) }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
} 