import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Modal, Linking, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { doctorService } from '../api/doctorService';
import Toast from 'react-native-toast-message';

export const DoctorAnalyticsScreen = () => {
  const navigation = useNavigation();
  const [filter, setFilter] = useState<'today' | 'weekly' | 'monthly'>('today');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAnalytics(1); // reset to page 1 on search or filter change
    }, 400);
    return () => clearTimeout(timer);
  }, [search, filter]);

  const fetchAnalytics = async (pageNum: number = page) => {
    try {
      setLoading(true);
      const res = await doctorService.getAnalytics(filter, search, pageNum, 10);
      setAnalytics(res.data);
      setPage(pageNum);
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Could not load analytics' });
    } finally {
      setLoading(false);
    }
  };

  const renderFilterTab = (value: 'today' | 'weekly' | 'monthly', label: string) => (
    <TouchableOpacity
      onPress={() => { setFilter(value); setSearch(''); }}
      className={`flex-1 py-3 items-center rounded-xl ${filter === value ? 'bg-[#122827]' : 'bg-transparent'}`}
    >
      <Text className={`text-xs font-bold uppercase tracking-widest ${filter === value ? 'text-white' : 'text-[#8B9C9A]'}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7F6]" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-[#E6F0EE]">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 rounded-full bg-[#F5F7F6] items-center justify-center">
          <Feather name="arrow-left" size={20} color="#122827" />
        </TouchableOpacity>
        <Text className="text-[#122827] text-lg font-black tracking-tight">Earnings & Analytics</Text>
        <View className="w-10 h-10" />
      </View>

      <View className="flex-1 px-6 pt-6">
        {/* Filters */}
        <View className="bg-white rounded-2xl p-1 flex-row mb-5 border border-[#E6F0EE]" style={{ elevation: 2, shadowColor: '#122827', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 }}>
          {renderFilterTab('today', 'Today')}
          {renderFilterTab('weekly', 'Weekly')}
          {renderFilterTab('monthly', 'Monthly')}
        </View>

        {/* Search Bar */}
        <View className="bg-white rounded-2xl px-4 py-3 flex-row items-center mb-6 border border-[#E6F0EE]">
          <Feather name="search" size={18} color="#8B9C9A" />
          <TextInput
            placeholder="Search patients by name or phone..."
            value={search}
            onChangeText={setSearch}
            className="flex-1 ml-3 text-[#122827] text-sm font-bold"
            placeholderTextColor="#8B9C9A"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Feather name="x-circle" size={16} color="#8B9C9A" />
            </TouchableOpacity>
          )}
        </View>

        {loading && !analytics ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#246E66" />
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            {/* Summary Cards */}
            <View className="flex-row justify-between mb-8">
              <View className="bg-[#246E66] flex-1 p-5 rounded-[24px] mr-4 border border-[#34D399]/30 items-center justify-center" style={{ elevation: 10, shadowColor: '#34D399', shadowOpacity: 0.2 }}>
                <Text className="text-white text-[28px] font-black mb-1" numberOfLines={1} adjustsFontSizeToFit>₹{analytics?.totalEarnings || 0}</Text>
                <Text className="text-white/90 text-[10px] font-bold uppercase tracking-wider text-center">Total Earnings</Text>
              </View>
              <View className="bg-white flex-1 p-5 rounded-[24px] border border-[#E6F0EE] items-center justify-center" style={{ elevation: 4, shadowColor: '#122827', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 }}>
                <Text className="text-[#122827] text-[28px] font-black mb-1" numberOfLines={1} adjustsFontSizeToFit>{analytics?.completedCount || 0}</Text>
                <Text className="text-[#5F7371] text-[10px] font-bold uppercase tracking-wider text-center">Finished Visits</Text>
              </View>
            </View>

            {/* History List */}
            <Text className="text-[#122827] text-xl font-black tracking-tight mb-4">Completed Consultations</Text>

            {analytics?.appointments && analytics.appointments.length > 0 ? (
              <>
                {analytics.appointments.map((apt: any) => {
                  const patient = apt.patientId || apt.patientSnapshot;
                  return (
                  <TouchableOpacity 
                    key={apt._id} 
                    onPress={() => setSelectedPatient(patient)}
                    activeOpacity={0.7}
                    className="bg-white rounded-[20px] p-4 mb-3 border border-[#E6F0EE] flex-row items-center justify-between" 
                    style={{ elevation: 2, shadowColor: '#122827', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 }}
                  >
                    <View className="flex-row items-center flex-1 mr-3">
                      <View className="w-10 h-10 rounded-full bg-[#E6F0EE] items-center justify-center mr-3 overflow-hidden border border-white shadow-sm">
                        {patient?.profileImage ? (
                          <Image source={{ uri: patient.profileImage }} className="w-full h-full" resizeMode="cover" />
                        ) : (
                          <Text className="text-[#122827] text-base font-bold">{patient?.name?.charAt(0) || 'U'}</Text>
                        )}
                      </View>
                      <View className="flex-1">
                        <Text className="text-[#122827] text-sm font-bold" numberOfLines={1}>{patient?.name || 'Unknown Patient'}</Text>
                        <Text className="text-[#8B9C9A] text-[10px] font-bold uppercase tracking-widest mt-0.5">{new Date(apt.date).toLocaleDateString()} • {apt.time}</Text>
                      </View>
                    </View>
                    <View className="bg-[#3B82F6]/10 px-3 py-1.5 rounded-full flex-row items-center">
                      <Text className="text-[#3B82F6] text-[10px] font-bold uppercase tracking-widest mr-1">Completed</Text>
                      <Feather name="chevron-right" size={12} color="#3B82F6" />
                    </View>
                  </TouchableOpacity>
                  );
                })}

                {/* Pagination Controls */}
                {analytics.totalPages > 1 && (
                  <View className="flex-row justify-between items-center mt-6 pt-4 border-t border-[#E6F0EE]">
                    <TouchableOpacity 
                      disabled={page === 1}
                      onPress={() => fetchAnalytics(page - 1)}
                      className={`flex-row items-center py-2 px-4 rounded-xl ${page === 1 ? 'opacity-30' : 'bg-white border border-[#E6F0EE]'}`}
                    >
                      <Feather name="chevron-left" size={16} color="#122827" />
                      <Text className="text-[#122827] text-xs font-bold ml-1">Prev</Text>
                    </TouchableOpacity>
                    
                    <Text className="text-[#8B9C9A] text-xs font-bold tracking-widest">
                      PAGE {page} OF {analytics.totalPages}
                    </Text>

                    <TouchableOpacity 
                      disabled={page === analytics.totalPages}
                      onPress={() => fetchAnalytics(page + 1)}
                      className={`flex-row items-center py-2 px-4 rounded-xl ${page === analytics.totalPages ? 'opacity-30' : 'bg-white border border-[#E6F0EE]'}`}
                    >
                      <Text className="text-[#122827] text-xs font-bold mr-1">Next</Text>
                      <Feather name="chevron-right" size={16} color="#122827" />
                    </TouchableOpacity>
                  </View>
                )}
              </>
            ) : (
              <View className="bg-white rounded-[24px] p-8 border border-[#E6F0EE] items-center justify-center mt-2">
                <View className="w-16 h-16 rounded-full bg-[#E6F0EE] items-center justify-center mb-4">
                  <Feather name="search" size={24} color="#5F7371" />
                </View>
                <Text className="text-[#122827] text-base font-bold mb-1 text-center">No Results</Text>
                <Text className="text-[#8B9C9A] text-xs text-center">We couldn't find any completed visits matching your search.</Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>

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
                  {selectedPatient?.profileImage ? (
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
