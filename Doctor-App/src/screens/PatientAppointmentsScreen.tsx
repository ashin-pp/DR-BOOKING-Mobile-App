import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { appointmentService } from '../api/appointmentService';
import Toast from 'react-native-toast-message';
import { DoctorProfileModal } from '../components/DoctorProfileModal';
import { getLocalDateString, isTimeInPast } from '../utils/date';

export const PatientAppointmentsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const isUpcomingOnly = route.params?.upcomingOnly || false;
  
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [dateFilter, setDateFilter] = useState('All');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await appointmentService.getAppointments();
      setAppointments(res.data);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load appointments.' });
    } finally {
      setLoading(false);
    }
  };

  const getFilteredAppointments = () => {
    if (dateFilter === 'All') return appointments;
    
    const todayStr = getLocalDateString(new Date());
    
    return appointments.filter(a => {
      if (dateFilter === 'Today') {
        return a.date === todayStr;
      }
      if (dateFilter === 'Next 7 Days') {
        const next7 = new Date();
        next7.setDate(next7.getDate() + 7);
        const next7Str = getLocalDateString(next7);
        return a.date >= todayStr && a.date <= next7Str;
      }
      if (dateFilter === 'This Month') {
        return a.date.startsWith(todayStr.substring(0, 7)); // 'YYYY-MM'
      }
      return true;
    });
  };

  const filtered = getFilteredAppointments();
  
  const todayStr = getLocalDateString(new Date());
  
  const upcoming = filtered.filter(a => {
    if (a.status !== 'PENDING' && a.status !== 'CONFIRMED') return false;
    if (a.date < todayStr) return false;
    if (a.date === todayStr && isTimeInPast(a.time, todayStr)) return false;
    return true;
  });
  
  const past = filtered.filter(a => {
    if (a.status === 'COMPLETED' || a.status === 'CANCELLED') return true;
    if (a.status === 'PENDING' || a.status === 'CONFIRMED') {
      if (a.date < todayStr) return true;
      if (a.date === todayStr && isTimeInPast(a.time, todayStr)) return true;
    }
    return false;
  });

  const renderAppointmentCard = (apt: any) => (
    <View 
      key={apt._id} 
      className="bg-white rounded-[24px] p-5 mb-4 border border-[#E6F0EE]" 
      style={{ elevation: 4, shadowColor: '#122827', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 }}
    >
      <View className="flex-row justify-between items-start mb-4">
        <TouchableOpacity onPress={() => setSelectedDoctor(apt.doctorId)} className="flex-row items-center flex-1 mr-2">
          <View className="w-12 h-12 rounded-full bg-[#E6F0EE] items-center justify-center mr-3 border-2 border-white shadow-sm overflow-hidden">
            {apt.doctorId?.profileImage ? (
              <Image source={{ uri: apt.doctorId.profileImage }} className="w-full h-full" resizeMode="cover" />
            ) : (
              <Text className="text-[#122827] text-lg font-bold">{apt.doctorId?.name?.charAt(0) || 'D'}</Text>
            )}
          </View>
          <View className="flex-1">
            <Text className="text-[#122827] text-base font-bold" numberOfLines={1}>Dr. {apt.doctorId.name}</Text>
            <Text className="text-[#8B9C9A] text-[10px] font-bold uppercase tracking-widest mt-0.5">{apt.doctorId.specialization || 'Specialist'}</Text>
          </View>
        </TouchableOpacity>
        <View className="items-end">
          <View className="bg-[#122827] px-3 py-1.5 rounded-full mb-1">
            <Text className="text-white text-[10px] font-bold uppercase tracking-widest">{apt.tokenNumber}</Text>
          </View>
          <Text className="text-[#122827] text-xs font-black">{apt.time}</Text>
        </View>
      </View>

      <View className="flex-row justify-between items-center pt-4 border-t border-[#E6F0EE]">
        <View className="flex-row items-center">
          <Feather name="calendar" size={14} color="#5F7371" />
          <Text className="text-[#5F7371] text-xs font-bold ml-1.5">{apt.date}</Text>
        </View>
        <View className="flex-row items-center">
          <Feather name={apt.status === 'COMPLETED' ? 'check-circle' : apt.status === 'CANCELLED' ? 'x-circle' : 'clock'} size={14} color={apt.status === 'COMPLETED' ? '#3B82F6' : apt.status === 'CANCELLED' ? '#EF4444' : '#F59E0B'} />
          <Text className={`text-[10px] font-bold ml-1.5 uppercase tracking-widest ${apt.status === 'COMPLETED' ? 'text-[#3B82F6]' : apt.status === 'CANCELLED' ? 'text-[#EF4444]' : 'text-[#F59E0B]'}`}>
            {apt.status}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7F6]">
      {/* Header */}
      <View className="flex-row items-center px-6 pt-4 pb-6 bg-[#122827] rounded-b-[40px]" style={{ elevation: 10, shadowColor: '#122827', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 rounded-full bg-white/10 items-center justify-center border border-white/20">
          <Feather name="chevron-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold tracking-widest ml-4">
          {isUpcomingOnly ? 'Upcoming Visits' : 'My Appointments'}
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#246E66" />
        </View>
      ) : (
        <View className="flex-1">
          {/* Date Filter */}
          <View className="px-6 py-4">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {['All', 'Today', 'Next 7 Days', 'This Month'].map((filter) => (
                <TouchableOpacity 
                  key={filter}
                  onPress={() => setDateFilter(filter)}
                  className={`mr-3 px-5 py-2.5 rounded-full border ${dateFilter === filter ? 'bg-[#246E66] border-[#246E66]' : 'bg-white border-[#E6F0EE]'}`}
                >
                  <Text className={`font-bold text-xs ${dateFilter === filter ? 'text-white' : 'text-[#5F7371]'}`}>{filter}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24, paddingTop: 8, paddingBottom: 60 }}>
          
          <Text className="text-[#122827] text-lg font-black tracking-tight mb-4">Upcoming</Text>
          {upcoming.length > 0 ? (
            upcoming.map(renderAppointmentCard)
          ) : (
            <View className="bg-white rounded-3xl p-6 items-center border border-[#E6F0EE] mb-6">
              <Feather name="calendar" size={32} color="#8B9C9A" className="mb-3" />
              <Text className="text-[#122827] font-bold mb-1">No Upcoming Visits</Text>
              <Text className="text-[#8B9C9A] text-xs">You don't have any pending appointments.</Text>
            </View>
          )}

          {!isUpcomingOnly && (
            <>
              <Text className="text-[#122827] text-lg font-black tracking-tight mb-4 mt-6">Past</Text>
              {past.length > 0 ? (
                past.map(renderAppointmentCard)
              ) : (
                <View className="bg-white rounded-3xl p-6 items-center border border-[#E6F0EE]">
                  <Feather name="clock" size={32} color="#8B9C9A" className="mb-3" />
                  <Text className="text-[#122827] font-bold mb-1">No History</Text>
                  <Text className="text-[#8B9C9A] text-xs">You don't have any past appointments.</Text>
                </View>
              )}
            </>
          )}

        </ScrollView>
        </View>
      )}

      {/* Doctor Profile Modal */}
      <DoctorProfileModal 
        doctor={selectedDoctor} 
        visible={!!selectedDoctor} 
        onClose={() => setSelectedDoctor(null)} 
      />
    </SafeAreaView>
  );
};
