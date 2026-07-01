import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Alert, FlatList, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { triggerButtonPressHaptic, triggerSelectionFeedback, triggerSuccessHaptic } from '../../src/utils/haptics';
import { hp, rf, wp } from '../../src/utils/responsive';

interface DuaItem {
  id: string;
  title: string;
  arabic: string;
  translation: string;
  transliteration?: string;
  category: string;
  isFavorite: boolean;
  source?: string;
  benefits?: string;
}

const duaCategories = [
  { id: 'all', name: 'Tümü', icon: 'apps', gradient: ['#8b5cf6', '#a78bfa'] },
  { id: 'daily', name: 'Günlük', icon: 'sunny', gradient: ['#f59e0b', '#fbbf24'] },
  { id: 'prayer', name: 'Namaz', icon: 'moon', gradient: ['#7c3aed', '#8b5cf6'] },
  { id: 'healing', name: 'Şifa', icon: 'medical', gradient: ['#22c55e', '#16a34a'] },
  { id: 'protection', name: 'Korunma', icon: 'shield', gradient: ['#3b82f6', '#60a5fa'] },
  { id: 'gratitude', name: 'Şükür', icon: 'heart', gradient: ['#ef4444', '#f87171'] },
  { id: 'forgiveness', name: 'Mağfiret', icon: 'refresh', gradient: ['#10b981', '#34d399'] },
  { id: 'guidance', name: 'Hidayet', icon: 'compass', gradient: ['#6366f1', '#8b5cf6'] },
];

const islamicDuas: DuaItem[] = [
  {
    id: '1',
    title: 'Yemek Öncesi Duası',
    arabic: 'بِسْمِ اللَّهِ وَعَلَى بَرَكَةِ اللَّهِ',
    translation: 'Allah\'ın adıyla ve Allah\'ın bereketiyle (başlarım)',
    transliteration: 'Bismillahi wa ala barakatillah',
    category: 'daily',
    isFavorite: true,
    source: 'Ebu Davud, Et\'ime, 17',
    benefits: 'Yediğimiz yemeğin bereketli olması için'
  },
  {
    id: '2',
    title: 'Yemek Sonrası Duası',
    arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَٰذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِّنِّي وَلَا قُوَّةٍ',
    translation: 'Beni bu yemekle doyuran ve bunu benim gücüm ve kuvvetim olmaksızın rızık olarak veren Allah\'a hamdolsun',
    transliteration: 'Alhamdulillahil-lezi at\'amani haza wa razaqanihi min gayri hawlin minni wa la quwwah',
    category: 'daily',
    isFavorite: false,
    source: 'Tirmizi, Deavat, 55',
    benefits: 'Yemek sonrası şükür için'
  },
  {
    id: '3',
    title: 'Sabah Duası',
    arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ',
    translation: 'Sabaha eriştik ve mülk Allah\'ındır, hamd de Allah\'ındır',
    transliteration: 'Asbahna wa asbahal-mulku lillahi walhamdu lillah',
    category: 'daily',
    isFavorite: true,
    source: 'Müslim, Zikir, 4',
    benefits: 'Günün bereketli geçmesi için'
  },
  {
    id: '4',
    title: 'Akşam Duası',
    arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ',
    translation: 'Akşama eriştik ve mülk Allah\'ındır, hamd de Allah\'ındır',
    transliteration: 'Amsayna wa amsal-mulku lillahi walhamdu lillah',
    category: 'daily',
    isFavorite: false,
    source: 'Müslim, Zikir, 4',
    benefits: 'Gecenin huzurlu geçmesi için'
  },
  {
    id: '5',
    title: 'Şifa Duası',
    arabic: 'اللَّهُمَّ رَبَّ النَّاسِ أَذْهِبِ الْبَأْسَ اشْفِ أَنتَ الشَّافِي',
    translation: 'Allahım, insanların Rabbi, hastalığı gider, şifa ver, Sen şifa verensin',
    transliteration: 'Allahumma rabban-nasi, azhabil-ba\'s, ishfi antash-shafi',
    category: 'healing',
    isFavorite: true,
    source: 'Buhari, Tıbb, 38',
    benefits: 'Hastalık zamanında şifa için'
  },
  {
    id: '6',
    title: 'Koruma Duası',
    arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِن شَرِّ مَا خَلَقَ',
    translation: 'Allah\'ın kusursuz kelimelerinin korumasına sığınırım, yarattığı şeylerin şerrinden',
    transliteration: 'A\'uzubi kalimatillahit-tammati min sharri ma khalaq',
    category: 'protection',
    isFavorite: true,
    source: 'Müslim, Zikir, 23',
    benefits: 'Kötülüklerden korunmak için'
  },
  {
    id: '7',
    title: 'İstiğfar Duası',
    arabic: 'اللَّهُمَّ أَنتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ',
    translation: 'Allahım, Sen benim Rabbimsin, Senden başka ilah yoktur, beni Sen yarattın, ben Senin kulunum',
    transliteration: 'Allahumma anta rabbi la ilaha illa anta, khalaqtani wa ana abduka',
    category: 'forgiveness',
    isFavorite: false,
    source: 'Buhari, Deavat, 2',
    benefits: 'Günah ve hataların bağışlanması için'
  },
  {
    id: '8',
    title: 'Hidayet Duası',
    arabic: 'اللَّهُمَّ اهْدِنِي فِيمَنْ هَدَيْتَ',
    translation: 'Allahım, hidayete erdirdiklerin arasında beni de hidayete erdir',
    transliteration: 'Allahummahdini fiman hadayt',
    category: 'guidance',
    isFavorite: false,
    source: 'Tirmizi, Deavat, 74',
    benefits: 'Doğru yolu bulabilmek için'
  },
  {
    id: '9',
    title: 'Şükür Duası',
    arabic: 'اللَّهُمَّ أَعِنِّي عَلَىٰ ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ',
    translation: 'Allahım, Seni zikretmekte, Sana şükretmekte ve Sana güzel ibadet etmekte bana yardım et',
    transliteration: 'Allahumma a\'inni ala zikrika wa shukrika wa husni ibadatik',
    category: 'gratitude',
    isFavorite: true,
    source: 'Ebu Davud, Salat, 362',
    benefits: 'Şükür duygusunu güçlendirmek için'
  },
  {
    id: '10',
    title: 'Namaz Öncesi Duası',
    arabic: 'اللَّهُمَّ بَاعِدْ بَيْنِي وَبَيْنَ خَطَايَايَ',
    translation: 'Allahım, benimle günahlarım arasını ayır',
    transliteration: 'Allahumma ba\'id bayni wa bayna khatayaya',
    category: 'prayer',
    isFavorite: false,
    source: 'Buhari, Ezan, 89',
    benefits: 'Namaza başlarken kalbi temizlemek için'
  }
];

