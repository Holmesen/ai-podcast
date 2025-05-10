import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';

interface AuthButtonProps {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'outline' | 'text';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function AuthButton({
  title,
  onPress,
  isLoading = false,
  disabled = false,
  variant = 'primary',
  style,
  textStyle,
}: AuthButtonProps) {
  const getButtonStyle = () => {
    switch (variant) {
      case 'outline':
        return [styles.button, styles.outlineButton, disabled && styles.disabledOutlineButton, style];
      case 'text':
        return [styles.button, styles.textButton, disabled && styles.disabledTextButton, style];
      default:
        return [styles.button, styles.primaryButton, disabled && styles.disabledButton, style];
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'outline':
        return [styles.buttonText, styles.outlineButtonText, disabled && styles.disabledButtonText, textStyle];
      case 'text':
        return [styles.buttonText, styles.textButtonText, disabled && styles.disabledButtonText, textStyle];
      default:
        return [styles.buttonText, styles.primaryButtonText, textStyle];
    }
  };

  return (
    <TouchableOpacity style={getButtonStyle()} onPress={onPress} disabled={isLoading || disabled} activeOpacity={0.8}>
      {isLoading ? (
        <ActivityIndicator size="small" color={variant === 'primary' ? '#fff' : '#6366f1'} />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    width: '100%',
  },
  primaryButton: {
    backgroundColor: '#6366f1',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#6366f1',
  },
  textButton: {
    backgroundColor: 'transparent',
  },
  disabledButton: {
    backgroundColor: '#a5a6f6',
  },
  disabledOutlineButton: {
    borderColor: '#a5a6f6',
  },
  disabledTextButton: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: '#fff',
  },
  outlineButtonText: {
    color: '#6366f1',
  },
  textButtonText: {
    color: '#6366f1',
  },
  disabledButtonText: {
    color: '#9ca3af',
  },
});
