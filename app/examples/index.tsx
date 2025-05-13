import { Ionicons } from '@expo/vector-icons';
import { Link, Stack } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

/**
 * 示例页面索引
 */
export default function ExamplesIndex() {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: '功能示例',
          headerTitleStyle: styles.headerTitle,
        }}
      />

      <ScrollView style={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>开发者工具和示例</Text>
          <Text style={styles.subheaderText}>
            这些示例展示了应用中使用的各种功能和组件。 选择一个示例以查看其功能和源代码。
          </Text>
        </View>

        <View style={styles.examplesContainer}>
          <Link href="/examples/ai-roles" asChild>
            <TouchableOpacity style={styles.exampleCard}>
              <View style={styles.iconContainer}>
                <Ionicons name="person-outline" size={24} color="#6366f1" />
              </View>
              <View style={styles.exampleContent}>
                <Text style={styles.exampleTitle}>AI 角色系统</Text>
                <Text style={styles.exampleDescription}>展示使用不同提示词模板创建各种 AI 角色并与之交互</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </Link>

          {/* 未来可以在这里添加更多示例 */}
          <TouchableOpacity style={[styles.exampleCard, styles.disabledCard]}>
            <View style={[styles.iconContainer, styles.disabledIcon]}>
              <Ionicons name="mic-outline" size={24} color="#9ca3af" />
            </View>
            <View style={styles.exampleContent}>
              <Text style={styles.disabledTitle}>话题生成器</Text>
              <Text style={styles.disabledDescription}>演示使用自然语言生成播客话题 (即将推出)</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.exampleCard, styles.disabledCard]}>
            <View style={[styles.iconContainer, styles.disabledIcon]}>
              <Ionicons name="document-text-outline" size={24} color="#9ca3af" />
            </View>
            <View style={styles.exampleContent}>
              <Text style={styles.disabledTitle}>内容摘要</Text>
              <Text style={styles.disabledDescription}>展示自动生成内容摘要功能 (即将推出)</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  scrollContainer: {
    flex: 1,
  },
  headerTitle: {
    fontWeight: 'bold',
  },
  headerContainer: {
    padding: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#111827',
  },
  subheaderText: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 22,
  },
  examplesContainer: {
    padding: 16,
  },
  exampleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  disabledCard: {
    opacity: 0.7,
    backgroundColor: '#f3f4f6',
  },
  iconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#ede9fe',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  disabledIcon: {
    backgroundColor: '#e5e7eb',
  },
  exampleContent: {
    flex: 1,
  },
  exampleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#111827',
  },
  exampleDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  disabledTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#6b7280',
  },
  disabledDescription: {
    fontSize: 14,
    color: '#9ca3af',
  },
});
