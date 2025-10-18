import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Star, MessageCircle, Video, Clock } from 'lucide-react-native';
import { Doctor } from '@/types/medical';
import { Colors } from '@/constants/colors';

interface DoctorCardProps {
  doctor: Doctor;
  onPress: () => void;
}

export function DoctorCard({ doctor, onPress }: DoctorCardProps) {
  const getStatusColor = () => {
    switch (doctor.status) {
      case 'online': return Colors.success;
      case 'busy': return Colors.warning;
      case 'offline': return Colors.textSecondary;
      default: return Colors.textSecondary;
    }
  };

  const getStatusText = () => {
    switch (doctor.status) {
      case 'online': return 'Онлайн';
      case 'busy': return 'Занят';
      case 'offline': return 'Не в сети';
      default: return 'Не в сети';
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.header}>
        <Image source={{ uri: doctor.avatar }} style={styles.avatar} />
        <View style={styles.info}>
          <Text style={styles.name}>{doctor.name}</Text>
          <Text style={styles.specialty}>{doctor.specialty}</Text>
          <View style={styles.rating}>
            <Star size={16} color={Colors.warning} fill={Colors.warning} />
            <Text style={styles.ratingText}>{doctor.rating}</Text>
            <Text style={styles.experience}>• {doctor.experience} лет опыта</Text>
          </View>
        </View>
        <View style={[styles.status, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.actionButton, styles.chatButton]} disabled={doctor.status === 'offline'}>
          <MessageCircle size={20} color="white" />
          <Text style={styles.actionText}>Чат</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.actionButton, styles.videoButton]} disabled={doctor.status !== 'online'}>
          <Video size={20} color="white" />
          <Text style={styles.actionText}>Видео</Text>
        </TouchableOpacity>
        
        {doctor.status === 'busy' && (
          <TouchableOpacity style={[styles.actionButton, styles.waitButton]}>
            <Clock size={20} color="white" />
            <Text style={styles.actionText}>Ждать</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <Text style={styles.price}>от {doctor.price} ₽</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  specialty: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginLeft: 4,
  },
  experience: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  status: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  chatButton: {
    backgroundColor: Colors.primary,
  },
  videoButton: {
    backgroundColor: Colors.success,
  },
  waitButton: {
    backgroundColor: Colors.warning,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
});