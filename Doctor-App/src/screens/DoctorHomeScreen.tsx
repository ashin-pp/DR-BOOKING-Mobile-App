import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, TextInput, Modal, KeyboardAvoidingView, Platform, Linking, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../store/authStore';
import { doctorService } from '../api/doctorService';
import { appointmentService } from '../api/appointmentService';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import { getLocalDateString } from '../utils/date';

const { width } = Dimensions.get('window');

interface Appointment {
  _id: string;
  patientId: { name: string; email: string; phone?: string; age?: number; bloodGroup?: string };
  date: string;
  time: string;
  tokenNumber: string;
  status: string;
}

export const DoctorHomeScreen = () => {
  const { user, logout } = useAuthStore();
  const navigation = useNavigation<any>();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [schedule, setSchedule] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Generate Tokens Form State
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [totalTokens, setTotalTokens] = useState('20');
  const [generating, setGenerating] = useState(false);
  
  const tokenDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      date: getLocalDateString(d),
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: d.getDate(),
    };
  });
  const [selectedTokenDate, setSelectedTokenDate] = useState(tokenDates[0].date);
  
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [slotToRemove, setSlotToRemove] = useState<string | null>(null);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [selectedTokenDate]); // Fetch data when date changes

  const fetchData = async () => {
    try {
      setLoading(true);
      const [apptRes, schedRes] = await Promise.all([
        appointmentService.getAppointments(),
        doctorService.getMySchedule(selectedTokenDate) // Use selected date
      ]);
      setAppointments(apptRes.data);
      setSchedule(schedRes.data);
    } catch (error) {
      console.log('Error fetching data:', error);
      Toast.show({
        type: 'error',
        text1: 'Sync Failed',
        text2: 'Could not load your dashboard data.',
        position: 'top',
        topOffset: 60,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appointmentId: string, status: string) => {
    try {
      await appointmentService.updateAppointmentStatus(appointmentId, status);
      Toast.show({ type: 'success', text1: 'Status Updated', text2: `Appointment marked as ${status}` });
      fetchData();
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: error.response?.data?.message || 'Could not update status' });
    }
  };

  const handleGenerateTokens = async () => {
    if (!startTime || !endTime || !totalTokens) {
      Toast.show({ type: 'error', text1: 'Missing Fields', text2: 'Please fill all token fields.' });
      return;
    }
    try {
      setGenerating(true);
      const res = await doctorService.createSchedule({
        date: selectedTokenDate,
        startTime,
        endTime,
        totalTokens: parseInt(totalTokens),
      });
      setSchedule(res.data);
      setShowGenerateModal(false);
      Toast.show({ type: 'success', text1: 'Tokens Generated!', text2: `Created ${totalTokens} slots for ${selectedTokenDate}.` });
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: error.response?.data?.message || 'Failed to generate tokens.' });
    } finally {
      setGenerating(false);
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(false);
    logout();
    Toast.show({
      type: 'success',
      text1: 'Signed Out',
      text2: 'See you next time, Doctor.',
      position: 'top',
      topOffset: 60,
    });
  };

  const handleRemoveSlot = async () => {
    if (!slotToRemove) return;
    try {
      const res = await doctorService.removeScheduleSlot(selectedTokenDate, slotToRemove);
      setSchedule(res.data);
      Toast.show({ type: 'success', text1: 'Slot Removed', text2: `Time slot ${slotToRemove} is now unavailable.` });
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: error.response?.data?.message || 'Could not remove slot.' });
    } finally {
      setSlotToRemove(null);
    }
  };

  const handleCloseConsultations = async () => {
    try {
      await doctorService.closeSchedule(selectedTokenDate);
      Toast.show({ type: 'success', text1: 'Consultations Closed', text2: `All unbooked slots removed and remaining visits cancelled.` });
      setShowCloseModal(false);
      fetchData();
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: error.response?.data?.message || 'Could not close consultations.' });
    }
  };

  const renderHeader = () => {
    const todaysAppointments = appointments.filter(a => a.date === selectedTokenDate);
    
    return (
      <View className="bg-[#122827] pt-4 pb-8 px-6 rounded-b-[40px]" style={{ elevation: 15, shadowColor: '#122827', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20 }}>
      <View className="flex-row justify-between items-center mb-6">
        <TouchableOpacity onPress={() => setShowMenuModal(true)} className="flex-row items-center">
          <View className="w-12 h-12 rounded-full bg-white/10 items-center justify-center border border-white/20 mr-3 overflow-hidden">
            {user?.profileImage ? (
              <Image source={{ uri: user.profileImage }} className="w-full h-full" resizeMode="cover" />
            ) : (
              <MaterialCommunityIcons name="stethoscope" size={24} color="#34D399" />
            )}
          </View>
          <View>
            <Text className="text-white/60 text-xs font-bold tracking-widest uppercase mb-1">Provider Portal <Feather name="chevron-down" size={12} color="#34D399" /></Text>
            <Text className="text-white text-xl font-black tracking-tight">Dr. {user?.name}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setShowLogoutModal(true)}
          className="w-10 h-10 rounded-full bg-white/10 items-center justify-center border border-white/20"
        >
          <Feather name="log-out" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View className="flex-row justify-between space-x-4">
        <View className="bg-white/10 flex-1 p-4 rounded-3xl border border-white/20 items-center">
          <Text className="text-white text-3xl font-black mb-1">{todaysAppointments.length}</Text>
          <Text className="text-white/70 text-[10px] font-bold uppercase tracking-wider text-center">Total{'\n'}Patients</Text>
        </View>
        <View className="bg-white/10 flex-1 p-4 rounded-3xl border border-white/20 items-center">
          <Text className="text-white text-3xl font-black mb-1">{todaysAppointments.filter(a => a.status === 'PENDING' || a.status === 'CONFIRMED').length}</Text>
          <Text className="text-[#34D399] text-[10px] font-bold uppercase tracking-wider text-center">Upcoming{'\n'}Visits</Text>
        </View>
        <View className="bg-[#246E66] flex-1 p-4 rounded-3xl border border-[#34D399]/30 items-center" style={{ elevation: 10, shadowColor: '#34D399', shadowOpacity: 0.2 }}>
          <Text className="text-white text-3xl font-black mb-1">{todaysAppointments.filter(a => a.status === 'COMPLETED').length}</Text>
          <Text className="text-white/90 text-[10px] font-bold uppercase tracking-wider text-center">Finished{'\n'}Visits</Text>
        </View>
      </View>
    </View>
    );
  };
  const renderAppointmentCard = (apt: any) => {
    const patient = apt.patientId || apt.patientSnapshot;
    return (
      <TouchableOpacity 
        key={apt._id} 
        activeOpacity={0.8}
        onPress={() => setSelectedPatient(patient)}
        className="bg-white rounded-[24px] p-5 mb-4 border border-[#E6F0EE]" 
        style={{ elevation: 4, shadowColor: '#122827', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 }}
      >
        <View className="flex-row justify-between items-start mb-4">
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
              <Text className="text-[#8B9C9A] text-[10px] font-bold uppercase tracking-widest mt-0.5">Tap to view profile</Text>
            </View>
          </View>
          <View className="items-end">
            <View className="bg-[#122827] px-3 py-1.5 rounded-full mb-1">
              <Text className="text-white text-[10px] font-bold uppercase tracking-widest">{apt.tokenNumber}</Text>
            </View>
            <Text className="text-[#122827] text-xs font-black">{apt.time}</Text>
          </View>
        </View>

        <View className="flex-row justify-between items-center pt-4 border-t border-[#E6F0EE]">
          <View className="flex-row items-center">
            <Feather name={apt.status === 'COMPLETED' ? 'check-circle' : 'clock'} size={14} color={apt.status === 'COMPLETED' ? '#3B82F6' : '#F59E0B'} />
            <Text className={`text-[10px] font-bold ml-1.5 uppercase tracking-widest ${apt.status === 'COMPLETED' ? 'text-[#3B82F6]' : 'text-[#F59E0B]'}`}>
              {apt.status}
            </Text>
          </View>

          {apt.status === 'PENDING' && (
            <TouchableOpacity 
              onPress={() => handleUpdateStatus(apt._id, 'COMPLETED')}
              className="bg-[#10B981] px-4 py-2 rounded-xl shadow-sm shadow-[#10B981]/30"
            >
              <Text className="text-white text-[10px] font-bold uppercase tracking-widest">Mark Done</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7F6]" edges={['top']}>
      {renderHeader()}
      
      <View className="flex-1 px-6 pt-6">
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            {/* Generate Tokens Section */}
            <View className="mb-8">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-[#122827] text-xl font-black tracking-tight">Token Status</Text>
                {schedule && (
                  <Text className="text-[#246E66] font-bold text-xs uppercase tracking-widest">{schedule.slotDurationMinutes} MIN/SLOT</Text>
                )}
              </View>

              <View className="mb-6 -mx-6 px-6">
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {tokenDates.map((d, i) => {
                    const isSelected = selectedTokenDate === d.date;
                    return (
                      <TouchableOpacity
                        key={i}
                        onPress={() => setSelectedTokenDate(d.date)}
                        className={`mr-3 items-center justify-center w-[60px] h-[75px] rounded-[20px] border ${isSelected ? 'bg-[#246E66] border-[#246E66]' : 'bg-white border-[#E6F0EE]'}`}
                        style={isSelected ? { elevation: 8, shadowColor: '#246E66', shadowOpacity: 0.3 } : {}}
                      >
                        <Text className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isSelected ? 'text-white/80' : 'text-[#8B9C9A]'}`}>{d.dayName}</Text>
                        <Text className={`text-xl font-black ${isSelected ? 'text-white' : 'text-[#122827]'}`}>{d.dayNumber}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
              
              {loading ? (
                <View className="bg-white rounded-[24px] p-6 border border-[#E6F0EE] items-center justify-center min-h-[150px]">
                  <ActivityIndicator size="large" color="#246E66" />
                </View>
              ) : !schedule || !schedule.slots || schedule.slots.length === 0 ? (
                <View className="bg-white rounded-[24px] p-6 border border-[#E6F0EE] items-center">
                  <View className="w-16 h-16 rounded-full bg-[#E6F0EE] items-center justify-center mb-4">
                    <Feather name="clock" size={24} color="#1E5A54" />
                  </View>
                  <Text className="text-[#122827] text-base font-bold text-center mb-2">No Tokens Generated</Text>
                  <Text className="text-[#5F7371] text-xs text-center px-4 mb-6 leading-relaxed">
                    You haven't generated your available token slots for patients today.
                  </Text>
                  <TouchableOpacity 
                    onPress={() => setShowGenerateModal(true)}
                    className="bg-[#246E66] rounded-full px-6 py-3.5 flex-row items-center shadow-lg"
                  >
                    <Feather name="plus-circle" size={16} color="white" />
                    <Text className="text-white font-bold text-[13px] ml-2 tracking-widest uppercase">Generate Tokens</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View className="bg-white rounded-[24px] p-5 border border-[#E6F0EE]">
                  <Text className="text-[#5F7371] text-xs font-bold uppercase tracking-wider mb-3">Generated Slots</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {schedule.slots.map((slot: any, idx: number) => (
                      <TouchableOpacity 
                        key={idx} 
                        onPress={() => !slot.isBooked && setSlotToRemove(slot.time)}
                        activeOpacity={slot.isBooked ? 1 : 0.4}
                        className={`px-3 py-2 rounded-lg border flex-row items-center ${slot.isBooked ? 'bg-gray-100 border-gray-200' : 'bg-[#10B981]/5 border-[#10B981]/40 border-dashed'}`}
                      >
                        <Text className={`text-xs font-bold ${slot.isBooked ? 'text-gray-400' : 'text-[#10B981]'}`}>{slot.time}</Text>
                        {!slot.isBooked && <Feather name="x" size={10} color="#10B981" style={{ marginLeft: 4 }} />}
                      </TouchableOpacity>
                    ))}
                  </View>
                  <View className="flex-row justify-between items-center mt-6 pt-4 border-t border-[#E6F0EE]">
                    <TouchableOpacity onPress={() => setShowGenerateModal(true)} className="flex-row items-center py-2">
                      <Feather name="refresh-cw" size={14} color="#246E66" />
                      <Text className="text-[#246E66] text-[11px] font-bold ml-2 uppercase tracking-widest">Regenerate</Text>
                    </TouchableOpacity>
                    
                    {appointments.filter(a => a.status === 'PENDING' || a.status === 'CONFIRMED').length > 0 ? (
                      <View className="bg-gray-100 px-3 py-2 rounded-lg border border-gray-200 flex-row items-center opacity-70">
                        <Feather name="clock" size={12} color="#9CA3AF" />
                        <Text className="text-gray-400 text-[10px] font-bold ml-1.5 uppercase tracking-widest">Finish Visits First</Text>
                      </View>
                    ) : (
                      <TouchableOpacity 
                        onPress={() => setShowCloseModal(true)}
                        className="bg-red-50 px-3 py-2 rounded-lg border border-red-100 flex-row items-center"
                      >
                        <Feather name="power" size={12} color="#EF4444" />
                        <Text className="text-[#EF4444] text-[10px] font-bold ml-1.5 uppercase tracking-widest">Close Day</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}
            </View>

              {/* Appointments Section */}
              <View className="flex-row justify-between items-center mb-5 mt-2">
                <Text className="text-[#122827] text-[22px] font-black tracking-tight">Schedule</Text>
                <TouchableOpacity 
                  onPress={() => navigation.navigate('DoctorAppointments')}
                  className="bg-[#246E66]/10 px-4 py-2 rounded-full border border-[#246E66]/20 flex-row items-center"
                >
                  <Text className="text-[#246E66] font-bold text-[11px] uppercase tracking-widest mr-1">View All</Text>
                  <Feather name="chevron-right" size={14} color="#246E66" />
                </TouchableOpacity>
              </View>

              {(() => {
                const selectedDateAppointments = appointments.filter(a => a.date === selectedTokenDate);
                const upcoming = selectedDateAppointments.filter(a => a.status === 'PENDING' || a.status === 'CONFIRMED');
                const completed = selectedDateAppointments.filter(a => a.status === 'COMPLETED');
                const displayList = [...upcoming, ...completed].slice(0, 3);

                if (displayList.length > 0) {
                  return displayList.map(renderAppointmentCard);
                }

                return (
                  <View className="items-center justify-center py-10 bg-white rounded-[32px] border border-[#E6F0EE]">
                    <View className="w-16 h-16 rounded-full bg-[#E6F0EE] items-center justify-center mb-4">
                      <Feather name="calendar" size={24} color="#5F7371" />
                    </View>
                    <Text className="text-[#122827] text-base font-bold mb-1">No Appointments Today</Text>
                    <Text className="text-[#8B9C9A] text-xs">Your schedule is currently clear.</Text>
                  </View>
                );
              })()}
            </ScrollView>
          </View>

      {/* Generate Tokens Modal */}
      <Modal visible={showGenerateModal} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-[40px] p-8">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-[#122827] text-2xl font-black tracking-tight">Generate Tokens</Text>
              <TouchableOpacity onPress={() => setShowGenerateModal(false)} className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
                <Feather name="x" size={20} color="#122827" />
              </TouchableOpacity>
            </View>

            <Text className="text-[#5F7371] text-xs mb-6">Set your available hours and specify the total number of patient tokens to issue for {selectedTokenDate}.</Text>

            <View className="flex-row space-x-4 mb-4">
              <View className="flex-1">
                <Text className="text-[#122827] font-bold text-xs mb-2 uppercase tracking-wider">Start Time (HH:MM)</Text>
                <View className="bg-[#F5F7F6] rounded-xl px-4 py-3 border border-[#E6F0EE]">
                  <TextInput value={startTime} onChangeText={setStartTime} placeholder="09:00" placeholderTextColor="#8B9C9A" className="text-[#122827] font-bold" />
                </View>
              </View>
              <View className="flex-1">
                <Text className="text-[#122827] font-bold text-xs mb-2 uppercase tracking-wider">End Time (HH:MM)</Text>
                <View className="bg-[#F5F7F6] rounded-xl px-4 py-3 border border-[#E6F0EE]">
                  <TextInput value={endTime} onChangeText={setEndTime} placeholder="17:00" placeholderTextColor="#8B9C9A" className="text-[#122827] font-bold" />
                </View>
              </View>
            </View>

            <View className="mb-8">
              <Text className="text-[#122827] font-bold text-xs mb-2 uppercase tracking-wider">Total Token Count</Text>
              <View className="bg-[#F5F7F6] rounded-xl px-4 py-3 border border-[#E6F0EE]">
                <TextInput value={totalTokens} onChangeText={setTotalTokens} placeholder="20" keyboardType="numeric" placeholderTextColor="#8B9C9A" className="text-[#122827] font-bold" />
              </View>
            </View>

            <TouchableOpacity 
              onPress={handleGenerateTokens} 
              disabled={generating}
              className={`w-full rounded-full py-4 items-center justify-center flex-row ${generating ? 'bg-gray-400' : 'bg-[#246E66]'}`}
            >
              {generating ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Feather name="zap" size={16} color="white" />
                  <Text className="text-white font-bold text-sm tracking-widest uppercase ml-2">Generate Slots</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

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
                onPress={handleLogout}
              >
                <Text className="text-white font-bold text-[15px]">Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Remove Slot Confirmation Modal */}
      <Modal
        visible={!!slotToRemove}
        transparent
        animationType="fade"
        onRequestClose={() => setSlotToRemove(null)}
      >
        <View className="flex-1 bg-black/60 items-center justify-center px-6">
          <View className="bg-white w-full rounded-[32px] p-8 items-center shadow-2xl">
            <View className="w-20 h-20 rounded-full bg-red-50 items-center justify-center mb-5">
              <Feather name="trash-2" size={32} color="#EF4444" />
            </View>
            <Text className="text-[#0F172A] text-[22px] font-black mb-3 tracking-tight">Remove Slot</Text>
            <Text className="text-[#64748B] text-center text-base mb-8 leading-6 px-2">
              Are you sure you want to remove the <Text className="font-bold text-[#122827]">{slotToRemove}</Text> slot? Patients won't be able to book it.
            </Text>
            
            <View className="flex-row w-full space-x-4">
              <TouchableOpacity 
                className="flex-1 bg-[#F1F5F9] rounded-2xl py-4 items-center justify-center"
                onPress={() => setSlotToRemove(null)}
              >
                <Text className="text-[#64748B] font-bold text-[15px]">Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="flex-1 bg-[#EF4444] rounded-2xl py-4 items-center justify-center shadow-md shadow-red-500/30"
                onPress={handleRemoveSlot}
              >
                <Text className="text-white font-bold text-[15px]">Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Close Day Confirmation Modal */}
      <Modal
        visible={showCloseModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCloseModal(false)}
      >
        <View className="flex-1 bg-black/60 items-center justify-center px-6">
          <View className="bg-white w-full rounded-[32px] p-8 items-center shadow-2xl">
            <View className="w-20 h-20 rounded-full bg-red-50 items-center justify-center mb-5 border border-red-100">
              <Feather name="power" size={32} color="#EF4444" />
            </View>
            <Text className="text-[#0F172A] text-[22px] font-black mb-3 tracking-tight text-center">End Consultations?</Text>
            <Text className="text-[#64748B] text-center text-sm mb-8 leading-5 px-2">
              This will remove all remaining empty slots for today. No new patients will be able to book.
            </Text>
            
            <View className="flex-row w-full space-x-4">
              <TouchableOpacity 
                className="flex-1 bg-[#F1F5F9] rounded-2xl py-4 items-center justify-center"
                onPress={() => setShowCloseModal(false)}
              >
                <Text className="text-[#64748B] font-bold text-[15px]">Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="flex-1 bg-[#EF4444] rounded-2xl py-4 items-center justify-center shadow-md shadow-red-500/30"
                onPress={handleCloseConsultations}
              >
                <Text className="text-white font-bold text-[15px]">Close Day</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Profile Navigation Menu Modal */}
      <Modal
        visible={showMenuModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMenuModal(false)}
      >
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-white rounded-t-[40px] p-8 pb-12">
            <View className="flex-row justify-between items-center mb-8">
              <Text className="text-[#122827] text-2xl font-black tracking-tight">Provider Portal</Text>
              <TouchableOpacity onPress={() => setShowMenuModal(false)} className="w-10 h-10 bg-[#F5F7F6] rounded-full items-center justify-center">
                <Feather name="x" size={20} color="#122827" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              className="flex-row items-center bg-[#F5F7F6] p-5 rounded-3xl mb-4 border border-[#E6F0EE]"
              onPress={() => {
                setShowMenuModal(false);
                navigation.navigate('DoctorProfile');
              }}
            >
              <View className="w-12 h-12 rounded-full bg-[#122827] items-center justify-center mr-4">
                <Feather name="user" size={20} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-[#122827] text-lg font-black">My Profile</Text>
                <Text className="text-[#8B9C9A] text-xs font-bold mt-1">Manage details & consultation fee</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#122827" />
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-row items-center bg-[#F5F7F6] p-5 rounded-3xl border border-[#E6F0EE]"
              onPress={() => {
                setShowMenuModal(false);
                navigation.navigate('DoctorAnalytics');
              }}
            >
              <View className="w-12 h-12 rounded-full bg-[#34D399] items-center justify-center mr-4 shadow-lg shadow-[#34D399]/30">
                <Feather name="bar-chart-2" size={20} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-[#122827] text-lg font-black">Earnings & Analytics</Text>
                <Text className="text-[#8B9C9A] text-xs font-bold mt-1">Track your performance</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#122827" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Patient Profile Modal */}
      <Modal
        visible={!!selectedPatient}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedPatient(null)}
      >
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-white rounded-t-[40px] p-8 pb-12">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-[#122827] text-2xl font-black tracking-tight">Patient Profile</Text>
              <TouchableOpacity onPress={() => setSelectedPatient(null)} className="w-10 h-10 bg-[#F5F7F6] rounded-full items-center justify-center">
                <Feather name="x" size={20} color="#122827" />
              </TouchableOpacity>
            </View>

            {selectedPatient && (
              <View className="items-center">
                <View className="w-24 h-24 rounded-full bg-[#E6F0EE] items-center justify-center mb-4 border-4 border-white shadow-lg overflow-hidden">
                  {selectedPatient.profileImage ? (
                    <Image source={{ uri: selectedPatient.profileImage }} className="w-full h-full" resizeMode="cover" />
                  ) : (
                    <Text className="text-[#246E66] text-4xl font-black">{selectedPatient.name.charAt(0)}</Text>
                  )}
                </View>
                <Text className="text-[#122827] text-2xl font-black mb-1">{selectedPatient.name}</Text>
                <Text className="text-[#5F7371] text-sm font-bold tracking-widest uppercase mb-8">Registered Patient</Text>

                <View className="w-full bg-[#F5F7F6] rounded-3xl p-6 border border-[#E6F0EE]">
                  <TouchableOpacity 
                    className="flex-row items-center mb-5 pb-5 border-b border-[#E6F0EE]"
                    onPress={() => selectedPatient.phone && Linking.openURL(`tel:${selectedPatient.phone}`)}
                  >
                    <View className="w-10 h-10 rounded-full bg-white items-center justify-center mr-4 shadow-sm shadow-[#246E66]/20">
                      <Feather name="phone-call" size={18} color="#246E66" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-[#8B9C9A] text-[10px] font-bold uppercase tracking-widest mb-1">Phone Number</Text>
                      <Text className={`text-base font-bold ${selectedPatient.phone ? 'text-[#246E66] underline' : 'text-[#122827]'}`}>{selectedPatient.phone || 'Not Provided'}</Text>
                    </View>
                    {selectedPatient.phone && <Feather name="chevron-right" size={16} color="#8B9C9A" />}
                  </TouchableOpacity>
                  
                  <View className="flex-row items-center mb-5 pb-5 border-b border-[#E6F0EE]">
                    <View className="w-10 h-10 rounded-full bg-white items-center justify-center mr-4">
                      <MaterialCommunityIcons name="water-outline" size={20} color="#EF4444" />
                    </View>
                    <View>
                      <Text className="text-[#8B9C9A] text-[10px] font-bold uppercase tracking-widest mb-1">Blood Group</Text>
                      <Text className="text-[#122827] text-base font-bold">{selectedPatient.bloodGroup || 'Not Provided'}</Text>
                    </View>
                  </View>

                  <View className="flex-row items-center">
                    <View className="w-10 h-10 rounded-full bg-white items-center justify-center mr-4">
                      <Feather name="user" size={18} color="#3B82F6" />
                    </View>
                    <View>
                      <Text className="text-[#8B9C9A] text-[10px] font-bold uppercase tracking-widest mb-1">Age</Text>
                      <Text className="text-[#122827] text-base font-bold">{selectedPatient.age ? `${selectedPatient.age} Years Old` : 'Not Provided'}</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};
