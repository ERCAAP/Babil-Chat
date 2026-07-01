// AI Chat Service for Islamic Guidance
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserData } from './auth';

// Message types for AI chat
export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'verse' | 'hadith' | 'advice' | 'dua';
  metadata?: {
    verseReference?: string;
    hadithReference?: string;
    confidence?: number;
    language?: string;
  };
}

// Chat session for storing conversation history
export interface ChatSession {
  id: string;
  title: string;
  language: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

// Storage keys
const CHAT_SESSIONS_KEY = 'chat_sessions';
const CHAT_HISTORY_KEY = 'chat_history';
const AI_CONFIG_KEY = 'ai_config';

// AI Configuration
const AI_CONFIG = {
  apiUrl: process.env.EXPO_PUBLIC_OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions',
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY || '',
  model: 'gpt-4',
  maxTokens: 1000,
  temperature: 0.7,
  timeout: 30000,
};

// Check if API key is configured
const isAPIKeyConfigured = (): boolean => {
  return AI_CONFIG.apiKey.length > 0;
};

// Generate message ID
const generateMessageId = (): string => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Generate session ID
const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Create new chat session
export const createChatSession = async (language: string = 'tr'): Promise<ChatSession> => {
  try {
    const session: ChatSession = {
      id: generateSessionId(),
      title: `Sohbet ${new Date().toLocaleDateString('tr-TR')}`,
      language,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    };

    // Save session
    const sessions = await getChatSessions();
    sessions.unshift(session);
    await AsyncStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(sessions.slice(0, 50))); // Keep max 50 sessions

    return session;
  } catch (error) {
    console.error('Error creating chat session:', error);
    throw error;
  }
};

// Get all chat sessions
export const getChatSessions = async (): Promise<ChatSession[]> => {
  try {
    const stored = await AsyncStorage.getItem(CHAT_SESSIONS_KEY);
    if (stored) {
      const sessions = JSON.parse(stored);
      return sessions.map((session: any) => ({
        ...session,
        createdAt: new Date(session.createdAt),
        updatedAt: new Date(session.updatedAt),
        messages: session.messages?.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })) || []
      }));
    }
    return [];
  } catch (error) {
    console.error('Error getting chat sessions:', error);
    return [];
  }
};

// Get specific chat session
export const getChatSession = async (sessionId: string): Promise<ChatSession | null> => {
  try {
    const sessions = await getChatSessions();
    return sessions.find(session => session.id === sessionId) || null;
  } catch (error) {
    console.error('Error getting chat session:', error);
    return null;
  }
};

// Update chat session
export const updateChatSession = async (sessionId: string, updates: Partial<ChatSession>): Promise<void> => {
  try {
    const sessions = await getChatSessions();
    const sessionIndex = sessions.findIndex(session => session.id === sessionId);
    
    if (sessionIndex !== -1) {
      sessions[sessionIndex] = {
        ...sessions[sessionIndex],
        ...updates,
        updatedAt: new Date()
      };
      
      await AsyncStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(sessions));
    }
  } catch (error) {
    console.error('Error updating chat session:', error);
  }
};

// Delete chat session
export const deleteChatSession = async (sessionId: string): Promise<void> => {
  try {
    const sessions = await getChatSessions();
    const filteredSessions = sessions.filter(session => session.id !== sessionId);
    await AsyncStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(filteredSessions));
  } catch (error) {
    console.error('Error deleting chat session:', error);
  }
};

// Create request headers
const createHeaders = async (): Promise<Record<string, string>> => {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${AI_CONFIG.apiKey}`,
    'User-Agent': 'BabilChat/1.0',
  };
};

// Get system prompt based on language
const getSystemPrompt = (language: string): string => {
  const prompts = {
    tr: `Sen Babil Chat uygulamasının AI rehberisin. İslami konularda yardımcı olan, bilgili ve merhametli bir danışmansın.

Görevlerin:
1. İslami sorulara Kuran ve Sünnet ışığında cevap vermek
2. Dini konularda doğru bilgi sağlamak
3. Kullanıcıları manevi olarak desteklemek
4. Ahlaki ve etik konularda rehberlik etmek

Kurallar:
- Her zaman saygılı ve anlayışlı ol
- Kesin fetva vermekten kaçın, "Allah daha iyi bilir" demeyi unutma
- Kuran ayetleri ve hadisleri doğru kaynaklarla belirt
- Mezhepsel tartışmalara girmeden evrensel İslami değerleri vurgula
- Şüpheli konularda uzman alim görüşüne yönlendir`,

    en: `You are the AI guide of Babil Chat app. You are a knowledgeable and compassionate advisor who helps with Islamic matters.

Your duties:
1. Answer Islamic questions in light of Quran and Sunnah
2. Provide accurate religious information
3. Support users spiritually
4. Guide on moral and ethical issues

Rules:
- Always be respectful and understanding
- Avoid giving definitive fatwas, remember to say "Allah knows best"
- Cite Quranic verses and hadiths with proper sources
- Emphasize universal Islamic values without sectarian discussions
- Refer to expert scholars' opinions on doubtful matters`,

    ar: `أنت المرشد الذكي لتطبيق بابل شات. أنت مستشار عليم ورحيم يساعد في الأمور الإسلامية.

واجباتك:
1. الإجابة على الأسئلة الإسلامية في ضوء القرآن والسنة
2. تقديم معلومات دينية صحيحة
3. دعم المستخدمين روحياً
4. الإرشاد في القضايا الأخلاقية والأخلاقية

القواعد:
- كن دائماً محترماً ومتفهماً
- تجنب إعطاء فتاوى قطعية، تذكر أن تقول "والله أعلم"
- اذكر الآيات القرآنية والأحاديث مع المصادر الصحيحة
- أكد على القيم الإسلامية العالمية دون نقاشات مذهبية
- وجه إلى آراء العلماء المختصين في الأمور المشكوك فيها`
  };

  return prompts[language as keyof typeof prompts] || prompts.tr;
};

