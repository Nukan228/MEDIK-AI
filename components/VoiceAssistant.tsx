import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { Mic, MicOff, Volume2 } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { Audio as ExpoAudio } from 'expo-av';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { useLanguage } from '@/hooks/language-store';



interface VoiceAssistantProps {
  onTranscript: (text: string) => void;
  isAISpeaking?: boolean;
  aiResponse?: string;
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
}

export default function VoiceAssistant({ 
  onTranscript, 
  isAISpeaking = false,
  aiResponse = '',
  onSpeechStart,
  onSpeechEnd
}: VoiceAssistantProps) {
  const { t, language } = useLanguage();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recording, setRecording] = useState<ExpoAudio.Recording | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);


  const pulseAnim = useRef(new Animated.Value(1)).current;
  const mouthAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
      glowAnim.setValue(0);
    }
  }, [isRecording]);

  useEffect(() => {
    if (isAISpeaking && aiResponse && !isSpeaking) {
      speakText(aiResponse);
    }
  }, [isAISpeaking, aiResponse]);

  useEffect(() => {
    if (isSpeaking) {
      const words = aiResponse.split(' ');
      let currentIndex = 0;

      const interval = setInterval(() => {
        if (currentIndex < words.length && isSpeaking) {
          Animated.sequence([
            Animated.timing(mouthAnim, {
              toValue: 1,
              duration: 150,
              useNativeDriver: true,
            }),
            Animated.timing(mouthAnim, {
              toValue: 0,
              duration: 150,
              useNativeDriver: true,
            }),
          ]).start();
          currentIndex++;
        } else {
          clearInterval(interval);
          mouthAnim.setValue(0);
        }
      }, 300);

      return () => {
        clearInterval(interval);
        mouthAnim.setValue(0);
      };
    } else {
      mouthAnim.setValue(0);
    }
  }, [isSpeaking, aiResponse]);

  const speakText = async (text: string) => {
    if (Platform.OS === 'web') {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        
        const langMap: { [key: string]: string } = {
          'kk': 'ru-RU',
          'ru': 'ru-RU',
          'en': 'en-US'
        };
        utterance.lang = langMap[language] || 'ru-RU';
        utterance.rate = 1.1;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        utterance.onstart = () => {
          setIsSpeaking(true);
          onSpeechStart?.();
        };
        
        utterance.onend = () => {
          setIsSpeaking(false);
          onSpeechEnd?.();
        };
        
        utterance.onerror = (error) => {
          console.error('Speech synthesis error:', error);
          setIsSpeaking(false);
          onSpeechEnd?.();
        };
        
        speechSynthRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      }
    } else {
      try {
        await Speech.stop();
        
        const langMap: { [key: string]: string } = {
          'kk': 'ru-RU',
          'ru': 'ru-RU',
          'en': 'en-US'
        };
        
        setIsSpeaking(true);
        onSpeechStart?.();
        
        await Speech.speak(text, {
          language: langMap[language] || 'ru-RU',
          pitch: 1.0,
          rate: 0.9,
          onDone: () => {
            setIsSpeaking(false);
            onSpeechEnd?.();
          },
          onStopped: () => {
            setIsSpeaking(false);
            onSpeechEnd?.();
          },
          onError: (error) => {
            console.error('Speech error:', error);
            setIsSpeaking(false);
            onSpeechEnd?.();
          },
        });
      } catch (error) {
        console.error('Failed to speak:', error);
        setIsSpeaking(false);
        onSpeechEnd?.();
      }
    }
  };

  useEffect(() => {
    return () => {
      if (Platform.OS === 'web' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      } else {
        Speech.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      if (isSpeaking) {
        if (Platform.OS === 'web' && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        } else {
          await Speech.stop();
        }
        setIsSpeaking(false);
      }

      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      if (Platform.OS === 'web') {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        const chunks: Blob[] = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunks.push(e.data);
          }
        };

        recorder.onstop = async () => {
          const audioBlob = new Blob(chunks, { type: 'audio/webm' });
          await transcribeAudio(audioBlob);
          stream.getTracks().forEach(track => track.stop());
        };

        recorder.start();
        setMediaRecorder(recorder);
      } else {
        const { status } = await ExpoAudio.requestPermissionsAsync();
        if (status !== 'granted') {
          console.error('Permission to access microphone was denied');
          return;
        }

        await ExpoAudio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const { recording: newRecording } = await ExpoAudio.Recording.createAsync({
          android: {
            extension: '.m4a',
            outputFormat: ExpoAudio.AndroidOutputFormat.MPEG_4,
            audioEncoder: ExpoAudio.AndroidAudioEncoder.AAC,
            sampleRate: 44100,
            numberOfChannels: 2,
            bitRate: 128000,
          },
          ios: {
            extension: '.wav',
            outputFormat: ExpoAudio.IOSOutputFormat.LINEARPCM,
            audioQuality: ExpoAudio.IOSAudioQuality.HIGH,
            sampleRate: 44100,
            numberOfChannels: 2,
            bitRate: 128000,
            linearPCMBitDepth: 16,
            linearPCMIsBigEndian: false,
            linearPCMIsFloat: false,
          },
          web: {
            mimeType: 'audio/webm',
            bitsPerSecond: 128000,
          },
        });

        setRecording(newRecording);
      }

      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopRecording = async () => {
    try {
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      setIsRecording(false);
      setIsProcessing(true);

      if (Platform.OS === 'web') {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
        }
      } else {
        if (recording) {
          await recording.stopAndUnloadAsync();
          await ExpoAudio.setAudioModeAsync({
            allowsRecordingIOS: false,
          });

          const uri = recording.getURI();
          if (uri) {
            const uriParts = uri.split('.');
            const fileType = uriParts[uriParts.length - 1];

            const audioFile = {
              uri,
              name: `recording.${fileType}`,
              type: `audio/${fileType}`,
            };

            await transcribeAudioFromUri(audioFile);
          }
          setRecording(null);
        }
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      setIsProcessing(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch('https://toolkit.rork.com/stt/transcribe/', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.text) {
        onTranscript(data.text);
      }
    } catch (error) {
      console.error('Transcription error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const transcribeAudioFromUri = async (audioFile: { uri: string; name: string; type: string }) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioFile as any);

      const response = await fetch('https://toolkit.rork.com/stt/transcribe/', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.text) {
        onTranscript(data.text);
      }
    } catch (error) {
      console.error('Transcription error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const mouthScale = mouthAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <View style={styles.container}>
      <View style={styles.assistantContainer}>
        <Animated.View
          style={[
            styles.glowOuter,
            {
              opacity: isRecording ? glowOpacity : 0,
              transform: [{ scale: pulseAnim }],
            },
          ]}
        />
        
        <Animated.View
          style={[
            styles.assistantCircle,
            {
              transform: [{ scale: isRecording ? pulseAnim : 1 }],
            },
          ]}
        >
          <View style={styles.face}>
            <View style={styles.eyes}>
              <View style={styles.eye} />
              <View style={styles.eye} />
            </View>
            
            <Animated.View
              style={[
                styles.mouth,
                {
                  transform: [{ scaleY: isSpeaking ? mouthScale : 0.3 }],
                },
              ]}
            />
          </View>

          {isSpeaking && (
            <View style={styles.speakingIndicator}>
              <Volume2 size={24} color={Colors.success} />
            </View>
          )}
        </Animated.View>

        <Text style={styles.assistantName}>AI MEDIK</Text>
        
        {isProcessing && (
          <Text style={styles.statusText}>{t('analyzing')}</Text>
        )}
        {isRecording && (
          <Text style={styles.statusText}>{t('listening')}</Text>
        )}
        {isSpeaking && (
          <Text style={styles.statusText}>{t('speaking')}</Text>
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.micButton,
          isRecording && styles.micButtonActive,
        ]}
        onPress={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
      >
        {isRecording ? (
          <MicOff size={32} color="white" />
        ) : (
          <Mic size={32} color="white" />
        )}
      </TouchableOpacity>

      <Text style={styles.instructionText}>
        {isRecording 
          ? t('tapToStopRecording') 
          : t('tapToStartVoiceChat')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  assistantContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  glowOuter: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.primary,
  },
  assistantCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  face: {
    alignItems: 'center',
  },
  eyes: {
    flexDirection: 'row',
    gap: 30,
    marginBottom: 20,
  },
  eye: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'white',
  },
  mouth: {
    width: 40,
    height: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    backgroundColor: 'white',
  },
  speakingIndicator: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 8,
  },
  assistantName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 20,
  },
  statusText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  micButtonActive: {
    backgroundColor: Colors.danger,
  },
  instructionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
});
