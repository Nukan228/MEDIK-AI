import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform
} from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Send, Bot, User, Mic } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useMedical } from '@/hooks/medical-store';
import { Message, Consultation } from '@/types/medical';
import * as Haptics from 'expo-haptics';
import { useLanguage } from '@/hooks/language-store';
import VoiceAssistant from '@/components/VoiceAssistant';

export default function AIChatScreen() {
  const { symptom } = useLocalSearchParams();
  const { saveConsultation } = useMedical();
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showVoiceMode, setShowVoiceMode] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleAIResponse = useCallback(async (userMessage: string, currentMessages: Message[], isVoiceMode = false) => {
    setIsLoading(true);
    
    try {
      const systemPrompt = isVoiceMode 
        ? `Вы медицинский ИИ-помощник AI MEDIK в ГОЛОСОВОМ режиме.

ВАЖНЫЕ ПРАВИЛА ДЛЯ ГОЛОСОВОГО РЕЖИМА:
1. Отвечайте МАКСИМАЛЬНО КРАТКО - 1-3 предложения
2. Говорите только САМОЕ ВАЖНОЕ
3. Отвечайте ТОЛЬКО на медицинские вопросы
4. На немедицинские темы: "Извините, я помогаю только с медицинскими вопросами"
5. При серьезных симптомах: "Срочно обратитесь к врачу"
6. Не давайте длинные объяснения
7. Будьте конкретны и по делу

ПРИМЕР ХОРОШЕГО ОТВЕТА: "Это может быть простуда. Пейте больше воды, отдыхайте. Если температура выше 38 - к врачу."
ПРИМЕР ПЛОХОГО ОТВЕТА: "Здравствуйте! Спасибо за ваш вопрос. Я внимательно изучил ваши симптомы и хочу сказать, что..."`
        : `Вы медицинский ИИ-помощник AI MEDIK. 

ВАЖНЫЕ ПРАВИЛА:
1. Отвечайте ТОЛЬКО на медицинские вопросы (симптомы, здоровье, лекарства, диагностика)
2. На любые немедицинские темы отвечайте: "Извините, я специализируюсь только на медицинских вопросах. Расскажите о ваших симптомах или проблемах со здоровьем."
3. Задавайте уточняющие вопросы о симптомах
4. Давайте предварительные рекомендации
5. ВСЕГДА напоминайте: "Это предварительная консультация. Обязательно обратитесь к врачу для точного диагноза и лечения."
6. Не ставьте окончательные диагнозы
7. При серьезных симптомах рекомендуйте немедленно обратиться к врачу`;

      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            ...currentMessages.map(m => ({
              role: m.role === 'assistant' ? 'assistant' : 'user',
              content: m.content
            })),
            {
              role: 'user',
              content: userMessage
            }
          ]
        }),
      });

      const data = await response.json();
      
      const aiMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.completion,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize messages based on symptom parameter
  useEffect(() => {
    if (symptom) {
      const initialMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: `У меня ${symptom}. Что это может быть?`,
        timestamp: new Date().toISOString(),
      };
      setMessages([initialMessage]);
      // Call AI response after setting messages
      setTimeout(() => {
        handleAIResponse(`У меня ${symptom}. Что это может быть?`, [initialMessage]);
      }, 100);
    } else {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Здравствуйте! Я ваш ИИ медицинский помощник. Расскажите о ваших симптомах, и я помогу с предварительной диагностикой.',
        timestamp: new Date().toISOString(),
      };
      setMessages([welcomeMessage]);
    }
  }, [symptom]); // Removed handleAIResponse from dependencies

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    const messageText = inputText.trim();
    setInputText('');

    await handleAIResponse(messageText, [...messages, userMessage]);
  };

  const saveConsultationHistory = async () => {
    if (messages.length === 0) return;

    const consultation: Consultation = {
      id: Date.now().toString(),
      type: 'ai',
      date: new Date().toISOString(),
      messages,
    };

    await saveConsultation(consultation);
    console.log('Консультация сохранена в истории');
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleVoiceTranscript = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    await handleAIResponse(text.trim(), [...messages, userMessage], true);
  }, [messages, handleAIResponse]);

  const lastAIMessage = useMemo(() => {
    const aiMessages = messages.filter(m => m.role === 'assistant');
    return aiMessages[aiMessages.length - 1]?.content || '';
  }, [messages]);

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: t('aiConsultation'),
          headerRight: () => (
            <TouchableOpacity onPress={saveConsultationHistory}>
              <Text style={styles.saveButton}>{t('save')}</Text>
            </TouchableOpacity>
          )
        }} 
      />
      
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageContainer,
                message.role === 'user' ? styles.userMessage : styles.aiMessage,
              ]}
            >
              <View style={styles.messageHeader}>
                {message.role === 'user' ? (
                  <User size={20} color={Colors.primary} />
                ) : (
                  <Bot size={20} color={Colors.success} />
                )}
                <Text style={styles.messageRole}>
                  {message.role === 'user' ? t('you') : t('aiAssistant')}
                </Text>
              </View>
              <Text style={styles.messageText}>{message.content}</Text>
            </View>
          ))}
          
          {isLoading && (
            <View style={[styles.messageContainer, styles.aiMessage]}>
              <View style={styles.messageHeader}>
                <Bot size={20} color={Colors.success} />
                <Text style={styles.messageRole}>{t('aiAssistant')}</Text>
              </View>
              <Text style={styles.loadingText}>{t('typing')}</Text>
            </View>
          )}
        </ScrollView>

        {showVoiceMode ? (
          <View style={styles.voiceContainer}>
            <VoiceAssistant
              onTranscript={handleVoiceTranscript}
              isAISpeaking={!isLoading && lastAIMessage.length > 0}
              aiResponse={lastAIMessage}
            />
            <TouchableOpacity
              style={styles.switchModeButton}
              onPress={() => setShowVoiceMode(false)}
            >
              <Text style={styles.switchModeText}>{t('switchToTextMode')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.inputContainer}>
            <TouchableOpacity
              style={styles.voiceModeButton}
              onPress={() => setShowVoiceMode(true)}
            >
              <Mic size={20} color={Colors.primary} />
            </TouchableOpacity>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder={t('describeSymptoms')}
              multiline
              maxLength={500}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
              onPress={sendMessage}
              disabled={!inputText.trim() || isLoading}
            >
              <Send size={20} color="white" />
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  saveButton: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 16,
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    maxWidth: '85%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.primary,
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  messageRole: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    color: Colors.textSecondary,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    color: Colors.text,
  },
  loadingText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: Colors.textSecondary,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 12,
    backgroundColor: Colors.background,
  },
  sendButton: {
    backgroundColor: Colors.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.textSecondary,
  },
  voiceContainer: {
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingVertical: 20,
  },
  voiceModeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  switchModeButton: {
    backgroundColor: Colors.background,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignSelf: 'center',
    marginTop: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  switchModeText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
});