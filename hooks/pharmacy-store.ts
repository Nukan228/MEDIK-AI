import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Platform } from 'react-native';
import { Pharmacy, Medicine, CartItem, Order } from '@/types/medical';
import { pharmacies, sampleMedicines } from '@/data/pharmacies';

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

export const [PharmacyProvider, usePharmacy] = createContextHook(() => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [cartData, ordersData] = await Promise.all([
        storage.getItem('cart'),
        storage.getItem('orders'),
      ]);

      if (cartData) {
        setCart(JSON.parse(cartData));
      }
      if (ordersData) {
        setOrders(JSON.parse(ordersData));
      }
    } catch (error) {
      console.error('Error loading pharmacy data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addToCart = useCallback(async (medicine: Medicine, quantity: number = 1) => {
    try {
      setCart(prev => {
        const existingItem = prev.find(item => item.medicine.id === medicine.id);
        let updated: CartItem[];
        
        if (existingItem) {
          updated = prev.map(item =>
            item.medicine.id === medicine.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          updated = [...prev, { medicine, quantity }];
        }

        storage.setItem('cart', JSON.stringify(updated)).catch(error => {
          console.error('Error saving cart:', error);
        });
        return updated;
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  }, []);

  const removeFromCart = useCallback(async (medicineId: string) => {
    try {
      setCart(prev => {
        const updated = prev.filter(item => item.medicine.id !== medicineId);
        storage.setItem('cart', JSON.stringify(updated)).catch(error => {
          console.error('Error saving cart:', error);
        });
        return updated;
      });
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  }, []);

  const updateCartQuantity = useCallback(async (medicineId: string, quantity: number) => {
    try {
      setCart(prev => {
        const updated = prev.map(item =>
          item.medicine.id === medicineId
            ? { ...item, quantity: Math.max(0, quantity) }
            : item
        ).filter(item => item.quantity > 0);

        storage.setItem('cart', JSON.stringify(updated)).catch(error => {
          console.error('Error saving cart:', error);
        });
        return updated;
      });
    } catch (error) {
      console.error('Error updating cart quantity:', error);
    }
  }, []);

  const clearCart = useCallback(async () => {
    try {
      setCart([]);
      await storage.setItem('cart', JSON.stringify([]));
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  }, []);

  const createOrder = useCallback(async (
    pharmacyId: string,
    deliveryAddress: string,
    userId: string
  ): Promise<Order> => {
    try {
      const pharmacyItems = cart.filter(item => item.medicine.pharmacyId === pharmacyId);
      const totalAmount = pharmacyItems.reduce(
        (sum, item) => sum + (item.medicine.price * item.quantity),
        0
      );

      const pharmacy = pharmacies.find(p => p.id === pharmacyId);
      const deliveryFee = pharmacy?.deliveryFee || 0;

      const order: Order = {
        id: Date.now().toString(),
        userId,
        pharmacyId,
        items: pharmacyItems,
        totalAmount: totalAmount + deliveryFee,
        deliveryAddress,
        status: 'pending',
        createdAt: new Date().toISOString(),
        estimatedDelivery: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
        trackingNumber: `TRK${Date.now()}`,
      };

      setOrders(prev => {
        const updated = [...prev, order];
        storage.setItem('orders', JSON.stringify(updated)).catch(error => {
          console.error('Error saving orders:', error);
        });
        return updated;
      });

      // Remove ordered items from cart
      setCart(prev => {
        const updated = prev.filter(item => item.medicine.pharmacyId !== pharmacyId);
        storage.setItem('cart', JSON.stringify(updated)).catch(error => {
          console.error('Error saving cart:', error);
        });
        return updated;
      });

      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }, [cart]);

  const getPharmacies = useCallback(() => {
    return pharmacies;
  }, []);

  const getMedicines = useCallback((pharmacyId?: string) => {
    if (pharmacyId) {
      return sampleMedicines.filter(medicine => medicine.pharmacyId === pharmacyId);
    }
    return sampleMedicines;
  }, []);

  const searchMedicines = useCallback((query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return sampleMedicines.filter(medicine =>
      medicine.name.toLowerCase().includes(lowercaseQuery) ||
      medicine.nameKz.toLowerCase().includes(lowercaseQuery) ||
      medicine.description.toLowerCase().includes(lowercaseQuery) ||
      medicine.category.toLowerCase().includes(lowercaseQuery)
    );
  }, []);

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.medicine.price * item.quantity), 0);
  }, [cart]);

  const cartItemsCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  return useMemo(() => ({
    cart,
    orders,
    isLoading,
    cartTotal,
    cartItemsCount,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    createOrder,
    getPharmacies,
    getMedicines,
    searchMedicines,
  }), [
    cart,
    orders,
    isLoading,
    cartTotal,
    cartItemsCount,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    createOrder,
    getPharmacies,
    getMedicines,
    searchMedicines,
  ]);
});