import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DEFAULT_BLURHASH } from '../utils/image-utils';

interface PodcastCardProps {
  title: string;
  host: string;
  duration: string;
  date: string;
  imageUrl: string;
  onPress?: () => void;
}

export function PodcastCard({ title, host, duration, date, imageUrl, onPress }: PodcastCardProps) {
  return (
    <TouchableOpacity style={styles.podcastCard} onPress={onPress} activeOpacity={0.7}>
      <Image
        source={{ uri: imageUrl }}
        style={styles.podcastCardImg}
        contentFit="cover"
        placeholder={{ blurhash: DEFAULT_BLURHASH }}
        transition={300}
        cachePolicy="memory-disk"
      />
      <View style={styles.podcastCardContent}>
        <View>
          <Text style={styles.podcastCardTitle}>{title}</Text>
          <Text style={styles.podcastCardHost}>{host}</Text>
        </View>
        <View style={styles.podcastCardMeta}>
          <Text style={styles.podcastCardMetaText}>{`${duration} · ${date}`}</Text>
          <TouchableOpacity style={styles.podcastCardPlay}>
            <Ionicons name="play" size={14} color="#6366f1" />
            <Text style={styles.podcastCardPlayText}>继续收听</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  podcastCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  podcastCardImg: {
    width: 92,
    height: 92,
    marginVertical: 'auto',
  },
  podcastCardContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  podcastCardTitle: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 4,
  },
  podcastCardHost: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 8,
  },
  podcastCardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  podcastCardMetaText: {
    fontSize: 13,
    color: '#4b5563',
  },
  podcastCardPlay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  podcastCardPlayText: {
    fontSize: 13,
    color: '#6366f1',
    marginLeft: 4,
  },
});
