import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, Text } from 'react-native';
import { useAuthStore } from '../store/authStore';

import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { UserRole } from '../constants/enums';

// Placeholders for Phase 3 and 4
const PatientHome = () => <View className="flex-1 items-center justify-center bg-[#F5F7F6]"><Text className="text-[#122827] text-lg font-bold">Patient Home</Text></View>;
const DoctorHome = () => <View className="flex-1 items-center justify-center bg-[#F5F7F6]"><Text className="text-[#122827] text-lg font-bold">Doctor Home</Text></View>;

const Stack = createNativeStackNavigator();

export const RootNavigator = () => {
  const { token, user, isLoading, loadStorage } = useAuthStore();

  useEffect(() => {
    loadStorage();
  }, []);

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#F5F7F6] items-center justify-center">
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
          <Stack.Screen name="DoctorHome" component={DoctorHome} />
        ) : (
          // Patient Stack
          <Stack.Screen name="PatientHome" component={PatientHome} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
