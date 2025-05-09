import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <ExpoStatusBar style="dark" />
      <Tabs
        // tabBar={() => null} // 隐藏默认 Tab Bar
        screenOptions={{
          tabBarActiveTintColor: '#6366f1',
          tabBarInactiveTintColor: '#6b7280',
          tabBarStyle: {
            height: 83 - insets.bottom,
            paddingBottom: 30 - insets.bottom,
            backgroundColor: '#FFFFFF',
            borderTopColor: '#E5E5EA',
          },
          tabBarItemStyle: {
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: '首页',
            tabBarIcon: ({ size, color }) => <Ionicons name="home" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: '探索',
            tabBarIcon: ({ size, color }) => <Ionicons name="compass" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="record"
          options={{
            title: '录制',
            tabBarIcon: ({ size, color }) => <Ionicons name="mic" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: '我的',
            tabBarIcon: ({ size, color }) => <Ionicons name="person" size={size} color={color} />,
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
});
