import React, { useState } from 'react';
import { View, Text, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { authService } from '../api/authService';
import { useAuthStore } from '../store/authStore';
import { NavigationProps } from '../types/navigation.types';
import { UserRole } from '../constants/enums';
import { SPECIALIZATIONS } from '../constants/specializations';

export const RegisterScreen = () => {
  const navigation = useNavigation<NavigationProps>();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const [role, setRole] = useState<UserRole>(UserRole.PATIENT);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const filteredSpecializations = SPECIALIZATIONS.filter(s => 
    s.toLowerCase().includes(specialization.toLowerCase()) && s !== specialization
  );

  const handleRegister = async () => {
    setErrors({});
    let newErrors: any = {};

    if (!name) newErrors.name = 'Name is required';
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    
    if (role === UserRole.DOCTOR && !specialization) {
      newErrors.specialization = 'Specialization is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const payload: any = { name, email, password, role, phone };
      if (role === UserRole.DOCTOR) {
        payload.specialization = specialization;
      }

      const response = await authService.register(payload);
      await setAuth(response.data.token, response.data.refreshToken, response.data.user);
      Alert.alert('Success', 'Account created successfully');
    } catch (error: any) {
      console.log('Registration Error Details:', error.response?.data || error.message || error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'An error occurred';
      Alert.alert('Registration Failed', errorMessage);
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

        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: 24, justifyContent: 'center' }}>
          
          <View className="items-center mb-6">
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
              <Input label="Full Name" placeholder="John Doe" value={name} onChangeText={(t) => {setName(t); setErrors((e:any)=>({...e, name:undefined}))}} error={errors.name} />
              <Input label="Email Address" placeholder="john@example.com" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={(t) => {setEmail(t); setErrors((e:any)=>({...e, email:undefined}))}} error={errors.email} />
              <Input label="Phone Number" placeholder="+1 (555) 000-0000" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
              
              {role === UserRole.DOCTOR && (
                <View className="z-10 relative">
                  <Input 
                    label="Specialization" 
                    placeholder="e.g. Cardiologist" 
                    value={specialization} 
                    onChangeText={(t) => {
                      setSpecialization(t); 
                      setShowSuggestions(true);
                      setErrors((e:any)=>({...e, specialization:undefined}));
                    }} 
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    error={errors.specialization} 
                  />
                  {showSuggestions && specialization.length > 0 && filteredSpecializations.length > 0 && (
                    <View className="bg-white border border-[#E6F0EE] rounded-[16px] mb-4 overflow-hidden -mt-2" style={{ elevation: 5, shadowColor: '#122827', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 }}>
                      <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled" style={{ maxHeight: 150 }}>
                        {filteredSpecializations.map((spec, index) => (
                          <TouchableOpacity 
                            key={index}
                            onPress={() => {
                              setSpecialization(spec);
                              setShowSuggestions(false);
                            }}
                            className={`px-4 py-3 ${index !== filteredSpecializations.length - 1 ? 'border-b border-[#F5F7F6]' : ''}`}
                          >
                            <Text className="text-[#122827] font-bold text-sm">{spec}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>
              )}

              <Input label="Password" placeholder="Create a strong password" isPassword value={password} onChangeText={(t) => {setPassword(t); setErrors((e:any)=>({...e, password:undefined}))}} error={errors.password} />
              <Input label="Confirm Password" placeholder="Repeat your password" isPassword value={confirmPassword} onChangeText={(t) => {setConfirmPassword(t); setErrors((e:any)=>({...e, confirmPassword:undefined}))}} error={errors.confirmPassword} marginBottom={false} />
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
