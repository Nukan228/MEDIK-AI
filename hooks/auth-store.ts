import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Platform } from 'react-native';
import { User, AuthState } from '@/types/medical';

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
  removeItem: async (key: string) => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      return AsyncStorage.removeItem(key);
    }
  },
};

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const loadUser = useCallback(async () => {
    try {
      const userData = await storage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Error loading user:', error);
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(async (user: User) => {
    try {
      await storage.setItem('user', JSON.stringify(user));
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await storage.removeItem('user');
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }, []);

  const updateUser = useCallback(async (updates: Partial<User>) => {
    if (!authState.user) return;
    
    try {
      const updatedUser = { ...authState.user, ...updates };
      await storage.setItem('user', JSON.stringify(updatedUser));
      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
      }));
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }, [authState.user]);

  const verifyEDSKey = useCallback(async (keyData: string): Promise<boolean> => {
    try {
      // Simulate EDS key verification with AI
      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are an EDS (Electronic Digital Signature) key validator. Analyze the provided key data and determine if it appears to be a valid EDS key format. Return only "VALID" or "INVALID" with a brief reason.'
            },
            {
              role: 'user',
              content: `Validate this EDS key data: ${keyData}`
            }
          ]
        })
      });

      const result = await response.json();
      return result.completion.includes('VALID');
    } catch (error) {
      console.error('Error verifying EDS key:', error);
      return false;
    }
  }, []);

  const verifyDoctorCertificate = useCallback(async (certificateImage: string): Promise<boolean> => {
    try {
      // Use AI to verify doctor certificate
      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are a medical certificate validator. Analyze the provided certificate image and determine if it appears to be a legitimate medical license or certificate. Look for official seals, proper formatting, and medical institution details. Return only "VALID" or "INVALID" with a brief reason.'
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Please verify this medical certificate:'
                },
                {
                  type: 'image',
                  image: certificateImage
                }
              ]
            }
          ]
        })
      });

      const result = await response.json();
      return result.completion.includes('VALID');
    } catch (error) {
      console.error('Error verifying certificate:', error);
      return false;
    }
  }, []);

  return useMemo(() => ({
    ...authState,
    login,
    logout,
    updateUser,
    verifyEDSKey,
    verifyDoctorCertificate,
  }), [authState, login, logout, updateUser, verifyEDSKey, verifyDoctorCertificate]);
});