import { Stack } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import AIRoleDemo from '../../components/AIRoleDemo';

/**
 * AI 角色系统示例页面
 */
export default function AIRolesExample() {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'AI 角色系统示例',
          headerTitleStyle: styles.headerTitle,
        }}
      />

      <View style={styles.introContainer}>
        <Text style={styles.introTitle}>AI 角色管理演示</Text>
        <Text style={styles.introText}>
          本示例展示了如何使用提示词模板创建不同风格的 AI 角色，
          以及如何在对话中使用这些角色。你可以选择不同的角色模板， 自定义指令，以及通过对话观察角色的行为特点。
        </Text>
      </View>

      <AIRoleDemo />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  headerTitle: {
    fontWeight: 'bold',
  },
  introContainer: {
    padding: 16,
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 8,
    elevation: 2,
  },
  introTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  introText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4b5563',
  },
});
