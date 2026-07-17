import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Dimensions, StatusBar, Image, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../store/authStore';
import { userService } from '../api/userService';
import * as ImagePicker from 'expo-image-picker';

const { height } = Dimensions.get('window');

export const PatientProfileScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user, setUser, logout } = useAuthStore();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [age, setAge] = useState(user?.age?.toString() || '');
  const [bloodGroup, setBloodGroup] = useState(user?.bloodGroup || '');
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [imageBase64, setImageBase64] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Name Required',
        text2: 'Please enter your full name.',
        position: 'top',
        topOffset: 60,
      });
      return;
    }

    setIsSaving(true);
    try {
      const payload: any = {
        name, 
        phone,
        age: age ? parseInt(age) : null,
        bloodGroup
      };
      
      if (imageBase64) {
        payload.imageBase64 = imageBase64;
      }

      const response = await userService.updateProfile(payload);
      await setUser(response.data.user);
      Toast.show({
        type: 'success',
        text1: 'Profile Updated',
        text2: 'Your personal information has been successfully saved.',
        position: 'top',
        topOffset: 60,
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: error.response?.data?.message || 'Failed to update profile',
        position: 'top',
        topOffset: 60,
      });
    } finally {
      setIsSaving(false);
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
    <View className="flex-1 bg-[#F8FAFA]">
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Deep Teal Top Background */}
      <View
        className="absolute top-0 w-full bg-[#246E66]"
        style={{ height: height * 0.4, borderBottomLeftRadius: 60, borderBottomRightRadius: 60 }}
      />

      {/* Header Nav */}
      <View className="flex-row items-center justify-between px-6 z-10" style={{ marginTop: insets.top + 20 }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-12 h-12 rounded-2xl bg-white/10 items-center justify-center border border-white/20"
        >
          <Feather name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold tracking-widest">My Profile</Text>
        <TouchableOpacity 
          className="flex-row items-center px-4 py-2 rounded-full bg-[#246E66] border border-[#113935]"
          style={{ elevation: 5, shadowColor: '#246E66', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 }}
          onPress={() => setShowLogoutModal(true)}
        >
          <Feather name="log-out" size={14} color="#FFFFFF" />
          <Text className="text-white font-bold text-[11px] ml-1.5 tracking-widest uppercase">Sign Out</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView
          contentContainerStyle={{ paddingBottom: 80, paddingTop: 60 }}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
        {/* Main Profile Card */}
        <View
          className="bg-white mx-6 rounded-[40px] px-6 pb-8 pt-20 mt-10 items-center"
          style={{
            elevation: 15,
            shadowColor: '#122827',
            shadowOffset: { width: 0, height: 20 },
            shadowOpacity: 0.08,
            shadowRadius: 30
          }}
        >
          {/* Avatar floating above the card */}
          <View className="absolute -top-20 items-center">
            <View
              className="w-36 h-36 rounded-full bg-white p-2"
              style={{ elevation: 10, shadowColor: '#122827', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 15 }}
            >
              <View className="flex-1 rounded-full bg-[#E8F0EF] items-center justify-center overflow-hidden border-2 border-[#E8F0EF]">
                {isUploadingAvatar ? (
                  <ActivityIndicator size="large" color="#246E66" />
                ) : profileImage ? (
                  <Image source={{ uri: profileImage }} className="w-full h-full" resizeMode="cover" />
                ) : (
                  <Feather name="user" size={56} color="#246E66" />
                )}
              </View>
              <TouchableOpacity
                onPress={handlePickImage}
                className="absolute bottom-2 right-2 bg-[#246E66] w-10 h-10 rounded-full items-center justify-center border-[3px] border-white"
              >
                <Feather name="camera" size={16} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          <Text className="text-[#122827] text-2xl font-black tracking-tight mt-6 mb-1">{user?.name || 'Patient'}</Text>
          <Text className="text-[#8B9C9A] text-sm font-semibold uppercase tracking-widest mb-8">{user?.role || 'Patient'}</Text>

          {/* Form Fields */}
          <View className="w-full space-y-5">

            {/* Name Input */}
            <View>
              <Text className="text-[#113935] font-bold text-[13px] uppercase tracking-wider mb-2 ml-2">Full Name</Text>
              <View className="flex-row items-center bg-[#F8FAFA] rounded-[24px] px-5 py-4 border border-[#EAEFEF]">
                <View className="bg-white w-10 h-10 rounded-xl items-center justify-center shadow-sm">
                  <Feather name="user" size={18} color="#246E66" />
                </View>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your full name"
                  className="flex-1 ml-4 text-[#122827] text-base font-bold"
                  placeholderTextColor="#8B9C9A"
                />
              </View>
            </View>

            {/* Phone Input */}
            <View>
              <Text className="text-[#113935] font-bold text-[13px] uppercase tracking-wider mb-2 ml-2">Phone Number</Text>
              <View className="flex-row items-center bg-[#F8FAFA] rounded-[24px] px-5 py-4 border border-[#EAEFEF]">
                <View className="bg-white w-10 h-10 rounded-xl items-center justify-center shadow-sm">
                  <Feather name="phone" size={18} color="#246E66" />
                </View>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Enter your phone number"
                  keyboardType="phone-pad"
                  className="flex-1 ml-4 text-[#122827] text-base font-bold"
                  placeholderTextColor="#8B9C9A"
                />
              </View>
            </View>

            {/* Age & Blood Group Row */}
            <View className="flex-row space-x-4">
              <View className="flex-1">
                <Text className="text-[#113935] font-bold text-[13px] uppercase tracking-wider mb-2 ml-2">Age</Text>
                <View className="flex-row items-center bg-[#F8FAFA] rounded-[24px] px-5 py-4 border border-[#EAEFEF]">
                  <TextInput
                    value={age}
                    onChangeText={setAge}
                    placeholder="e.g. 28"
                    keyboardType="numeric"
                    className="flex-1 text-[#122827] text-base font-bold text-center"
                    placeholderTextColor="#8B9C9A"
                  />
                </View>
              </View>

              <View className="flex-1">
                <Text className="text-[#113935] font-bold text-[13px] uppercase tracking-wider mb-2 ml-2">Blood Type</Text>
                <View className="flex-row items-center bg-[#F8FAFA] rounded-[24px] px-5 py-4 border border-[#EAEFEF]">
                  <TextInput
                    value={bloodGroup}
                    onChangeText={(text) => setBloodGroup(text.toUpperCase())}
                    placeholder="e.g. O+"
                    maxLength={3}
                    className="flex-1 text-[#122827] text-base font-bold text-center uppercase"
                    placeholderTextColor="#8B9C9A"
                  />
                </View>
              </View>
            </View>

            {/* Email Input */}
            <View>
              <Text className="text-[#113935] font-bold text-[13px] uppercase tracking-wider mb-2 ml-2">Email Address</Text>
              <View className="flex-row items-center bg-[#F0F4F4] rounded-[24px] px-5 py-4 border border-[#EAEFEF]">
                <View className="bg-white w-10 h-10 rounded-xl items-center justify-center shadow-sm opacity-60">
                  <MaterialCommunityIcons name="email-outline" size={18} color="#8B9C9A" />
                </View>
                <TextInput
                  value={user?.email}
                  editable={false}
                  className="flex-1 ml-4 text-[#8B9C9A] text-base font-bold"
                />
                <Feather name="lock" size={16} color="#8B9C9A" className="ml-2 opacity-50" />
              </View>
            </View>

          </View>

          {/* Save Button */}
          <TouchableOpacity
            className="w-full mt-10 rounded-3xl overflow-hidden shadow-lg shadow-[#246E66]/40"
            onPress={handleSave}
            disabled={isSaving}
          >
            <LinearGradient
              colors={['#246E66', '#1A4D47']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="py-5 items-center justify-center flex-row"
            >
              {isSaving ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-black text-lg tracking-wider">SAVE CHANGES</Text>
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
              Are you sure you want to securely log out of your account?
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

    </View>
  );
};
