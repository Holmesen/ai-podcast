import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const isNative = Platform.OS === 'ios' || Platform.OS === 'android';

export const getItem = async (key: string) => {
  if (!isNative) {
    return localStorage.getItem(key);
  }
  return await AsyncStorage.getItem(key);
};

export const setItem = async (key: string, value: string) => {
  if (!isNative) {
    return localStorage.setItem(key, value);
  }
  return await AsyncStorage.setItem(key, value);
};

export const removeItem = async (key: string) => {
  if (!isNative) {
    return localStorage.removeItem(key);
  }
  return await AsyncStorage.removeItem(key);
};

export const getItemAsync = async (key: string) => {
  if (!isNative) {
    return localStorage.getItem(key);
  }
  return await AsyncStorage.getItem(key);
};

export const setItemAsync = async (key: string, value: string) => {
  if (!isNative) {
    return localStorage.setItem(key, value);
  }
  return await AsyncStorage.setItem(key, value);
};

export const deleteItemAsync = async (key: string) => {
  if (!isNative) {
    return localStorage.removeItem(key);
  }
  return await AsyncStorage.removeItem(key);
};
