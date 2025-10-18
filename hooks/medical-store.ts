import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Platform } from 'react-native';
import { Consultation, MedicalRecord } from '@/types/medical';

const storage = {
  getItem: async (key: string) => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    } else {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      return AsyncStorage.getItem(key);
    }
  },
  setItem: async (key: string, value: string) => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      return AsyncStorage.setItem(key, value);
    }
  },
};

export const [MedicalProvider, useMedical] = createContextHook(() => {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [consultationsData, recordsData] = await Promise.all([
        storage.getItem('consultations'),
        storage.getItem('medicalRecords'),
      ]);

      if (consultationsData) {
        setConsultations(JSON.parse(consultationsData));
      }
      if (recordsData) {
        setMedicalRecords(JSON.parse(recordsData));
      }
    } catch (error) {
      console.error('Error loading medical data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const saveConsultation = useCallback(async (consultation: Consultation) => {
    try {
      setConsultations(prev => {
        const updated = [...prev, consultation];
        storage.setItem('consultations', JSON.stringify(updated)).catch(error => {
          console.error('Error saving consultation:', error);
        });
        return updated;
      });
    } catch (error) {
      console.error('Error saving consultation:', error);
    }
  }, []);

  const updateConsultation = useCallback(async (id: string, updates: Partial<Consultation>) => {
    try {
      setConsultations(prev => {
        const updated = prev.map(c => 
          c.id === id ? { ...c, ...updates } : c
        );
        storage.setItem('consultations', JSON.stringify(updated)).catch(error => {
          console.error('Error updating consultation:', error);
        });
        return updated;
      });
    } catch (error) {
      console.error('Error updating consultation:', error);
    }
  }, []);

  const addMedicalRecord = useCallback(async (record: MedicalRecord) => {
    try {
      setMedicalRecords(prev => {
        const updated = [...prev, record];
        storage.setItem('medicalRecords', JSON.stringify(updated)).catch(error => {
          console.error('Error saving medical record:', error);
        });
        return updated;
      });
    } catch (error) {
      console.error('Error saving medical record:', error);
    }
  }, []);

  return useMemo(() => ({
    consultations,
    medicalRecords,
    isLoading,
    saveConsultation,
    updateConsultation,
    addMedicalRecord,
  }), [consultations, medicalRecords, isLoading, saveConsultation, updateConsultation, addMedicalRecord]);
});