// Prepare messages for API
const prepareMessagesForAPI = (messages: ChatMessage[], systemPrompt: string) => {
  const apiMessages = [
    { role: 'system', content: systemPrompt }
  ];

  messages.forEach(message => {
    apiMessages.push({
      role: message.isUser ? 'user' : 'assistant',
      content: message.text
    });
  });

  return apiMessages;
};

// Parse AI response for special content
const parseAIResponse = (response: string): { type: ChatMessage['type']; metadata: any } => {
  // Look for verse references
  const verseRegex = /(?:Kuran|Quran).*?(\d+):(\d+)/i;
  const verseMatch = response.match(verseRegex);
  
  if (verseMatch) {
    return {
      type: 'verse',
      metadata: {
        verseReference: `${verseMatch[1]}:${verseMatch[2]}`
      }
    };
  }

  // Look for hadith references
  const hadithRegex = /(Bukhari|Muslim|Tirmizi|Abu Dawud|Nasai|Ibn Majah)/i;
  const hadithMatch = response.match(hadithRegex);
  
  if (hadithMatch) {
    return {
      type: 'hadith',
      metadata: {
        hadithReference: hadithMatch[1]
      }
    };
  }

  // Look for dua content
  if (response.includes('dua') || response.includes('Allah') || response.includes('اللهم')) {
    return {
      type: 'dua',
      metadata: {}
    };
  }

  return {
    type: 'advice',
    metadata: {}
  };
};

// Quick questions for chat
export const getQuickQuestions = (language: string = 'tr') => {
  const questions = {
    tr: [
      'Namaz nasıl kılınır?',
      'Abdest nasıl alınır?',
      'Günlük dualar nelerdir?',
      'Kuran okuma adabı nedir?',
      'Oruç tutmanın faydaları',
      'Zekât nasıl hesaplanır?'
    ],
    en: [
      'How to perform prayer?',
      'How to perform wudu?',
      'What are daily prayers?',
      'Quran reading etiquette',
      'Benefits of fasting',
      'How to calculate zakat?'
    ],
    ar: [
      'كيفية أداء الصلاة؟',
      'كيفية الوضوء؟',
      'ما هي الأدعية اليومية؟',
      'آداب قراءة القرآن',
      'فوائد الصيام',
      'كيفية حساب الزكاة؟'
    ]
  };

  return questions[language as keyof typeof questions] || questions.tr;
};

