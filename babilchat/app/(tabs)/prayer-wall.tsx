import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, {
    FadeInUp
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface Prayer {
  id: string;
  title: string;
  content: string;
  author: string;
  timestamp: Date;
  category: 'health' | 'family' | 'guidance' | 'gratitude' | 'other';
  prayerCount: number;
  isAnonymous: boolean;
  userHasPrayed: boolean;
}

interface PrayerCategory {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string[];
}

const categories: PrayerCategory[] = [
  {
    id: 'all',
    name: 'Tümü',
    icon: 'apps',
    color: ['#8b5cf6', '#a78bfa'],
  },
  {
    id: 'health',
    name: 'Sağlık',
    icon: 'medical',
    color: ['#10b981', '#34d399'],
  },
  {
    id: 'family',
    name: 'Aile',
    icon: 'people',
    color: ['#f59e0b', '#fbbf24'],
  },
  {
    id: 'guidance',
    name: 'Rehberlik',
    icon: 'compass',
    color: ['#3b82f6', '#60a5fa'],
  },
  {
    id: 'gratitude',
    name: 'Şükür',
    icon: 'heart',
    color: ['#ef4444', '#f87171'],
  },
];

const samplePrayers: Prayer[] = [
  {
    id: '1',
    title: 'Ailem için dua',
    content: 'Ailemin sağlığı ve huzuru için dua ediyorum. Allah onları korusun ve bizleri daima bir arada tutsun.',
    author: 'Fatma K.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    category: 'family',
    prayerCount: 23,
    isAnonymous: false,
    userHasPrayed: false,
  },
  {
    id: '2',
    title: 'İş başvurusu için',
    content: 'İnşallah yeni iş başvurumda başarılı olurum. Allah bana en hayırlısını nasip etsin.',
    author: 'Anonim',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    category: 'guidance',
    prayerCount: 15,
    isAnonymous: true,
    userHasPrayed: true,
  },
  {
    id: '3',
    title: 'Hastanedeki annem için',
    content: 'Annemin ameliyatı var. Allah şifa versin, sağlığına kavuşsun inşallah.',
    author: 'Mehmet A.',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    category: 'health',
    prayerCount: 45,
    isAnonymous: false,
    userHasPrayed: false,
  },
];

export default function PrayerWallScreen() {
  const [prayers, setPrayers] = useState<Prayer[]>(samplePrayers);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPrayer, setNewPrayer] = useState({
    title: '',
    content: '',
    category: 'other' as Prayer['category'],
    isAnonymous: false,
  });

  const handlePrayForSomeone = (prayerId: string) => {
    setPrayers(prev => prev.map(prayer => 
      prayer.id === prayerId 
        ? { 
            ...prayer, 
            prayerCount: prayer.userHasPrayed ? prayer.prayerCount - 1 : prayer.prayerCount + 1,
            userHasPrayed: !prayer.userHasPrayed 
          }
        : prayer
    ));
  };

  const handleSubmitPrayer = () => {
    if (!newPrayer.title.trim() || !newPrayer.content.trim()) {
      Alert.alert('Hata', 'Lütfen başlık ve dua metnini doldurun.');
      return;
    }

    const prayer: Prayer = {
      id: Date.now().toString(),
      title: newPrayer.title.trim(),
      content: newPrayer.content.trim(),
      author: newPrayer.isAnonymous ? 'Anonim' : 'Sen',
      timestamp: new Date(),
      category: newPrayer.category,
      prayerCount: 0,
      isAnonymous: newPrayer.isAnonymous,
      userHasPrayed: false,
    };

    setPrayers(prev => [prayer, ...prev]);
    setNewPrayer({
      title: '',
      content: '',
      category: 'other',
      isAnonymous: false,
    });
    setShowAddModal(false);
  };

  const filteredPrayers = selectedCategory === 'all' 
    ? prayers 
    : prayers.filter(prayer => prayer.category === selectedCategory);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Şimdi';
    if (diffInHours < 24) return `${diffInHours} saat önce`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} gün önce`;
  };

  const getCategoryIcon = (category: Prayer['category']) => {
    const categoryData = categories.find(cat => cat.id === category);
    return categoryData?.icon || 'ellipse';
  };

  const getCategoryColor = (category: Prayer['category']) => {
    const categoryData = categories.find(cat => cat.id === category);
    return categoryData?.color || ['#6b7280', '#9ca3af'];
  };

  return (
    <LinearGradient
      colors={['#0f0f23', '#1a1a2e', '#16213e']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dua Duvarı</Text>
          <Text style={styles.headerSubtitle}>Topluluk ile dua paylaş</Text>
        </View>

        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContent}
          >
            {categories.map((category, index) => (
              <Animated.View key={category.id} entering={FadeInUp.delay(index * 100)}>
                <TouchableOpacity
                  onPress={() => setSelectedCategory(category.id)}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category.id && styles.categoryButtonActive,
                  ]}
                >
                  <LinearGradient
                    colors={selectedCategory === category.id ? category.color : ['#1a1a1a', '#2d2d2d']}
                    style={styles.categoryGradient}
                  >
                    <Ionicons 
                      name={category.icon} 
                      size={20} 
                      color={selectedCategory === category.id ? '#ffffff' : '#94a3b8'} 
                    />
                    <Text style={[
                      styles.categoryText,
                      selectedCategory === category.id && styles.categoryTextActive,
                    ]}>
                      {category.name}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </ScrollView>
        </View>

        {/* Prayers List */}
        <ScrollView
          style={styles.prayersContainer}
          contentContainerStyle={styles.prayersContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredPrayers.map((prayer, index) => (
            <Animated.View
              key={prayer.id}
              entering={FadeInUp.delay(index * 100)}
              style={styles.prayerCard}
            >
              <LinearGradient
                colors={['#1a1a1a', '#2d2d2d']}
                style={styles.prayerGradient}
              >
                {/* Prayer Header */}
                <View style={styles.prayerHeader}>
                  <View style={styles.prayerAuthor}>
                    <LinearGradient
                      colors={getCategoryColor(prayer.category)}
                      style={styles.authorAvatar}
                    >
                      <Ionicons 
                        name={getCategoryIcon(prayer.category)} 
                        size={16} 
                        color="#ffffff" 
                      />
                    </LinearGradient>
                    <View style={styles.authorInfo}>
                      <Text style={styles.authorName}>{prayer.author}</Text>
                      <Text style={styles.prayerTime}>{formatTimeAgo(prayer.timestamp)}</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.moreButton}>
                    <Ionicons name="ellipsis-horizontal" size={20} color="#94a3b8" />
                  </TouchableOpacity>
                </View>

                {/* Prayer Content */}
                <Text style={styles.prayerTitle}>{prayer.title}</Text>
                <Text style={styles.prayerContent}>{prayer.content}</Text>

                {/* Prayer Actions */}
                <View style={styles.prayerActions}>
                  <TouchableOpacity
                    onPress={() => handlePrayForSomeone(prayer.id)}
                    style={[
                      styles.prayButton,
                      prayer.userHasPrayed && styles.prayButtonActive,
                    ]}
                  >
                    <LinearGradient
                      colors={prayer.userHasPrayed ? ['#7c3aed', '#8b5cf6'] : ['#374151', '#4b5563']}
                      style={styles.prayButtonGradient}
                    >
                      <Ionicons 
                        name={prayer.userHasPrayed ? "heart" : "heart-outline"} 
                        size={16} 
                        color="#ffffff" 
                      />
                      <Text style={styles.prayButtonText}>
                        {prayer.userHasPrayed ? 'Dua Ettim' : 'Dua Et'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  
                  <View style={styles.prayerStats}>
                    <Text style={styles.prayerCount}>{prayer.prayerCount} kişi dua etti</Text>
                  </View>
                </View>
              </LinearGradient>
            </Animated.View>
          ))}
        </ScrollView>

        {/* Floating Add Button */}
        <TouchableOpacity
          onPress={() => setShowAddModal(true)}
          style={styles.fabButton}
        >
          <LinearGradient
            colors={['#7c3aed', '#8b5cf6']}
            style={styles.fabGradient}
          >
            <Ionicons name="add" size={28} color="#ffffff" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Add Prayer Modal */}
        <Modal
          visible={showAddModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <LinearGradient
            colors={['#0f0f23', '#1a1a2e', '#16213e']}
            style={styles.modalContainer}
          >
            <SafeAreaView style={styles.modalSafeArea}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  onPress={() => setShowAddModal(false)}
                  style={styles.modalCloseButton}
                >
                  <Text style={styles.modalCloseText}>İptal</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Dua Ekle</Text>
                <TouchableOpacity
                  onPress={handleSubmitPrayer}
                  style={styles.modalSubmitButton}
                >
                  <Text style={styles.modalSubmitText}>Paylaş</Text>
                </TouchableOpacity>
              </View>

              {/* Modal Content */}
              <ScrollView style={styles.modalContent}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Başlık</Text>
                  <LinearGradient
                    colors={['#1a1a1a', '#2d2d2d']}
                    style={styles.inputGradient}
                  >
                    <TextInput
                      style={styles.textInput}
                      value={newPrayer.title}
                      onChangeText={(text) => setNewPrayer(prev => ({ ...prev, title: text }))}
                      placeholder="Dua konusu..."
                      placeholderTextColor="#94a3b8"
                      maxLength={100}
                    />
                  </LinearGradient>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Dua Metni</Text>
                  <LinearGradient
                    colors={['#1a1a1a', '#2d2d2d']}
                    style={[styles.inputGradient, styles.textAreaGradient]}
                  >
                    <TextInput
                      style={[styles.textInput, styles.textArea]}
                      value={newPrayer.content}
                      onChangeText={(text) => setNewPrayer(prev => ({ ...prev, content: text }))}
                      placeholder="Duanızı buraya yazın..."
                      placeholderTextColor="#94a3b8"
                      multiline
                      maxLength={500}
                    />
                  </LinearGradient>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Kategori</Text>
                  <View style={styles.categorySelector}>
                    {categories.slice(1).map((category) => (
                      <TouchableOpacity
                        key={category.id}
                        onPress={() => setNewPrayer(prev => ({ ...prev, category: category.id as Prayer['category'] }))}
                        style={[
                          styles.categorySelectorButton,
                          newPrayer.category === category.id && styles.categorySelectorButtonActive,
                        ]}
                      >
                        <LinearGradient
                          colors={newPrayer.category === category.id ? category.color : ['#1a1a1a', '#2d2d2d']}
                          style={styles.categorySelectorGradient}
                        >
                          <Ionicons 
                            name={category.icon} 
                            size={16} 
                            color={newPrayer.category === category.id ? '#ffffff' : '#94a3b8'} 
                          />
                          <Text style={[
                            styles.categorySelectorText,
                            newPrayer.category === category.id && styles.categorySelectorTextActive,
                          ]}>
                            {category.name}
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => setNewPrayer(prev => ({ ...prev, isAnonymous: !prev.isAnonymous }))}
                  style={styles.anonymousToggle}
                >
                  <View style={styles.anonymousToggleContent}>
                    <Ionicons 
                      name={newPrayer.isAnonymous ? "checkbox" : "square-outline"} 
                      size={20} 
                      color="#8b5cf6" 
                    />
                    <Text style={styles.anonymousToggleText}>Anonim olarak paylaş</Text>
                  </View>
                </TouchableOpacity>
              </ScrollView>
            </SafeAreaView>
          </LinearGradient>
        </Modal>
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
  categoriesContainer: {
    paddingVertical: 10,
  },
  categoriesContent: {
    paddingHorizontal: 20,
  },
  categoryButton: {
    marginRight: 12,
  },
  categoryButtonActive: {
    transform: [{ scale: 1.05 }],
  },
  categoryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  categoryText: {
    fontSize: 14,
    color: '#94a3b8',
    marginLeft: 8,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#ffffff',
  },
  prayersContainer: {
    flex: 1,
  },
  prayersContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  prayerCard: {
    marginBottom: 16,
  },
  prayerGradient: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  prayerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  prayerAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  prayerTime: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  moreButton: {
    padding: 4,
  },
  prayerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  prayerContent: {
    fontSize: 16,
    color: '#e2e8f0',
    lineHeight: 24,
    marginBottom: 20,
  },
  prayerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prayButton: {
    flex: 1,
    marginRight: 16,
  },
  prayButtonActive: {
    transform: [{ scale: 1.02 }],
  },
  prayButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  prayButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
  prayerStats: {
    alignItems: 'flex-end',
  },
  prayerCount: {
    fontSize: 12,
    color: '#94a3b8',
  },
  fabButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
  },
  modalSafeArea: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalCloseText: {
    fontSize: 16,
    color: '#94a3b8',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  modalSubmitButton: {
    padding: 8,
  },
  modalSubmitText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8b5cf6',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  inputGradient: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  textAreaGradient: {
    minHeight: 120,
  },
  textInput: {
    fontSize: 16,
    color: '#ffffff',
    padding: 16,
  },
  textArea: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  categorySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  categorySelectorButton: {
    marginRight: 12,
    marginBottom: 12,
  },
  categorySelectorButtonActive: {
    transform: [{ scale: 1.05 }],
  },
  categorySelectorGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  categorySelectorText: {
    fontSize: 14,
    color: '#94a3b8',
    marginLeft: 8,
    fontWeight: '500',
  },
  categorySelectorTextActive: {
    color: '#ffffff',
  },
  anonymousToggle: {
    marginTop: 20,
  },
  anonymousToggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  anonymousToggleText: {
    fontSize: 16,
    color: '#e2e8f0',
    marginLeft: 12,
  },
}); 