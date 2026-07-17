import React, { useState } from 'react';
import { View, TextInput, Text, TextInputProps, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  marginBottom?: boolean;
  isPassword?: boolean;
}

export const Input = ({ label, error, marginBottom = true, isPassword = false, className = '', ...props }: InputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className={`w-full ${marginBottom ? 'mb-4' : ''}`}>
      <Text className="text-[#122827] font-semibold text-xs tracking-wider uppercase mb-2 ml-1">{label}</Text>
      <View className="relative justify-center">
        <TextInput
          className={`w-full bg-white border ${
            error ? 'border-red-400' : 'border-[#E6F0EE]'
          } rounded-[20px] px-5 py-4 pr-12 text-[#122827] text-sm shadow-sm shadow-[#122827]/5 ${className}`}
          placeholderTextColor="#8B9C9A"
          secureTextEntry={isPassword && !showPassword}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity 
            className="absolute right-4" 
            onPress={() => setShowPassword(!showPassword)}
          >
            <Feather name={showPassword ? "eye" : "eye-off"} size={18} color="#8B9C9A" />
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text className="text-red-500 text-xs mt-2 ml-2 font-medium">{error}</Text> : null}
    </View>
  );
};
