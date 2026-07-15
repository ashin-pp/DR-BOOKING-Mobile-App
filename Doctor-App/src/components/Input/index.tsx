import React from 'react';
import { View, TextInput, Text, TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  marginBottom?: boolean;
}

export const Input = ({ label, error, marginBottom = true, className = '', ...props }: InputProps) => {
  return (
    <View className={`w-full ${marginBottom ? 'mb-4' : ''}`}>
      <Text className="text-[#122827] font-semibold text-xs tracking-wider uppercase mb-2 ml-1">{label}</Text>
      <TextInput
        className={`w-full bg-white border ${
          error ? 'border-red-400' : 'border-[#E6F0EE]'
        } rounded-[20px] px-5 py-4 text-[#122827] text-sm shadow-sm shadow-[#122827]/5 ${className}`}
        placeholderTextColor="#8B9C9A"
        {...props}
      />
      {error && <Text className="text-red-500 text-xs mt-2 ml-2 font-medium">{error}</Text>}
    </View>
  );
};
