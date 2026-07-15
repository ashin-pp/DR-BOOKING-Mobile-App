import React, { useState } from 'react';
import { View, Text, SafeAreaView, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { apiClient } from '../api/client';
import { useAuthStore } from '../store/authStore';
import { NavigationProps } from '../types/navigation.types';

export const LoginScreen = () => {
  const navigation = useNavigation<NavigationProps>();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      await setAuth(response.data.token, response.data.user);
      Alert.alert('Success', 'Logged in successfully');
    } catch (error: any) {
      Alert.alert('Login Failed', error.response?.data?.error || 'An error occurred');
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
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24, justifyContent: 'center' }}>
          
          <TouchableOpacity onPress={() => navigation.goBack()} className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm shadow-[#122827]/10">
            <Feather name="arrow-left" size={20} color="#122827" />
          </TouchableOpacity>

          <View className="items-center mb-10 mt-8">
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
              onChangeText={setEmail}
            />
            <Input
              label="Password"
              placeholder="Enter your password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
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
