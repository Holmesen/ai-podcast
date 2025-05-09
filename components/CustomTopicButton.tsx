import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, shadows } from './theme';

interface CustomTopicButtonProps {
  onPress: () => void;
}

export function CustomTopicButton({ onPress }: CustomTopicButtonProps) {
  return (
    <TouchableOpacity style={styles.customTopic} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.customTopicIcon}>
        <Ionicons name="add" size={20} color={colors.primary} />
      </View>
      <View style={styles.customTopicContent}>
        <Text style={styles.customTopicTitle}>创建自定义话题</Text>
        <Text style={styles.customTopicDesc}>输入你想要探讨的具体话题或问题</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.neutral400} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  customTopic: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 32,
    ...shadows.sm,
  },
  customTopicIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  customTopicContent: {
    flex: 1,
  },
  customTopicTitle: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 4,
  },
  customTopicDesc: {
    fontSize: 13,
    color: colors.neutral500,
  },
});
