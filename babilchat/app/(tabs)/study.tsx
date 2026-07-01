import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    Dimensions,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    FadeInRight,
    FadeInUp,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface StudyCategory {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: string[];
  itemCount: number;
}

interface StudyItem {
  id: string;
  title: string;
  subtitle: string;
  progress?: number;
  category: string;
  isCompleted: boolean;
}

const studyCategories: StudyCategory[] = [
  {
    id: 'quran',
    title: 'Kur\'an-ı Kerim',
    icon: 'book',
    gradient: ['#10b981', '#34d399'],
    itemCount: 114,
  },
  {
    id: 'hadith',
    title: 'Hadis-i Şerif',
    icon: 'library',
    gradient: ['#3b82f6', '#60a5fa'],
    itemCount: 42,
  },
  {
    id: 'prayers',
    title: 'Dualar',
    icon: 'heart',
    gradient: ['#ef4444', '#f87171'],
    itemCount: 25,
  },
  {
    id: 'names',
    title: 'Esma-ül Hüsna',
    icon: 'sparkles',
    gradient: ['#f59e0b', '#fbbf24'],
    itemCount: 99,
  },
];

const studyPlans: StudyItem[] = [
  {
    id: '1',
    title: 'Kur\'an Hatmi',
    subtitle: '30 günde tamamla',
    progress: 35,
    category: 'quran',
    isCompleted: false,
  },
  {
    id: '2',
    title: 'Günlük Dualar',
    subtitle: 'Sabah akşam duaları',
    progress: 80,
    category: 'prayers',
    isCompleted: false,
  },
  {
    id: '3',
    title: 'Esma-ül Hüsna',
    subtitle: 'Allah\'ın 99 ismi',
    progress: 100,
    category: 'names',
    isCompleted: true,
  },
];

const recentSurahs = [
  { id: '1', name: 'Fatiha', arabicName: 'الفاتحة', verseCount: 7, lastRead: '2 saat önce' },
  { id: '2', name: 'Bakara', arabicName: 'البقرة', verseCount: 286, lastRead: '1 gün önce' },
  { id: '3', name: 'Ali İmran', arabicName: 'آل عمران', verseCount: 200, lastRead: '2 gün önce' },
];

