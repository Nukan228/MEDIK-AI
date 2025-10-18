import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Language = 'kk' | 'en' | 'ru';

interface Translations {
  [key: string]: {
    kk: string;
    en: string;
    ru: string;
  };
}

export const translations: Translations = {
  // Tab Navigation
  home: { kk: 'Басты бет', en: 'Home', ru: 'Главная' },
  aiChat: { kk: 'AI Чат', en: 'AI Chat', ru: 'AI Чат' },
  cameraAnalysis: { kk: 'Камера талдау', en: 'Camera Analysis', ru: 'Анализ камеры' },
  doctors: { kk: 'Дәрігерлер', en: 'Doctors', ru: 'Врачи' },
  pharmacy: { kk: 'Дәріхана', en: 'Pharmacy', ru: 'Аптека' },
  history: { kk: 'Тарих', en: 'History', ru: 'История' },
  profile: { kk: 'Профиль', en: 'Profile', ru: 'Профиль' },

  // Home Screen
  welcomeBack: { kk: 'Қайта келуіңізбен!', en: 'Welcome Back!', ru: 'С возвращением!' },
  howCanWeHelp: { kk: 'Бүгін сізге қалай көмектесе аламыз?', en: 'How can we help you today?', ru: 'Как мы можем помочь вам сегодня?' },
  quickActions: { kk: 'Жылдам әрекеттер', en: 'Quick Actions', ru: 'Быстрые действия' },
  consultDoctor: { kk: 'Дәрігерге кеңес', en: 'Consult Doctor', ru: 'Консультация врача' },
  findPharmacy: { kk: 'Дәріхана табу', en: 'Find Pharmacy', ru: 'Найти аптеку' },
  analyzeSymptoms: { kk: 'Симптомдарды талдау', en: 'Analyze Symptoms', ru: 'Анализ симптомов' },
  viewHistory: { kk: 'Тарихты қарау', en: 'View History', ru: 'Просмотр истории' },

  // AI Chat
  typeMessage: { kk: 'Хабарламаны теріңіз...', en: 'Type a message...', ru: 'Введите сообщение...' },
  send: { kk: 'Жіберу', en: 'Send', ru: 'Отправить' },

  // Camera Analysis
  scanAnalyze: { kk: 'Сканерлеу және талдау', en: 'Scan & Analyze', ru: 'Сканировать и анализировать' },
  takePhoto: { kk: 'Фото түсіру', en: 'Take Photo', ru: 'Сделать фото' },
  uploadPhoto: { kk: 'Фото жүктеу', en: 'Upload Photo', ru: 'Загрузить фото' },

  // Doctors
  findDoctor: { kk: 'Дәрігер табу', en: 'Find a Doctor', ru: 'Найти врача' },
  searchDoctors: { kk: 'Дәрігерлерді іздеу...', en: 'Search doctors...', ru: 'Поиск врачей...' },
  allSpecialties: { kk: 'Барлық мамандықтар', en: 'All Specialties', ru: 'Все специальности' },
  bookAppointment: { kk: 'Қабылдауға жазылу', en: 'Book Appointment', ru: 'Записаться на прием' },
  yearsExp: { kk: 'жыл тәжірибе', en: 'years exp', ru: 'лет опыта' },
  rating: { kk: 'Рейтинг', en: 'Rating', ru: 'Рейтинг' },

  // Pharmacy
  nearbyPharmacies: { kk: 'Жақын дәріханалар', en: 'Nearby Pharmacies', ru: 'Ближайшие аптеки' },
  searchMedicine: { kk: 'Дәрі-дәрмек іздеу...', en: 'Search medicine...', ru: 'Поиск лекарств...' },
  openNow: { kk: 'Қазір ашық', en: 'Open Now', ru: 'Открыто сейчас' },
  closed: { kk: 'Жабық', en: 'Closed', ru: 'Закрыто' },
  kmAway: { kk: 'км қашықтықта', en: 'km away', ru: 'км от вас' },
  orderDelivery: { kk: 'Жеткізуге тапсырыс', en: 'Order Delivery', ru: 'Заказать доставку' },
  payWithKaspi: { kk: 'Kaspi арқылы төлеу', en: 'Pay with Kaspi', ru: 'Оплатить через Kaspi' },
  inStock: { kk: 'Қоймада бар', en: 'In Stock', ru: 'В наличии' },
  outOfStock: { kk: 'Қоймада жоқ', en: 'Out of Stock', ru: 'Нет в наличии' },
  addToCart: { kk: 'Себетке қосу', en: 'Add to Cart', ru: 'Добавить в корзину' },
  cart: { kk: 'Себет', en: 'Cart', ru: 'Корзина' },
  checkout: { kk: 'Төлем', en: 'Checkout', ru: 'Оформить заказ' },
  total: { kk: 'Жалпы', en: 'Total', ru: 'Итого' },

  // Profile
  myProfile: { kk: 'Менің профилім', en: 'My Profile', ru: 'Мой профиль' },
  personalInfo: { kk: 'Жеке ақпарат', en: 'Personal Info', ru: 'Личная информация' },
  medicalRecords: { kk: 'Медициналық жазбалар', en: 'Medical Records', ru: 'Медицинские записи' },
  appointments: { kk: 'Қабылдаулар', en: 'Appointments', ru: 'Записи на прием' },
  prescriptions: { kk: 'Рецепттер', en: 'Prescriptions', ru: 'Рецепты' },
  settings: { kk: 'Параметрлер', en: 'Settings', ru: 'Настройки' },
  language: { kk: 'Тіл', en: 'Language', ru: 'Язык' },
  notifications: { kk: 'Хабарландырулар', en: 'Notifications', ru: 'Уведомления' },
  logout: { kk: 'Шығу', en: 'Logout', ru: 'Выход' },

  // Common
  save: { kk: 'Сақтау', en: 'Save', ru: 'Сохранить' },
  cancel: { kk: 'Болдырмау', en: 'Cancel', ru: 'Отмена' },
  confirm: { kk: 'Растау', en: 'Confirm', ru: 'Подтвердить' },
  delete: { kk: 'Жою', en: 'Delete', ru: 'Удалить' },
  edit: { kk: 'Өңдеу', en: 'Edit', ru: 'Редактировать' },
  back: { kk: 'Артқа', en: 'Back', ru: 'Назад' },
  next: { kk: 'Келесі', en: 'Next', ru: 'Далее' },
  loading: { kk: 'Жүктелуде...', en: 'Loading...', ru: 'Загрузка...' },
  error: { kk: 'Қате', en: 'Error', ru: 'Ошибка' },
  success: { kk: 'Сәтті', en: 'Success', ru: 'Успешно' },
  
  // Currency
  currency: { kk: '₸', en: '₸', ru: '₸' },
  
  // Home Screen - Extended
  welcome: { kk: 'Қош келдіңіз', en: 'Welcome to', ru: 'Добро пожаловать в' },
  appName: { kk: 'AI MEDIK', en: 'AI MEDIK', ru: 'AI MEDIK' },
  personalAssistant: { kk: 'Сіздің жеке медициналық көмекшіңіз', en: 'Your personal medical assistant', ru: 'Ваш личный медицинский помощник' },
  aiConsultation: { kk: 'ИИ Консультация', en: 'AI Consultation', ru: 'ИИ Консультация' },
  chatWithAI: { kk: 'Жасанды интеллектпен сөйлесу', en: 'Chat with artificial intelligence', ru: 'Чат с искусственным интеллектом' },
  cameraAnalysisTitle: { kk: 'Камерамен талдау', en: 'Camera Analysis', ru: 'Анализ камеры' },
  photoSymptoms: { kk: 'Симптомдарды суретке түсіріңіз', en: 'Photograph symptoms', ru: 'Сфотографируйте симптомы' },
  connectDoctor: { kk: 'Дәрігермен байланыс', en: 'Connect with Doctor', ru: 'Связаться с врачом' },
  onlineConsultations: { kk: 'Онлайн консультациялар', en: 'Online consultations', ru: 'Онлайн консультации' },
  healthHistory: { kk: 'Денсаулық тарихы', en: 'Health History', ru: 'История здоровья' },
  consultationsAndDiagnoses: { kk: 'Консультацияларыңыз және диагноздарыңыз', en: 'Your consultations and diagnoses', ru: 'Ваши консультации и диагнозы' },
  quickDiagnosis: { kk: 'Жылдам өзін-өзі диагностикалау', en: 'Quick self-diagnosis', ru: 'Быстрая самодиагностика' },
  selectSymptoms: { kk: 'Ұсыныстар алу үшін симптомдарыңызды таңдаңыз', en: 'Select your symptoms to get recommendations', ru: 'Выберите симптомы для получения рекомендаций' },
  emergencyHelp: { kk: 'Жедел көмек', en: 'Emergency Help', ru: 'Экстренная помощь' },
  callAmbulance: { kk: 'Жедел жәрдем шақыру', en: 'Call ambulance', ru: 'Вызвать скорую' },
  
  // AI Chat - Extended
  aiAssistant: { kk: 'ИИ Көмекші', en: 'AI Assistant', ru: 'ИИ Помощник' },
  you: { kk: 'Сіз', en: 'You', ru: 'Вы' },
  typing: { kk: 'Теруде...', en: 'Typing...', ru: 'Печатает...' },
  describeSymptoms: { kk: 'Симптомдарыңызды сипаттаңыз...', en: 'Describe your symptoms...', ru: 'Опишите ваши симптомы...' },
  
  // Camera Analysis - Extended
  cameraAccess: { kk: 'Камераға қол жеткізу', en: 'Camera Access', ru: 'Доступ к камере' },
  needCameraAccess: { kk: 'Симптомдарды талдау үшін камераға қол жеткізу қажет', en: 'Camera access needed to analyze symptoms', ru: 'Требуется доступ к камере для анализа симптомов' },
  allowAccess: { kk: 'Қол жеткізуге рұқсат беру', en: 'Allow Access', ru: 'Разрешить доступ' },
  photoSymptom: { kk: 'Симптомды суретке түсіріңіз', en: 'Photograph the symptom', ru: 'Сфотографируйте симптом' },
  pointCamera: { kk: 'Камераны симптомдары бар аймаққа бағыттаңыз', en: 'Point camera at area with symptoms', ru: 'Направьте камеру на область с симптомами' },
  retake: { kk: 'Қайта түсіру', en: 'Retake', ru: 'Переснять' },
  analyze: { kk: 'Талдау', en: 'Analyze', ru: 'Анализировать' },
  analyzing: { kk: 'Талдау...', en: 'Analyzing...', ru: 'Анализ...' },
  analysisResult: { kk: 'Талдау нәтижесі:', en: 'Analysis Result:', ru: 'Результат анализа:' },
  askQuestion: { kk: 'Сұрақ қою', en: 'Ask Question', ru: 'Задать вопрос' },
  chatWithAIDoctor: { kk: 'ИИ-дәрігермен сөйлесу', en: 'Chat with AI Doctor', ru: 'Чат с ИИ-врачом' },
  close: { kk: 'Жабу', en: 'Close', ru: 'Закрыть' },
  askAboutSymptoms: { kk: 'Симптомдар туралы сұрақ қойыңыз...', en: 'Ask about symptoms...', ru: 'Задайте вопрос о симптомах...' },
  imageAnalysis: { kk: 'Кескінді талдау', en: 'Image Analysis', ru: 'Анализ изображения' },
  
  // Doctors - Extended
  onlineDoctors: { kk: 'Онлайн дәрігерлер', en: 'Online Doctors', ru: 'Онлайн врачи' },
  all: { kk: 'Барлығы', en: 'All', ru: 'Все' },
  online: { kk: 'Онлайн', en: 'Online', ru: 'Онлайн' },
  doctorsFound: { kk: 'Дәрігерлер табылды:', en: 'Doctors found:', ru: 'Найдено врачей:' },
  onlineCount: { kk: 'Онлайн:', en: 'Online:', ru: 'Онлайн:' },
  noDoctorsFound: { kk: 'Дәрігерлер табылмады', en: 'No doctors found', ru: 'Врачи не найдены' },
  tryChangingSearch: { kk: 'Іздеу параметрлерін өзгертіп көріңіз', en: 'Try changing search parameters', ru: 'Попробуйте изменить параметры поиска' },
  
  // Pharmacy - Extended
  onlinePharmacy: { kk: 'Онлайн дәріхана', en: 'Online Pharmacy', ru: 'Онлайн аптека' },
  shoppingCart: { kk: 'Себет', en: 'Shopping Cart', ru: 'Корзина покупок' },
  selectPharmacy: { kk: 'Дәріхананы таңдаңыз', en: 'Select Pharmacy', ru: 'Выберите аптеку' },
  enableLocation: { kk: 'Геолокацияны қосу', en: 'Enable Location', ru: 'Включить геолокацию' },
  medicalProducts: { kk: 'Медициналық өнімдер', en: 'Medical Products', ru: 'Медицинские товары' },
  searchResults: { kk: 'Іздеу нәтижелері', en: 'Search Results', ru: 'Результаты поиска' },
  toPharmacies: { kk: 'Дәріханаларға', en: 'To Pharmacies', ru: 'К аптекам' },
  noProductsInPharmacy: { kk: 'Бұл дәріханада өнімдер жоқ', en: 'No products in this pharmacy', ru: 'В этой аптеке нет товаров' },
  productsNotFound: { kk: 'Өнімдер табылмады', en: 'Products not found', ru: 'Товары не найдены' },
  deliveryInfo: { kk: 'Жеткізу туралы ақпарат:', en: 'Delivery Information:', ru: 'Информация о доставке:' },
  minOrderAmount: { kk: 'Тапсырыстың ең аз сомасы:', en: 'Minimum order amount:', ru: 'Минимальная сумма заказа:' },
  deliveryCost: { kk: 'Жеткізу құны:', en: 'Delivery cost:', ru: 'Стоимость доставки:' },
  yourCartEmpty: { kk: 'Себетіңіз бос', en: 'Your cart is empty', ru: 'Ваша корзина пуста' },
  orderNow: { kk: 'Қазір тапсырыс беру', en: 'Order Now', ru: 'Заказать сейчас' },
  
  // Profile - Extended
  accountSettings: { kk: 'Аккаунт параметрлері', en: 'Account Settings', ru: 'Настройки аккаунта' },
  profileSettings: { kk: 'Профиль параметрлері', en: 'Profile Settings', ru: 'Настройки профиля' },
  editPersonalInfo: { kk: 'Жеке ақпаратты өңдеу', en: 'Edit personal information', ru: 'Редактировать личную информацию' },
  paymentMethods: { kk: 'Төлем әдістері', en: 'Payment Methods', ru: 'Способы оплаты' },
  kaspiAndCards: { kk: 'Kaspi Pay, банк карталары', en: 'Kaspi Pay, bank cards', ru: 'Kaspi Pay, банковские карты' },
  ecpSettings: { kk: 'ЭЦҚ параметрлері', en: 'ECP Settings', ru: 'Настройки ЭЦП' },
  manageECP: { kk: 'Электрондық қолтаңбаны басқару', en: 'Manage electronic signature', ru: 'Управление электронной подписью' },
  pushNotifications: { kk: 'Push-хабарландырулар параметрлері', en: 'Push notification settings', ru: 'Настройки push-уведомлений' },
  support: { kk: 'Қолдау', en: 'Support', ru: 'Поддержка' },
  helpAndSupport: { kk: 'Көмек және қолдау', en: 'Help and Support', ru: 'Помощь и поддержка' },
  faqContact: { kk: 'FAQ, қолдаумен байланысу', en: 'FAQ, contact support', ru: 'FAQ, связаться с поддержкой' },
  privacy: { kk: 'Құпиялылық', en: 'Privacy', ru: 'Конфиденциальность' },
  privacyPolicy: { kk: 'Құпиялылық саясаты', en: 'Privacy Policy', ru: 'Политика конфиденциальности' },
  logoutAccount: { kk: 'Аккаунттан шығу', en: 'Logout', ru: 'Выход из аккаунта' },
  endSession: { kk: 'Ағымдағы сеансты аяқтау', en: 'End current session', ru: 'Завершить текущий сеанс' },
  doctor: { kk: 'Дәрігер', en: 'Doctor', ru: 'Врач' },
  govEmployee: { kk: 'Мемлекеттік қызметкер', en: 'Government Employee', ru: 'Государственный служащий' },
  citizen: { kk: 'Азамат', en: 'Citizen', ru: 'Гражданин' },
  verified: { kk: 'Верификацияланған', en: 'Verified', ru: 'Верифицирован' },
  yearsExperience: { kk: 'жыл тәжірибе', en: 'years experience', ru: 'лет опыта' },
  
  // Registration
  emailRequired: { kk: 'Email міндетті', en: 'Email is required', ru: 'Email обязателен' },
  phoneRequired: { kk: 'Телефон міндетті', en: 'Phone is required', ru: 'Телефон обязателен' },
  passwordRequired: { kk: 'Құпия сөз міндетті', en: 'Password is required', ru: 'Пароль обязателен' },
  firstNameRequired: { kk: 'Аты міндетті', en: 'First name is required', ru: 'Имя обязательно' },
  lastNameRequired: { kk: 'Тегі міндетті', en: 'Last name is required', ru: 'Фамилия обязательна' },
  specializationRequired: { kk: 'Мамандық міндетті', en: 'Specialization is required', ru: 'Специализация обязательна' },
  cityRequired: { kk: 'Қала міндетті', en: 'City is required', ru: 'Город обязателен' },
  experienceRequired: { kk: 'Тәжірибе міндетті', en: 'Experience is required', ru: 'Опыт обязателен' },
  licenseRequired: { kk: 'Лицензия нөмірі міндетті', en: 'License number is required', ru: 'Номер лицензии обязателен' },
  fillAllFields: { kk: 'Барлық міндетті өрістерді толтырыңыз', en: 'Please fill all required fields', ru: 'Пожалуйста, заполните все обязательные поля' },
  invalidEmail: { kk: 'Email дұрыс емес', en: 'Invalid email format', ru: 'Неверный формат email' },
  invalidPhone: { kk: 'Телефон нөмірі дұрыс емес', en: 'Invalid phone number', ru: 'Неверный номер телефона' },
  passwordTooShort: { kk: 'Құпия сөз кем дегенде 6 таңбадан тұруы керек', en: 'Password must be at least 6 characters', ru: 'Пароль должен содержать минимум 6 символов' },
  selectCity: { kk: 'Қаланы таңдаңыз', en: 'Select City', ru: 'Выберите город' },
  selectSpecialization: { kk: 'Мамандықты таңдаңыз', en: 'Select Specialization', ru: 'Выберите специализацию' },
  
  // Cities
  astana: { kk: 'Астана', en: 'Astana', ru: 'Астана' },
  almaty: { kk: 'Алматы', en: 'Almaty', ru: 'Алматы' },
  shymkent: { kk: 'Шымкент', en: 'Shymkent', ru: 'Шымкент' },
  karaganda: { kk: 'Қарағанды', en: 'Karaganda', ru: 'Караганда' },
  aktobe: { kk: 'Ақтөбе', en: 'Aktobe', ru: 'Актобе' },
  taraz: { kk: 'Тараз', en: 'Taraz', ru: 'Тараз' },
  
  // Specializations
  therapist: { kk: 'Терапевт', en: 'Therapist', ru: 'Терапевт' },
  cardiologist: { kk: 'Кардиолог', en: 'Cardiologist', ru: 'Кардиолог' },
  neurologist: { kk: 'Невролог', en: 'Neurologist', ru: 'Невролог' },
  pediatrician: { kk: 'Педиатр', en: 'Pediatrician', ru: 'Педиатр' },
  dermatologist: { kk: 'Дерматолог', en: 'Dermatologist', ru: 'Дерматолог' },
  ophthalmologist: { kk: 'Офтальмолог', en: 'Ophthalmologist', ru: 'Офтальмолог' },
  
  // Doctor Application
  applyToAcceptPatients: { kk: 'Пациенттерді қабылдауға өтініш беру', en: 'Apply to Accept Patients', ru: 'Подать заявку на прием пациентов' },
  applicationSubmitted: { kk: 'Өтініш жіберілді', en: 'Application Submitted', ru: 'Заявка отправлена' },
  applicationPending: { kk: 'Өтініш қаралуда', en: 'Application Pending', ru: 'Заявка на рассмотрении' },
  startAcceptingPatients: { kk: 'Пациенттерді қабылдауды бастау', en: 'Start Accepting Patients', ru: 'Начать прием пациентов' },
  stopAcceptingPatients: { kk: 'Пациенттерді қабылдауды тоқтату', en: 'Stop Accepting Patients', ru: 'Прекратить прием пациентов' },
  
  // Subscription
  becomePremiumDoctor: { kk: 'Премиум дәрігер болу', en: 'Become Premium Doctor', ru: 'Стать премиум врачом' },
  premiumBenefits: { kk: 'Премиум артықшылықтары', en: 'Premium Benefits', ru: 'Преимущества премиум' },
  topPlacement: { kk: 'Іздеу нәтижелерінде жоғары орын', en: 'Top placement in search results', ru: 'Высокое место в результатах поиска' },
  prioritySupport: { kk: 'Басым қолдау', en: 'Priority support', ru: 'Приоритетная поддержка' },
  threeDayPlan: { kk: '3 күндік жоспар', en: '3-Day Plan', ru: '3-дневный план' },
  weeklyPlan: { kk: 'Апталық жоспар', en: 'Weekly Plan', ru: 'Недельный план' },
  subscribe: { kk: 'Жазылу', en: 'Subscribe', ru: 'Подписаться' },
  currentPlan: { kk: 'Ағымдағы жоспар', en: 'Current Plan', ru: 'Текущий план' },
  expiresOn: { kk: 'Аяқталады:', en: 'Expires on:', ru: 'Истекает:' },
  
  // Rating
  rateDoctor: { kk: 'Дәрігерді бағалау', en: 'Rate Doctor', ru: 'Оценить врача' },
  howWasConsultation: { kk: 'Консультация қалай өтті?', en: 'How was your consultation?', ru: 'Как прошла консультация?' },
  leaveReview: { kk: 'Пікір қалдыру (міндетті емес)', en: 'Leave a review (optional)', ru: 'Оставить отзыв (необязательно)' },
  submitRating: { kk: 'Бағаны жіберу', en: 'Submit Rating', ru: 'Отправить оценку' },
  thankYouForRating: { kk: 'Бағаңыз үшін рахмет!', en: 'Thank you for your rating!', ru: 'Спасибо за вашу оценку!' },
  
  // Address
  deliveryAddress: { kk: 'Жеткізу мекенжайы', en: 'Delivery Address', ru: 'Адрес доставки' },
  enterAddress: { kk: 'Мекенжайды енгізіңіз', en: 'Enter address', ru: 'Введите адрес' },
  street: { kk: 'Көше', en: 'Street', ru: 'Улица' },
  building: { kk: 'Үй', en: 'Building', ru: 'Дом' },
  apartment: { kk: 'Пәтер', en: 'Apartment', ru: 'Квартира' },
  addressRequired: { kk: 'Мекенжай міндетті', en: 'Address is required', ru: 'Адрес обязателен' },
  
  // Voice Assistant
  listening: { kk: 'Тыңдап жатыр...', en: 'Listening...', ru: 'Слушаю...' },
  speaking: { kk: 'Сөйлеп жатыр...', en: 'Speaking...', ru: 'Говорю...' },
  tapToStartVoiceChat: { kk: 'Дауыс чатын бастау үшін басыңыз', en: 'Tap to start voice chat', ru: 'Нажмите для начала голосового чата' },
  tapToStopRecording: { kk: 'Жазуды тоқтату үшін басыңыз', en: 'Tap to stop recording', ru: 'Нажмите для остановки записи' },
  switchToTextMode: { kk: 'Мәтін режиміне ауысу', en: 'Switch to Text Mode', ru: 'Переключиться на текстовый режим' },
  switchToVoiceMode: { kk: 'Дауыс режиміне ауысу', en: 'Switch to Voice Mode', ru: 'Переключиться на голосовой режим' },
};

export const [LanguageContext, useLanguage] = createContextHook(() => {
  const [language, setLanguageState] = useState<Language>('kk');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const saved = await AsyncStorage.getItem('app_language');
      if (saved === 'kk' || saved === 'en' || saved === 'ru') {
        setLanguageState(saved);
      }
    } catch (error) {
      console.error('Failed to load language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setLanguage = useCallback(async (lang: Language) => {
    try {
      await AsyncStorage.setItem('app_language', lang);
      setLanguageState(lang);
    } catch (error) {
      console.error('Failed to save language:', error);
    }
  }, []);

  const t = useCallback((key: string): string => {
    return translations[key]?.[language] || key;
  }, [language]);

  return useMemo(() => ({
    language,
    setLanguage,
    t,
    isLoading,
  }), [language, setLanguage, t, isLoading]);
});
