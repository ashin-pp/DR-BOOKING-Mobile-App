import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { doctorService } from '../api/doctorService';
import Toast from 'react-native-toast-message';
import { DoctorProfileModal } from '../components/DoctorProfileModal';

const { width } = Dimensions.get('window');

export const AllDoctorsScreen = () => {
  const navigation = useNavigation();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await doctorService.getAllDoctors();
      setDoctors(res.data);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load doctors' });
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', ...new Set(doctors.map(d => d.specialization || 'General'))];
  
  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || (doc.specialization || 'General') === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7F6]">
      {/* Header */}
      <View className="flex-row items-center px-6 pt-4 pb-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 rounded-full bg-white items-center justify-center border border-[#E6F0EE] shadow-sm">
          <Feather name="chevron-left" size={24} color="#122827" />
        </TouchableOpacity>
        <Text className="text-[#122827] text-xl font-black tracking-widest ml-4">Our Specialists</Text>
      </View>

      {/* Search & Filters */}
      <View className="px-6 mb-4 mt-2">
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

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-6 px-6 mb-2">
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

      {/* Doctors List */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#246E66" />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}>
          {filteredDoctors.length === 0 ? (
            <View className="bg-white rounded-3xl p-8 border border-[#E6F0EE] items-center mt-4">
              <Feather name="search" size={40} color="#8B9C9A" className="mb-4" />
              <Text className="text-[#122827] font-bold text-lg mb-2">No Doctors Found</Text>
              <Text className="text-[#8B9C9A] text-sm text-center">We couldn't find any specialists matching your search.</Text>
            </View>
          ) : (
            <View className="flex-row flex-wrap justify-between">
              {filteredDoctors.map((doctor) => (
                <TouchableOpacity 
                  key={doctor._id} 
                  onPress={() => setSelectedDoctor(doctor)}
                  className="bg-white rounded-[24px] p-4 border border-[#E6F0EE] mb-4"
                  style={{ width: (width - 64) / 2, elevation: 2, shadowColor: '#122827', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8 }}
                >
                  <View className="w-full aspect-square rounded-[20px] bg-[#F5F7F6] items-center justify-center mb-3 overflow-hidden">
                    {doctor.profileImage ? (
                      <Image source={{ uri: doctor.profileImage }} className="w-full h-full" resizeMode="cover" />
                    ) : (
                      <MaterialCommunityIcons name="doctor" size={48} color="#246E66" />
                    )}
                  </View>
                  <Text className="text-[#122827] font-bold text-sm mb-1" numberOfLines={1}>Dr. {doctor.name}</Text>
                  <Text className="text-[#8B9C9A] text-xs mb-3 font-semibold uppercase tracking-wider" numberOfLines={1}>{doctor.specialization || 'General'}</Text>
                  
                  <View className="flex-row items-center justify-between pt-3 border-t border-[#F5F7F6]">
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
            </View>
          )}
        </ScrollView>
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
