import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  queuePosition: number;
  totalInQueue: number;
  createdAt: string;
}

export const [AppointmentContext, useAppointments] = createContextHook(() => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const stored = await AsyncStorage.getItem('appointments');
      if (stored) {
        setAppointments(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveAppointments = async (newAppointments: Appointment[]) => {
    try {
      await AsyncStorage.setItem('appointments', JSON.stringify(newAppointments));
      setAppointments(newAppointments);
    } catch (error) {
      console.error('Failed to save appointments:', error);
    }
  };

  const bookAppointment = useCallback(async (
    doctorId: string,
    doctorName: string,
    doctorSpecialty: string,
    patientId: string,
    patientName: string,
    date: string,
    time: string
  ) => {
    const doctorAppointments = appointments.filter(
      a => a.doctorId === doctorId && a.status !== 'cancelled' && a.status !== 'completed'
    );

    const queuePosition = doctorAppointments.length + 1;
    const totalInQueue = queuePosition;

    const newAppointment: Appointment = {
      id: Date.now().toString(),
      doctorId,
      doctorName,
      doctorSpecialty,
      patientId,
      patientName,
      date,
      time,
      status: 'pending',
      queuePosition,
      totalInQueue,
      createdAt: new Date().toISOString(),
    };

    const updated = [...appointments, newAppointment];
    await saveAppointments(updated);

    return newAppointment;
  }, [appointments]);

  const cancelAppointment = useCallback(async (appointmentId: string) => {
    const updated = appointments.map(a =>
      a.id === appointmentId ? { ...a, status: 'cancelled' as const } : a
    );
    await saveAppointments(updated);
  }, [appointments]);
  
  const completeAppointment = useCallback(async (appointmentId: string) => {
    const updated = appointments.map(a =>
      a.id === appointmentId ? { ...a, status: 'completed' as const } : a
    );
    await saveAppointments(updated);
  }, [appointments]);

  const updateAppointmentStatus = useCallback(async (
    appointmentId: string,
    status: Appointment['status']
  ) => {
    const updated = appointments.map(a =>
      a.id === appointmentId ? { ...a, status } : a
    );
    await saveAppointments(updated);

    const appointment = appointments.find(a => a.id === appointmentId);
    if (appointment && status === 'in-progress') {
      Alert.alert(
        'Врач готов принять вас',
        `Доктор ${appointment.doctorName} готов принять вас. Пожалуйста, подойдите к кабинету.`,
        [{ text: 'OK' }]
      );
    }
  }, [appointments]);

  const getQueuePosition = useCallback((appointmentId: string) => {
    const appointment = appointments.find(a => a.id === appointmentId);
    if (!appointment) return null;

    const doctorQueue = appointments
      .filter(a =>
        a.doctorId === appointment.doctorId &&
        (a.status === 'pending' || a.status === 'confirmed') &&
        new Date(a.createdAt) <= new Date(appointment.createdAt)
      )
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    const position = doctorQueue.findIndex(a => a.id === appointmentId) + 1;
    const total = doctorQueue.length;

    return { position, total };
  }, [appointments]);

  const getUserAppointments = useCallback((userId: string) => {
    return appointments
      .filter(a => a.patientId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [appointments]);

  const getDoctorQueue = useCallback((doctorId: string) => {
    return appointments
      .filter(a =>
        a.doctorId === doctorId &&
        (a.status === 'pending' || a.status === 'confirmed')
      )
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [appointments]);

  return useMemo(() => ({
    appointments,
    isLoading,
    bookAppointment,
    cancelAppointment,
    completeAppointment,
    updateAppointmentStatus,
    getQueuePosition,
    getUserAppointments,
    getDoctorQueue,
  }), [
    appointments,
    isLoading,
    bookAppointment,
    cancelAppointment,
    completeAppointment,
    updateAppointmentStatus,
    getQueuePosition,
    getUserAppointments,
    getDoctorQueue,
  ]);
});
