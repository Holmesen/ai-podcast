import { Podcast, PodcastChapter, PodcastService, PodcastSummary } from '@/services/podcast-service';
import { DEFAULT_BLURHASH } from '@/utils/image-utils';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PodcastDetails() {
  const { id } = useLocalSearchParams();

  // 状态定义
  const [isLoading, setIsLoading] = useState(true);
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [chapters, setChapters] = useState<PodcastChapter[]>([]);
  // const [messages, setMessages] = useState<PodcastMessage[]>([]);
  const [summary, setSummary] = useState<PodcastSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 加载播客详情的函数
  const loadPodcastDetails = useCallback(async () => {
    if (!id) {
      setError('未找到播客ID');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const podcastData = await PodcastService.getPodcastDetails(id as string);
      setPodcast(podcastData.podcast);
      setChapters(podcastData.chapters);
      // setMessages(podcastData.messages);
      setSummary(podcastData.summary);
    } catch (err) {
      console.error('加载播客详情失败:', err);
      setError('无法加载播客详情，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  // 添加useFocusEffect以在页面获得焦点时刷新数据
  useFocusEffect(
    useCallback(() => {
      loadPodcastDetails();
    }, [loadPodcastDetails])
  );

  // 格式化标签（从数据库中的字符串数组）
  const formatTags = (tags?: string[] | null) => {
    if (!tags || tags.length === 0) {
      // 如果没有标签，返回默认标签
      return ['人工智能', '播客', '对话'];
    }
    return tags;
  };

  // 获取精彩片段，优先使用chapters，其次使用summary的key_points
  const getHighlights = () => {
    if (chapters && chapters.length > 0) {
      return chapters.map((chapter) => ({
        timestamp: formatTimestamp(chapter.start_time),
        title: chapter.title,
        content: chapter.summary || '该章节没有概要',
      }));
    } else if (summary && summary.key_points && summary.key_points.length > 0) {
      return summary.key_points.map((point, index) => ({
        timestamp: `片段 ${index + 1}`,
        title: point,
        content:
          summary.notable_quotes && summary.notable_quotes[index] ? summary.notable_quotes[index] : '没有相关引用',
      }));
    }

    // 如果没有章节和要点，返回空数组
    return [];
  };

  // 格式化时间戳
  const formatTimestamp = (seconds: number) => {
    if (!seconds && seconds !== 0) return '00:00';

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // 加载中状态
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>加载播客详情...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // 错误状态
  if (error || !podcast) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
          <Text style={styles.errorText}>{error || '找不到播客'}</Text>
          <TouchableOpacity style={styles.backButtonLarge} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>返回</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const highlights = getHighlights();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>

          {/* 添加编辑按钮 */}
          <TouchableOpacity
            style={styles.editButton}
            onPress={() =>
              router.push({
                pathname: '/(podcast)/edit/[id]' as any,
                params: { id: podcast.id },
              })
            }
          >
            <Ionicons name="pencil-outline" size={20} color="#6366f1" />
            <Text style={styles.editButtonText}>编辑</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.podcastHeader}>
          <Image
            source={{ uri: podcast.cover_image_url || 'https://via.placeholder.com/150' }}
            style={styles.podcastImage}
            contentFit="cover"
            placeholder={{ blurhash: DEFAULT_BLURHASH }}
            transition={300}
            cachePolicy="memory-disk"
          />
          <View style={styles.podcastInfo}>
            <Text style={styles.podcastTitle}>{podcast.title}</Text>
            <Text style={styles.podcastHost}>与 {podcast.hostName || 'AI 主持人'}</Text>
            <View style={styles.podcastMeta}>
              <Text style={styles.podcastDate}>{podcast.date || '最近更新'}</Text>
              <View style={styles.bulletSeparator} />
              <Text style={styles.podcastDuration}>{podcast.formattedDuration || '0分钟'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          {/* <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="play" size={22} color="white" />
            <Text style={styles.actionButtonText}>播放</Text>
          </TouchableOpacity> */}
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() =>
              router.push({
                pathname: '/(podcast)/summary/[id]',
                params: { id: podcast.id },
              })
            }
          >
            <Ionicons name="document-text-outline" size={22} color="#6366f1" />
            <Text style={styles.secondaryButtonText}>内容总结</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => {
              router.push({
                pathname: '/(podcast)/conversation/[id]' as any,
                params: { id: podcast.id, readonly: 'true' },
              });
            }}
          >
            <Ionicons name="chatbubbles-outline" size={22} color="#6366f1" />
            <Text style={styles.secondaryButtonText}>查看对话</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>播客介绍</Text>
          <Text style={styles.descriptionText}>
            {podcast.description || '这是一段精彩的播客对话，探讨了与AI相关的主题和见解。'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>话题标签</Text>
          <View style={styles.topicsContainer}>
            {formatTags(podcast.tags).map((topic, index) => (
              <View key={index} style={styles.topicTag}>
                <Text style={styles.topicTagText}>{topic}</Text>
              </View>
            ))}
          </View>
        </View>

        {highlights.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>播客精彩片段</Text>
            {highlights.map((highlight, index) => (
              <View key={index} style={styles.highlightItem}>
                <View style={styles.timestampContainer}>
                  <Ionicons name="time-outline" size={16} color="#6b7280" />
                  <Text style={styles.timestampText}>{highlight.timestamp}</Text>
                </View>
                <Text style={styles.highlightTitle}>{highlight.title}</Text>
                <Text style={styles.highlightContent}>{highlight.content}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={[styles.actionsContainer, { flexDirection: 'column' }]}>
          <TouchableOpacity style={[styles.actionButton]}>
            <Ionicons name="share-outline" size={20} color="white" />
            <Text style={styles.actionButtonText}>分享</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#4b5563',
    marginVertical: 16,
    textAlign: 'center',
  },
  backButtonLarge: {
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 16,
  },
  backButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  backButton: {
    padding: 8,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  editButtonText: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  podcastHeader: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  podcastImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginRight: 16,
  },
  podcastInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  podcastTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  podcastHost: {
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 8,
  },
  podcastMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  podcastDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  bulletSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#6b7280',
    marginHorizontal: 8,
  },
  podcastDuration: {
    fontSize: 14,
    color: '#6b7280',
  },
  actionsContainer: {
    flexDirection: 'row',
    marginBottom: 32,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#6366f1',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.05,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButtonText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
  },
  topicsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  topicTag: {
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  topicTagText: {
    color: '#4b5563',
    fontSize: 14,
  },
  highlightItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timestampText: {
    color: '#6b7280',
    fontSize: 14,
    marginLeft: 4,
  },
  highlightTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  highlightContent: {
    color: '#4b5563',
    fontSize: 14,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
});