export default function DuaScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [duas, setDuas] = useState<DuaItem[]>(islamicDuas);
  const [favorites, setFavorites] = useState<string[]>(['1', '3', '5', '6', '9']);
  const [showTransliteration, setShowTransliteration] = useState(false);

  const filteredDuas = duas.filter(dua => {
    const matchesSearch = dua.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dua.translation.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dua.arabic.includes(searchQuery);
    const matchesCategory = selectedCategory === 'all' || dua.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFavorite = (duaId: string) => {
    triggerSelectionFeedback();
    setFavorites(prev => 
      prev.includes(duaId) 
        ? prev.filter(id => id !== duaId)
        : [...prev, duaId]
    );
    
    setDuas(prev => prev.map(dua => 
      dua.id === duaId 
        ? { ...dua, isFavorite: !dua.isFavorite }
        : dua
    ));
  };

  const playAudio = (duaId: string) => {
    triggerButtonPressHaptic();
    Alert.alert('Sesli Okuma', 'Dua sesli olarak okunacak (özellik yakında)', [{ text: 'Tamam' }]);
  };

  const shareDua = (dua: DuaItem) => {
    triggerButtonPressHaptic();
    Alert.alert(
      'Dua Paylaş', 
      `${dua.title}\n\n${dua.arabic}\n\n${dua.translation}`, 
      [{ text: 'Tamam' }]
    );
  };

  const renderDuaCard = ({ item, index }: { item: DuaItem; index: number }) => (
    <Animated.View entering={FadeInUp.delay(index * 100)} style={{ marginBottom: hp(3) }}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']}
        style={{
          borderRadius: wp(4),
          padding: wp(4),
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: hp(2)
        }}>
          <Text style={{
            fontSize: rf(18),
            fontWeight: '600',
            color: '#ffffff',
            flex: 1
          }}>
            {item.title}
          </Text>
          
          <TouchableOpacity
            onPress={() => toggleFavorite(item.id)}
            style={{ marginLeft: wp(2) }}
          >
            <Ionicons 
              name={favorites.includes(item.id) ? "heart" : "heart-outline"} 
              size={wp(6)} 
              color={favorites.includes(item.id) ? "#ef4444" : "#94a3b8"} 
            />
          </TouchableOpacity>
        </View>

        {/* Arabic Text */}
        <Text style={{
          fontSize: rf(20),
          lineHeight: rf(36),
          color: '#ffffff',
          textAlign: 'right',
          marginBottom: hp(2),
          fontFamily: 'serif',
          paddingVertical: hp(1),
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          borderRadius: wp(2),
          paddingHorizontal: wp(3)
        }}>
          {item.arabic}
        </Text>

        {/* Transliteration */}
        {showTransliteration && item.transliteration && (
          <View style={{
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderRadius: wp(2),
            padding: wp(3),
            marginBottom: hp(2)
          }}>
            <Text style={{
              color: '#60a5fa',
              fontSize: rf(14),
              fontStyle: 'italic',
              textAlign: 'center'
            }}>
              {item.transliteration}
            </Text>
          </View>
        )}

        {/* Translation */}
        <Text style={{
          fontSize: rf(16),
          lineHeight: rf(24),
          color: '#e2e8f0',
          marginBottom: hp(2),
          textAlign: 'left'
        }}>
          {item.translation}
        </Text>

        {/* Source & Benefits */}
        {(item.source || item.benefits) && (
          <View style={{
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            borderRadius: wp(2),
            padding: wp(3),
            marginBottom: hp(2)
          }}>
            {item.source && (
              <Text style={{
                fontSize: rf(12),
                color: '#a78bfa',
                marginBottom: hp(0.5),
                fontWeight: '500'
              }}>
                📚 Kaynak: {item.source}
              </Text>
            )}
            {item.benefits && (
              <Text style={{
                fontSize: rf(12),
                color: '#c4b5fd',
                lineHeight: rf(16)
              }}>
                💫 {item.benefits}
              </Text>
            )}
          </View>
        )}

        {/* Actions */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          paddingTop: hp(2),
          borderTopWidth: 1,
          borderTopColor: 'rgba(255, 255, 255, 0.1)'
        }}>
          <TouchableOpacity
            onPress={() => playAudio(item.id)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: hp(1),
              paddingHorizontal: wp(3)
            }}
          >
            <Ionicons name="play-circle" size={wp(5)} color="#3b82f6" />
            <Text style={{
              color: '#3b82f6',
              fontSize: rf(12),
              marginLeft: wp(1),
              fontWeight: '500'
            }}>
              Dinle
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => shareDua(item)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: hp(1),
              paddingHorizontal: wp(3)
            }}
          >
            <Ionicons name="share" size={wp(5)} color="#10b981" />
            <Text style={{
              color: '#10b981',
              fontSize: rf(12),
              marginLeft: wp(1),
              fontWeight: '500'
            }}>
              Paylaş
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => Alert.alert('Kopyalandı', 'Dua metni panoya kopyalandı')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: hp(1),
              paddingHorizontal: wp(3)
            }}
          >
            <Ionicons name="copy" size={wp(5)} color="#f59e0b" />
            <Text style={{
              color: '#f59e0b',
              fontSize: rf(12),
              marginLeft: wp(1),
              fontWeight: '500'
            }}>
              Kopyala
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  return (
    <LinearGradient colors={['#0f0f23', '#1a1a2e', '#16213e']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={{
          paddingHorizontal: wp(6),
          paddingVertical: hp(2),
          marginTop: hp(1)
        }}>
          <Text style={{
            fontSize: rf(28),
            fontWeight: 'bold',
            color: '#ffffff',
            marginBottom: hp(1)
          }}>
            Dualar
          </Text>
          <Text style={{
            fontSize: rf(16),
            color: '#94a3b8'
          }}>
            Günlük hayatta ihtiyaç duyacağınız dualar
          </Text>
        </View>

        {/* Search Bar */}
        <View style={{
          paddingHorizontal: wp(6),
          marginBottom: hp(2)
        }}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderRadius: wp(4),
              paddingHorizontal: wp(4),
              paddingVertical: hp(1.5),
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.2)'
            }}
          >
            <Ionicons name="search" size={wp(5)} color="#94a3b8" />
            <TextInput
              style={{
                flex: 1,
                fontSize: rf(16),
                color: '#ffffff',
                marginLeft: wp(3)
              }}
              placeholder="Dua ara..."
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={wp(5)} color="#94a3b8" />
              </TouchableOpacity>
            )}
          </LinearGradient>
        </View>

        {/* Controls */}
        <View style={{
          flexDirection: 'row',
          paddingHorizontal: wp(6),
          marginBottom: hp(2)
        }}>
          <TouchableOpacity
            onPress={() => {
              triggerSelectionFeedback();
              setShowTransliteration(!showTransliteration);
            }}
            style={{ flex: 1, marginRight: wp(2) }}
          >
            <LinearGradient
              colors={showTransliteration ? ['#10b981', '#34d399'] : ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
              style={{
                borderRadius: wp(3),
                padding: wp(3),
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: showTransliteration ? 0 : 1,
                borderColor: 'rgba(255, 255, 255, 0.2)'
              }}
            >
              <Ionicons name="text" size={wp(5)} color="#ffffff" />
              <Text style={{
                color: '#ffffff',
                fontSize: rf(14),
                fontWeight: '600',
                marginLeft: wp(2)
              }}>
                Okunuş
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              triggerButtonPressHaptic();
              setSelectedCategory('all');
              setSearchQuery('');
              triggerSuccessHaptic();
            }}
            style={{ flex: 1, marginLeft: wp(2) }}
          >
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
              style={{
                borderRadius: wp(3),
                padding: wp(3),
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.2)'
              }}
            >
              <Ionicons name="refresh" size={wp(5)} color="#ffffff" />
              <Text style={{
                color: '#ffffff',
                fontSize: rf(14),
                fontWeight: '600',
                marginLeft: wp(2)
              }}>
                Sıfırla
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <View style={{ marginBottom: hp(2) }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: wp(6) }}
          >
            {duaCategories.map((category, index) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => {
                  triggerSelectionFeedback();
                  setSelectedCategory(category.id);
                }}
                style={{ marginRight: wp(3) }}
              >
                <LinearGradient
                  colors={selectedCategory === category.id ? category.gradient : ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
                  style={{
                    borderRadius: wp(4),
                    paddingHorizontal: wp(4),
                    paddingVertical: hp(1.5),
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderWidth: selectedCategory === category.id ? 0 : 1,
                    borderColor: 'rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <Ionicons 
                    name={category.icon as any} 
                    size={wp(4)} 
                    color="#ffffff" 
                  />
                  <Text style={{
                    color: '#ffffff',
                    fontSize: rf(14),
                    fontWeight: '500',
                    marginLeft: wp(2)
                  }}>
                    {category.name}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Duas List */}
        <FlatList
          data={filteredDuas}
          keyExtractor={item => item.id}
          renderItem={renderDuaCard}
          contentContainerStyle={{
            paddingHorizontal: wp(6),
            paddingBottom: hp(4)
          }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: hp(8)
            }}>
              <Ionicons name="search" size={wp(12)} color="#64748b" />
              <Text style={{
                color: '#94a3b8',
                fontSize: rf(16),
                marginTop: hp(2),
                textAlign: 'center'
              }}>
                Aradığınız kriterlere uygun dua bulunamadı
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                style={{
                  backgroundColor: '#8b5cf6',
                  paddingHorizontal: wp(6),
                  paddingVertical: hp(1.5),
                  borderRadius: wp(3),
                  marginTop: hp(2)
                }}
              >
                <Text style={{
                  color: '#ffffff',
                  fontSize: rf(14),
                  fontWeight: '600'
                }}>
                  Filtreleri Temizle
                </Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </SafeAreaView>
    </LinearGradient>
  );
} 