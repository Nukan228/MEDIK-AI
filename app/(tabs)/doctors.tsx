import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { Search, Users } from 'lucide-react-native';
import { DoctorCard } from '@/components/DoctorCard';
import { Colors } from '@/constants/colors';
import { doctors } from '@/data/doctors';
import { Doctor, User as UserType } from '@/types/medical';
import { useLanguage } from '@/hooks/language-store';
import { useAppointments } from '@/hooks/appointment-store';
import { useAuth } from '@/hooks/auth-store';
import DoctorRatingModal from '@/components/DoctorRatingModal';

export default function DoctorsScreen() {
  const { t } = useLanguage();
  const { user, updateUser } = useAuth();
  const { bookAppointment, getUserAppointments, getQueuePosition, completeAppointment } = useAppointments();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'online' | 'specialty'>('all');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedDoctorForRating, setSelectedDoctorForRating] = useState<UserType | null>(null);

  const specialties = Array.from(new Set(doctors.map(doctor => doctor.specialty)));

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'online' && doctor.status === 'online') ||
                         (selectedFilter === 'specialty' && doctor.specialty === selectedSpecialty);
    
    return matchesSearch && matchesFilter;
  });

  const handleRatingSubmit = async (rating: number, review: string) => {
    if (!selectedDoctorForRating || !user) return;
    
    try {
      const currentRating = selectedDoctorForRating.rating || 0;
      const currentReviewCount = selectedDoctorForRating.reviewCount || 0;
      const newReviewCount = currentReviewCount + 1;
      const newRating = ((currentRating * currentReviewCount) + rating) / newReviewCount;
      
      await updateUser({
        rating: newRating,
        reviewCount: newReviewCount,
      });
      
      setShowRatingModal(false);
      setSelectedDoctorForRating(null);
      
      Alert.alert(t('success'), t('thankYouForRating'));
    } catch (error) {
      Alert.alert(t('error'), 'Не удалось отправить рейтинг');
    }
  };
  
  const handleDoctorPress = (doctor: Doctor) => {
    if (!user) {
      Alert.alert(t('error'), 'Пожалуйста, войдите в систему');
      return;
    }

    const userAppointments = getUserAppointments(user.id);
    const existingAppointment = userAppointments.find(
      a => a.doctorId === doctor.id && (a.status === 'pending' || a.status === 'confirmed')
    );

    if (existingAppointment) {
      const queueInfo = getQueuePosition(existingAppointment.id);
      Alert.alert(
        'У вас уже есть запись',
        `Вы уже записаны к этому врачу.\n\nВаша позиция в очереди: ${queueInfo?.position || 0} из ${queueInfo?.total || 0}`,
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      t('bookAppointment'),
      `Записаться к ${doctor.name}?`,
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('confirm'),
          onPress: async () => {
            try {
              const appointment = await bookAppointment(
                doctor.id,
                doctor.name,
                doctor.specialty,
                user.id,
                `${user.firstName} ${user.lastName}`,
                new Date().toISOString().split('T')[0],
                new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
              );

              Alert.alert(
                t('success'),
                `Вы успешно записаны!\n\nВаша позиция в очереди: ${appointment.queuePosition}\nВсего в очереди: ${appointment.totalInQueue}\n\nВы получите уведомление, когда врач будет готов принять вас.`,
                [
                  { text: 'OK' },
                  {
                    text: 'Завершить консультацию (Demo)',
                    onPress: () => {
                      completeAppointment(appointment.id);
                      const doctorUser: UserType = {
                        id: doctor.id,
                        email: `${doctor.name.toLowerCase().replace(' ', '.')}@hospital.kz`,
                        phone: '+7 777 123 4567',
                        firstName: doctor.name.split(' ')[0],
                        lastName: doctor.name.split(' ')[1] || '',
                        userType: 'doctor',
                        isVerified: true,
                        createdAt: new Date().toISOString(),
                        avatar: doctor.avatar,
                        specialization: doctor.specialty,
                        experience: doctor.experience,
                        rating: doctor.rating,
                        reviewCount: 0,
                      };
                      setSelectedDoctorForRating(doctorUser);
                      setShowRatingModal(true);
                    }
                  }
                ]
              );
            } catch {
              Alert.alert(t('error'), 'Не удалось записаться к врачу');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: t('onlineDoctors') }} />
      
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('searchDoctors')}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
        >
          <TouchableOpacity
            style={[styles.filterButton, selectedFilter === 'all' && styles.filterButtonActive]}
            onPress={() => setSelectedFilter('all')}
          >
            <Text style={[styles.filterText, selectedFilter === 'all' && styles.filterTextActive]}>
              {t('all')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterButton, selectedFilter === 'online' && styles.filterButtonActive]}
            onPress={() => setSelectedFilter('online')}
          >
            <Text style={[styles.filterText, selectedFilter === 'online' && styles.filterTextActive]}>
              {t('online')}
            </Text>
          </TouchableOpacity>
          
          {specialties.map(specialty => (
            <TouchableOpacity
              key={specialty}
              style={[
                styles.filterButton, 
                selectedFilter === 'specialty' && selectedSpecialty === specialty && styles.filterButtonActive
              ]}
              onPress={() => {
                if (specialty && specialty.trim()) {
                  setSelectedFilter('specialty');
                  setSelectedSpecialty(specialty);
                }
              }}
            >
              <Text style={[
                styles.filterText, 
                selectedFilter === 'specialty' && selectedSpecialty === specialty && styles.filterTextActive
              ]}>
                {specialty}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.doctorsList} showsVerticalScrollIndicator={false}>
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            {t('doctorsFound')} {filteredDoctors.length}
          </Text>
          <Text style={styles.statsSubtext}>
            {t('onlineCount')} {filteredDoctors.filter(d => d.status === 'online').length}
          </Text>
        </View>

        {filteredDoctors.map(doctor => (
          <DoctorCard
            key={doctor.id}
            doctor={doctor}
            onPress={() => handleDoctorPress(doctor)}
          />
        ))}

        {filteredDoctors.length === 0 && (
          <View style={styles.emptyState}>
            <Users size={64} color={Colors.textSecondary} />
            <Text style={styles.emptyTitle}>
              {searchQuery ? t('noDoctorsFound') : 'Список врачей пуст'}
            </Text>
            <Text style={styles.emptyText}>
              {searchQuery ? t('tryChangingSearch') : 'Врачи будут добавлены в скором времени.\nПока вы можете использовать AI чат для консультации.'}
            </Text>
          </View>
        )}
      </ScrollView>
      
      <DoctorRatingModal
        visible={showRatingModal}
        doctor={selectedDoctorForRating}
        onClose={() => {
          setShowRatingModal(false);
          setSelectedDoctorForRating(null);
        }}
        onSubmit={handleRatingSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 16,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    color: Colors.text,
  },
  filtersContainer: {
    flexDirection: 'row',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  filterTextActive: {
    color: 'white',
  },
  doctorsList: {
    flex: 1,
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  statsText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  statsSubtext: {
    fontSize: 14,
    color: Colors.success,
    fontWeight: '500',
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
  },
});