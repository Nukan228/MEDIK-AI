import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Search, ShoppingCart, Star, Clock, Truck, Plus, Minus, MapPin, Navigation, Home } from 'lucide-react-native';
import { usePharmacy } from '@/hooks/pharmacy-store';
import { Pharmacy, Medicine } from '@/types/medical';
import * as Location from 'expo-location';
import { useLanguage } from '@/hooks/language-store';

export default function PharmacyScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPharmacy, setSelectedPharmacy] = useState<string | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [locationPermission, setLocationPermission] = useState<Location.PermissionStatus | null>(null);
  const [sortByDistance, setSortByDistance] = useState(false);
  const [showAddressInput, setShowAddressInput] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    building: '',
    apartment: '',
  });
  
  const {
    cart,
    cartTotal,
    cartItemsCount,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    getPharmacies,
    getMedicines,
    searchMedicines,
  } = usePharmacy();
  
  const { t } = useLanguage();

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'web') {
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const location: Location.LocationObject = {
                coords: {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                  altitude: position.coords.altitude,
                  accuracy: position.coords.accuracy,
                  altitudeAccuracy: position.coords.altitudeAccuracy,
                  heading: position.coords.heading,
                  speed: position.coords.speed,
                },
                timestamp: position.timestamp,
              };
              setUserLocation(location);
              setLocationPermission('granted' as Location.PermissionStatus);
            },
            (error) => {
              console.log('Web geolocation error:', error.message);
              setLocationPermission('denied' as Location.PermissionStatus);
              Alert.alert(
                'Location Access',
                'Please enable location access in your browser settings to see nearby pharmacies.'
              );
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
          );
        } else {
          console.log('Geolocation not supported in this browser');
          setLocationPermission('denied' as Location.PermissionStatus);
        }
      } else {
        const { status } = await Location.requestForegroundPermissionsAsync();
        setLocationPermission(status);
        
        if (status === 'granted') {
          try {
            const location = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            });
            setUserLocation(location);
          } catch (locError) {
            console.log('Error getting location:', locError);
            Alert.alert(
              'Location Error',
              'Could not get your current location. Please try again.'
            );
          }
        } else {
          Alert.alert(
            'Location Permission',
            'Location permission is required to show nearby pharmacies.'
          );
        }
      }
    } catch (error) {
      console.log('Location permission error:', error);
      setLocationPermission('denied' as Location.PermissionStatus);
    }
  };

  const calculateDistance = (pharmacy: Pharmacy) => {
    if (!userLocation) return 0;
    
    // Примерные координаты для аптек в Алматы
    const pharmacyCoords = getPharmacyCoordinates(pharmacy.id);
    const userLat = userLocation.coords.latitude;
    const userLon = userLocation.coords.longitude;
    
    const R = 6371; // Радиус Земли в км
    const dLat = (pharmacyCoords.lat - userLat) * Math.PI / 180;
    const dLon = (pharmacyCoords.lon - userLon) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(userLat * Math.PI / 180) * Math.cos(pharmacyCoords.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance;
  };

  const getPharmacyCoordinates = (pharmacyId: string) => {
    // Примерные координаты аптек в Алматы
    const coords: { [key: string]: { lat: number; lon: number } } = {
      '1': { lat: 43.2220, lon: 76.8512 }, // Europharma
      '2': { lat: 43.2380, lon: 76.9450 }, // Apteka Plus
      '3': { lat: 43.2565, lon: 76.9286 }, // Melodiya Zdorovya
      '4': { lat: 43.2394, lon: 76.8897 }, // ArzanApteka
      '5': { lat: 43.2075, lon: 76.9050 }, // Apteka 36,6
      '6': { lat: 43.2630, lon: 76.9300 }, // Zdorovye
      '7': { lat: 43.1950, lon: 76.8650 }, // Apteka Ot Sklada
      '8': { lat: 43.2500, lon: 76.9100 }, // DariDerek
      '9': { lat: 43.2300, lon: 76.8800 }, // Sadykhan
      '10': { lat: 43.2400, lon: 76.9200 }, // PharmLine
      '11': { lat: 43.2100, lon: 76.8900 }, // Apteka Akniet
      '12': { lat: 43.2600, lon: 76.9400 }, // Remedium
      '13': { lat: 43.2200, lon: 76.8700 }, // Apteka Aina
      '14': { lat: 43.2450, lon: 76.9350 }, // Apteka Arzan
      '15': { lat: 43.2350, lon: 76.9150 }, // Apteka Nur
    };
    return coords[pharmacyId] || { lat: 43.2220, lon: 76.8512 };
  };

  const getSortedPharmacies = () => {
    const allPharmacies = getPharmacies();
    
    if (!sortByDistance || !userLocation) {
      return allPharmacies;
    }
    
    return allPharmacies.sort((a, b) => {
      const distanceA = calculateDistance(a);
      const distanceB = calculateDistance(b);
      return distanceA - distanceB;
    });
  };

  const pharmacies = getSortedPharmacies();
  const medicines = selectedPharmacy 
    ? getMedicines(selectedPharmacy)
    : searchQuery 
    ? searchMedicines(searchQuery)
    : [];

  const handleAddToCart = (medicine: Medicine) => {
    addToCart(medicine, 1);
    Alert.alert('Added to Cart', `${medicine.name} has been added to your cart`);
  };

  const getCartItemQuantity = (medicineId: string) => {
    const item = cart.find(item => item.medicine.id === medicineId);
    return item ? item.quantity : 0;
  };

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} ₸`;
  };

  const handleCheckout = () => {
    setShowAddressInput(true);
  };
  
  const handleConfirmAddress = () => {
    if (!deliveryAddress.street || !deliveryAddress.building) {
      Alert.alert(t('error'), t('addressRequired'));
      return;
    }
    
    setShowAddressInput(false);
    
    Alert.alert(
      'Choose Payment Method',
      'Select your preferred payment method',
      [
        {
          text: 'Kaspi Pay',
          onPress: () => handleKaspiPayment()
        },
        {
          text: 'Card Payment',
          onPress: () => handleCardPayment()
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  const handleKaspiPayment = () => {
    const fullAddress = `${deliveryAddress.street}, ${deliveryAddress.building}${deliveryAddress.apartment ? ', кв. ' + deliveryAddress.apartment : ''}`;
    
    Alert.alert(
      'Kaspi Payment',
      `Total: ${formatPrice(cartTotal)}\nAddress: ${fullAddress}\n\nRedirecting to Kaspi app...`,
      [
        {
          text: 'Pay with Kaspi',
          onPress: () => {
            Alert.alert('Success', 'Payment completed successfully!');
            setDeliveryAddress({ street: '', building: '', apartment: '' });
          }
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleCardPayment = () => {
    const fullAddress = `${deliveryAddress.street}, ${deliveryAddress.building}${deliveryAddress.apartment ? ', кв. ' + deliveryAddress.apartment : ''}`;
    
    Alert.alert(
      'Card Payment',
      `Total: ${formatPrice(cartTotal)}\nAddress: ${fullAddress}\n\nEnter your card details`,
      [
        {
          text: 'Pay Now',
          onPress: () => {
            Alert.alert('Success', 'Payment completed successfully!');
            setDeliveryAddress({ street: '', building: '', apartment: '' });
          }
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const renderPharmacyCard = (pharmacy: Pharmacy) => {
    const distance = userLocation ? calculateDistance(pharmacy) : null;
    
    return (
      <TouchableOpacity
        key={pharmacy.id}
        style={[
          styles.pharmacyCard,
          selectedPharmacy === pharmacy.id && styles.selectedPharmacy
        ]}
        onPress={() => setSelectedPharmacy(pharmacy.id)}
      >
        <Image source={{ uri: pharmacy.logo }} style={styles.pharmacyLogo} />
        <View style={styles.pharmacyInfoContainer}>
          <Text style={styles.pharmacyName}>{pharmacy.name}</Text>
          <Text style={styles.pharmacyAddress}>{pharmacy.address}</Text>
          <View style={styles.pharmacyMeta}>
            <View style={styles.ratingContainer}>
              <Star size={16} color="#FFD700" fill="#FFD700" />
              <Text style={styles.rating}>{pharmacy.rating}</Text>
            </View>
            <View style={styles.deliveryContainer}>
              <Clock size={16} color="#666" />
              <Text style={styles.deliveryTime}>{pharmacy.deliveryTime}</Text>
            </View>
            {distance && (
              <View style={styles.distanceContainer}>
                <MapPin size={16} color="#007AFF" />
                <Text style={styles.distance}>{distance.toFixed(1)} км</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderMedicineCard = (medicine: Medicine) => {
    const quantity = getCartItemQuantity(medicine.id);
    
    return (
      <View key={medicine.id} style={styles.medicineCard}>
        <Image source={{ uri: medicine.image }} style={styles.medicineImage} />
        <View style={styles.medicineInfo}>
          <Text style={styles.medicineName}>{medicine.name}</Text>
          <Text style={styles.medicineDescription}>{medicine.description}</Text>
          <Text style={styles.medicinePrice}>{formatPrice(medicine.price)}</Text>
          
          {quantity > 0 ? (
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => updateCartQuantity(medicine.id, quantity - 1)}
              >
                <Minus size={16} color="#007AFF" />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => updateCartQuantity(medicine.id, quantity + 1)}
              >
                <Plus size={16} color="#007AFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => handleAddToCart(medicine)}
            >
              <Text style={styles.addButtonText}>Add to Cart</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderCartItem = (item: any) => (
    <View key={item.medicine.id} style={styles.cartItem}>
      <Image source={{ uri: item.medicine.image }} style={styles.cartItemImage} />
      <View style={styles.cartItemInfo}>
        <Text style={styles.cartItemName}>{item.medicine.name}</Text>
        <Text style={styles.cartItemPrice}>{formatPrice(item.medicine.price)}</Text>
      </View>
      <View style={styles.cartItemQuantity}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => updateCartQuantity(item.medicine.id, item.quantity - 1)}
        >
          <Minus size={16} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.quantityText}>{item.quantity}</Text>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => updateCartQuantity(item.medicine.id, item.quantity + 1)}
        >
          <Plus size={16} color="#007AFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (showAddressInput) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: t('deliveryAddress') }} />
        
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setShowAddressInput(false)}
          >
            <Text style={styles.backButtonText}>← {t('back')}</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.content}>
          <View style={styles.addressForm}>
            <View style={styles.addressHeader}>
              <Home size={32} color="#007AFF" />
              <Text style={styles.addressTitle}>{t('deliveryAddress')}</Text>
              <Text style={styles.addressSubtitle}>{t('enterAddress')}</Text>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('street')} *</Text>
              <TextInput
                style={styles.addressInput}
                placeholder={t('street')}
                value={deliveryAddress.street}
                onChangeText={(text) => setDeliveryAddress({ ...deliveryAddress, street: text })}
              />
            </View>
            
            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.inputLabel}>{t('building')} *</Text>
                <TextInput
                  style={styles.addressInput}
                  placeholder={t('building')}
                  value={deliveryAddress.building}
                  onChangeText={(text) => setDeliveryAddress({ ...deliveryAddress, building: text })}
                />
              </View>
              
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.inputLabel}>{t('apartment')}</Text>
                <TextInput
                  style={styles.addressInput}
                  placeholder={t('apartment')}
                  value={deliveryAddress.apartment}
                  onChangeText={(text) => setDeliveryAddress({ ...deliveryAddress, apartment: text })}
                  keyboardType="numeric"
                />
              </View>
            </View>
            
            <TouchableOpacity
              style={styles.confirmAddressButton}
              onPress={handleConfirmAddress}
            >
              <Text style={styles.confirmAddressButtonText}>{t('confirm')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
  
  if (showCart) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: t('cart') }} />
        
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setShowCart(false)}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {cart.length === 0 ? (
            <View style={styles.emptyCart}>
              <ShoppingCart size={64} color="#ccc" />
              <Text style={styles.emptyCartText}>Your cart is empty</Text>
            </View>
          ) : (
            <>
              {cart.map(renderCartItem)}
              
              <View style={styles.cartSummary}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total:</Text>
                  <Text style={styles.totalAmount}>{formatPrice(cartTotal)}</Text>
                </View>
                
                <TouchableOpacity 
                  style={styles.checkoutButton}
                  onPress={() => handleCheckout()}
                >
                  <Truck size={20} color="white" />
                  <Text style={styles.checkoutButtonText}>Order Now</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Online Pharmacy' }} />
      
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search medicines..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <View style={styles.headerButtons}>
          {locationPermission === 'granted' && (
            <TouchableOpacity
              style={[styles.locationButton, sortByDistance && styles.locationButtonActive]}
              onPress={() => setSortByDistance(!sortByDistance)}
            >
              <Navigation size={20} color={sortByDistance ? "white" : "#007AFF"} />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => setShowCart(true)}
          >
            <ShoppingCart size={24} color="#007AFF" />
            {cartItemsCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartItemsCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {!selectedPharmacy && !searchQuery && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Выберите аптеку</Text>
              {locationPermission !== 'granted' && (
                <TouchableOpacity 
                  style={styles.locationPermissionButton}
                  onPress={requestLocationPermission}
                >
                  <MapPin size={16} color="#007AFF" />
                  <Text style={styles.locationPermissionText}>Включить геолокацию</Text>
                </TouchableOpacity>
              )}
            </View>
            {pharmacies.map(renderPharmacyCard)}
          </View>
        )}
        
        {(selectedPharmacy || searchQuery) && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {selectedPharmacy ? 'Медицинские товары' : 'Результаты поиска'}
              </Text>
              {selectedPharmacy && (
                <TouchableOpacity 
                  style={styles.backToPharmaciesButton}
                  onPress={() => setSelectedPharmacy(null)}
                >
                  <Text style={styles.backToPharmaciesText}>К аптекам</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {medicines.length === 0 ? (
              <View style={styles.noResultsContainer}>
                <Text style={styles.noResults}>
                  {selectedPharmacy ? 'В этой аптеке нет товаров' : 'Товары не найдены'}
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.medicinesGrid}>
                  {medicines.map(renderMedicineCard)}
                </View>
                
                {selectedPharmacy && (
                  <View style={styles.pharmacyInfo}>
                    <Text style={styles.pharmacyInfoTitle}>Информация о доставке:</Text>
                    <Text style={styles.pharmacyInfoText}>Минимальная сумма заказа: {formatPrice(pharmacies.find(p => p.id === selectedPharmacy)?.minOrderAmount || 0)}</Text>
                    <Text style={styles.pharmacyInfoText}>Стоимость доставки: {formatPrice(pharmacies.find(p => p.id === selectedPharmacy)?.deliveryFee || 0)}</Text>
                  </View>
                )}
              </>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingLeft: 8,
    fontSize: 16,
  },
  cartButton: {
    position: 'relative',
    padding: 8,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  pharmacyCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPharmacy: {
    borderColor: '#007AFF',
  },
  pharmacyLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  pharmacyInfoContainer: {
    flex: 1,
  },
  pharmacyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  pharmacyAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  pharmacyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  rating: {
    marginLeft: 4,
    fontSize: 14,
    color: '#333',
  },
  deliveryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryTime: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  distance: {
    marginLeft: 4,
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  locationButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  locationButtonActive: {
    backgroundColor: '#007AFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationPermissionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  locationPermissionText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  backToPharmaciesButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  backToPharmaciesText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  medicinesGrid: {
    gap: 12,
  },
  pharmacyInfo: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  pharmacyInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  pharmacyInfoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  medicineCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
  },
  medicineImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  medicineInfo: {
    flex: 1,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  medicineDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  medicinePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    padding: 8,
  },
  quantityText: {
    marginHorizontal: 16,
    fontSize: 16,
    fontWeight: 'bold',
  },
  noResults: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  emptyCart: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyCartText: {
    marginTop: 16,
    fontSize: 18,
    color: '#666',
  },
  cartItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartItemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  cartItemPrice: {
    fontSize: 14,
    color: '#007AFF',
  },
  cartItemQuantity: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartSummary: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  checkoutButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  addressForm: {
    padding: 20,
  },
  addressHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  addressTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  addressSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  addressInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  confirmAddressButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  confirmAddressButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});