export default function StudyScreen() {
  const [selectedTab, setSelectedTab] = useState<'categories' | 'plans' | 'recent'>('categories');

  const renderCategory = ({ item, index }: { item: StudyCategory; index: number }) => (
    <Animated.View entering={FadeInUp.delay(index * 100)}>
      <TouchableOpacity style={styles.categoryCard}>
        <LinearGradient
          colors={item.gradient}
          style={styles.categoryGradient}
        >
          <Ionicons name={item.icon} size={32} color="#ffffff" />
          <Text style={styles.categoryTitle}>{item.title}</Text>
          <Text style={styles.categoryCount}>{item.itemCount} içerik</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderStudyPlan = ({ item, index }: { item: StudyItem; index: number }) => (
    <Animated.View entering={FadeInRight.delay(index * 100)}>
      <LinearGradient
        colors={['#1a1a1a', '#2d2d2d']}
        style={styles.planCard}
      >
        <View style={styles.planHeader}>
          <View style={styles.planInfo}>
            <Text style={styles.planTitle}>{item.title}</Text>
            <Text style={styles.planSubtitle}>{item.subtitle}</Text>
          </View>
          {item.isCompleted && (
            <Ionicons name="checkmark-circle" size={24} color="#10b981" />
          )}
        </View>
        
        {!item.isCompleted && item.progress !== undefined && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={['#7c3aed', '#8b5cf6']}
                style={[styles.progressFill, { width: `${item.progress}%` }]}
              />
            </View>
            <Text style={styles.progressText}>%{item.progress}</Text>
          </View>
        )}
      </LinearGradient>
    </Animated.View>
  );

  const renderRecentSurah = ({ item, index }: { item: any; index: number }) => (
    <Animated.View entering={FadeInRight.delay(index * 100)}>
      <LinearGradient
        colors={['#1a1a1a', '#2d2d2d']}
        style={styles.surahCard}
      >
        <View style={styles.surahInfo}>
          <Text style={styles.surahName}>{item.name}</Text>
          <Text style={styles.surahArabic}>{item.arabicName}</Text>
          <Text style={styles.surahDetails}>{item.verseCount} ayet • {item.lastRead}</Text>
        </View>
        <TouchableOpacity style={styles.playButton}>
          <LinearGradient
            colors={['#7c3aed', '#8b5cf6']}
            style={styles.playGradient}
          >
            <Ionicons name="play" size={16} color="#ffffff" />
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );

  return (
    <LinearGradient
      colors={['#0f0f23', '#1a1a2e', '#16213e']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Çalışma Merkezi</Text>
          <Text style={styles.headerSubtitle}>Manevi eğitiminize devam edin</Text>
        </View>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <LinearGradient
            colors={['#1a1a1a', '#2d2d2d']}
            style={styles.tabSelector}
          >
            <TouchableOpacity
              onPress={() => setSelectedTab('categories')}
              style={[
                styles.tabButton,
                selectedTab === 'categories' && styles.tabButtonActive,
              ]}
            >
              <LinearGradient
                colors={selectedTab === 'categories' ? ['#7c3aed', '#8b5cf6'] : ['transparent', 'transparent']}
                style={styles.tabButtonGradient}
              >
                <Text style={[
                  styles.tabButtonText,
                  selectedTab === 'categories' && styles.tabButtonTextActive,
                ]}>
                  Kategoriler
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSelectedTab('plans')}
              style={[
                styles.tabButton,
                selectedTab === 'plans' && styles.tabButtonActive,
              ]}
            >
              <LinearGradient
                colors={selectedTab === 'plans' ? ['#7c3aed', '#8b5cf6'] : ['transparent', 'transparent']}
                style={styles.tabButtonGradient}
              >
                <Text style={[
                  styles.tabButtonText,
                  selectedTab === 'plans' && styles.tabButtonTextActive,
                ]}>
                  Planlarım
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSelectedTab('recent')}
              style={[
                styles.tabButton,
                selectedTab === 'recent' && styles.tabButtonActive,
              ]}
            >
              <LinearGradient
                colors={selectedTab === 'recent' ? ['#7c3aed', '#8b5cf6'] : ['transparent', 'transparent']}
                style={styles.tabButtonGradient}
              >
                <Text style={[
                  styles.tabButtonText,
                  selectedTab === 'recent' && styles.tabButtonTextActive,
                ]}>
                  Son Okunanlar
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {selectedTab === 'categories' && (
            <FlatList
              data={studyCategories}
              renderItem={renderCategory}
              numColumns={2}
              contentContainerStyle={styles.categoriesGrid}
              showsVerticalScrollIndicator={false}
            />
          )}

          {selectedTab === 'plans' && (
            <ScrollView
              contentContainerStyle={styles.plansContainer}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.statsCard}>
                <LinearGradient
                  colors={['#1a1a1a', '#2d2d2d']}
                  style={styles.statsGradient}
                >
                  <Text style={styles.statsTitle}>Bu Hafta</Text>
                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>5</Text>
                      <Text style={styles.statLabel}>Gün</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>45</Text>
                      <Text style={styles.statLabel}>Dakika</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>12</Text>
                      <Text style={styles.statLabel}>Sure</Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>

              <FlatList
                data={studyPlans}
                renderItem={renderStudyPlan}
                scrollEnabled={false}
                contentContainerStyle={styles.plansList}
              />
            </ScrollView>
          )}

          {selectedTab === 'recent' && (
            <FlatList
              data={recentSurahs}
              renderItem={renderRecentSurah}
              contentContainerStyle={styles.recentList}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#94a3b8',
  },
  tabContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tabSelector: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
  },
  tabButtonActive: {
    elevation: 2,
  },
  tabButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#94a3b8',
  },
  tabButtonTextActive: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  categoriesGrid: {
    paddingBottom: 100,
  },
  categoryCard: {
    width: (width - 60) / 2,
    marginBottom: 16,
    marginHorizontal: 8,
  },
  categoryGradient: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 16,
    textAlign: 'center',
  },
  categoryCount: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  plansContainer: {
    paddingBottom: 100,
  },
  statsCard: {
    marginBottom: 24,
  },
  statsGradient: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8b5cf6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#94a3b8',
  },
  plansList: {
    gap: 16,
  },
  planCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  planInfo: {
    flex: 1,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  planSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8b5cf6',
    minWidth: 40,
    textAlign: 'right',
  },
  recentList: {
    paddingBottom: 100,
    gap: 16,
  },
  surahCard: {
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  surahInfo: {
    flex: 1,
  },
  surahName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  surahArabic: {
    fontSize: 16,
    color: '#8b5cf6',
    marginBottom: 8,
    fontFamily: 'Geeza Pro',
  },
  surahDetails: {
    fontSize: 14,
    color: '#94a3b8',
  },
  playButton: {
    marginLeft: 16,
  },
  playGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 