import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Alert, Share, Text, TouchableOpacity, View } from 'react-native';
import { getTodaysVerse, markVerseAsRead, toggleVerseFavorite, VerseOfDay } from '../utils/dailyVerse';
import { triggerButtonPressHaptic, triggerSelectionFeedback } from '../utils/haptics';
import { logActivity } from '../utils/progressTracking';
import { hp, rf, wp } from '../utils/responsive';

interface DailyVerseCardProps {
  onVerseRead?: (verse: VerseOfDay) => void;
  onAchievementUnlocked?: (achievements: string[]) => void;
}

export default function DailyVerseCard({ onVerseRead, onAchievementUnlocked }: DailyVerseCardProps) {
  const [verse, setVerse] = useState<VerseOfDay | null>(null);
  const [isRead, setIsRead] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showTransliteration, setShowTransliteration] = useState(false);

  useEffect(() => {
    loadTodaysVerse();
  }, []);

  const loadTodaysVerse = async () => {
    try {
      const result = await getTodaysVerse();
      if (result.success && result.verse) {
        setVerse(result.verse);
        // Check if already read today (you'd implement this)
        // setIsRead(checkIfReadToday(result.verse.id));
      }
    } catch (error) {
      console.error('Load today\'s verse error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async () => {
    if (!verse || isRead) return;
    
    triggerButtonPressHaptic();
    
    try {
      const result = await markVerseAsRead(verse.id);
      if (result.success) {
        setIsRead(true);
        
        // Log reading activity
        await logActivity({
          type: 'reading',
          date: new Date().toISOString().split('T')[0],
          duration: 2, // Estimated 2 minutes for reading
          details: {
            content: 'daily_verse',
            verses: 1,
            chapter: verse.surah.name
          },
          completed: true
        });

        // Trigger callbacks
        onVerseRead?.(verse);
        if (result.newAchievements && result.newAchievements.length > 0) {
          onAchievementUnlocked?.(result.newAchievements);
        }
      }
    } catch (error) {
      console.error('Mark verse as read error:', error);
      Alert.alert('Hata', 'Okuma durumu kaydedilirken hata oluştu');
    }
  };

  const handleToggleFavorite = async () => {
    if (!verse) return;
    
    triggerSelectionFeedback();
    
    try {
      const result = await toggleVerseFavorite(verse.id);
      if (result.success) {
        setIsFavorite(result.isFavorite);
      }
    } catch (error) {
      console.error('Toggle favorite error:', error);
    }
  };

  const handleShare = async () => {
    if (!verse) return;
    
    triggerButtonPressHaptic();
    
    try {
      const shareText = `📖 Günün Ayeti\n\n${verse.arabic}\n\n"${verse.translation}"\n\n📍 ${verse.surah.name} Suresi, ${verse.verse}. Ayet\n\n#HidayetApp #GünlükAyet`;
      
      await Share.share({
        message: shareText,
        title: 'Günün Ayeti'
      });

      // Log sharing activity
      await logActivity({
        type: 'reading',
        date: new Date().toISOString().split('T')[0],
        details: {
          content: 'verse_shared',
          chapter: verse.surah.name
        },
        completed: true
      });
      
    } catch (error) {
      console.error('Share verse error:', error);
    }
  };

  if (isLoading) {
    return (
      <LinearGradient colors={['#1a1a2e', '#16213e']} style={{
        borderRadius: wp(4),
        padding: wp(4),
        marginBottom: hp(2),
        minHeight: hp(25)
      }}>
        <View style={{ 
          flex: 1, 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <Ionicons name="book-outline" size={wp(8)} color="#64748b" />
          <Text style={{
            fontSize: rf(14),
            color: '#64748b',
            marginTop: hp(1)
          }}>
            Günün ayeti yükleniyor...
          </Text>
        </View>
      </LinearGradient>
    );
  }

  if (!verse) {
    return (
      <LinearGradient colors={['#1a1a2e', '#16213e']} style={{
        borderRadius: wp(4),
        padding: wp(4),
        marginBottom: hp(2),
        minHeight: hp(25)
      }}>
        <View style={{ 
          flex: 1, 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <Ionicons name="alert-circle-outline" size={wp(8)} color="#ef4444" />
          <Text style={{
            fontSize: rf(14),
            color: '#ef4444',
            marginTop: hp(1),
            textAlign: 'center'
          }}>
            Günün ayeti yüklenemedi
          </Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#1a1a2e', '#16213e', '#0f0f23']} style={{
      borderRadius: wp(4),
      padding: wp(4),
      marginBottom: hp(2),
      borderColor: 'rgba(139, 92, 246, 0.2)',
      borderWidth: 1
    }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: hp(2)
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{
            width: wp(8),
            height: wp(8),
            borderRadius: wp(4),
            backgroundColor: 'rgba(139, 92, 246, 0.2)',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: wp(2)
          }}>
            <Ionicons name="book" size={wp(4)} color="#8b5cf6" />
          </View>
          <View>
            <Text style={{
              fontSize: rf(14),
              fontWeight: '600',
              color: '#ffffff'
            }}>
              Günün Ayeti
            </Text>
            <Text style={{
              fontSize: rf(11),
              color: '#94a3b8'
            }}>
              {new Date().toLocaleDateString('tr-TR', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={handleToggleFavorite}
            style={{
              padding: wp(2),
              marginRight: wp(1)
            }}
          >
            <Ionicons 
              name={isFavorite ? "heart" : "heart-outline"} 
              size={wp(5)} 
              color={isFavorite ? "#ef4444" : "#64748b"} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleShare}
            style={{
              padding: wp(2)
            }}
          >
            <Ionicons name="share-outline" size={wp(5)} color="#64748b" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Arabic Text */}
      <View style={{
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderRadius: wp(3),
        padding: wp(3),
        marginBottom: hp(2),
        borderRightColor: '#22c55e',
        borderRightWidth: wp(1)
      }}>
        <Text style={{
          fontSize: rf(20),
          color: '#22c55e',
          textAlign: 'right',
          lineHeight: rf(32),
          fontFamily: 'serif'
        }}>
          {verse.arabic}
        </Text>
      </View>

      {/* Translation */}
      <Text style={{
        fontSize: rf(16),
        color: '#ffffff',
        lineHeight: rf(24),
        marginBottom: hp(1),
        fontStyle: 'italic'
      }}>
        "{verse.translation}"
      </Text>

      {/* Transliteration (Toggle) */}
      {showTransliteration && (
        <Text style={{
          fontSize: rf(13),
          color: '#94a3b8',
          lineHeight: rf(20),
          marginBottom: hp(1),
          fontFamily: 'monospace'
        }}>
          {verse.transliteration}
        </Text>
      )}

      <TouchableOpacity
        onPress={() => setShowTransliteration(!showTransliteration)}
        style={{ marginBottom: hp(2) }}
      >
        <Text style={{
          fontSize: rf(12),
          color: '#8b5cf6',
          textDecorationLine: 'underline'
        }}>
          {showTransliteration ? 'Transliterasyonu gizle' : 'Transliterasyonu göster'}
        </Text>
      </TouchableOpacity>

      {/* Reference */}
      <Text style={{
        fontSize: rf(12),
        color: '#6366f1',
        fontWeight: '500',
        marginBottom: hp(2)
      }}>
        📍 {verse.surah.name} Suresi, {verse.verse}. Ayet
      </Text>

      {/* Theme & Reflection */}
      <View style={{
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderRadius: wp(3),
        padding: wp(3),
        marginBottom: hp(2)
      }}>
        <Text style={{
          fontSize: rf(13),
          fontWeight: '600',
          color: '#3b82f6',
          marginBottom: hp(0.5)
        }}>
          💡 {verse.theme}
        </Text>
        <Text style={{
          fontSize: rf(12),
          color: '#dbeafe',
          lineHeight: rf(18)
        }}>
          {verse.reflection}
        </Text>
      </View>

      {/* Benefits Tags */}
      <View style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: hp(2)
      }}>
        {verse.benefits.map((benefit, index) => (
          <View key={index} style={{
            backgroundColor: 'rgba(34, 197, 94, 0.2)',
            borderRadius: wp(2),
            paddingHorizontal: wp(2),
            paddingVertical: hp(0.5),
            marginRight: wp(1),
            marginBottom: hp(0.5)
          }}>
            <Text style={{
              fontSize: rf(10),
              color: '#22c55e',
              fontWeight: '500'
            }}>
              {benefit}
            </Text>
          </View>
        ))}
      </View>

      {/* Action Button */}
      <TouchableOpacity
        onPress={handleMarkAsRead}
        disabled={isRead}
        style={{
          backgroundColor: isRead ? 'rgba(34, 197, 94, 0.3)' : '#8b5cf6',
          paddingVertical: hp(1.5),
          borderRadius: wp(3),
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'center'
        }}
      >
        <Ionicons 
          name={isRead ? "checkmark-circle" : "book-outline"} 
          size={wp(4)} 
          color="#ffffff" 
          style={{ marginRight: wp(1) }}
        />
        <Text style={{
          color: '#ffffff',
          fontSize: rf(14),
          fontWeight: '600'
        }}>
          {isRead ? 'Okundu ✓' : 'Okudum'}
        </Text>
      </TouchableOpacity>
    </LinearGradient>
  );
} 