import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';

import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { PatientHomeScreen } from '../screens/PatientHomeScreen';
import { PatientProfileScreen } from '../screens/PatientProfileScreen';
import { BookAppointmentScreen } from '../screens/BookAppointmentScreen';
import { PatientAppointmentsScreen } from '../screens/PatientAppointmentsScreen';
import { AllDoctorsScreen } from '../screens/AllDoctorsScreen';
import { DoctorHomeScreen } from '../screens/DoctorHomeScreen';
import { DoctorProfileScreen } from '../screens/DoctorProfileScreen';
import { DoctorAppointmentsScreen } from '../screens/DoctorAppointmentsScreen';
import { DoctorAnalyticsScreen } from '../screens/DoctorAnalyticsScreen';
import { UserRole } from '../constants/enums';

const Stack = createNativeStackNavigator();

export const RootNavigator = () => {
  const { token, user, isLoading, loadStorage } = useAuthStore();

  useEffect(() => {
    loadStorage();
  }, []);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#F5F7F6]">
        {/* Custom Aarohcare Logo Loader */}
        <View className="items-center mb-8">
          <View className="w-16 h-16 rounded-full border-[2.5px] border-[#122827] items-center justify-center mb-4 bg-white/50" style={{ elevation: 5, shadowColor: '#122827', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 }}>
            <MaterialCommunityIcons name="stethoscope" size={36} color="#122827" />
          </View>
          <Text className="text-[#122827] text-3xl font-black tracking-tighter">Aarohcare</Text>
          <Text className="text-[#5F7371] text-[10px] font-bold tracking-[3px] uppercase mt-1">Elite Medical Wellness</Text>
        </View>
        <ActivityIndicator size="large" color="#246E66" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#F5F7F6' } }}>
        {!token ? (
          // Auth Stack
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : user?.role === UserRole.DOCTOR ? (
          // Doctor Stack
          <>
            <Stack.Screen name="DoctorHome" component={DoctorHomeScreen} />
            <Stack.Screen name="DoctorProfile" component={DoctorProfileScreen} />
            <Stack.Screen name="DoctorAppointments" component={DoctorAppointmentsScreen} />
            <Stack.Screen name="DoctorAnalytics" component={DoctorAnalyticsScreen} />
          </>
        ) : (
          // Patient Stack
          <>
            <Stack.Screen name="PatientHome" component={PatientHomeScreen} />
            <Stack.Screen name="PatientProfile" component={PatientProfileScreen} />
            <Stack.Screen name="BookAppointment" component={BookAppointmentScreen} />
            <Stack.Screen name="PatientAppointments" component={PatientAppointmentsScreen} />
            <Stack.Screen name="AllDoctors" component={AllDoctorsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
