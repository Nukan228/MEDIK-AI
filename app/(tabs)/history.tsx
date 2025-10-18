import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { Bot, User, Camera, MessageSquare, FileText, X, Send } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useMedical } from '@/hooks/medical-store';
import { Consultation, MedicalRecord, Message } from '@/types/medical';
import { Image } from 'expo-image';

export default function HistoryScreen() {
  const { consultations, medicalRecords, isLoading, saveConsultation } = useMedical();
  const [selectedTab, setSelectedTab] = useState<'consultations' | 'records'>('consultations');
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const openChatModal = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setShowChatModal(true);
  };

  const closeChatModal = () => {
    setShowChatModal(false);
    setSelectedConsultation(null);
    setInputText('');
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isSending || !selectedConsultation) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...selectedConsultation.messages, userMessage];
    const updatedConsultation = {
      ...selectedConsultation,
      messages: updatedMessages,
    };
    
    setSelectedConsultation(updatedConsultation);
    setInputText('');
    setIsSending(true);

    try {
      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'Вы медицинский ИИ-помощник. Отвечайте только на медицинские вопросы. Если вопрос не связан с медициной, вежливо объясните, что вы можете помочь только с медицинскими вопросами. ВАЖНО: всегда напоминайте, что это не заменяет консультацию врача.'
            },
            ...updatedMessages.map(msg => ({
              role: msg.role,
              content: msg.content
            })),
          ]
        }),
      });

      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.completion,
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [...updatedMessages, aiMessage];
      const finalConsultation = {
        ...selectedConsultation,
        messages: finalMessages,
      };
      
      setSelectedConsultation(finalConsultation);
      await saveConsultation(finalConsultation);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const renderConsultation = (consultation: Consultation) => (
    <TouchableOpacity 
      key={consultation.id} 
      style={styles.consultationCard}
      onPress={() => openChatModal(consultation)}
    >
      <View style={styles.consultationHeader}>
        <View style={styles.consultationInfo}>
          {consultation.type === 'ai' ? (
            <Bot size={20} color={Colors.primary} />
          ) : (
            <User size={20} color={Colors.success} />
          )}
          <Text style={styles.consultationType}>
            {consultation.type === 'ai' ? 'ИИ Консультация' : 'Консультация с врачом'}
          </Text>
        </View>
        <Text style={styles.consultationDate}>{formatDate(consultation.date)}</Text>
      </View>
      
      {consultation.images && consultation.images.length > 0 && (
        <View style={styles.imagesContainer}>
          <Camera size={16} color={Colors.textSecondary} />
          <Text style={styles.imagesText}>
            {consultation.images.length} изображение(й)
          </Text>
        </View>
      )}
      
      <Text style={styles.consultationPreview} numberOfLines={3}>
        {consultation.messages[0]?.content || 'Консультация'}
      </Text>
      
      {consultation.diagnosis && (
        <View style={styles.diagnosisContainer}>
          <Text style={styles.diagnosisLabel}>Диагноз:</Text>
          <Text style={styles.diagnosisText}>{consultation.diagnosis}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderMedicalRecord = (record: MedicalRecord) => (
    <TouchableOpacity key={record.id} style={styles.recordCard}>
      <View style={styles.recordHeader}>
        <View style={styles.recordInfo}>
          <FileText size={20} color={Colors.warning} />
          <Text style={styles.recordType}>{record.type}</Text>
        </View>
        <Text style={styles.recordDate}>{formatDate(record.date)}</Text>
      </View>
      
      <Text style={styles.recordTitle}>{record.title}</Text>
      <Text style={styles.recordDescription} numberOfLines={2}>
        {record.description}
      </Text>
      
      {record.doctorName && (
        <Text style={styles.doctorName}>Врач: {record.doctorName}</Text>
      )}
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'История здоровья' }} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Загрузка...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'История здоровья' }} />
      
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'consultations' && styles.tabActive]}
          onPress={() => setSelectedTab('consultations')}
        >
          <MessageSquare size={20} color={selectedTab === 'consultations' ? 'white' : Colors.textSecondary} />
          <Text style={[styles.tabText, selectedTab === 'consultations' && styles.tabTextActive]}>
            Консультации
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'records' && styles.tabActive]}
          onPress={() => setSelectedTab('records')}
        >
          <FileText size={20} color={selectedTab === 'records' ? 'white' : Colors.textSecondary} />
          <Text style={[styles.tabText, selectedTab === 'records' && styles.tabTextActive]}>
            Записи
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedTab === 'consultations' ? (
          <>
            {consultations.length > 0 ? (
              consultations.map(renderConsultation)
            ) : (
              <View style={styles.emptyState}>
                <MessageSquare size={48} color={Colors.textSecondary} />
                <Text style={styles.emptyTitle}>Нет консультаций</Text>
                <Text style={styles.emptyText}>
                  Ваши консультации с ИИ и врачами будут отображаться здесь
                </Text>
              </View>
            )}
          </>
        ) : (
          <>
            {medicalRecords.length > 0 ? (
              medicalRecords.map(renderMedicalRecord)
            ) : (
              <View style={styles.emptyState}>
                <FileText size={48} color={Colors.textSecondary} />
                <Text style={styles.emptyTitle}>Нет записей</Text>
                <Text style={styles.emptyText}>
                  Ваши медицинские записи будут отображаться здесь
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
      
      <Modal
        visible={showChatModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {selectedConsultation?.type === 'ai' ? 'ИИ Консультация' : 'Консультация с врачом'}
            </Text>
            <TouchableOpacity onPress={closeChatModal}>
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.chatMessages}>
            {selectedConsultation?.messages.map((message) => (
              <View 
                key={message.id} 
                style={[
                  styles.messageContainer,
                  message.role === 'user' ? styles.userMessage : styles.aiMessage
                ]}
              >
                {message.images && message.images.length > 0 && (
                  <Image source={{ uri: message.images[0] }} style={styles.messageImage} />
                )}
                <Text style={[
                  styles.messageText,
                  message.role === 'user' ? styles.userMessageText : styles.aiMessageText
                ]}>
                  {message.content}
                </Text>
                <Text style={[
                  styles.messageTime,
                  message.role === 'user' ? styles.userMessageTime : styles.aiMessageTime
                ]}>
                  {formatDate(message.timestamp)}
                </Text>
              </View>
            ))}
          </ScrollView>
          
          {selectedConsultation?.type === 'ai' && (
            <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.inputContainer}
            >
              <TextInput
                style={styles.textInput}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Задайте дополнительный вопрос..."
                placeholderTextColor={Colors.textSecondary}
                multiline
                maxLength={500}
              />
              <TouchableOpacity 
                style={[styles.sendButton, (!inputText.trim() || isSending) && styles.sendButtonDisabled]} 
                onPress={sendMessage}
                disabled={!inputText.trim() || isSending}
              >
                <Send size={20} color="white" />
              </TouchableOpacity>
            </KeyboardAvoidingView>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    margin: 16,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  consultationCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  consultationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  consultationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  consultationType: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  consultationDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  imagesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  imagesText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  consultationPreview: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 8,
  },
  diagnosisContainer: {
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  diagnosisLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  diagnosisText: {
    fontSize: 14,
    color: Colors.text,
  },
  recordCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recordInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recordType: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  recordDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  recordDescription: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 8,
  },
  doctorName: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.card,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  chatMessages: {
    flex: 1,
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.primary,
    borderRadius: 16,
    borderBottomRightRadius: 4,
    padding: 12,
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
  },
  userMessageText: {
    color: 'white',
  },
  aiMessageText: {
    color: Colors.text,
  },
  messageTime: {
    fontSize: 12,
    opacity: 0.7,
  },
  userMessageTime: {
    color: 'white',
  },
  aiMessageTime: {
    color: Colors.textSecondary,
  },
  messageImage: {
    width: 150,
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.card,
    gap: 12,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
    maxHeight: 100,
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
});