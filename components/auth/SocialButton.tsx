import { AntDesign, FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';

type SocialProvider = 'wechat' | 'apple' | 'google';

interface SocialButtonProps {
  provider: SocialProvider;
  onPress: () => void;
  style?: ViewStyle;
}

export function SocialButton({ provider, onPress, style }: SocialButtonProps) {
  const getIcon = () => {
    switch (provider) {
      case 'wechat':
        return <FontAwesome name="weixin" size={24} color="#07C160" />;
      case 'apple':
        return <AntDesign name="apple1" size={24} color="#000" />;
      case 'google':
        return <AntDesign name="google" size={24} color="#DB4437" />;
      default:
        return null;
    }
  };

  return (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress} activeOpacity={0.8}>
      {getIcon()}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
});