// Send message to AI service
export const sendMessageToAI = async (
  message: string, 
  conversationHistory: ChatMessage[] = [],
  language: string = 'tr'
): Promise<ChatMessage> => {
  try {
    // Check if API key is configured
    if (!isAPIKeyConfigured()) {
      return {
        id: generateMessageId(),
        text: language === 'tr' 
          ? 'AI servisine erişim için API anahtarı yapılandırılmalı. Lütfen ayarlardan OpenAI API anahtarınızı ekleyin.'
          : 'API key must be configured for AI service access. Please add your OpenAI API key from settings.',
        isUser: false,
        timestamp: new Date(),
        type: 'advice',
        metadata: { language },
      };
    }

    // Check if user has reached rate limits (for free tier)
    const user = await getUserData();
    if (user && !user.subscription.isPremium) {
      // Implement rate limiting for free users
      const todayMessages = conversationHistory.filter(msg => {
        const today = new Date();
        const msgDate = new Date(msg.timestamp);
        return msgDate.toDateString() === today.toDateString() && !msg.isUser;
      });
      
      if (todayMessages.length >= 10) {
        throw new Error('RATE_LIMIT_EXCEEDED');
      }
    }
    
    const headers = await createHeaders();
    const systemPrompt = getSystemPrompt(language);
    const apiMessages = prepareMessagesForAPI(conversationHistory, systemPrompt);
    
    // Add the new user message
    apiMessages.push({
      role: 'user',
      content: message
    });
    
    const requestBody = {
      model: AI_CONFIG.model,
      messages: apiMessages,
      max_tokens: AI_CONFIG.maxTokens,
      temperature: AI_CONFIG.temperature,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    };
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AI_CONFIG.timeout);
    
    const response = await fetch(AI_CONFIG.apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`AI API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid AI response format');
    }
    
    const aiResponseText = data.choices[0].message.content.trim();
    const { type, metadata } = parseAIResponse(aiResponseText);
    
    const aiMessage: ChatMessage = {
      id: generateMessageId(),
      text: aiResponseText,
      isUser: false,
      timestamp: new Date(),
      type,
      metadata: {
        ...metadata,
        confidence: data.choices[0].finish_reason === 'stop' ? 0.9 : 0.7,
        language,
      },
    };
    
    return aiMessage;
    
  } catch (error) {
    console.error('AI Chat Error:', error);
    
    if (error instanceof Error) {
      if (error.message === 'RATE_LIMIT_EXCEEDED') {
        return {
          id: generateMessageId(),
          text: language === 'tr' 
            ? 'Günlük mesaj limitinize ulaştınız. Premium üyelik ile sınırsız sohbet imkanına sahip olabilirsiniz.'
            : 'You have reached your daily message limit. Upgrade to premium for unlimited chat.',
          isUser: false,
          timestamp: new Date(),
          type: 'advice',
          metadata: { language },
        };
      }
      
      // Network or API errors
      if (error.name === 'AbortError') {
        return {
          id: generateMessageId(),
          text: language === 'tr'
            ? 'Üzgünüm, yanıt verme sürem doldu. Lütfen tekrar deneyin.'
            : 'Sorry, my response timed out. Please try again.',
          isUser: false,
          timestamp: new Date(),
          type: 'advice',
          metadata: { language },
        };
      }
    }
    
    // Generic error response
    return {
      id: generateMessageId(),
      text: language === 'tr'
        ? 'Üzgünüm, şu anda teknik bir sorun yaşıyorum. Lütfen daha sonra tekrar deneyin.'
        : 'Sorry, I\'m experiencing technical difficulties. Please try again later.',
      isUser: false,
      timestamp: new Date(),
      type: 'advice',
      metadata: { language },
    };
  }
};

// Save chat message to history
export const saveChatMessage = async (message: ChatMessage, sessionId?: string): Promise<void> => {
  try {
    const historyKey = sessionId ? `${CHAT_HISTORY_KEY}_${sessionId}` : CHAT_HISTORY_KEY;
    const stored = await AsyncStorage.getItem(historyKey);
    const history = stored ? JSON.parse(stored) : [];
    
    history.push(message);
    
    // Keep only last 1000 messages
    if (history.length > 1000) {
      history.splice(0, history.length - 1000);
    }
    
    await AsyncStorage.setItem(historyKey, JSON.stringify(history));
  } catch (error) {
    console.error('Error saving chat message:', error);
  }
};

// Get chat history
export const getChatHistory = async (sessionId?: string, limit: number = 50): Promise<ChatMessage[]> => {
  try {
    const historyKey = sessionId ? `${CHAT_HISTORY_KEY}_${sessionId}` : CHAT_HISTORY_KEY;
    const stored = await AsyncStorage.getItem(historyKey);
    
    if (stored) {
      const history = JSON.parse(stored);
      const messages = history.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
      
      return messages.slice(-limit);
    }
    
    return [];
  } catch (error) {
    console.error('Error getting chat history:', error);
    return [];
  }
};

// Clear chat history
export const clearChatHistory = async (sessionId?: string): Promise<void> => {
  try {
    const historyKey = sessionId ? `${CHAT_HISTORY_KEY}_${sessionId}` : CHAT_HISTORY_KEY;
    await AsyncStorage.removeItem(historyKey);
  } catch (error) {
    console.error('Error clearing chat history:', error);
  }
};

// Export chat session
export const exportChatSession = async (sessionId: string): Promise<string> => {
  try {
    const session = await getChatSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }
    
    let exportText = `# ${session.title}\n`;
    exportText += `Tarih: ${session.createdAt.toLocaleDateString('tr-TR')}\n\n`;
    
    session.messages.forEach(message => {
      const sender = message.isUser ? 'Sen' : 'AI Rehber';
      const timestamp = message.timestamp.toLocaleTimeString('tr-TR');
      exportText += `**${sender}** (${timestamp}):\n${message.text}\n\n`;
    });
    
    return exportText;
  } catch (error) {
    console.error('Error exporting chat session:', error);
    throw error;
  }
}; 