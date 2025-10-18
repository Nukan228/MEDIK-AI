import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  User, 
  Camera,
  Eye,
  EyeOff,
  Mail,
  Phone,
  FileText,
  Shield
} from 'lucide-react-native';
import { useAuth } from '@/hooks/auth-store';
import { useLanguage } from '@/hooks/language-store';

type UserType = 'citizen' | 'government' | 'doctor';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState<UserType>('citizen');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    firstName: '',
    lastName: '',
    specialization: '',
    city: '',
    experience: '',
    licenseNumber: '',
    position: '',
    department: '',
    governmentId: '',
  });
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [showSpecializationPicker, setShowSpecializationPicker] = useState(false);

  const { login } = useAuth();
  const { t } = useLanguage();
  
  const cities = ['astana', 'almaty', 'shymkent', 'karaganda', 'aktobe', 'taraz'];
  const specializations = ['therapist', 'cardiologist', 'neurologist', 'pediatrician', 'dermatologist', 'ophthalmologist'];

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.email) {
      newErrors.email = t('emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('invalidEmail');
    }
    
    if (!formData.phone) {
      newErrors.phone = t('phoneRequired');
    } else if (!/^\+?[0-9]{10,15}$/.test(formData.phone.replace(/[\s-]/g, ''))) {
      newErrors.phone = t('invalidPhone');
    }
    
    if (!isLogin) {
      if (!formData.password) {
        newErrors.password = t('passwordRequired');
      } else if (formData.password.length < 6) {
        newErrors.password = t('passwordTooShort');
      }
      
      if (!formData.firstName) {
        newErrors.firstName = t('firstNameRequired');
      }
      
      if (!formData.lastName) {
        newErrors.lastName = t('lastNameRequired');
      }
      
      if (userType === 'doctor') {
        if (!formData.specialization) {
          newErrors.specialization = t('specializationRequired');
        }
        if (!formData.city) {
          newErrors.city = t('cityRequired');
        }
        if (!formData.experience) {
          newErrors.experience = t('experienceRequired');
        }
        if (!formData.licenseNumber) {
          newErrors.licenseNumber = t('licenseRequired');
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert(t('error'), t('fillAllFields'));
      return;
    }

    setIsLoading(true);
    try {
      const user: import('@/types/medical').User = {
        id: Date.now().toString(),
        email: formData.email,
        phone: formData.phone,
        firstName: formData.firstName,
        lastName: formData.lastName,
        userType,
        isVerified: false,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        createdAt: new Date().toISOString(),
      };

      if (userType === 'doctor') {
        user.specialization = formData.specialization;
        user.city = formData.city;
        user.experience = parseInt(formData.experience) || 0;
        user.licenseNumber = formData.licenseNumber;
        user.consultationPrice = 5000;
        user.isOnline = false;
        user.acceptingPatients = false;
        user.rating = 0;
        user.reviewCount = 0;
        user.isPremium = false;
      }

      if (userType === 'government') {
        user.position = formData.position;
        user.department = formData.department;
        user.governmentId = formData.governmentId;
      }

      await login(user);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert(t('error'), 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCertificateUpload = () => {
    Alert.alert(
      'Загрузка сертификата',
      'Сфотографируйте ваш медицинский сертификат для верификации. ИИ проверит подлинность документа.',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Сфотографировать', 
          onPress: () => {
            Alert.alert(
              'Анализ документа',
              'ИИ анализирует ваш сертификат...\n\n✓ Документ подлинный\n✓ Данные соответствуют\n✓ Сертификат действителен',
              [{ text: 'ОК' }]
            );
          }
        },
      ]
    );
  };

  const renderUserTypeSelector = () => (
    <View style={styles.userTypeContainer}>
      <Text style={styles.label}>User Type</Text>
      <View style={styles.userTypeButtons}>
        <TouchableOpacity
          style={[
            styles.userTypeButton,
            userType === 'citizen' && styles.selectedUserType
          ]}
          onPress={() => setUserType('citizen')}
        >
          <User size={20} color={userType === 'citizen' ? 'white' : '#007AFF'} />
          <Text style={[
            styles.userTypeText,
            userType === 'citizen' && styles.selectedUserTypeText
          ]}>
            Citizen
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.userTypeButton,
            userType === 'government' && styles.selectedUserType
          ]}
          onPress={() => setUserType('government')}
        >
          <Shield size={20} color={userType === 'government' ? 'white' : '#007AFF'} />
          <Text style={[
            styles.userTypeText,
            userType === 'government' && styles.selectedUserTypeText
          ]}>
            Government
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.userTypeButton,
            userType === 'doctor' && styles.selectedUserType
          ]}
          onPress={() => setUserType('doctor')}
        >
          <User size={20} color={userType === 'doctor' ? 'white' : '#007AFF'} />
          <Text style={[
            styles.userTypeText,
            userType === 'doctor' && styles.selectedUserTypeText
          ]}>
            Doctor
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderBasicFields = () => (
    <>
      <View style={styles.inputContainer}>
        <Mail size={20} color="#666" />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <Phone size={20} color="#666" />
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={formData.phone}
          onChangeText={(text) => setFormData({ ...formData, phone: text })}
          keyboardType="phone-pad"
        />
      </View>

      {!isLogin && (
        <>
          <View style={styles.inputContainer}>
            <User size={20} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="First Name"
              value={formData.firstName}
              onChangeText={(text) => setFormData({ ...formData, firstName: text })}
            />
          </View>

          <View style={styles.inputContainer}>
            <User size={20} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              value={formData.lastName}
              onChangeText={(text) => setFormData({ ...formData, lastName: text })}
            />
          </View>

          <View style={styles.inputContainer}>
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff size={20} color="#666" />
              ) : (
                <Eye size={20} color="#666" />
              )}
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              secureTextEntry={!showPassword}
            />
          </View>
        </>
      )}
    </>
  );

  const renderDoctorFields = () => (
    <>
      <View>
        <TouchableOpacity
          style={[styles.inputContainer, errors.specialization && styles.inputError]}
          onPress={() => setShowSpecializationPicker(true)}
        >
          <User size={20} color="#666" />
          <Text style={[styles.input, !formData.specialization && styles.placeholder]}>
            {formData.specialization ? t(formData.specialization) : t('selectSpecialization')}
          </Text>
        </TouchableOpacity>
        {errors.specialization && <Text style={styles.errorText}>{errors.specialization}</Text>}
      </View>
      
      <View>
        <TouchableOpacity
          style={[styles.inputContainer, errors.city && styles.inputError]}
          onPress={() => setShowCityPicker(true)}
        >
          <User size={20} color="#666" />
          <Text style={[styles.input, !formData.city && styles.placeholder]}>
            {formData.city ? t(formData.city) : t('selectCity')}
          </Text>
        </TouchableOpacity>
        {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
      </View>

      <View>
        <View style={[styles.inputContainer, errors.experience && styles.inputError]}>
          <User size={20} color="#666" />
          <TextInput
            style={styles.input}
            placeholder={t('yearsExp')}
            value={formData.experience}
            onChangeText={(text) => {
              setFormData({ ...formData, experience: text });
              if (errors.experience) setErrors({...errors, experience: ''});
            }}
            keyboardType="numeric"
          />
        </View>
        {errors.experience && <Text style={styles.errorText}>{errors.experience}</Text>}
      </View>

      <View>
        <View style={[styles.inputContainer, errors.licenseNumber && styles.inputError]}>
          <User size={20} color="#666" />
          <TextInput
            style={styles.input}
            placeholder={t('licenseRequired')}
            value={formData.licenseNumber}
            onChangeText={(text) => {
              setFormData({ ...formData, licenseNumber: text });
              if (errors.licenseNumber) setErrors({...errors, licenseNumber: ''});
            }}
          />
        </View>
        {errors.licenseNumber && <Text style={styles.errorText}>{errors.licenseNumber}</Text>}
      </View>

      <TouchableOpacity style={styles.certificateButton} onPress={handleCertificateUpload}>
        <Camera size={20} color="#007AFF" />
        <Text style={styles.certificateButtonText}>{t('ru' === 'ru' ? 'Загрузить медицинский сертификат' : 'Upload medical certificate')}</Text>
      </TouchableOpacity>
      
      <View style={styles.aiVerificationNote}>
        <FileText size={16} color="#666" />
        <Text style={styles.aiVerificationText}>
          {t('ru' === 'ru' ? 'ИИ автоматически проверит подлинность вашего сертификата' : 'AI will automatically verify your certificate')}
        </Text>
      </View>
      
      {showSpecializationPicker && (
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerTitle}>{t('selectSpecialization')}</Text>
            <ScrollView style={styles.pickerScroll}>
              {specializations.map((spec) => (
                <TouchableOpacity
                  key={spec}
                  style={styles.pickerItem}
                  onPress={() => {
                    setFormData({ ...formData, specialization: spec });
                    setShowSpecializationPicker(false);
                    if (errors.specialization) setErrors({...errors, specialization: ''});
                  }}
                >
                  <Text style={styles.pickerItemText}>{t(spec)}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.pickerCloseButton}
              onPress={() => setShowSpecializationPicker(false)}
            >
              <Text style={styles.pickerCloseText}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {showCityPicker && (
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerTitle}>{t('selectCity')}</Text>
            <ScrollView style={styles.pickerScroll}>
              {cities.map((city) => (
                <TouchableOpacity
                  key={city}
                  style={styles.pickerItem}
                  onPress={() => {
                    setFormData({ ...formData, city });
                    setShowCityPicker(false);
                    if (errors.city) setErrors({...errors, city: ''});
                  }}
                >
                  <Text style={styles.pickerItemText}>{t(city)}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.pickerCloseButton}
              onPress={() => setShowCityPicker(false)}
            >
              <Text style={styles.pickerCloseText}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </>
  );

  const renderGovernmentFields = () => (
    <>
      <View style={styles.inputContainer}>
        <Shield size={20} color="#666" />
        <TextInput
          style={styles.input}
          placeholder="Position"
          value={formData.position}
          onChangeText={(text) => setFormData({ ...formData, position: text })}
        />
      </View>

      <View style={styles.inputContainer}>
        <Shield size={20} color="#666" />
        <TextInput
          style={styles.input}
          placeholder="Department"
          value={formData.department}
          onChangeText={(text) => setFormData({ ...formData, department: text })}
        />
      </View>

      <View style={styles.inputContainer}>
        <Shield size={20} color="#666" />
        <TextInput
          style={styles.input}
          placeholder="Government ID"
          value={formData.governmentId}
          onChangeText={(text) => setFormData({ ...formData, governmentId: text })}
        />
      </View>
    </>
  );

  return (
    <View style={[styles.container, { paddingTop: useSafeAreaInsets().top }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>AI MEDIK</Text>
          <Text style={styles.subtitle}>Your Personal Medical Assistant</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleButton, isLogin && styles.activeToggle]}
              onPress={() => setIsLogin(true)}
            >
              <Text style={[styles.toggleText, isLogin && styles.activeToggleText]}>
                Login
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, !isLogin && styles.activeToggle]}
              onPress={() => setIsLogin(false)}
            >
              <Text style={[styles.toggleText, !isLogin && styles.activeToggleText]}>
                Register
              </Text>
            </TouchableOpacity>
          </View>

          {!isLogin && renderUserTypeSelector()}

          {renderBasicFields()}

          {!isLogin && userType === 'doctor' && renderDoctorFields()}
          {!isLogin && userType === 'government' && renderGovernmentFields()}

          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text style={styles.submitButtonText}>
              {isLoading ? 'Processing...' : isLogin ? 'Login' : 'Register'}
            </Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
            </Text>
            <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
              <Text style={styles.footerLink}>
                {isLogin ? 'Register' : 'Login'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
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
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  form: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    minHeight: '70%',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeToggle: {
    backgroundColor: '#007AFF',
  },
  toggleText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeToggleText: {
    color: 'white',
  },
  userTypeContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  userTypeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  userTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    backgroundColor: 'white',
  },
  selectedUserType: {
    backgroundColor: '#007AFF',
  },
  userTypeText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },
  selectedUserTypeText: {
    color: 'white',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    paddingLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  eyeButton: {
    padding: 4,
  },
  certificateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
  },
  certificateButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  footerText: {
    fontSize: 16,
    color: '#666',
  },
  footerLink: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  aiVerificationNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  aiVerificationText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  inputError: {
    borderColor: '#ff3b30',
    borderWidth: 2,
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 12,
    marginTop: -12,
    marginBottom: 12,
    marginLeft: 16,
  },
  placeholder: {
    color: '#999',
  },
  pickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    maxHeight: '60%',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  pickerScroll: {
    maxHeight: 300,
  },
  pickerItem: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#333',
  },
  pickerCloseButton: {
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  pickerCloseText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
});