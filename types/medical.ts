export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: number;
  rating: number;
  avatar: string;
  status: 'online' | 'busy' | 'offline';
  price: number;
}

export interface Consultation {
  id: string;
  type: 'ai' | 'doctor';
  doctorId?: string;
  date: string;
  messages: Message[];
  diagnosis?: string;
  recommendations?: string[];
  images?: string[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'doctor';
  content: string;
  timestamp: string;
  images?: string[];
}

export interface Symptom {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export interface MedicalRecord {
  id: string;
  date: string;
  type: 'consultation' | 'diagnosis' | 'prescription' | 'analysis';
  title: string;
  description: string;
  doctorName?: string;
  images?: string[];
}

export interface User {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  userType: 'citizen' | 'government' | 'doctor';
  isVerified: boolean;
  createdAt: string;
  avatar?: string;
  
  // Doctor specific fields
  specialization?: string;
  experience?: number;
  licenseNumber?: string;
  certificateImage?: string;
  isOnline?: boolean;
  consultationPrice?: number;
  city?: string;
  acceptingPatients?: boolean;
  rating?: number;
  reviewCount?: number;
  isPremium?: boolean;
  premiumExpiry?: string;
  
  // Government specific fields
  position?: string;
  department?: string;
  governmentId?: string;
  
  // EDS key info
  edsKeyId?: string;
  edsKeyExpiry?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface Pharmacy {
  id: string;
  name: string;
  nameKz: string;
  logo: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  minOrderAmount: number;
  isOpen: boolean;
  workingHours: string;
  phone: string;
  website?: string;
  address: string;
  latitude?: number;
  longitude?: number;
}

export interface Medicine {
  id: string;
  name: string;
  nameKz: string;
  description: string;
  price: number;
  currency: '₸' | 'KZT';
  inStock: boolean;
  manufacturer: string;
  category: string;
  prescriptionRequired: boolean;
  image: string;
  pharmacyId: string;
  dosage?: string;
  sideEffects?: string[];
}

export interface CartItem {
  medicine: Medicine;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  pharmacyId: string;
  items: CartItem[];
  totalAmount: number;
  deliveryAddress: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'delivering' | 'delivered' | 'cancelled';
  createdAt: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
}

export interface Appointment {
  id: string;
  userId: string;
  doctorId: string;
  date: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  queuePosition?: number;
  createdAt: string;
  completedAt?: string;
  rating?: number;
  review?: string;
}

export interface Subscription {
  id: string;
  userId: string;
  type: '3-day' | 'weekly';
  price: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}