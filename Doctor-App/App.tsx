import 'react-native-screens';
import React from 'react';
import { View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { RootNavigator } from './src/navigation/RootNavigator';
import Toast from 'react-native-toast-message';
import { Feather } from '@expo/vector-icons';

const toastConfig = {
  success: ({ text1, text2 }: any) => (
    <View 
      className="flex-row items-center bg-[#0F1C1B] px-5 py-4 rounded-[20px] border border-[#246E66]/40 shadow-xl w-[90%] mt-2"
      style={{ elevation: 15, shadowColor: '#000000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.3, shadowRadius: 20 }}
    >
      <View className="w-11 h-11 rounded-full bg-[#10B981]/20 items-center justify-center mr-4 border border-[#10B981]/30">
        <Feather name="check" size={20} color="#34D399" />
      </View>
      <View className="flex-1">
        <Text className="text-white font-bold text-[15px] tracking-wide mb-0.5">{text1}</Text>
        {text2 && <Text className="text-white/60 text-[13px]">{text2}</Text>}
      </View>
    </View>
  ),
  error: ({ text1, text2 }: any) => (
    <View 
      className="flex-row items-center bg-[#0F1C1B] px-5 py-4 rounded-[20px] border border-[#EF4444]/40 shadow-xl w-[90%] mt-2"
      style={{ elevation: 15, shadowColor: '#000000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.3, shadowRadius: 20 }}
    >
      <View className="w-11 h-11 rounded-full bg-[#EF4444]/20 items-center justify-center mr-4 border border-[#EF4444]/30">
        <Feather name="alert-circle" size={20} color="#F87171" />
      </View>
      <View className="flex-1">
        <Text className="text-white font-bold text-[15px] tracking-wide mb-0.5">{text1}</Text>
        {text2 && <Text className="text-white/60 text-[13px]">{text2}</Text>}
      </View>
    </View>
  )
};

import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <RootNavigator />
      <Toast config={toastConfig} />
    </SafeAreaProvider>
  );
}
