import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { triggerButtonPressHaptic, triggerSelectionFeedback } from '../../src/utils/haptics';
import { hp, rf, wp } from '../../src/utils/responsive';

interface Verse {
  number: number;
  arabic: string;
  translation: string;
  transliteration?: string;
}

interface Surah {
  number: number;
  name: string;
  arabicName: string;
  englishName: string;
  revelationPlace: 'Mecca' | 'Medina';
  numberOfVerses: number;
  verses: Verse[];
}

const fatihaVsreses: Verse[] = [
  {
    number: 1,
    arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    translation: 'Rahman ve Rahim olan Allah\'ın adıyla.',
    transliteration: 'Bismillahir-Rahmanir-Rahim'
  },
  {
    number: 2,
    arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
    translation: 'Hamd, âlemlerin Rabbi Allah\'a mahsustur.',
    transliteration: 'Alhamdu lillahi rabbil-alameen'
  },
  {
    number: 3,
    arabic: 'الرَّحْمَٰنِ الرَّحِيمِ',
    translation: 'O, Rahman\'dır, Rahim\'dir.',
    transliteration: 'Ar-Rahmanir-Rahim'
  },
  {
    number: 4,
    arabic: 'مَالِكِ يَوْمِ الدِّينِ',
    translation: 'Din (ceza ve hesap) gününün sahibidir.',
    transliteration: 'Maliki yawmid-deen'
  },
  {
    number: 5,
    arabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
    translation: 'Ancak sana ibadet eder, yalnız senden yardım dileriz.',
    transliteration: 'Iyyaka na\'budu wa iyyaka nasta\'een'
  },
  {
    number: 6,
    arabic: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
    translation: 'Bizi doğru yola ilet.',
    transliteration: 'Ihdi nas-siratal-mustaqeem'
  },
  {
    number: 7,
    arabic: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
    translation: 'Kendilerine nimet verdiklerinin yoluna, gazaba uğrayanların ve sapıtanların yoluna değil.',
    transliteration: 'Siratal-lazeena an\'amta alayhim ghayril-maghdoobi alayhim wa lad-dalleen'
  }
];

const currentSurah: Surah = {
  number: 1,
  name: 'Fatiha',
  arabicName: 'الفاتحة',
  englishName: 'The Opening',
  revelationPlace: 'Mecca',
  numberOfVerses: 7,
  verses: fatihaVsreses
};

