import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { Colors } from '@/constants/colors';

interface SymptomButtonProps {
  symptom: {
    name: string;
    icon: string;
    color: string;
  };
  icon: LucideIcon;
  onPress: () => void;
}

export function SymptomButton({ symptom, icon: Icon, onPress }: SymptomButtonProps) {
  return (
    <TouchableOpacity 
      style={[styles.container, { borderColor: symptom.color }]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Icon size={24} color={symptom.color} />
      <Text style={[styles.text, { color: symptom.color }]}>{symptom.name}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    backgroundColor: Colors.card,
    marginRight: 8,
    marginBottom: 8,
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
});