import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Bot, User, Camera, MessageSquare, FileText, ArrowLeft } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useMedical } from '@/hooks/medical-store';
import { Consultation, MedicalRecord } from '@/types/medical';

export default function HistoryScreen() {
  const { consultations, medicalRecords, isLoading } = useMedical();
  const [selectedTab, setSelectedTab] = useState<'consultations' | 'records'>('consultations');

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

  const renderConsultation = (consultation: Consultation) => (
    <TouchableOpacity key={consultation.id} style={styles.consultationCard}>
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
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'История здоровья' }} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Загрузка...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'История здоровья',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={Colors.primary} />
            </TouchableOpacity>
          )
        }} 
      />
      
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
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
});