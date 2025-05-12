import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DEFAULT_BLURHASH } from '../utils/image-utils';

interface TopicCardProps {
  title: string;
  episodeCount: string;
  imageUrl: string;
  onPress?: () => void;
}

export function TopicCard({ title, episodeCount, imageUrl, onPress }: TopicCardProps) {
  return (
    <TouchableOpacity style={styles.topicCard} onPress={onPress} activeOpacity={0.7}>
      <Image
        source={{ uri: imageUrl }}
        style={styles.topicCardImg}
        contentFit="cover"
        placeholder={{ blurhash: DEFAULT_BLURHASH }}
        transition={300}
        cachePolicy="memory-disk"
      />
      <View style={styles.topicCardContent}>
        <Text style={styles.topicCardTitle}>{title}</Text>
        <Text style={styles.topicCardEpisodes}>{episodeCount}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  topicCard: {
    width: 140,
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  topicCardImg: {
    height: 100,
    width: '100%',
  },
  topicCardContent: {
    padding: 12,
  },
  topicCardTitle: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 4,
  },
  topicCardEpisodes: {
    fontSize: 12,
    color: '#6b7280',
  },
});
