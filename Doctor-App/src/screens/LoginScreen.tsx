import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { authService } from '../api/authService';
import { useAuthStore } from '../store/authStore';
import { NavigationProps } from '../types/navigation.types';

export const LoginScreen = () => {
  const navigation = useNavigation<NavigationProps>();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{email?: string, password?: string}>({});

  const handleLogin = async () => {
    // Reset errors
    setErrors({});
    let newErrors: any = {};
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await authService.login({ email, password });
      await setAuth(response.data.token, response.data.refreshToken, response.data.user);
      Toast.show({
        type: 'success',
        text1: 'Welcome Back! 👋',
        text2: 'You have logged in successfully.',
        position: 'top',
        topOffset: 60,
      });
    } catch (error: any) {
      console.log('Login Error Details:', error.response?.data || error.message || error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'An error occurred';
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: errorMessage,
        position: 'top',
        topOffset: 60,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7F6]">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="px-6 pt-4 pb-2 z-10">
          <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm shadow-[#122827]/10 border border-[#E6F0EE]">
            <Feather name="arrow-left" size={20} color="#122827" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: 24, justifyContent: 'center' }}>
          
          <View className="items-center mb-8">
            <View className="w-16 h-16 rounded-full border-[1.5px] border-[#122827] items-center justify-center mb-6">
              <MaterialCommunityIcons name="leaf" size={32} color="#122827" />
            </View>
            <Text className="text-[#122827] text-3xl font-extrabold mb-3 tracking-tight">Welcome Back</Text>
            <Text className="text-[#5F7371] text-sm text-center px-4 leading-relaxed">
              Sign in securely to continue managing your health and appointments.
            </Text>
          </View>

          <View className="bg-white p-6 rounded-[32px] shadow-lg shadow-[#122827]/5 border border-[#E6F0EE] mb-6 space-y-2">
            <Input
              label="Email Address"
              placeholder="john@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={(text) => { setEmail(text); setErrors(e => ({...e, email: undefined})); }}
              error={errors.email}
            />
            <Input
              label="Password"
              placeholder="Enter your password"
              isPassword
              value={password}
              onChangeText={(text) => { setPassword(text); setErrors(e => ({...e, password: undefined})); }}
              error={errors.password}
            />
            
            <TouchableOpacity className="items-end mt-2 mb-6">
              <Text className="text-[#246E66] font-semibold text-xs">Forgot Password?</Text>
            </TouchableOpacity>

            <Button
              title={loading ? "Authenticating..." : "Sign In"}
              onPress={handleLogin}
              disabled={loading}
              variant="primary"
            />
          </View>

          <View className="flex-row justify-center mt-2">
            <Text className="text-[#8B9C9A] text-sm">Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text className="text-[#246E66] font-bold text-sm">Register</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
