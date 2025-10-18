import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Globe } from 'lucide-react-native';
import { useLanguage } from '@/hooks/language-store';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Globe size={20} color="#007AFF" />
        <Text style={styles.title}>
          {language === 'kk' ? 'Тіл' : language === 'ru' ? 'Язык' : 'Language'}
        </Text>
      </View>
      
      <View style={styles.options}>
        <TouchableOpacity
          style={[
            styles.option,
            language === 'kk' && styles.selectedOption,
          ]}
          onPress={() => setLanguage('kk')}
        >
          <Text style={[
            styles.optionText,
            language === 'kk' && styles.selectedText,
          ]}>
            Қазақша
          </Text>
          {language === 'kk' && (
            <View style={styles.checkmark}>
              <Text style={styles.checkmarkText}>✓</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.option,
            language === 'en' && styles.selectedOption,
          ]}
          onPress={() => setLanguage('en')}
        >
          <Text style={[
            styles.optionText,
            language === 'en' && styles.selectedText,
          ]}>
            English
          </Text>
          {language === 'en' && (
            <View style={styles.checkmark}>
              <Text style={styles.checkmarkText}>✓</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.option,
            language === 'ru' && styles.selectedOption,
          ]}
          onPress={() => setLanguage('ru')}
        >
          <Text style={[
            styles.optionText,
            language === 'ru' && styles.selectedText,
          ]}>
            Русский
          </Text>
          {language === 'ru' && (
            <View style={styles.checkmark}>
              <Text style={styles.checkmarkText}>✓</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginLeft: 8,
  },
  options: {
    gap: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    backgroundColor: '#e8f4ff',
    borderColor: '#007AFF',
  },
  optionText: {
    fontSize: 15,
    color: '#666',
  },
  selectedText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
