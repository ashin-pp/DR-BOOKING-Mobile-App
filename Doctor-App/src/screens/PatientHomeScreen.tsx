import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StatusBar, Dimensions, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../store/authStore';
import { NavigationProps } from '../types/navigation.types';
import { doctorService } from '../api/doctorService';
import { appointmentService } from '../api/appointmentService';
import { DoctorProfileModal } from '../components/DoctorProfileModal';
import { getLocalDateString, isTimeInPast } from '../utils/date';

const { width } = Dimensions.get('window');

const quickActions = [
  { id: '1', title: 'Book Appointment', icon: 'calendar', color: '#1E5A54', bg: '#E8F0EF' },
  { id: '2', title: 'My Appointments', icon: 'clock', color: '#27303D', bg: '#EEF0F2' },
  { id: '3', title: 'Medical Records', icon: 'file-text', color: '#8B9C9A', bg: '#F5F7F6' },
  { id: '4', title: 'Messages', icon: 'message-circle', color: '#122827', bg: '#E6F0EE' },
];

export const PatientHomeScreen = () => {
  const { user } = useAuthStore();
  const navigation = useNavigation<NavigationProps>();
  const userName = user?.name || 'Patient';

  const [doctors, setDoctors] = useState<any[]>([]);
  const [nextAppointment, setNextAppointment] = useState<any>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [docRes, apptRes] = await Promise.all([
        doctorService.getAllDoctors(),
        appointmentService.getAppointments()
      ]);
      setDoctors(docRes.data);
      
      const todayStr = getLocalDateString(new Date());
      const upcoming = apptRes.data.filter((a: any) => {
        if (a.status !== 'PENDING' && a.status !== 'CONFIRMED') return false;
        if (a.date < todayStr) return false;
        if (a.date === todayStr && isTimeInPast(a.time, todayStr)) return false;
        return true;
      });
      if (upcoming.length > 0) {
        setNextAppointment(upcoming[0]);
      }
    } catch (error) {
      console.log('Error fetching patient data', error);
    }
  };

  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7F6]" edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F7F6" />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        
        {/* Header Section */}
        <View className="px-6 pt-4 pb-2 flex-row justify-between items-center">
          <View>
            <Text className="text-[#8B9C9A] text-sm font-medium uppercase tracking-wider mb-1">{currentDate}</Text>
            <Text className="text-[#122827] text-2xl font-extrabold tracking-tight">{userName}</Text>
          </View>
          <TouchableOpacity 
            onPress={() => navigation.navigate('PatientProfile')}
            className="w-12 h-12 rounded-full bg-white border border-[#E6F0EE] items-center justify-center overflow-hidden" style={{ elevation: 2, shadowColor: '#122827', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 }}>
            {user?.profileImage ? (
              <Image source={{ uri: user.profileImage }} className="w-full h-full" resizeMode="cover" />
            ) : (
              <Feather name="user" size={20} color="#122827" />
            )}
          </TouchableOpacity>
        </View>

        {/* Hero Status Card */}
        <View className="px-5 mt-6">
          <TouchableOpacity 
            onPress={() => navigation.navigate('PatientAppointments', { upcomingOnly: true })}
            className="rounded-[32px] overflow-hidden bg-[#246E66]"
            style={{
              elevation: 8,
              shadowColor: '#122827',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.2,
              shadowRadius: 12,
            }}
          >
            <LinearGradient 
              colors={['#246E66', '#113935']} 
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="p-6 sm:p-8"
            >
              <View className="flex-row justify-between items-center mb-6">
                <View className="bg-white/20 px-3 py-1.5 rounded-full flex-row items-center">
                  <Feather name="clock" size={12} color="#fff" style={{ marginRight: 4 }} />
                  <Text className="text-white text-xs font-semibold uppercase tracking-wider">Upcoming Visit</Text>
                </View>
                <Feather name="chevron-right" size={20} color="#fff" />
              </View>
              
              {nextAppointment ? (
                <>
                  <Text className="text-white text-xl font-bold mb-1 tracking-tight">Appointment with</Text>
                  <Text className="text-white text-2xl font-black tracking-tight mb-2">Dr. {nextAppointment.doctorId?.name}</Text>
                  <Text className="text-[#D3DFDD] text-sm mb-6">{nextAppointment.date} • {nextAppointment.time}</Text>
                  
                  <View className="flex-row justify-between items-center mt-2">
                    <View className="flex-row -space-x-2">
                      <View className="w-10 h-10 rounded-full border-2 border-[#113935] bg-[#E6F0EE] items-center justify-center overflow-hidden">
                        {nextAppointment.doctorId?.profileImage ? (
                          <Image source={{ uri: nextAppointment.doctorId.profileImage }} className="w-full h-full" resizeMode="cover" />
                        ) : (
                          <Text className="text-[#122827] text-lg font-bold">{nextAppointment.doctorId?.name?.charAt(0) || 'D'}</Text>
                        )}
                      </View>
                    </View>
                    <View className="bg-white px-5 py-3 rounded-full flex-row items-center">
                      <Text className="text-[#113935] font-bold text-sm mr-2">View Details</Text>
                      <Feather name="arrow-right" size={14} color="#113935" />
                    </View>
                  </View>
                </>
              ) : (
                <View className="py-4">
                  <Text className="text-white text-xl font-bold mb-2">No Upcoming Visits</Text>
                  <Text className="text-[#D3DFDD] text-sm mb-6">You don't have any appointments scheduled.</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('BookAppointment')} className="bg-white px-5 py-3 rounded-full self-start flex-row items-center">
                    <Feather name="calendar" size={16} color="#113935" className="mr-2" />
                    <Text className="text-[#113935] font-bold text-sm">Book Now</Text>
                  </TouchableOpacity>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Quick Actions Grid */}
        <View className="px-5 mt-8">
          <Text className="text-[#122827] text-lg font-bold mb-4 tracking-tight px-1">Quick Actions</Text>
          <View className="flex-row flex-wrap justify-between">
            {quickActions.map((action, index) => (
              <TouchableOpacity 
                key={action.id}
                onPress={() => {
                  if (action.id === '1') {
                    navigation.navigate('BookAppointment' as never);
                  } else if (action.id === '2') {
                    navigation.navigate('PatientAppointments' as never);
                  }
                }}
                className="bg-white rounded-3xl p-5 items-center mb-4 border border-[#E6F0EE]"
                style={{ 
                  width: (width - 56) / 2, // 2 columns with gap
                  elevation: 2, 
                  shadowColor: '#122827', 
                  shadowOffset: { width: 0, height: 4 }, 
                  shadowOpacity: 0.05, 
                  shadowRadius: 8 
                }}
              >
                <View className="w-14 h-14 rounded-full items-center justify-center mb-3" style={{ backgroundColor: action.bg }}>
                  {action.icon === 'pill' ? (
                    <MaterialCommunityIcons name="pill" size={24} color={action.color} />
                  ) : (
                    <Feather name={action.icon as any} size={24} color={action.color} />
                  )}
                </View>
                <Text className="text-[#122827] font-semibold text-sm text-center">{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Top Specialists - Horizontal Scroll */}
        <View className="mt-4">
          <View className="px-6 mb-4 flex-row justify-between items-center">
            <Text className="text-[#122827] text-lg font-bold tracking-tight">Top Specialists</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AllDoctors' as never)}>
              <Text className="text-[#246E66] text-sm font-semibold">See All</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
            {doctors.map((doctor, index) => (
              <TouchableOpacity 
                key={doctor._id} 
                onPress={() => setSelectedDoctor(doctor)}
                className={`bg-white rounded-3xl p-4 border border-[#E6F0EE] ${index !== doctors.length - 1 ? 'mr-4' : ''}`}
                style={{ width: 160, elevation: 2, shadowColor: '#122827', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8 }}
              >
                <View className="w-full h-32 rounded-2xl bg-[#F5F7F6] items-center justify-center mb-3 overflow-hidden">
                  {doctor.profileImage ? (
                    <Image source={{ uri: doctor.profileImage }} className="w-full h-full" resizeMode="cover" />
                  ) : (
                    <MaterialCommunityIcons name="doctor" size={48} color="#246E66" />
                  )}
                </View>
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-[#122827] font-bold text-sm flex-1" numberOfLines={1}>Dr. {doctor.name}</Text>
                </View>
                <Text className="text-[#8B9C9A] text-xs mb-2" numberOfLines={1}>{doctor.specialization || 'General'}</Text>
                <View className="flex-row items-center justify-between mt-auto pt-2 border-t border-[#F5F7F6]">
                  <View className="flex-row items-center">
                    <MaterialCommunityIcons name="star" size={14} color="#F59E0B" />
                    <Text className="text-[#122827] text-xs font-bold ml-1">4.9</Text>
                  </View>
                  <View className="bg-[#E8F0EF] p-1.5 rounded-full">
                    <Feather name="arrow-right" size={14} color="#1E5A54" />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

      </ScrollView>

      {/* Doctor Profile Modal */}
      <DoctorProfileModal 
        doctor={selectedDoctor} 
        visible={!!selectedDoctor} 
        onClose={() => setSelectedDoctor(null)} 
      />
    </SafeAreaView>
  );
};
