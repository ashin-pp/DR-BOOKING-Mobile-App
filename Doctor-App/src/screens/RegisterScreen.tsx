import React, { useState } from 'react';
import { View, Text, SafeAreaView, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { apiClient } from '../api/client';
import { useAuthStore } from '../store/authStore';
import { NavigationProps } from '../types/navigation.types';
import { UserRole } from '../constants/enums';

export const RegisterScreen = () => {
  const navigation = useNavigation<NavigationProps>();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const [role, setRole] = useState<UserRole>(UserRole.PATIENT);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (role === UserRole.DOCTOR && !specialization) {
      Alert.alert('Error', 'Please enter your specialization');
      return;
    }

    setLoading(true);
    try {
      const payload: any = { name, email, password, role, phone };
      if (role === UserRole.DOCTOR) {
        payload.specialization = specialization;
      }

      const response = await apiClient.post('/auth/register', payload);
      await setAuth(response.data.token, response.data.user);
      Alert.alert('Success', 'Account created successfully');
    } catch (error: any) {
      Alert.alert('Registration Failed', error.response?.data?.error || 'An error occurred');
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

          <View className="items-center mb-8 mt-8">
            <View className="w-14 h-14 rounded-full border-[1.5px] border-[#122827] items-center justify-center mb-4">
              <MaterialCommunityIcons name="leaf" size={26} color="#122827" />
            </View>
            <Text className="text-[#122827] text-3xl font-extrabold mb-2 tracking-tight">Create Account</Text>
            <Text className="text-[#5F7371] text-sm text-center px-4 leading-relaxed">
              Join Aarohcare to access personalized healthcare and elite concierge support.
            </Text>
          </View>

          <View className="bg-white p-6 rounded-[32px] shadow-lg shadow-[#122827]/5 border border-[#E6F0EE] mb-6">
            
            {/* Role Selector */}
            <View className="flex-row bg-[#F5F7F6] p-1 rounded-full mb-8 border border-[#E6F0EE]">
              <TouchableOpacity 
                className={`flex-1 py-3 rounded-full items-center ${role === UserRole.PATIENT ? 'bg-white shadow-sm shadow-[#122827]/10' : ''}`}
                onPress={() => setRole(UserRole.PATIENT)}
              >
                <Text className={`font-bold text-xs tracking-wide uppercase ${role === UserRole.PATIENT ? 'text-[#122827]' : 'text-[#8B9C9A]'}`}>Patient</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className={`flex-1 py-3 rounded-full items-center ${role === UserRole.DOCTOR ? 'bg-white shadow-sm shadow-[#122827]/10' : ''}`}
                onPress={() => setRole(UserRole.DOCTOR)}
              >
                <Text className={`font-bold text-xs tracking-wide uppercase ${role === UserRole.DOCTOR ? 'text-[#122827]' : 'text-[#8B9C9A]'}`}>Doctor</Text>
              </TouchableOpacity>
            </View>

            <View className="space-y-1">
              <Input label="Full Name" placeholder="John Doe" value={name} onChangeText={setName} />
              <Input label="Email Address" placeholder="john@example.com" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
              <Input label="Phone Number" placeholder="+1 (555) 000-0000" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
              
              {role === UserRole.DOCTOR && (
                <Input label="Specialization" placeholder="e.g. Cardiologist" value={specialization} onChangeText={setSpecialization} />
              )}

              <Input label="Password" placeholder="Create a strong password" secureTextEntry value={password} onChangeText={setPassword} marginBottom={false} />
            </View>

            <View className="mt-8">
              <Button
                title={loading ? "Creating Account..." : "Create Account"}
                onPress={handleRegister}
                disabled={loading}
                variant="primary"
              />
            </View>
          </View>

          <View className="flex-row justify-center mt-2 mb-4">
            <Text className="text-[#8B9C9A] text-sm">Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text className="text-[#246E66] font-bold text-sm">Sign In</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
