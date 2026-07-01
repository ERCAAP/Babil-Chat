import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, { FadeInLeft, FadeInRight, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ChatMessage,
    ChatSession,
    createChatSession,
    getQuickQuestions,
    sendMessageToAI
} from '../../src/utils/aiChat';
import { getUserData } from '../../src/utils/auth';
import { triggerButtonPressHaptic, triggerSelectionFeedback } from '../../src/utils/haptics';
import { hp, rf, wp } from '../../src/utils/responsive';

export default function ChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [userLanguage, setUserLanguage] = useState('tr');
  const [showQuickQuestions, setShowQuickQuestions] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  // Initialize chat session
  useEffect(() => {
    initializeChat();
  }, []);

  const initializeChat = async () => {
    try {
      const user = await getUserData();
      const language = user?.preferences?.language || 'tr';
      setUserLanguage(language);
      
      const session = await createChatSession(language);
      setCurrentSession(session);
      
      // Add welcome message
      const welcomeMessage: ChatMessage = {
        id: `welcome_${Date.now()}`,
        text: language === 'tr' 
          ? 'Merhaba! Ben Babil Chat\'in AI rehberiyim. İslami konularda size yardımcı olmak için buradayım. Sorularınızı sorabilir veya aşağıdaki önerilerden birini seçebilirsiniz.'
          : 'Hello! I am the AI guide of Babil Chat. I am here to help you with Islamic matters. You can ask your questions or choose one of the suggestions below.',
        isUser: false,
        timestamp: new Date(),
        type: 'advice',
        metadata: { language }
      };
      
      setMessages([welcomeMessage]);
    } catch (error) {
      console.error('Error initializing chat:', error);
      Alert.alert('Hata', 'Sohbet başlatılırken bir hata oluştu');
    }
  };

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;
    
    triggerButtonPressHaptic();
    
    // Add user message
    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      text: messageText.trim(),
      isUser: true,
      timestamp: new Date()
    };
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText('');
    setShowQuickQuestions(false);
    setIsLoading(true);
    
    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
    
    try {
      // Send to AI service
      const aiResponse = await sendMessageToAI(messageText, updatedMessages, userLanguage);
      
      const finalMessages = [...updatedMessages, aiResponse];
      setMessages(finalMessages);
      
      // Update session if exists
      if (currentSession) {
        const updatedSession: ChatSession = {
          ...currentSession,
          messages: finalMessages,
          updatedAt: new Date()
        };
        setCurrentSession(updatedSession);
      }
      
    } catch (error) {
      console.error('AI Chat Error:', error);
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        text: userLanguage === 'tr'
          ? 'Üzgünüm, şu anda teknik bir sorun yaşıyorum. Lütfen daha sonra tekrar deneyin.'
          : 'Sorry, I\'m experiencing technical difficulties. Please try again later.',
        isUser: false,
        timestamp: new Date(),
        type: 'advice',
        metadata: { language: userLanguage }
      };
      
      setMessages([...updatedMessages, errorMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const selectQuickQuestion = (question: string) => {
    triggerSelectionFeedback();
    sendMessage(question);
  };

  const copyMessage = (text: string) => {
    triggerSelectionFeedback();
    // In a real app, you would use Clipboard API
    Alert.alert('Kopyalandı', 'Mesaj panoya kopyalandı');
  };

  const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => {
    const isUser = item.isUser;
    const messageType = item.type;
    
    return (
      <Animated.View 
        entering={isUser ? FadeInRight.delay(index * 50) : FadeInLeft.delay(index * 50)}
        style={{
          flexDirection: 'row',
          marginBottom: hp(2),
          justifyContent: isUser ? 'flex-end' : 'flex-start',
          paddingHorizontal: wp(4)
        }}
      >
        {!isUser && (
          <View style={{
            width: wp(10),
            height: wp(10),
            borderRadius: wp(5),
            backgroundColor: '#8b5cf6',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: wp(3)
          }}>
            <Ionicons name="sparkles" size={wp(5)} color="#ffffff" />
          </View>
        )}
        
        <View style={{
          maxWidth: wp(75),
          minWidth: wp(20)
        }}>
          <LinearGradient
            colors={isUser 
              ? ['#3b82f6', '#1d4ed8'] 
              : messageType === 'verse' 
                ? ['rgba(34, 197, 94, 0.15)', 'rgba(34, 197, 94, 0.05)']
                : messageType === 'hadith'
                  ? ['rgba(249, 115, 22, 0.15)', 'rgba(249, 115, 22, 0.05)']
                  : messageType === 'dua'
                    ? ['rgba(139, 92, 246, 0.15)', 'rgba(139, 92, 246, 0.05)']
                    : ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']
            }
            style={{
              borderRadius: wp(4),
              padding: wp(4),
              borderWidth: isUser ? 0 : 1,
              borderColor: isUser ? 'transparent' : 'rgba(255, 255, 255, 0.1)'
            }}
          >
            {/* Message Type Indicator */}
            {!isUser && messageType && messageType !== 'advice' && (
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: hp(1),
                paddingBottom: hp(1),
                borderBottomWidth: 1,
                borderBottomColor: 'rgba(255, 255, 255, 0.1)'
              }}>
                <Ionicons 
                  name={
                    messageType === 'verse' ? 'book' :
                    messageType === 'hadith' ? 'library' :
                    messageType === 'dua' ? 'heart' : 'information-circle'
                  } 
                  size={wp(4)} 
                  color={
                    messageType === 'verse' ? '#22c55e' :
                    messageType === 'hadith' ? '#f97316' :
                    messageType === 'dua' ? '#8b5cf6' : '#3b82f6'
                  } 
                />
                <Text style={{
                  fontSize: rf(12),
                  color: messageType === 'verse' ? '#22c55e' :
                         messageType === 'hadith' ? '#f97316' :
                         messageType === 'dua' ? '#8b5cf6' : '#3b82f6',
                  fontWeight: '600',
                  marginLeft: wp(2),
                  textTransform: 'capitalize'
                }}>
                  {messageType === 'verse' ? 'Ayet' :
                   messageType === 'hadith' ? 'Hadis' :
                   messageType === 'dua' ? 'Dua' : 'Bilgi'}
                </Text>
              </View>
            )}
            
            {/* Message Text */}
            <Text style={{
              fontSize: rf(16),
              color: isUser ? '#ffffff' : '#e2e8f0',
              lineHeight: rf(24),
              textAlign: isUser ? 'right' : 'left'
            }}>
              {item.text}
            </Text>
            
            {/* References */}
            {!isUser && item.metadata && (item.metadata.verseReference || item.metadata.hadithReference) && (
              <View style={{
                marginTop: hp(1),
                paddingTop: hp(1),
                borderTopWidth: 1,
                borderTopColor: 'rgba(255, 255, 255, 0.1)'
              }}>
                <Text style={{
                  fontSize: rf(12),
                  color: '#94a3b8',
                  fontStyle: 'italic'
                }}>
                  📚 {item.metadata.verseReference || item.metadata.hadithReference}
                </Text>
              </View>
            )}
            
            {/* Timestamp */}
            <Text style={{
              fontSize: rf(11),
              color: isUser ? 'rgba(255, 255, 255, 0.7)' : '#64748b',
              marginTop: hp(1),
              textAlign: isUser ? 'right' : 'left'
            }}>
              {item.timestamp.toLocaleTimeString('tr-TR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          </LinearGradient>
          
          {/* Message Actions */}
          {!isUser && (
            <TouchableOpacity
              onPress={() => copyMessage(item.text)}
              style={{
                alignSelf: 'flex-end',
                marginTop: hp(0.5),
                paddingHorizontal: wp(2),
                paddingVertical: hp(0.5)
              }}
            >
              <Ionicons name="copy-outline" size={wp(4)} color="#64748b" />
            </TouchableOpacity>
          )}
        </View>
        
        {isUser && (
          <View style={{
            width: wp(10),
            height: wp(10),
            borderRadius: wp(5),
            backgroundColor: '#1f2937',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: wp(3),
            borderWidth: 2,
            borderColor: '#3b82f6'
          }}>
            <Ionicons name="person" size={wp(5)} color="#3b82f6" />
          </View>
        )}
      </Animated.View>
    );
  };

  const renderQuickQuestions = () => {
    if (!showQuickQuestions || messages.length > 1) return null;
    
    const questions = getQuickQuestions(userLanguage);
    
    return (
      <Animated.View entering={FadeInUp.delay(500)} style={{ paddingHorizontal: wp(4), marginBottom: hp(2) }}>
        <Text style={{
          fontSize: rf(16),
          fontWeight: '600',
          color: '#ffffff',
          marginBottom: hp(2),
          textAlign: 'center'
        }}>
          💡 Popüler Sorular
        </Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {questions.map((question, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => selectQuickQuestion(question)}
              style={{
                marginRight: wp(3),
                minWidth: wp(60)
              }}
            >
              <LinearGradient
                colors={['rgba(139, 92, 246, 0.2)', 'rgba(59, 130, 246, 0.1)']}
                style={{
                  paddingHorizontal: wp(4),
                  paddingVertical: hp(2),
                  borderRadius: wp(3),
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.1)'
                }}
              >
                <Text style={{
                  fontSize: rf(14),
                  color: '#e2e8f0',
                  textAlign: 'center',
                  lineHeight: rf(20)
                }}>
                  {question}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>
    );
  };

  const renderTypingIndicator = () => {
    if (!isLoading) return null;
    
    return (
      <Animated.View 
        entering={FadeInLeft}
        style={{
          flexDirection: 'row',
          paddingHorizontal: wp(4),
          marginBottom: hp(2)
        }}
      >
        <View style={{
          width: wp(10),
          height: wp(10),
          borderRadius: wp(5),
          backgroundColor: '#8b5cf6',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: wp(3)
        }}>
          <Ionicons name="sparkles" size={wp(5)} color="#ffffff" />
        </View>
        
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
          style={{
            paddingHorizontal: wp(4),
            paddingVertical: hp(2),
            borderRadius: wp(4),
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.1)',
            flexDirection: 'row',
            alignItems: 'center'
          }}
        >
          <Text style={{ fontSize: rf(16), color: '#94a3b8', marginRight: wp(2) }}>
            Düşünüyor
          </Text>
          <View style={{ flexDirection: 'row' }}>
            {[0, 1, 2].map(i => (
              <Animated.View
                key={i}
                style={{
                  width: wp(1.5),
                  height: wp(1.5),
                  borderRadius: wp(0.75),
                  backgroundColor: '#8b5cf6',
                  marginHorizontal: wp(0.5),
                  opacity: 0.5
                }}
              />
            ))}
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  return (
    <LinearGradient colors={['#0f0f23', '#1a1a2e', '#16213e']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          {/* Header */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: wp(6),
            paddingVertical: hp(2),
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(255, 255, 255, 0.1)'
          }}>
            <LinearGradient
              colors={['#8b5cf6', '#a78bfa']}
              style={{
                width: wp(12),
                height: wp(12),
                borderRadius: wp(6),
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: wp(4)
              }}
            >
              <Ionicons name="sparkles" size={wp(6)} color="#ffffff" />
            </LinearGradient>
            
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: rf(20),
                fontWeight: 'bold',
                color: '#ffffff'
              }}>
                AI Rehber
              </Text>
              <Text style={{
                fontSize: rf(14),
                color: '#94a3b8'
              }}>
                İslami sorularınızı sorun
              </Text>
            </View>
            
            <TouchableOpacity
              onPress={() => {
                triggerButtonPressHaptic();
                Alert.alert(
                  'Sohbet Geçmişi',
                  'Yeni sohbet başlatmak ister misiniz?',
                  [
                    { text: 'İptal', style: 'cancel' },
                    { 
                      text: 'Yeni Sohbet', 
                      onPress: () => {
                        setMessages([]);
                        setShowQuickQuestions(true);
                        initializeChat();
                      }
                    }
                  ]
                );
              }}
              style={{
                width: wp(10),
                height: wp(10),
                borderRadius: wp(5),
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Ionicons name="add" size={wp(5)} color="#ffffff" />
            </TouchableOpacity>
          </View>
          
          {/* Messages */}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={item => item.id}
            renderItem={renderMessage}
            style={{ flex: 1 }}
            contentContainerStyle={{ 
              paddingVertical: hp(2),
              flexGrow: 1
            }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: wp(8)
              }}>
                <Ionicons name="chatbubbles" size={wp(16)} color="#64748b" />
                <Text style={{
                  fontSize: rf(18),
                  color: '#94a3b8',
                  textAlign: 'center',
                  marginTop: hp(2)
                }}>
                  Merhaba! İslami konularda size nasıl yardımcı olabilirim?
                </Text>
              </View>
            )}
            ListFooterComponent={() => (
              <>
                {renderTypingIndicator()}
                {renderQuickQuestions()}
              </>
            )}
          />
          
          {/* Input Area */}
          <View style={{
            paddingHorizontal: wp(4),
            paddingVertical: hp(2),
            borderTopWidth: 1,
            borderTopColor: 'rgba(255, 255, 255, 0.1)'
          }}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderRadius: wp(6),
                paddingHorizontal: wp(4),
                paddingVertical: hp(1),
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.2)'
              }}
            >
              <TextInput
                style={{
                  flex: 1,
                  fontSize: rf(16),
                  color: '#ffffff',
                  maxHeight: hp(12),
                  paddingVertical: hp(1)
                }}
                placeholder="İslami sorularınızı yazın..."
                placeholderTextColor="#94a3b8"
                value={inputText}
                onChangeText={setInputText}
                multiline
                onSubmitEditing={() => sendMessage(inputText)}
                blurOnSubmit={false}
              />
              
              <TouchableOpacity
                onPress={() => sendMessage(inputText)}
                disabled={!inputText.trim() || isLoading}
                style={{
                  width: wp(10),
                  height: wp(10),
                  borderRadius: wp(5),
                  backgroundColor: inputText.trim() && !isLoading ? '#8b5cf6' : '#374151',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: wp(2)
                }}
              >
                <Ionicons 
                  name="send" 
                  size={wp(5)} 
                  color={inputText.trim() && !isLoading ? '#ffffff' : '#6b7280'} 
                />
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
} 