import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Truck } from 'lucide-react-native';
import { useLanguage } from '@/hooks/language-store';

interface DeliveryOptionsProps {
  selectedMethod: 'yandex' | 'pickup' | null;
  onSelect: (method: 'yandex' | 'pickup') => void;
  deliveryFee: number;
  estimatedTime: string;
}

export function DeliveryOptions({ selectedMethod, onSelect, deliveryFee, estimatedTime }: DeliveryOptionsProps) {
  const { t, language } = useLanguage();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {language === 'kk' ? 'Жеткізу әдісі' : 'Delivery Method'}
      </Text>

      <TouchableOpacity
        style={[
          styles.option,
          selectedMethod === 'yandex' && styles.selectedOption,
        ]}
        onPress={() => onSelect('yandex')}
      >
        <View style={styles.optionHeader}>
          <View style={styles.iconContainer}>
            <Image
              source={{ uri: 'https://yastatic.net/s3/home/logos/yandex-logo.svg' }}
              style={styles.yandexLogo}
              resizeMode="contain"
            />
          </View>
          <View style={styles.optionInfo}>
            <Text style={styles.optionTitle}>
              {language === 'kk' ? 'Яндекс жеткізу' : 'Yandex Delivery'}
            </Text>
            <Text style={styles.optionSubtitle}>
              {estimatedTime} • {deliveryFee} {t('currency')}
            </Text>
          </View>
        </View>
        {selectedMethod === 'yandex' && (
          <View style={styles.selectedBadge}>
            <Text style={styles.selectedText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.option,
          selectedMethod === 'pickup' && styles.selectedOption,
        ]}
        onPress={() => onSelect('pickup')}
      >
        <View style={styles.optionHeader}>
          <View style={[styles.iconContainer, styles.pickupIcon]}>
            <Truck size={24} color="#fff" />
          </View>
          <View style={styles.optionInfo}>
            <Text style={styles.optionTitle}>
              {language === 'kk' ? 'Өзім алып кетемін' : 'Pickup'}
            </Text>
            <Text style={styles.optionSubtitle}>
              {language === 'kk' ? 'Тегін' : 'Free'}
            </Text>
          </View>
        </View>
        {selectedMethod === 'pickup' && (
          <View style={styles.selectedBadge}>
            <Text style={styles.selectedText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1a1a1a',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e5e5',
    marginBottom: 12,
  },
  selectedOption: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f7ff',
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  pickupIcon: {
    backgroundColor: '#34C759',
  },
  yandexLogo: {
    width: 32,
    height: 32,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  selectedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
