import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CreditCard, Wallet } from 'lucide-react-native';
import { useLanguage } from '@/hooks/language-store';

interface PaymentOptionsProps {
  selectedMethod: 'kaspi' | 'card' | 'cash' | null;
  onSelect: (method: 'kaspi' | 'card' | 'cash') => void;
}

export function PaymentOptions({ selectedMethod, onSelect }: PaymentOptionsProps) {
  const { language } = useLanguage();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {language === 'kk' ? 'Төлем әдісі' : 'Payment Method'}
      </Text>

      <TouchableOpacity
        style={[
          styles.option,
          selectedMethod === 'kaspi' && styles.selectedOption,
        ]}
        onPress={() => onSelect('kaspi')}
      >
        <View style={styles.optionHeader}>
          <View style={[styles.iconContainer, styles.kaspiIcon]}>
            <Text style={styles.kaspiText}>K</Text>
          </View>
          <View style={styles.optionInfo}>
            <Text style={styles.optionTitle}>Kaspi.kz</Text>
            <Text style={styles.optionSubtitle}>
              {language === 'kk' ? 'Kaspi қосымшасы арқылы төлеу' : 'Pay via Kaspi app'}
            </Text>
          </View>
        </View>
        {selectedMethod === 'kaspi' && (
          <View style={styles.selectedBadge}>
            <Text style={styles.selectedText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.option,
          selectedMethod === 'card' && styles.selectedOption,
        ]}
        onPress={() => onSelect('card')}
      >
        <View style={styles.optionHeader}>
          <View style={[styles.iconContainer, styles.cardIcon]}>
            <CreditCard size={24} color="#fff" />
          </View>
          <View style={styles.optionInfo}>
            <Text style={styles.optionTitle}>
              {language === 'kk' ? 'Банк картасы' : 'Bank Card'}
            </Text>
            <Text style={styles.optionSubtitle}>
              {language === 'kk' ? 'Visa, Mastercard' : 'Visa, Mastercard'}
            </Text>
          </View>
        </View>
        {selectedMethod === 'card' && (
          <View style={styles.selectedBadge}>
            <Text style={styles.selectedText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.option,
          selectedMethod === 'cash' && styles.selectedOption,
        ]}
        onPress={() => onSelect('cash')}
      >
        <View style={styles.optionHeader}>
          <View style={[styles.iconContainer, styles.cashIcon]}>
            <Wallet size={24} color="#fff" />
          </View>
          <View style={styles.optionInfo}>
            <Text style={styles.optionTitle}>
              {language === 'kk' ? 'Қолма-қол ақша' : 'Cash'}
            </Text>
            <Text style={styles.optionSubtitle}>
              {language === 'kk' ? 'Жеткізу кезінде төлеу' : 'Pay on delivery'}
            </Text>
          </View>
        </View>
        {selectedMethod === 'cash' && (
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
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  kaspiIcon: {
    backgroundColor: '#F14635',
  },
  kaspiText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  cardIcon: {
    backgroundColor: '#5856D6',
  },
  cashIcon: {
    backgroundColor: '#34C759',
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
