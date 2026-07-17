import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { appointmentService } from '../api/appointmentService';
import Toast from 'react-native-toast-message';
import { getLocalDateString } from '../utils/date';

interface Appointment {
  _id: string;
  patientId: { name: string; email: string; phone?: string; age?: number; bloodGroup?: string; profileImage?: string };
  date: string;
  time: string;
  tokenNumber: string;
  status: string;
}

export const DoctorAppointmentsScreen = () => {
  const navigation = useNavigation<any>();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'COMPLETED'>('UPCOMING');
  
  const tokenDates = Array.from({ length: 29 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + (i - 14));
    return {
      date: getLocalDateString(d),
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: d.getDate(),
    };
  });
  const [selectedDate, setSelectedDate] = useState(getLocalDateString(new Date()));

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await appointmentService.getAppointments();
      setAppointments(res.data);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Could not load appointments.' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appointmentId: string, status: string) => {
    try {
      await appointmentService.updateAppointmentStatus(appointmentId, status);
      Toast.show({ type: 'success', text1: 'Status Updated', text2: `Appointment marked as ${status}` });
      fetchAppointments();
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: error.response?.data?.message || 'Could not update status' });
    }
  };

  const upcomingAppointments = appointments.filter(a => (a.status === 'PENDING' || a.status === 'CONFIRMED') && a.date === selectedDate);
  const completedAppointments = appointments.filter(a => a.status === 'COMPLETED' && a.date === selectedDate);

  const displayAppointments = activeTab === 'UPCOMING' ? upcomingAppointments : completedAppointments;

  const renderAppointmentCard = (apt: Appointment) => {
    const patient = apt.patientId || apt.patientSnapshot;
    return (
    <View key={apt._id} className="bg-white rounded-[24px] p-5 mb-4 border border-[#E6F0EE]" style={{ elevation: 4, shadowColor: '#122827', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 }}>
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-center flex-1 mr-2">
          <View className="w-12 h-12 rounded-full bg-[#E6F0EE] items-center justify-center mr-3 overflow-hidden border border-white shadow-sm">
            {patient?.profileImage ? (
              <Image source={{ uri: patient.profileImage }} className="w-full h-full" resizeMode="cover" />
            ) : (
              <Text className="text-[#122827] text-lg font-bold">{patient?.name?.charAt(0) || 'U'}</Text>
            )}
          </View>
          <View className="flex-1">
            <Text className="text-[#122827] text-base font-bold" numberOfLines={1}>{patient?.name || 'Unknown Patient'}</Text>
            <View className="flex-row items-center mt-1 flex-wrap">
              <Text className="text-[#246E66] text-[10px] font-bold uppercase tracking-widest bg-[#246E66]/10 px-2 py-0.5 rounded-md mr-1 mt-1">TKN: {apt.tokenNumber}</Text>
              {(patient?.age || patient?.bloodGroup) && (
                <Text className="text-[#5F7371] text-[10px] font-bold uppercase tracking-widest bg-[#F5F7F6] border border-[#E6F0EE] px-2 py-0.5 rounded-md mt-1">
                  {[patient.age ? `${patient.age}y` : null, patient.bloodGroup].filter(Boolean).join(' • ')}
                </Text>
              )}
            </View>
          </View>
        </View>
        <View className={`px-2 py-1.5 rounded-full ${apt.status === 'COMPLETED' ? 'bg-[#3B82F6]/10' : apt.status === 'CONFIRMED' || apt.status === 'PENDING' ? 'bg-[#10B981]/10' : 'bg-gray-100'}`}>
          <Text className={`text-[10px] font-bold uppercase tracking-widest ${apt.status === 'COMPLETED' ? 'text-[#3B82F6]' : apt.status === 'CONFIRMED' || apt.status === 'PENDING' ? 'text-[#10B981]' : 'text-gray-500'}`}>
            {apt.status}
          </Text>
        </View>
      </View>
      
      <View className="flex-row items-center bg-[#F5F7F6] rounded-2xl p-3 mb-4">
        <View className="flex-row items-center mr-6">
          <Feather name="calendar" size={14} color="#246E66" />
          <Text className="text-[#122827] text-xs font-bold ml-2">{new Date(apt.date).toLocaleDateString()}</Text>
        </View>
        <View className="flex-row items-center">
          <Feather name="clock" size={14} color="#246E66" />
          <Text className="text-[#122827] text-xs font-bold ml-2">{apt.time}</Text>
        </View>
      </View>

      {apt.status !== 'COMPLETED' ? (
        <TouchableOpacity 
          onPress={() => handleUpdateStatus(apt._id, 'COMPLETED')}
          className="w-full bg-[#122827] rounded-xl py-3.5 items-center flex-row justify-center"
        >
          <Text className="text-white font-bold text-xs uppercase tracking-widest mr-2">Mark as Completed</Text>
          <Feather name="check-circle" size={14} color="#FFFFFF" />
        </TouchableOpacity>
      ) : (
        <View className="w-full bg-gray-100 rounded-xl py-3.5 items-center flex-row justify-center">
          <Text className="text-gray-400 font-bold text-xs uppercase tracking-widest mr-2">Consultation Completed</Text>
          <Feather name="check" size={14} color="#9CA3AF" />
        </View>
      )}
    </View>
  );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7F6]">
      {/* Header */}
      <View className="bg-[#122827] px-6 pt-4 pb-6 rounded-b-[32px] shadow-lg shadow-[#122827]/20 z-10">
        <View className="flex-row items-center mb-6">
          <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 rounded-full bg-white/10 items-center justify-center border border-white/20">
            <Feather name="chevron-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold tracking-widest ml-4">All Appointments</Text>
        </View>

        {/* Tab Switcher */}
        <View className="flex-row bg-white/10 p-1 rounded-2xl mb-4">
          <TouchableOpacity 
            onPress={() => setActiveTab('UPCOMING')}
            className={`flex-1 py-3 items-center justify-center rounded-xl transition-all ${activeTab === 'UPCOMING' ? 'bg-white shadow-sm' : 'bg-transparent'}`}
          >
            <Text className={`font-bold text-xs uppercase tracking-widest ${activeTab === 'UPCOMING' ? 'text-[#122827]' : 'text-white/70'}`}>Upcoming</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => setActiveTab('COMPLETED')}
            className={`flex-1 py-3 items-center justify-center rounded-xl transition-all ${activeTab === 'COMPLETED' ? 'bg-white shadow-sm' : 'bg-transparent'}`}
          >
            <Text className={`font-bold text-xs uppercase tracking-widest ${activeTab === 'COMPLETED' ? 'text-[#122827]' : 'text-white/70'}`}>Completed</Text>
          </TouchableOpacity>
        </View>

        {/* Date Selector */}
        <View className="-mx-6 px-6">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {tokenDates.map((d, i) => {
              const isSelected = selectedDate === d.date;
              return (
                <TouchableOpacity
                  key={i}
                  onPress={() => setSelectedDate(d.date)}
                  className={`mr-3 items-center justify-center w-[60px] h-[75px] rounded-[20px] border ${isSelected ? 'bg-white border-white' : 'bg-transparent border-white/20'}`}
                  style={isSelected ? { elevation: 8, shadowColor: '#000', shadowOpacity: 0.1 } : {}}
                >
                  <Text className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isSelected ? 'text-[#122827]' : 'text-white/70'}`}>{d.dayName}</Text>
                  <Text className={`text-xl font-black ${isSelected ? 'text-[#122827]' : 'text-white'}`}>{d.dayNumber}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>

      <View className="flex-1 px-6 pt-6">
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#246E66" />
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            {displayAppointments.length > 0 ? (
              displayAppointments.map(renderAppointmentCard)
            ) : (
              <View className="items-center justify-center py-12 mt-10 bg-white rounded-[32px] border border-[#E6F0EE] shadow-sm shadow-[#122827]/5">
                <View className="w-20 h-20 rounded-full bg-[#F5F7F6] items-center justify-center mb-6">
                  <Feather name="inbox" size={32} color="#246E66" />
                </View>
                <Text className="text-[#122827] text-lg font-black tracking-tight mb-2">No Appointments Found</Text>
                <Text className="text-[#5F7371] text-sm text-center px-8 leading-6">
                  {activeTab === 'UPCOMING' 
                    ? "You don't have any upcoming consultations right now."
                    : "You haven't completed any consultations yet."}
                </Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};
