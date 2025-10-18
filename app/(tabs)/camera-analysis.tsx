import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Platform,
  TextInput,
  KeyboardAvoidingView
} from 'react-native';
import { Stack } from 'expo-router';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Camera, FlipHorizontal, Image as ImageIcon, Send, MessageCircle } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useMedical } from '@/hooks/medical-store';
import { Consultation, Message } from '@/types/medical';
import * as Haptics from 'expo-haptics';
import { useLanguage } from '@/hooks/language-store';

export default function CameraAnalysisScreen() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { saveConsultation } = useMedical();
  const cameraRef = useRef<CameraView>(null);
  const { t } = useLanguage();

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Camera size={64} color={Colors.textSecondary} />
          <Text style={styles.permissionTitle}>{t('cameraAccess')}</Text>
          <Text style={styles.permissionText}>
            {t('needCameraAccess')}
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>{t('allowAccess')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const takePicture = async () => {
    if (!cameraRef.current) return;

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
      });
      
      if (photo) {
        setCapturedImage(photo.uri);
      }
    } catch (error) {
      console.error('Error taking picture:', error);
    }
  };

  const pickImage = async () => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setCapturedImage(result.assets[0].uri);
    }
  };

  const analyzeImage = async () => {
    if (!capturedImage) return;

    setIsAnalyzing(true);
    
    try {
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.readAsDataURL(blob);
      });

      const aiResponse = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'Вы медицинский ИИ-помощник. Анализируйте изображения симптомов и давайте предварительные рекомендации. ВАЖНО: всегда напоминайте, что это не заменяет консультацию врача.'
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Проанализируйте это изображение симптома и дайте предварительную оценку. Что это может быть и какие рекомендации вы можете дать?'
                },
                {
                  type: 'image',
                  image: base64
                }
              ]
            }
          ]
        }),
      });

      const data = await aiResponse.json();
      setAnalysis(data.completion);

      // Инициализируем чат с результатом анализа
      const initialMessages: Message[] = [
        {
          id: '1',
          role: 'user',
          content: 'Анализ изображения симптома',
          timestamp: new Date().toISOString(),
          images: [capturedImage],
        },
        {
          id: '2',
          role: 'assistant',
          content: data.completion,
          timestamp: new Date().toISOString(),
        },
      ];
      
      setChatMessages(initialMessages);

      // Сохраняем консультацию
      const consultation: Consultation = {
        id: Date.now().toString(),
        type: 'ai',
        date: new Date().toISOString(),
        messages: initialMessages,
        images: [capturedImage],
      };

      await saveConsultation(consultation);
      
    } catch (error) {
      console.error('Error analyzing image:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleCameraFacing = () => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setAnalysis('');
    setShowChat(false);
    setChatMessages([]);
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isSending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date().toISOString(),
    };

    setChatMessages(prev => [...prev, userMessage]);
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
            ...chatMessages.map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            {
              role: 'user',
              content: inputText.trim()
            }
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

      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  if (capturedImage) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: t('imageAnalysis') }} />
        
        <ScrollView style={styles.analysisContainer}>
          <Image source={{ uri: capturedImage }} style={styles.capturedImage} />
          
          <View style={styles.analysisActions}>
            <TouchableOpacity style={styles.retakeButton} onPress={retakePhoto}>
              <Text style={styles.retakeButtonText}>{t('retake')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.analyzeButton, isAnalyzing && styles.analyzeButtonDisabled]} 
              onPress={analyzeImage}
              disabled={isAnalyzing}
            >
              <Send size={20} color="white" />
              <Text style={styles.analyzeButtonText}>
                {isAnalyzing ? t('analyzing') : t('analyze')}
              </Text>
            </TouchableOpacity>
          </View>

          {analysis && !showChat && (
            <View style={styles.analysisResult}>
              <Text style={styles.analysisTitle}>{t('analysisResult')}</Text>
              <Text style={styles.analysisText}>{analysis}</Text>
              
              <TouchableOpacity 
                style={styles.chatButton} 
                onPress={() => setShowChat(true)}
              >
                <MessageCircle size={20} color="white" />
                <Text style={styles.chatButtonText}>{t('askQuestion')}</Text>
              </TouchableOpacity>
            </View>
          )}

          {showChat && (
            <KeyboardAvoidingView 
              style={styles.chatContainer}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
              <View style={styles.chatHeader}>
                <Text style={styles.chatTitle}>{t('chatWithAIDoctor')}</Text>
                <TouchableOpacity onPress={() => setShowChat(false)}>
                  <Text style={styles.closeChat}>{t('close')}</Text>
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.messagesContainer}>
                {chatMessages.map((message) => (
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
                  </View>
                ))}
              </ScrollView>
              
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder={t('askAboutSymptoms')}
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
              </View>
            </KeyboardAvoidingView>
          )}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: t('cameraAnalysis') }} />
      
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        <View style={styles.cameraOverlay}>
          <View style={styles.cameraHeader}>
            <Text style={styles.cameraTitle}>{t('photoSymptom')}</Text>
            <Text style={styles.cameraSubtitle}>
              {t('pointCamera')}
            </Text>
          </View>
          
          <View style={styles.cameraControls}>
            <TouchableOpacity style={styles.galleryButton} onPress={pickImage}>
              <ImageIcon size={24} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
              <FlipHorizontal size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 20,
    marginBottom: 12,
  },
  permissionText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  permissionButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'space-between',
  },
  cameraHeader: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  cameraTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
  },
  cameraSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 60,
  },
  galleryButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
  },
  flipButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  analysisContainer: {
    flex: 1,
    padding: 20,
  },
  capturedImage: {
    width: '100%',
    height: 300,
    borderRadius: 16,
    marginBottom: 20,
  },
  analysisActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  retakeButton: {
    flex: 1,
    backgroundColor: Colors.textSecondary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  retakeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  analyzeButton: {
    flex: 2,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  analyzeButtonDisabled: {
    backgroundColor: Colors.textSecondary,
  },
  analyzeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  analysisResult: {
    backgroundColor: Colors.card,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  analysisText: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
    marginBottom: 16,
  },
  chatButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  chatButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  chatContainer: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    maxHeight: 500,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  closeChat: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
    maxHeight: 300,
  },
  messageContainer: {
    marginBottom: 12,
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
    backgroundColor: Colors.background,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: 'white',
  },
  aiMessageText: {
    color: Colors.text,
  },
  messageImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
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