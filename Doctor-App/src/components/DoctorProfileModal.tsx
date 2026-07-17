import React from 'react';
import { View, Text, TouchableOpacity, Modal, Image } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface DoctorProfileModalProps {
  doctor: any;
  visible: boolean;
  onClose: () => void;
  onBook?: () => void;
}

export const DoctorProfileModal: React.FC<DoctorProfileModalProps> = ({ doctor, visible, onClose, onBook }) => {
  const navigation = useNavigation();

  if (!doctor) return null;

  const handleBook = () => {
    onClose();
    if (onBook) {
      onBook();
    } else {
      navigation.navigate('BookAppointment' as never);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black/60">
        <View className="bg-white rounded-t-[40px] p-8 pb-12 items-center">
          <TouchableOpacity onPress={onClose} className="absolute top-8 right-8 w-10 h-10 bg-[#F5F7F6] rounded-full items-center justify-center z-10">
            <Feather name="x" size={20} color="#122827" />
          </TouchableOpacity>
          
          <View className="w-24 h-24 rounded-full bg-[#E6F0EE] items-center justify-center mb-4 border-4 border-white shadow-lg mt-4 overflow-hidden">
            {doctor.profileImage ? (
              <Image source={{ uri: doctor.profileImage }} className="w-full h-full" resizeMode="cover" />
            ) : (
              <MaterialCommunityIcons name="doctor" size={48} color="#246E66" />
            )}
          </View>
          <Text className="text-[#122827] text-2xl font-black mb-1">Dr. {doctor.name}</Text>
          <Text className="text-[#246E66] font-bold tracking-widest uppercase mb-6 text-xs">{doctor.specialization || 'General Practitioner'}</Text>
          
          <View className="w-full flex-row justify-between mb-8 px-4">
            <View className="items-center">
              <Text className="text-[#122827] font-black text-xl mb-1">{doctor.experience || 5}+</Text>
              <Text className="text-[#8B9C9A] text-[10px] font-bold uppercase tracking-widest">Years Exp.</Text>
            </View>
            <View className="items-center border-l border-r border-[#E6F0EE] px-8">
              <Text className="text-[#122827] font-black text-xl mb-1">₹{doctor.consultationFee || 250}</Text>
              <Text className="text-[#8B9C9A] text-[10px] font-bold uppercase tracking-widest">Consult Fee</Text>
            </View>
            <View className="items-center">
              <Text className="text-[#122827] font-black text-xl mb-1 flex-row items-center">4.9 <MaterialCommunityIcons name="star" size={16} color="#F59E0B" /></Text>
              <Text className="text-[#8B9C9A] text-[10px] font-bold uppercase tracking-widest">Rating</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            onPress={handleBook}
            className="w-full rounded-full py-4 items-center justify-center flex-row bg-[#122827]"
          >
            <Text className="text-white font-bold text-sm tracking-widest uppercase mr-2">Book Appointment</Text>
            <Feather name="calendar" size={16} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
