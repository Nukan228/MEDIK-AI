import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { 
  User, 
  Settings, 
  CreditCard, 
  Shield, 
  HelpCircle, 
  LogOut,
  Edit,
  Star,
  Clock,
  Key,
  CheckCircle,
  Crown,
  Users
} from 'lucide-react-native';
import { useAuth } from '@/hooks/auth-store';
import { useLanguage } from '@/hooks/language-store';

export default function ProfileScreen() {
  const { user, logout, updateUser } = useAuth();
  const { t } = useLanguage();
  
  const handleToggleAcceptingPatients = async () => {
    if (!user?.acceptingPatients) {
      Alert.alert(
        t('applyToAcceptPatients'),
        t('applicationPending'),
        [
          { text: t('cancel'), style: 'cancel' },
          {
            text: t('confirm'),
            onPress: async () => {
              await updateUser({ acceptingPatients: true });
              Alert.alert(t('success'), t('applicationSubmitted'));
            }
          }
        ]
      );
    } else {
      await updateUser({ acceptingPatients: false });
      Alert.alert(t('success'), t('stopAcceptingPatients'));
    }
  };
  
  const handleSubscribe = (type: '3-day' | 'weekly') => {
    const price = type === '3-day' ? 700 : 2000;
    const days = type === '3-day' ? 3 : 7;
    
    Alert.alert(
      t('subscribe'),
      `${t(type === '3-day' ? 'threeDayPlan' : 'weeklyPlan')}\n${price} ${t('currency')}`,
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('payWithKaspi'),
          onPress: async () => {
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + days);
            
            await updateUser({
              isPremium: true,
              premiumExpiry: endDate.toISOString()
            });
            
            Alert.alert(t('success'), t('thankYouForRating'));
          }
        }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Выход',
      'Вы уверены, что хотите выйти из аккаунта?',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Выйти', 
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/auth');
          }
        },
      ]
    );
  };

  const handlePaymentSettings = () => {
    Alert.alert(
      'Настройки оплаты',
      'Выберите способ оплаты по умолчанию',
      [
        {
          text: 'Kaspi Pay',
          onPress: () => Alert.alert('Успешно', 'Kaspi Pay установлен как способ оплаты по умолчанию')
        },
        {
          text: 'Банковская карта',
          onPress: () => Alert.alert('Добавить карту', 'Функция добавления карты будет доступна в следующем обновлении')
        },
        { text: 'Отмена', style: 'cancel' }
      ]
    );
  };

  const handleECPSettings = () => {
    Alert.alert(
      'Настройки ЭЦП',
      'Управление электронной цифровой подписью',
      [
        {
          text: 'Обновить ключ',
          onPress: () => Alert.alert('Обновление ключа', 'Выберите новый файл ключа ЭЦП')
        },
        {
          text: 'Проверить статус',
          onPress: () => Alert.alert('Статус ЭЦП', '✓ Ключ действителен\n✓ Сертификат не истек\n✓ Подпись активна')
        },
        { text: 'Отмена', style: 'cancel' }
      ]
    );
  };

  const renderProfileHeader = () => (
    <View style={styles.profileHeader}>
      <View style={styles.avatarContainer}>
        <Image 
          source={{ uri: user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face' }} 
          style={styles.avatar} 
        />
        <TouchableOpacity style={styles.editAvatarButton}>
          <Edit size={16} color="white" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.userInfo}>
        <Text style={styles.userName}>
          {user?.firstName} {user?.lastName}
        </Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        <Text style={styles.userPhone}>{user?.phone}</Text>
        
        <View style={styles.userTypeContainer}>
          <View style={[
            styles.userTypeBadge,
            user?.userType === 'doctor' && styles.doctorBadge,
            user?.userType === 'government' && styles.governmentBadge,
            user?.userType === 'citizen' && styles.citizenBadge,
          ]}>
            {user?.userType === 'doctor' && <User size={16} color="white" />}
            {user?.userType === 'government' && <Shield size={16} color="white" />}
            {user?.userType === 'citizen' && <User size={16} color="white" />}
            <Text style={styles.userTypeText}>
              {user?.userType === 'doctor' && t('doctor')}
              {user?.userType === 'government' && t('govEmployee')}
              {user?.userType === 'citizen' && t('citizen')}
            </Text>
          </View>
          
          {user?.isVerified && (
            <View style={styles.verifiedBadge}>
              <Shield size={14} color="#00C851" />
              <Text style={styles.verifiedText}>{t('verified')}</Text>
            </View>
          )}
        </View>
        
        {user?.userType === 'doctor' && (
          <>
            <View style={styles.doctorStats}>
              <View style={styles.statItem}>
                <Star size={16} color="#FFD700" />
                <Text style={styles.statText}>{user.rating || 0}</Text>
              </View>
              <View style={styles.statItem}>
                <Clock size={16} color="#666" />
                <Text style={styles.statText}>{user.experience} {t('yearsExperience')}</Text>
              </View>
              {user.isPremium && (
                <View style={styles.statItem}>
                  <Crown size={16} color="#FFD700" />
                  <Text style={styles.premiumText}>Premium</Text>
                </View>
              )}
            </View>
            
            <View style={styles.doctorControls}>
              <TouchableOpacity
                style={[
                  styles.acceptingButton,
                  user.acceptingPatients && styles.acceptingButtonActive
                ]}
                onPress={handleToggleAcceptingPatients}
              >
                <Users size={16} color="white" />
                <Text style={styles.acceptingButtonText}>
                  {user.acceptingPatients ? t('stopAcceptingPatients') : t('startAcceptingPatients')}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </View>
  );

  const renderMenuItem = (icon: React.ReactNode, title: string, subtitle: string, onPress: () => void, showArrow = true) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemLeft}>
        <View style={styles.menuItemIcon}>
          <Text>{icon}</Text>
        </View>
        <View style={styles.menuItemText}>
          <Text style={styles.menuItemTitle}>{title}</Text>
          <Text style={styles.menuItemSubtitle}>{subtitle}</Text>
        </View>
      </View>
      {showArrow && (
        <Text style={styles.menuItemArrow}>›</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: t('profile') }} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderProfileHeader()}
        
        {user?.userType === 'doctor' && (
          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>{t('becomePremiumDoctor')}</Text>
            
            {user.isPremium ? (
              <View style={styles.premiumCard}>
                <View style={styles.premiumHeader}>
                  <Crown size={24} color="#FFD700" />
                  <Text style={styles.premiumTitle}>{t('currentPlan')}</Text>
                </View>
                <Text style={styles.premiumExpiry}>
                  {t('expiresOn')} {user.premiumExpiry ? new Date(user.premiumExpiry).toLocaleDateString() : ''}
                </Text>
                <View style={styles.premiumBenefits}>
                  <View style={styles.benefitItem}>
                    <CheckCircle size={16} color="#00C851" />
                    <Text style={styles.benefitText}>{t('topPlacement')}</Text>
                  </View>
                  <View style={styles.benefitItem}>
                    <CheckCircle size={16} color="#00C851" />
                    <Text style={styles.benefitText}>{t('prioritySupport')}</Text>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.subscriptionOptions}>
                <TouchableOpacity
                  style={styles.subscriptionCard}
                  onPress={() => handleSubscribe('3-day')}
                >
                  <Text style={styles.subscriptionTitle}>{t('threeDayPlan')}</Text>
                  <Text style={styles.subscriptionPrice}>700 {t('currency')}</Text>
                  <Text style={styles.subscriptionDescription}>{t('premiumBenefits')}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.subscriptionCard, styles.subscriptionCardPopular]}
                  onPress={() => handleSubscribe('weekly')}
                >
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularText}>Popular</Text>
                  </View>
                  <Text style={styles.subscriptionTitle}>{t('weeklyPlan')}</Text>
                  <Text style={styles.subscriptionPrice}>2000 {t('currency')}</Text>
                  <Text style={styles.subscriptionDescription}>{t('premiumBenefits')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>
            {t('accountSettings')}
          </Text>
          
          {renderMenuItem(
            <Settings size={20} color="#007AFF" />,
            t('settings'),
            t('language') + ', ' + t('notifications'),
            () => router.push('/settings')
          )}
          
          {renderMenuItem(
            <CreditCard size={20} color="#007AFF" />,
            t('paymentMethods'),
            t('kaspiAndCards'),
            handlePaymentSettings
          )}
          
          {renderMenuItem(
            <Key size={20} color="#007AFF" />,
            t('ecpSettings'),
            t('manageECP'),
            handleECPSettings
          )}
        </View>
        
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>{t('support')}</Text>
          
          {renderMenuItem(
            <HelpCircle size={20} color="#007AFF" />,
            t('helpAndSupport'),
            t('faqContact'),
            () => Alert.alert(t('support'), t('faqContact'))
          )}
          
          {renderMenuItem(
            <Shield size={20} color="#007AFF" />,
            t('privacy'),
            t('privacyPolicy'),
            () => Alert.alert(t('privacy'), t('privacyPolicy'))
          )}
        </View>
        
        <View style={styles.menuSection}>
          {renderMenuItem(
            <LogOut size={20} color="#FF3B30" />,
            t('logoutAccount'),
            t('endSession'),
            handleLogout,
            false
          )}
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>AI MEDIK v1.0.0</Text>
          <Text style={styles.footerText}>© 2024 AI MEDIK. Все права защищены.</Text>
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
  profileHeader: {
    backgroundColor: 'white',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007AFF',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  userTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  userTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  doctorBadge: {
    backgroundColor: '#00C851',
  },
  governmentBadge: {
    backgroundColor: '#FF6900',
  },
  citizenBadge: {
    backgroundColor: '#007AFF',
  },
  userTypeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    color: '#00C851',
    fontSize: 12,
    fontWeight: '600',
  },
  doctorStats: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    color: '#666',
  },
  menuSection: {
    backgroundColor: 'white',
    marginTop: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#f8f8f8',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  menuItemArrow: {
    fontSize: 20,
    color: '#ccc',
    fontWeight: 'bold',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 4,
  },
  premiumText: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: 'bold',
  },
  doctorControls: {
    marginTop: 16,
    width: '100%',
    paddingHorizontal: 20,
  },
  acceptingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#666',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  acceptingButtonActive: {
    backgroundColor: '#00C851',
  },
  acceptingButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  premiumCard: {
    backgroundColor: '#FFF9E6',
    padding: 20,
    margin: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  premiumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  premiumTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  premiumExpiry: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  premiumBenefits: {
    gap: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  benefitText: {
    fontSize: 14,
    color: '#333',
  },
  subscriptionOptions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  subscriptionCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    position: 'relative',
  },
  subscriptionCardPopular: {
    borderColor: '#FFD700',
    backgroundColor: '#FFF9E6',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: 10,
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  subscriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subscriptionPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  subscriptionDescription: {
    fontSize: 12,
    color: '#666',
  },
});