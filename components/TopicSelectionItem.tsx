import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, shadows } from './theme';

interface TopicSelectionItemProps {
  title: string;
  description: string;
  imageUrl: string;
  isSelected?: boolean;
  onSelect: () => void;
}

export function TopicSelectionItem({
  title,
  description,
  imageUrl,
  isSelected = false,
  onSelect,
}: TopicSelectionItemProps) {
  return (
    <TouchableOpacity
      style={[styles.topicItem, isSelected && styles.topicItemSelected]}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      <Image source={{ uri: imageUrl }} style={styles.topicItemImg} resizeMode="cover" />
      {isSelected && (
        <View style={styles.topicCheck}>
          <Ionicons name="checkmark" size={12} color="white" />
        </View>
      )}
      <View style={styles.topicItemContent}>
        <Text style={styles.topicItemTitle}>{title}</Text>
        <Text style={styles.topicItemDesc} numberOfLines={2}>
          {description}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  topicItem: {
    position: 'relative',
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    ...shadows.sm,
  },
  topicItemSelected: {
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  topicItemImg: {
    width: '100%',
    height: 100,
  },
  topicItemContent: {
    padding: 12,
  },
  topicItemTitle: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 4,
  },
  topicItemDesc: {
    fontSize: 12,
    color: colors.neutral500,
    height: 36,
  },
  topicCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
