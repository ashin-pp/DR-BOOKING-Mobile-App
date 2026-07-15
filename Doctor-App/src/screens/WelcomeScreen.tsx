import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StatusBar, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { NavigationProps } from '../types/navigation.types';

const { height } = Dimensions.get('window');

export const WelcomeScreen = () => {
  const navigation = useNavigation<NavigationProps>();

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7F6]" edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F7F6" />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        
        {/* Header with Custom Logo */}
        <View className="flex-row justify-between items-center px-6 pt-3 pb-5">
          <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-full border-[1.5px] border-[#122827] items-center justify-center mr-2">
              <MaterialCommunityIcons name="leaf" size={18} color="#122827" />
            </View>
            <Text className="text-[#122827] text-2xl font-extrabold tracking-tight">Aarohcare</Text>
          </View>
          <View className="flex-row items-center space-x-5">
            <TouchableOpacity>
              <Feather name="bell" size={22} color="#122827" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Feather name="menu" size={24} color="#122827" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero Section */}
        <View className="px-5 pb-8 mt-2">
          <View 
            className="rounded-[32px] overflow-hidden bg-[#E6F0EE]"
            style={{
              height: height * 0.38,
              minHeight: 280,
              elevation: 10,
              shadowColor: '#122827',
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.15,
              shadowRadius: 16,
            }}
          >
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2753&auto=format&fit=crop' }} 
              style={{ width: '100%', height: '100%', position: 'absolute' }}
              resizeMode="cover"
            />
            <LinearGradient 
              colors={['transparent', 'rgba(18,40,39,0.5)', 'rgba(18,40,39,0.95)']} 
              style={{ position: 'absolute', width: '100%', height: '100%' }} 
            />
            
            <View className="flex-1 justify-end items-center px-6 pb-8">
              <Text className="text-white text-3xl font-black text-center mb-2 tracking-tight" style={{ textShadowColor: 'rgba(0,0,0,0.4)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 }}>
                Elite Health{'\n'}Management
              </Text>
              <Text className="text-[#D3DFDD] text-xs sm:text-sm text-center leading-relaxed font-medium px-2">
                Redefining medical wellness through clinical precision and elite concierge care. Experience seamless synergy between technology and human-centric medicine.
              </Text>
            </View>
          </View>
        </View>

        {/* Portal Cards Container */}
        <View className="px-5 space-y-6 pb-8 mt-[-10px]">
          
          {/* Patient Portal Card */}
          <View className="bg-white rounded-[32px] p-6 sm:p-8 items-center border border-[#E6F0EE]" style={{ elevation: 5, shadowColor: '#122827', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 12 }}>
            <View className="w-16 h-16 rounded-full bg-[#E8F0EF] items-center justify-center mb-4">
              <Feather name="user" size={28} color="#1E5A54" />
            </View>
            <Text className="text-[#122827] text-xl font-bold mb-2 tracking-tight text-center">Patient Portal</Text>
            <Text className="text-[#5F7371] text-center text-xs sm:text-sm leading-relaxed mb-6 px-4">
              Access your personalized wellness journey, medical records, and elite concierge support.
            </Text>
            <TouchableOpacity 
              className="w-full rounded-full overflow-hidden"
              onPress={() => navigation.navigate('Login')}
            >
              <LinearGradient colors={['#246E66', '#113935']} className="w-full py-4 items-center justify-center flex-row px-2">
                <Text className="text-white font-bold text-[13px] tracking-wide uppercase text-center w-full">Access Patient Dashboard</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Doctor Portal Card */}
          <View className="bg-white rounded-[32px] p-6 sm:p-8 items-center border border-[#E6F0EE]" style={{ elevation: 5, shadowColor: '#122827', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 12 }}>
            <View className="w-16 h-16 rounded-full bg-[#EEF0F2] items-center justify-center mb-4">
              <MaterialCommunityIcons name="stethoscope" size={30} color="#27303D" />
            </View>
            <Text className="text-[#122827] text-xl font-bold mb-2 tracking-tight text-center">Doctor Portal</Text>
            <Text className="text-[#5F7371] text-center text-xs sm:text-sm leading-relaxed mb-6 px-4">
              Empowering providers with clinical precision tools, real-time diagnostics, and patient management.
            </Text>
            <TouchableOpacity 
              className="w-full rounded-full overflow-hidden"
              onPress={() => navigation.navigate('Login')}
            >
              <LinearGradient colors={['#27303D', '#11161D']} className="w-full py-4 items-center justify-center flex-row px-2">
                <Text className="text-white font-bold text-[13px] tracking-wide uppercase text-center w-full">Enter Provider Portal</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

        </View>

        {/* Footer Features */}
        <View className="px-10 py-4 space-y-4">
          <View className="flex-row items-center justify-center">
            <View className="w-1.5 h-1.5 bg-[#246E66] rounded-full mr-3" />
            <Text className="text-[#8B9C9A] text-xs font-semibold tracking-wider uppercase">HIPAA Compliant</Text>
          </View>
          <View className="flex-row items-center justify-center">
            <Feather name="lock" size={12} color="#8B9C9A" style={{ marginRight: 8 }} />
            <Text className="text-[#8B9C9A] text-xs font-semibold tracking-wider uppercase">256-bit Encryption</Text>
          </View>
          <View className="flex-row items-center justify-center">
            <Feather name="headphones" size={12} color="#8B9C9A" style={{ marginRight: 8 }} />
            <Text className="text-[#8B9C9A] text-xs font-semibold tracking-wider uppercase">24/7 Concierge Support</Text>
          </View>
        </View>

        {/* Copyright & Links */}
        <View className="pb-12 pt-6 items-center">
          <Text className="text-[#8B9C9A] text-[10px] text-center mb-4 tracking-wide leading-relaxed">
            © 2024 Aarohcare Elite Medical Wellness.{'\n'}All rights reserved.
          </Text>
          <View className="flex-row space-x-6">
            <Text className="text-[#8B9C9A] text-[10px] font-medium tracking-wide">Privacy</Text>
            <Text className="text-[#8B9C9A] text-[10px] font-medium tracking-wide">Terms</Text>
            <Text className="text-[#8B9C9A] text-[10px] font-medium tracking-wide">Ethics</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};
