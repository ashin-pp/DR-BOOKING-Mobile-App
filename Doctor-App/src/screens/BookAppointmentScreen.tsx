import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image, Dimensions, Modal, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '../store/authStore';
import { doctorService } from '../api/doctorService';
import { appointmentService } from '../api/appointmentService';
import { userService } from '../api/userService';
import { DoctorProfileModal } from '../components/DoctorProfileModal';
import { getLocalDateString, isTimeInPast } from '../utils/date';

const { width } = Dimensions.get('window');

export const BookAppointmentScreen = () => {
  const navigation = useNavigation();
  
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [viewDoctorProfile, setViewDoctorProfile] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>(getLocalDateString());
  
  const [schedule, setSchedule] = useState<any>(null);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [booking, setBooking] = useState(false);
  const { user, setUser } = useAuthStore();
  
  // Profile Update State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileAge, setProfileAge] = useState(user?.age ? String(user.age) : '');
  const [profileBloodGroup, setProfileBloodGroup] = useState(user?.bloodGroup || '');
  const [profileErrors, setProfileErrors] = useState<any>({});
  const [updatingProfile, setUpdatingProfile] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      fetchSchedule();
    }
  }, [selectedDoctor, selectedDate]);

  const fetchDoctors = async () => {
    try {
      const res = await doctorService.getAllDoctors();
      setDoctors(res.data);
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: error.response?.data?.message || error.message || 'Failed to load doctors' });
    } finally {
      setLoadingDoctors(false);
    }
  };

  const fetchSchedule = async () => {
    try {
      setLoadingSchedule(true);
      setSchedule(null);
      setSelectedSlot(null);
      const res = await doctorService.getDoctorSchedule(selectedDoctor._id, selectedDate);
      setSchedule(res.data);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load schedule' });
    } finally {
      setLoadingSchedule(false);
    }
  };

  const handleBook = async (skipProfileCheck = false) => {
    if (!selectedDoctor || !selectedDate || !selectedSlot) return;
    
    // Check if profile is complete
    if (!skipProfileCheck && (!user?.phone || !user?.age || !user?.bloodGroup)) {
      setProfilePhone(user?.phone || '');
      setProfileAge(user?.age ? String(user.age) : '');
      setProfileBloodGroup(user?.bloodGroup || '');
      setProfileErrors({});
      setShowProfileModal(true);
      return;
    }
    
    try {
      setBooking(true);
      await appointmentService.bookAppointment({
        doctorId: selectedDoctor._id,
        date: selectedDate,
        time: selectedSlot,
        notes: 'Booked via patient app'
      });
      
      Toast.show({
        type: 'success',
        text1: 'Appointment Confirmed',
        text2: `You are booked with Dr. ${selectedDoctor.name} at ${selectedSlot}`,
        position: 'top',
        topOffset: 60,
      });
      
      navigation.goBack();
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Booking Failed', text2: error.response?.data?.message || 'Could not book slot.' });
      fetchSchedule(); // Refresh slots
    } finally {
      setBooking(false);
    }
  };

  const handleUpdateProfile = async () => {
    setProfileErrors({});
    let newErrors: any = {};

    if (!profilePhone) newErrors.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(profilePhone.trim())) newErrors.phone = 'Enter a valid 10-digit number';

    if (!profileAge) newErrors.age = 'Age is required';
    if (!profileBloodGroup) newErrors.bloodGroup = 'Blood Group is required';

    if (Object.keys(newErrors).length > 0) {
      setProfileErrors(newErrors);
      return;
    }

    try {
      setUpdatingProfile(true);
      const res = await userService.updateProfile({
        phone: profilePhone,
        age: parseInt(profileAge),
        bloodGroup: profileBloodGroup
      });
      setUser(res.data.user);
      setShowProfileModal(false);
      
      // Proceed to book
      setTimeout(() => {
        handleBook(true);
      }, 500);
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Update Failed', text2: error.response?.data?.message || 'Could not update profile.' });
    } finally {
      setUpdatingProfile(false);
    }
  };

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      date: getLocalDateString(d),
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: d.getDate(),
    };
  });

  const activeDoctors = doctors.filter(d => d.hasActiveSchedule);
  const categories = ['All', ...new Set(activeDoctors.map(d => d.specialization || 'General'))];
  
  const filteredDoctors = activeDoctors.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || (doc.specialization || 'General') === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <View className="flex-1 bg-[#F5F7F6]">
      {/* Background Header */}
      <View className="absolute top-0 w-full h-[150px] bg-[#122827] rounded-b-[40px]" />

      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center px-6 py-4 mb-4">
          <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 rounded-full bg-white/10 items-center justify-center border border-white/20">
            <Feather name="chevron-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold tracking-widest ml-4">Book Appointment</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          
          {/* Search & Filters */}
          <View className="px-6 mb-6 mt-2">
            <View className="flex-row items-center bg-white rounded-2xl px-4 py-3 mb-4 border border-[#E6F0EE]" style={{ elevation: 2, shadowColor: '#122827', shadowOpacity: 0.05, shadowRadius: 5 }}>
              <Feather name="search" size={20} color="#8B9C9A" />
              <TextInput 
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search doctors by name..."
                placeholderTextColor="#8B9C9A"
                className="flex-1 ml-3 text-[#122827] font-bold"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Feather name="x" size={18} color="#8B9C9A" />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-6 px-6">
              {categories.map((cat, idx) => (
                <TouchableOpacity 
                  key={idx}
                  onPress={() => setSelectedCategory(cat as string)}
                  className={`mr-3 px-5 py-2.5 rounded-full border ${selectedCategory === cat ? 'bg-[#246E66] border-[#246E66]' : 'bg-white border-[#E6F0EE]'}`}
                >
                  <Text className={`font-bold text-xs ${selectedCategory === cat ? 'text-white' : 'text-[#5F7371]'}`}>{cat as string}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Step 1: Select Doctor */}
          <View className="px-6 mb-6">
            <Text className="text-[#122827] text-lg font-black tracking-tight mb-4">1. Select Doctor</Text>
            {loadingDoctors ? (
              <ActivityIndicator color="#246E66" />
            ) : filteredDoctors.length === 0 ? (
              <View className="bg-white rounded-3xl p-6 border border-[#E6F0EE] items-center mt-2">
                <Feather name="search" size={32} color="#8B9C9A" />
                <Text className="text-[#122827] font-bold mt-3">No Doctors Found</Text>
                <Text className="text-[#8B9C9A] text-xs text-center mt-1">Try adjusting your search or category.</Text>
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-6 px-6">
                {filteredDoctors.map(doc => (
                  <TouchableOpacity 
                    key={doc._id}
                    onPress={() => { setSelectedDoctor(doc); setSelectedSlot(null); setSchedule(null); }}
                    className={`mr-4 p-4 rounded-3xl border w-[150px] ${selectedDoctor?._id === doc._id ? 'bg-[#122827] border-[#122827]' : 'bg-white border-[#E6F0EE]'}`}
                  >
                    <View className="w-16 h-16 rounded-full bg-[#E6F0EE] items-center justify-center mb-3 self-center border-2 border-white shadow-sm overflow-hidden">
                      {doc.profileImage ? (
                        <Image source={{ uri: doc.profileImage }} className="w-full h-full" resizeMode="cover" />
                      ) : (
                        <MaterialCommunityIcons name="doctor" size={30} color="#246E66" />
                      )}
                    </View>
                    <View className="flex-row justify-center items-center mb-1">
                      <Text className={`font-bold text-sm mr-1 ${selectedDoctor?._id === doc._id ? 'text-white' : 'text-[#122827]'}`} numberOfLines={1}>
                        Dr. {doc.name}
                      </Text>
                      <TouchableOpacity 
                        onPress={(e) => { e.stopPropagation(); setViewDoctorProfile(doc); }}
                        hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                        style={{ padding: 4 }}
                      >
                        <Feather name="info" size={16} color={selectedDoctor?._id === doc._id ? 'white' : '#8B9C9A'} />
                      </TouchableOpacity>
                    </View>
                    <Text className={`text-center text-xs ${selectedDoctor?._id === doc._id ? 'text-white/70' : 'text-[#5F7371]'}`} numberOfLines={1}>
                      {doc.specialization || 'General'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Step 2: Select Date */}
          {selectedDoctor && (
            <View className="px-6 mb-8">
              <Text className="text-[#122827] text-lg font-black tracking-tight mb-4">2. Select Date</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-6 px-6">
                {dates.map((d, i) => {
                  const isSelected = selectedDate === d.date;
                  return (
                    <TouchableOpacity
                      key={i}
                      onPress={() => setSelectedDate(d.date)}
                      className={`mr-3 items-center justify-center w-[65px] h-[85px] rounded-[24px] border ${isSelected ? 'bg-[#246E66] border-[#246E66]' : 'bg-white border-[#E6F0EE]'}`}
                      style={isSelected ? { elevation: 8, shadowColor: '#246E66', shadowOpacity: 0.3 } : {}}
                    >
                      <Text className={`text-xs font-bold uppercase tracking-wider mb-1 ${isSelected ? 'text-white/80' : 'text-[#8B9C9A]'}`}>{d.dayName}</Text>
                      <Text className={`text-2xl font-black ${isSelected ? 'text-white' : 'text-[#122827]'}`}>{d.dayNumber}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Step 3: Select Slot */}
          {selectedDoctor && selectedDate && (
            <View className="px-6 mb-6">
              <Text className="text-[#122827] text-lg font-black tracking-tight mb-4">3. Available Slots</Text>
              
              {loadingSchedule ? (
                <ActivityIndicator color="#246E66" className="mt-4" />
              ) : !schedule ? (
                <View className="bg-white rounded-3xl p-6 border border-[#E6F0EE] items-center mt-2">
                  <Feather name="calendar" size={32} color="#8B9C9A" />
                  <Text className="text-[#122827] font-bold mt-3">No Schedule Available</Text>
                  <Text className="text-[#8B9C9A] text-xs text-center mt-1">The doctor has not generated tokens for this date.</Text>
                </View>
              ) : (
                <View className="flex-row flex-wrap justify-between">
                  {(() => {
                    const upcomingSlots = schedule.slots.filter((slot: any) => !isTimeInPast(slot.time, selectedDate));
                    if (upcomingSlots.length === 0) {
                      return (
                        <View className="w-full bg-white rounded-3xl p-6 border border-[#E6F0EE] items-center mt-2">
                          <Feather name="clock" size={32} color="#8B9C9A" />
                          <Text className="text-[#122827] font-bold mt-3">No Upcoming Slots</Text>
                          <Text className="text-[#8B9C9A] text-xs text-center mt-1">All slots for this date are in the past.</Text>
                        </View>
                      );
                    }
                    return upcomingSlots.map((slot: any, idx: number) => {
                    const isSelected = selectedSlot === slot.time;
                    const disabled = slot.isBooked;

                    return (
                      <TouchableOpacity
                        key={idx}
                        disabled={disabled}
                        onPress={() => setSelectedSlot(slot.time)}
                        className={`w-[31%] py-3 mb-3 rounded-2xl border items-center justify-center ${
                          disabled 
                            ? 'bg-gray-100 border-gray-200 opacity-50' 
                            : isSelected 
                              ? 'bg-[#10B981] border-[#10B981]' 
                              : 'bg-white border-[#10B981]/30'
                        }`}
                        style={isSelected ? { elevation: 4, shadowColor: '#10B981' } : {}}
                      >
                        <Text className={`font-bold ${disabled ? 'text-gray-400' : isSelected ? 'text-white' : 'text-[#122827]'}`}>
                          {slot.time}
                        </Text>
                      </TouchableOpacity>
                    );
                  })})()}
                </View>
              )}
            </View>
          )}

        </ScrollView>

        {/* Floating Book Button */}
        {selectedSlot && (
          <View className="absolute bottom-0 w-full px-6 py-6 bg-white border-t border-[#E6F0EE]">
            <TouchableOpacity 
              onPress={() => handleBook(false)}
              disabled={booking}
              className={`w-full rounded-full py-4 items-center justify-center flex-row ${booking ? 'bg-gray-400' : 'bg-[#122827]'}`}
            >
              {booking ? <ActivityIndicator color="white" /> : (
                <>
                  <Text className="text-white font-bold text-sm tracking-widest uppercase mr-2">Confirm Booking</Text>
                  <Feather name="arrow-right" size={16} color="white" />
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

      </SafeAreaView>

      {/* Profile Completion Modal */}
      <Modal visible={showProfileModal} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 justify-end bg-black/60">
          <View className="bg-white rounded-t-[40px] p-8">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-[#122827] text-2xl font-black tracking-tight">Complete Profile</Text>
              <TouchableOpacity onPress={() => setShowProfileModal(false)} className="w-10 h-10 bg-[#F5F7F6] rounded-full items-center justify-center">
                <Feather name="x" size={20} color="#122827" />
              </TouchableOpacity>
            </View>

            <Text className="text-[#5F7371] text-sm mb-6 leading-6">
              Please complete your medical profile to confirm this appointment. This helps doctors provide better care.
            </Text>

            <View className="space-y-4 mb-8">
              <View>
                <Text className="text-[#122827] font-bold text-xs mb-2 uppercase tracking-wider">Phone Number</Text>
                <View className={`bg-[#F5F7F6] rounded-xl px-4 py-3 border ${profileErrors.phone ? 'border-red-400' : 'border-[#E6F0EE]'}`}>
                  <TextInput value={profilePhone} onChangeText={(t) => {setProfilePhone(t); setProfileErrors((e:any) => ({...e, phone: undefined}))}} placeholder="+1 234 567 890" keyboardType="phone-pad" placeholderTextColor="#8B9C9A" className="text-[#122827] font-bold" />
                </View>
                {profileErrors.phone && <Text className="text-red-500 text-xs mt-1 ml-1">{profileErrors.phone}</Text>}
              </View>

              <View className="flex-row space-x-4">
                <View className="flex-1">
                  <Text className="text-[#122827] font-bold text-xs mb-2 uppercase tracking-wider">Age</Text>
                  <View className={`bg-[#F5F7F6] rounded-xl px-4 py-3 border ${profileErrors.age ? 'border-red-400' : 'border-[#E6F0EE]'}`}>
                    <TextInput value={profileAge} onChangeText={(t) => {setProfileAge(t); setProfileErrors((e:any) => ({...e, age: undefined}))}} placeholder="25" keyboardType="numeric" placeholderTextColor="#8B9C9A" className="text-[#122827] font-bold" />
                  </View>
                  {profileErrors.age && <Text className="text-red-500 text-xs mt-1 ml-1">{profileErrors.age}</Text>}
                </View>
                <View className="flex-1">
                  <Text className="text-[#122827] font-bold text-xs mb-2 uppercase tracking-wider">Blood Group</Text>
                  <View className={`bg-[#F5F7F6] rounded-xl px-4 py-3 border ${profileErrors.bloodGroup ? 'border-red-400' : 'border-[#E6F0EE]'}`}>
                    <TextInput value={profileBloodGroup} onChangeText={(t) => {setProfileBloodGroup(t); setProfileErrors((e:any) => ({...e, bloodGroup: undefined}))}} placeholder="O+" autoCapitalize="characters" placeholderTextColor="#8B9C9A" className="text-[#122827] font-bold" />
                  </View>
                  {profileErrors.bloodGroup && <Text className="text-red-500 text-xs mt-1 ml-1">{profileErrors.bloodGroup}</Text>}
                </View>
              </View>
            </View>

            <TouchableOpacity 
              onPress={handleUpdateProfile} 
              disabled={updatingProfile}
              className={`w-full rounded-full py-4 items-center justify-center flex-row shadow-lg ${updatingProfile ? 'bg-gray-400' : 'bg-[#10B981] shadow-[#10B981]/30'}`}
            >
              {updatingProfile ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text className="text-white font-bold text-sm tracking-widest uppercase mr-2">Save & Book</Text>
                  <Feather name="check" size={16} color="white" />
                </>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Doctor Profile Modal */}
      <DoctorProfileModal 
        doctor={viewDoctorProfile} 
        visible={!!viewDoctorProfile} 
        onClose={() => setViewDoctorProfile(null)}
        onBook={() => {
          setSelectedDoctor(viewDoctorProfile);
          setSelectedSlot(null);
          setSchedule(null);
        }}
      />
    </View>
  );
};
