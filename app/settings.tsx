import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Bell, Volume2 } from 'lucide-react-native';
import { useLanguage } from '@/hooks/language-store';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function SettingsScreen() {
  const { t } = useLanguage();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [appointmentReminders, setAppointmentReminders] = useState(true);
  const [medicationReminders, setMedicationReminders] = useState(true);
  const [doctorMessages, setDoctorMessages] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const renderSettingItem = (
    icon: React.ReactNode,
    title: string,
    subtitle: string,
    value: boolean,
    onValueChange: (value: boolean) => void
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          <Text>{icon}</Text>
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#e0e0e0', true: '#007AFF' }}
        thumbColor="#fff"
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: t('settings') }} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('language')}</Text>
          <LanguageSwitcher />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('notifications')}</Text>

          {renderSettingItem(
            <Bell size={20} color="#007AFF" />,
            t('notifications'),
            t('pushNotifications'),
            notificationsEnabled,
            setNotificationsEnabled
          )}

          {notificationsEnabled && (
            <>
              {renderSettingItem(
                <Bell size={20} color="#007AFF" />,
                t('appointments'),
                'Напоминания о записях к врачу',
                appointmentReminders,
                setAppointmentReminders
              )}

              {renderSettingItem(
                <Bell size={20} color="#007AFF" />,
                'Лекарства',
                'Напоминания о приеме лекарств',
                medicationReminders,
                setMedicationReminders
              )}

              {renderSettingItem(
                <Bell size={20} color="#007AFF" />,
                'Сообщения врачей',
                'Уведомления от врачей',
                doctorMessages,
                setDoctorMessages
              )}

              {renderSettingItem(
                <Volume2 size={20} color="#007AFF" />,
                'Звук',
                'Звуковые уведомления',
                soundEnabled,
                setSoundEnabled
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
  },
});
