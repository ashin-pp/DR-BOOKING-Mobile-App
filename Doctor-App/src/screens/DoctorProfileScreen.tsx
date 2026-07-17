import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions, KeyboardAvoidingView, Platform, Modal, Image } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../store/authStore';
import { userService } from '../api/userService';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import { SPECIALIZATIONS } from '../constants/specializations';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

export const DoctorProfileScreen = () => {
  const { user, setUser, logout } = useAuthStore();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState(user?.name || '');
  const [specialization, setSpecialization] = useState(user?.specialization || '');
  const [experience, setExperience] = useState(user?.experience?.toString() || '');
  const [consultationFee, setConsultationFee] = useState(user?.consultationFee?.toString() || '');
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [imageBase64, setImageBase64] = useState('');
  const [loading, setLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSpecializations = SPECIALIZATIONS.filter(s => 
    s.toLowerCase().includes(specialization.toLowerCase()) && s !== specialization
  );

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const payload: any = {
        name,
        specialization,
        experience: experience ? parseInt(experience) : 0,
        consultationFee: consultationFee ? parseInt(consultationFee) : 0,
      };
      if (imageBase64) {
        payload.imageBase64 = imageBase64;
      }
      const res = await userService.updateProfile(payload);
      await setUser(res.data.user);
      Toast.show({
        type: 'success',
        text1: 'Profile Updated',
        text2: 'Your doctor profile has been saved.',
        position: 'top',
        topOffset: 60,
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: error.response?.data?.message || 'Could not update profile',
        position: 'top',
        topOffset: 60,
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Toast.show({ type: 'error', text1: 'Permission Denied', text2: 'Sorry, we need camera roll permissions to make this work!' });
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      const base64Str = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setImageBase64(base64Str);
      setProfileImage(result.assets[0].uri);

      // Auto-save the image
      try {
        setIsUploadingAvatar(true);
        const res = await userService.updateProfile({ imageBase64: base64Str });
        await setUser(res.data.user);
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Avatar updated successfully',
          position: 'top',
          topOffset: 60,
        });
      } catch (error: any) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error.response?.data?.message || 'Failed to update avatar',
          position: 'top',
          topOffset: 60,
        });
      } finally {
        setIsUploadingAvatar(false);
      }
    }
  };

  return (
    <View className="flex-1 bg-[#F5F7F6]">
      {/* Background Header */}
      <View className="absolute top-0 w-full h-[280px] bg-[#246E66] rounded-b-[60px]" style={{ elevation: 20, shadowColor: '#122827', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20 }} />

      <SafeAreaView className="flex-1">
        {/* Header Nav */}
        <View className="flex-row items-center justify-between px-6 py-4">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 rounded-full bg-white/10 items-center justify-center border border-white/20">
              <Feather name="chevron-left" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold tracking-widest ml-4">Edit Profile</Text>
          </View>
          <TouchableOpacity 
            className="flex-row items-center px-4 py-2 rounded-full bg-white/10 border border-white/20"
            onPress={() => setShowLogoutModal(true)}
          >
            <Feather name="log-out" size={14} color="#FFFFFF" />
            <Text className="text-white font-bold text-[11px] ml-1.5 tracking-widest uppercase">Sign Out</Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40, paddingTop: 40 }}>
            
            {/* Profile Card */}
            <View className="bg-white rounded-[40px] p-6 pt-16 mt-8 items-center mb-6" style={{ elevation: 15, shadowColor: '#122827', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20 }}>
            {/* Floating Avatar */}
            <TouchableOpacity onPress={handlePickImage} activeOpacity={0.8} className="absolute -top-14 w-28 h-28 rounded-full bg-[#122827] items-center justify-center border-4 border-white shadow-xl overflow-hidden">
              <View className="w-full h-full rounded-full bg-[#F5F7F6] items-center justify-center overflow-hidden border-[3px] border-[#F5F7F6]">
                {isUploadingAvatar ? (
                  <ActivityIndicator size="large" color="#122827" />
                ) : profileImage ? (
                  <Image source={{ uri: profileImage }} className="w-full h-full" resizeMode="cover" />
                ) : (
                  <Feather name="user" size={48} color="#8B9C9A" />
                )}
              </View>
              <View className="absolute bottom-0 right-0 bg-black/40 w-full h-8 items-center justify-center">
                <Feather name="camera" size={14} color="white" />
              </View>
            </TouchableOpacity>

            <Text className="text-[#122827] text-2xl font-black mb-1">Dr. {name}</Text>
            <Text className="text-[#5F7371] text-xs font-bold uppercase tracking-widest mb-8">{user?.email}</Text>

            {/* Inputs */}
            <View className="w-full space-y-4">
              <View>
                <Text className="text-[#122827] font-bold text-xs uppercase tracking-wider mb-2 ml-1">Full Name</Text>
                <View className="flex-row items-center bg-[#F5F7F6] rounded-2xl px-4 py-4 border border-[#E6F0EE]">
                  <View className="w-8 h-8 rounded-full bg-white items-center justify-center mr-3 shadow-sm">
                    <Feather name="user" size={14} color="#246E66" />
                  </View>
                  <TextInput className="flex-1 text-[#122827] font-bold text-base" value={name} onChangeText={setName} placeholder="Your Name" placeholderTextColor="#8B9C9A" />
                </View>
              </View>

              <View className="z-10">
                <Text className="text-[#122827] font-bold text-xs uppercase tracking-wider mb-2 ml-1 mt-4">Specialization</Text>
                <View className="flex-row items-center bg-[#F5F7F6] rounded-2xl px-4 py-4 border border-[#E6F0EE]">
                  <View className="w-8 h-8 rounded-full bg-white items-center justify-center mr-3 shadow-sm">
                    <MaterialCommunityIcons name="stethoscope" size={14} color="#246E66" />
                  </View>
                  <TextInput 
                    className="flex-1 text-[#122827] font-bold text-base" 
                    value={specialization} 
                    onChangeText={(t) => {
                      setSpecialization(t);
                      setShowSuggestions(true);
                    }} 
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    placeholder="e.g. Cardiologist" 
                    placeholderTextColor="#8B9C9A" 
                  />
                </View>
                {showSuggestions && specialization.length > 0 && filteredSpecializations.length > 0 && (
                  <View className="bg-white border border-[#E6F0EE] rounded-[16px] mt-2 overflow-hidden" style={{ elevation: 5, shadowColor: '#122827', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 }}>
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

              <View className="flex-row space-x-4 mt-4">
                <View className="flex-1">
                  <Text className="text-[#122827] font-bold text-xs uppercase tracking-wider mb-2 ml-1">Experience (Yrs)</Text>
                  <View className="flex-row items-center bg-[#F5F7F6] rounded-2xl px-4 py-4 border border-[#E6F0EE]">
                    <TextInput className="flex-1 text-[#122827] font-bold text-base text-center" value={experience} onChangeText={setExperience} keyboardType="numeric" placeholder="10" placeholderTextColor="#8B9C9A" />
                  </View>
                </View>
                <View className="flex-1">
                  <Text className="text-[#122827] font-bold text-xs uppercase tracking-wider mb-2 ml-1">Fee ($)</Text>
                  <View className="flex-row items-center bg-[#F5F7F6] rounded-2xl px-4 py-4 border border-[#E6F0EE]">
                    <TextInput className="flex-1 text-[#122827] font-bold text-base text-center" value={consultationFee} onChangeText={setConsultationFee} keyboardType="numeric" placeholder="150" placeholderTextColor="#8B9C9A" />
                  </View>
                </View>
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity onPress={handleUpdate} disabled={loading} className="w-full mt-8 rounded-full overflow-hidden" style={{ elevation: 8, shadowColor: '#246E66', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12 }}>
              <LinearGradient colors={['#246E66', '#113935']} className="w-full py-4 items-center justify-center flex-row">
                {loading ? <ActivityIndicator color="white" /> : (
                  <>
                    <Text className="text-white font-bold text-sm tracking-widest uppercase mr-2">Save Profile</Text>
                    <Feather name="check" size={16} color="white" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Modern Custom Logout Confirmation Modal */}
        <Modal
          visible={showLogoutModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowLogoutModal(false)}
        >
          <View className="flex-1 bg-black/60 items-center justify-center px-6">
            <View className="bg-white w-full rounded-[32px] p-8 items-center shadow-2xl">
              <View className="w-20 h-20 rounded-full bg-red-50 items-center justify-center mb-5">
                <Feather name="log-out" size={32} color="#EF4444" />
              </View>
              <Text className="text-[#0F172A] text-[22px] font-black mb-3 tracking-tight">Sign Out</Text>
              <Text className="text-[#64748B] text-center text-base mb-8 leading-6 px-2">
                Are you sure you want to securely log out of your doctor portal?
              </Text>
              
              <View className="flex-row w-full space-x-4">
                <TouchableOpacity 
                  className="flex-1 bg-[#F1F5F9] rounded-2xl py-4 items-center justify-center"
                  onPress={() => setShowLogoutModal(false)}
                >
                  <Text className="text-[#64748B] font-bold text-[15px]">Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  className="flex-1 bg-[#EF4444] rounded-2xl py-4 items-center justify-center shadow-md shadow-red-500/30"
                  onPress={() => {
                    setShowLogoutModal(false);
                    logout();
                  }}
                >
                  <Text className="text-white font-bold text-[15px]">Sign Out</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </SafeAreaView>
    </View>
  );
};
