import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary';
  marginBottom?: boolean;
}

export const Button = ({
  title,
  variant = 'primary',
  marginBottom = false,
  className = '',
  ...props
}: ButtonProps) => {
  const isPrimary = variant === 'primary';

  return (
    <TouchableOpacity
      className={`w-full rounded-full overflow-hidden ${marginBottom ? 'mb-4' : ''} ${className}`}
      {...props}
    >
      {isPrimary ? (
        <LinearGradient 
          colors={['#246E66', '#113935']} 
          className="w-full py-4 items-center justify-center flex-row px-2"
        >
          <Text className="text-white font-bold text-[13px] tracking-wide uppercase text-center w-full">
            {title}
          </Text>
        </LinearGradient>
      ) : (
        <View className="w-full py-4 items-center justify-center flex-row px-2 bg-transparent border-2 border-[#122827] rounded-full">
          <Text className="text-[#122827] font-bold text-[13px] tracking-wide uppercase text-center w-full">
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};
