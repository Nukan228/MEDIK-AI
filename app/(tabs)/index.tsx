import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { 
  MessageSquare, 
  Camera, 
  Users, 
  History, 
  Zap, 
  Phone,
  Brain,
  Thermometer,
  Wind,
  Droplets,
  Circle,
  Battery,
  Sparkles
} from 'lucide-react-native';
import { FeatureCard } from '@/components/FeatureCard';
import { SymptomButton } from '@/components/SymptomButton';
import { Colors, Gradients } from '@/constants/colors';
import { commonSymptoms } from '@/data/symptoms';
import * as Haptics from 'expo-haptics';
import { useLanguage } from '@/hooks/language-store';

const iconMap = {
  Brain,
  Thermometer,
  Wind,
  Zap,
  Droplets,
  Circle,
  Battery,
  Sparkles,
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const handleEmergencyCall = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    
    const emergencyNumber = Platform.OS === 'ios' ? 'tel:103' : 'tel:103';
    Linking.openURL(emergencyNumber);
  };

  const handleSymptomPress = (symptom: any) => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    if (symptom?.name) {
      router.push({
        pathname: '/ai-chat',
        params: { symptom: symptom.name }
      });
    }
  };

  const handleFeaturePress = (feature: string) => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    
    switch (feature) {
      case 'ai-chat':
        router.push('/ai-chat');
        break;
      case 'camera':
        router.push('/camera-analysis');
        break;
      case 'doctors':
        router.push('/doctors');
        break;
      case 'history':
        router.push('/history');
        break;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.greeting}>{t('welcome')}</Text>
          <Text style={styles.title}>{t('appName')}</Text>
          <Text style={styles.subtitle}>{t('personalAssistant')}</Text>
        </View>

        <View style={styles.featuresGrid}>
          <FeatureCard
            title={t('aiConsultation')}
            subtitle={t('chatWithAI')}
            icon={MessageSquare}
            gradient={Gradients.primary}
            onPress={() => handleFeaturePress('ai-chat')}
            style={styles.featureCard}
          />
          
          <FeatureCard
            title={t('cameraAnalysisTitle')}
            subtitle={t('photoSymptoms')}
            icon={Camera}
            gradient={Gradients.success}
            onPress={() => handleFeaturePress('camera')}
            style={styles.featureCard}
          />
          
          <FeatureCard
            title={t('connectDoctor')}
            subtitle={t('onlineConsultations')}
            icon={Users}
            gradient={Gradients.purple}
            onPress={() => handleFeaturePress('doctors')}
            style={styles.featureCard}
          />
          
          <FeatureCard
            title={t('healthHistory')}
            subtitle={t('consultationsAndDiagnoses')}
            icon={History}
            gradient={Gradients.warning}
            onPress={() => handleFeaturePress('history')}
            style={styles.featureCard}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('quickDiagnosis')}</Text>
          <Text style={styles.sectionSubtitle}>{t('selectSymptoms')}</Text>
          
          <View style={styles.symptomsContainer}>
            {commonSymptoms.slice(0, 6).map((symptom) => {
              const IconComponent = iconMap[symptom.icon as keyof typeof iconMap];
              return (
                <SymptomButton
                  key={symptom.id}
                  symptom={symptom}
                  icon={IconComponent}
                  onPress={() => handleSymptomPress(symptom)}
                />
              );
            })}
          </View>
        </View>

        <TouchableOpacity style={styles.emergencyButton} onPress={handleEmergencyCall}>
          <Phone size={24} color="white" />
          <Text style={styles.emergencyText}>{t('emergencyHelp')}</Text>
          <Text style={styles.emergencySubtext}>{t('callAmbulance')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  featureCard: {
    width: '48%',
  },
  section: {
    padding: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  symptomsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  emergencyButton: {
    backgroundColor: Colors.danger,
    marginHorizontal: 20,
    marginVertical: 20,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 8,
    shadowColor: Colors.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  emergencyText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginTop: 8,
  },
  emergencySubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
});