export default function QuranScreen() {
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const [showTransliteration, setShowTransliteration] = useState(false);
  const [readingProgress, setReadingProgress] = useState(1);

  const handleVersePress = (verseNumber: number) => {
    triggerSelectionFeedback();
    setSelectedVerse(selectedVerse === verseNumber ? null : verseNumber);
  };

  const handlePlayAudio = () => {
    triggerButtonPressHaptic();
    Alert.alert('Sesli Tilavet', 'Sesli tilavet özelliği yakında eklenecek.', [{ text: 'Tamam' }]);
  };

  const handleBookmark = () => {
    triggerButtonPressHaptic();
    Alert.alert('Yer İmi', 'Bu sayfa yer imlerinize eklendi.', [{ text: 'Tamam' }]);
  };

  const toggleTransliteration = () => {
    triggerSelectionFeedback();
    setShowTransliteration(!showTransliteration);
  };

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
          <Animated.View 
            entering={FadeInUp.delay(100)}
            style={{ marginBottom: hp(3), marginTop: hp(2) }}
          >
            <LinearGradient
              colors={['#059669', '#10b981']}
              style={{
                borderRadius: wp(4),
                padding: wp(4),
                alignItems: 'center'
              }}
            >
              <Text style={{
                fontSize: rf(24),
                fontWeight: 'bold',
                color: '#ffffff',
                textAlign: 'center',
                marginBottom: hp(1)
              }}>
                {currentSurah.arabicName}
              </Text>
              <Text style={{
                fontSize: rf(18),
                fontWeight: '600',
                color: '#dcfce7',
                textAlign: 'center',
                marginBottom: hp(1)
              }}>
                {currentSurah.name} Suresi
              </Text>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                flexWrap: 'wrap'
              }}>
                <Text style={{ color: '#dcfce7', fontSize: rf(12), marginHorizontal: wp(2) }}>
                  📍 {currentSurah.revelationPlace === 'Mecca' ? 'Mekke' : 'Medine'}
                </Text>
                <Text style={{ color: '#dcfce7', fontSize: rf(12), marginHorizontal: wp(2) }}>
                  📖 {currentSurah.numberOfVerses} Ayet
                </Text>
                <Text style={{ color: '#dcfce7', fontSize: rf(12), marginHorizontal: wp(2) }}>
                  📄 Sure: {currentSurah.number}
                </Text>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Controls */}
          <Animated.View 
            entering={FadeInUp.delay(200)}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: hp(3)
            }}
          >
            <TouchableOpacity
              onPress={handlePlayAudio}
              style={{
                flex: 1,
                marginRight: wp(2)
              }}
            >
              <LinearGradient
                colors={['#3b82f6', '#60a5fa']}
                style={{
                  borderRadius: wp(3),
                  padding: wp(3),
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Ionicons name="play" size={wp(5)} color="#ffffff" />
                <Text style={{
                  color: '#ffffff',
                  fontSize: rf(14),
                  fontWeight: '600',
                  marginLeft: wp(2)
                }}>
                  Sesli Dinle
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={toggleTransliteration}
              style={{
                flex: 1,
                marginHorizontal: wp(1)
              }}
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
              onPress={handleBookmark}
              style={{
                flex: 1,
                marginLeft: wp(2)
              }}
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
                <Ionicons name="bookmark" size={wp(5)} color="#ffffff" />
                <Text style={{
                  color: '#ffffff',
                  fontSize: rf(14),
                  fontWeight: '600',
                  marginLeft: wp(2)
                }}>
                  Yer İmi
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Reading Progress */}
          <Animated.View 
            entering={FadeInUp.delay(300)}
            style={{
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              borderColor: 'rgba(139, 92, 246, 0.3)',
              borderWidth: 1,
              borderRadius: wp(3),
              padding: wp(3),
              marginBottom: hp(3)
            }}
          >
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: hp(1)
            }}>
              <Text style={{
                color: '#8b5cf6',
                fontSize: rf(14),
                fontWeight: '600'
              }}>
                📖 Okuma İlerlemesi
              </Text>
              <Text style={{
                color: '#c4b5fd',
                fontSize: rf(14)
              }}>
                {readingProgress}/{currentSurah.numberOfVerses}
              </Text>
            </View>
            <View style={{
              backgroundColor: 'rgba(139, 92, 246, 0.2)',
              height: hp(0.8),
              borderRadius: wp(2),
              overflow: 'hidden'
            }}>
              <View style={{
                backgroundColor: '#8b5cf6',
                height: '100%',
                width: `${(readingProgress / currentSurah.numberOfVerses) * 100}%`,
                borderRadius: wp(2)
              }} />
            </View>
          </Animated.View>

          {/* Verses */}
          {currentSurah.verses.map((verse, index) => (
            <Animated.View
              key={verse.number}
              entering={FadeInUp.delay(400 + (index * 100))}
              style={{ marginBottom: hp(3) }}
            >
              <TouchableOpacity
                onPress={() => handleVersePress(verse.number)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={
                    selectedVerse === verse.number
                      ? ['rgba(139, 92, 246, 0.2)', 'rgba(139, 92, 246, 0.1)']
                      : ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']
                  }
                  style={{
                    borderRadius: wp(4),
                    padding: wp(4),
                    borderWidth: selectedVerse === verse.number ? 2 : 1,
                    borderColor: selectedVerse === verse.number 
                      ? 'rgba(139, 92, 246, 0.5)' 
                      : 'rgba(255, 255, 255, 0.1)'
                  }}
                >
                  {/* Verse Number */}
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: hp(2)
                  }}>
                    <LinearGradient
                      colors={['#059669', '#10b981']}
                      style={{
                        width: wp(8),
                        height: wp(8),
                        borderRadius: wp(4),
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: wp(3)
                      }}
                    >
                      <Text style={{
                        color: '#ffffff',
                        fontSize: rf(14),
                        fontWeight: 'bold'
                      }}>
                        {verse.number}
                      </Text>
                    </LinearGradient>
                    <View style={{
                      height: 1,
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      flex: 1
                    }} />
                  </View>

                  {/* Arabic Text */}
                  <Text style={{
                    fontSize: rf(22),
                    lineHeight: rf(40),
                    color: '#ffffff',
                    textAlign: 'right',
                    marginBottom: hp(2),
                    fontFamily: 'serif'
                  }}>
                    {verse.arabic} ﴿{verse.number}﴾
                  </Text>

                  {/* Transliteration */}
                  {showTransliteration && verse.transliteration && (
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
                        {verse.transliteration}
                      </Text>
                    </View>
                  )}

                  {/* Translation */}
                  <View style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: wp(2),
                    padding: wp(3)
                  }}>
                    <Text style={{
                      color: '#e2e8f0',
                      fontSize: rf(16),
                      lineHeight: rf(24),
                      textAlign: 'left'
                    }}>
                      {verse.translation}
                    </Text>
                  </View>

                  {/* Verse Actions */}
                  {selectedVerse === verse.number && (
                    <View style={{
                      flexDirection: 'row',
                      justifyContent: 'space-around',
                      marginTop: hp(2),
                      paddingTop: hp(2),
                      borderTopWidth: 1,
                      borderTopColor: 'rgba(255, 255, 255, 0.1)'
                    }}>
                      <TouchableOpacity
                        onPress={() => Alert.alert('Audio', 'Bu ayetin sesli tilaveti çalacak')}
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
                          marginLeft: wp(1)
                        }}>
                          Dinle
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => Alert.alert('Paylaş', 'Bu ayet paylaşılacak')}
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
                          marginLeft: wp(1)
                        }}>
                          Paylaş
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => Alert.alert('Favoriler', 'Bu ayet favorilere eklendi')}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          paddingVertical: hp(1),
                          paddingHorizontal: wp(3)
                        }}
                      >
                        <Ionicons name="heart" size={wp(5)} color="#ef4444" />
                        <Text style={{
                          color: '#ef4444',
                          fontSize: rf(12),
                          marginLeft: wp(1)
                        }}>
                          Favorile
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          ))}

          {/* Bottom Navigation */}
          <Animated.View 
            entering={FadeInUp.delay(1000)}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: hp(4),
              marginTop: hp(2)
            }}
          >
            <TouchableOpacity
              onPress={() => Alert.alert('Önceki Sure', 'Önceki sure mevcut değil')}
              style={{
                flex: 1,
                marginRight: wp(2)
              }}
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
                <Ionicons name="chevron-back" size={wp(5)} color="#94a3b8" />
                <Text style={{
                  color: '#94a3b8',
                  fontSize: rf(14),
                  fontWeight: '600',
                  marginLeft: wp(2)
                }}>
                  Önceki Sure
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => Alert.alert('Sonraki Sure', 'Bakara suresine geçilecek')}
              style={{
                flex: 1,
                marginLeft: wp(2)
              }}
            >
              <LinearGradient
                colors={['#059669', '#10b981']}
                style={{
                  borderRadius: wp(3),
                  padding: wp(3),
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Text style={{
                  color: '#ffffff',
                  fontSize: rf(14),
                  fontWeight: '600',
                  marginRight: wp(2)
                }}>
                  Sonraki Sure
                </Text>
                <Ionicons name="chevron-forward" size={wp(5)} color="#ffffff" />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Bottom padding */}
          <View style={{ height: hp(4) }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
} 