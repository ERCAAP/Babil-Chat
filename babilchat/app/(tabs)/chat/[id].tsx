import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, { FadeInLeft, FadeInRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ChatMessage,
    getChatSession,
    sendMessageToAI
} from '../../../src/utils/aiChat';
import { triggerButtonPressHaptic } from '../../../src/utils/haptics';
import { hp, rf, wp } from '../../../src/utils/responsive';

export default function ChatDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionTitle, setSessionTitle] = useState('Sohbet');

  useEffect(() => {
    if (id) {
      loadChatSession(id);
    }
  }, [id]);

  const loadChatSession = async (sessionId: string) => {
    try {
      const session = await getChatSession(sessionId);
      if (session) {
        setMessages(session.messages || []);
        setSessionTitle(session.title || 'Sohbet');
      }
    } catch (error) {
      console.error('Error loading chat session:', error);
      Alert.alert('Hata', 'Sohbet yüklenirken bir hata oluştu');
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
      type: 'question'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await sendMessageToAI(userMessage.text, id || '');
      
      if (response) {
        setMessages(prev => [...prev, response]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Hata', 'Mesaj gönderilemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    return (
      <Animated.View
        entering={item.isUser ? FadeInRight : FadeInLeft}
        style={{
          alignSelf: item.isUser ? 'flex-end' : 'flex-start',
          marginHorizontal: wp(4),
          marginVertical: hp(0.5),
          maxWidth: '80%',
        }}
      >
        <LinearGradient
          colors={item.isUser ? ['#8b5cf6', '#a78bfa'] : ['#1a1a2e', '#16213e']}
          style={{
            paddingHorizontal: wp(4),
            paddingVertical: hp(1.5),
            borderRadius: wp(4),
            borderWidth: item.isUser ? 0 : 1,
            borderColor: 'rgba(255, 255, 255, 0.1)',
          }}
        >
          <Text style={{
            color: '#ffffff',
            fontSize: rf(14),
            lineHeight: rf(20),
          }}>
            {item.text}
          </Text>
          <Text style={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: rf(10),
            marginTop: hp(0.5),
            textAlign: item.isUser ? 'right' : 'left',
          }}>
            {new Date(item.timestamp).toLocaleTimeString('tr-TR', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </LinearGradient>
      </Animated.View>
    );
  };

  return (
    <LinearGradient colors={['#0f0f23', '#1a1a2e', '#16213e']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: wp(4),
          paddingVertical: hp(2),
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(255, 255, 255, 0.1)',
        }}>
          <TouchableOpacity
            onPress={() => {
              triggerButtonPressHaptic();
              router.back();
            }}
            style={{
              width: wp(10),
              height: wp(10),
              borderRadius: wp(5),
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: wp(3),
            }}
          >
            <Ionicons name="arrow-back" size={wp(5)} color="#ffffff" />
          </TouchableOpacity>
          
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: rf(18),
              fontWeight: '600',
              color: '#ffffff',
            }}>
              {sessionTitle}
            </Text>
            <Text style={{
              fontSize: rf(12),
              color: '#94a3b8',
            }}>
              AI Rehberlik
            </Text>
          </View>
        </View>

        {/* Messages */}
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: hp(2) }}
        />

        {/* Loading indicator */}
        {isLoading && (
          <View style={{
            alignItems: 'center',
            paddingVertical: hp(1),
          }}>
            <Text style={{
              color: '#94a3b8',
              fontSize: rf(12),
            }}>
              AI yanıt yazıyor...
            </Text>
          </View>
        )}

        {/* Input */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{
            paddingHorizontal: wp(4),
            paddingVertical: hp(2),
            borderTopWidth: 1,
            borderTopColor: 'rgba(255, 255, 255, 0.1)',
          }}
        >
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: wp(6),
            paddingHorizontal: wp(4),
          }}>
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Mesajınızı yazın..."
              placeholderTextColor="#94a3b8"
              style={{
                flex: 1,
                color: '#ffffff',
                fontSize: rf(14),
                paddingVertical: hp(2),
              }}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              onPress={sendMessage}
              disabled={!inputText.trim() || isLoading}
              style={{
                width: wp(10),
                height: wp(10),
                borderRadius: wp(5),
                backgroundColor: inputText.trim() ? '#8b5cf6' : 'rgba(255, 255, 255, 0.2)',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: wp(2),
              }}
            >
              <Ionicons 
                name="send" 
                size={wp(5)} 
                color={inputText.trim() ? '#ffffff' : '#94a3b8'} 
              />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
} 