import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { User, AuthState } from '../types/user.types';

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isLoading: true,

  setAuth: async (token: string, refreshToken: string, user: User) => {
    await SecureStore.setItemAsync('refreshToken', refreshToken);
    await AsyncStorage.setItem('user', JSON.stringify(user));
    set({ token, user });
  },

  setToken: (token: string) => {
    set({ token });
  },

  setUser: async (user: User) => {
    await AsyncStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('refreshToken');
    await AsyncStorage.removeItem('user');
    set({ token: null, user: null });
  },

  loadStorage: async () => {
    try {
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      const userStr = await AsyncStorage.getItem('user');
      
      if (refreshToken && userStr) {
        // Try to get a new access token
        try {
          const response = await fetch('https://dr-booking-backend-qzs4.onrender.com/api/auth/refresh', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
          });

          if (response.ok) {
            const data = await response.json();
            set({ token: data.token, user: JSON.parse(userStr), isLoading: false });
          } else {
            // Refresh token is invalid or expired
            await SecureStore.deleteItemAsync('refreshToken');
            await AsyncStorage.removeItem('user');
            set({ isLoading: false, token: null, user: null });
          }
        } catch (error) {
          // Network error, maybe allow offline access or just logout
          set({ isLoading: false });
        }
      } else {
        set({ isLoading: false });
      }
    } catch (e) {
      set({ isLoading: false });
    }
  },
}));
