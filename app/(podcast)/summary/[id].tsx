import MarkdownRenderer from '@/components/MarkdownRenderer';
import { Podcast, PodcastService } from '@/services/podcast-service';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PodcastSummary {
  id: string;
  podcast_id: string;
  key_points?: string[];
  notable_quotes?: string[];
  practical_tips?: string[];
  follow_up_actions?: string[];
  summary_text?: string;
  created_at: string;
  updated_at: string;
}

interface QuoteProps {
  content: string;
  author: string;
  isAI?: boolean;
}

interface TagProps {
  label: string;
}

interface ListItemProps {
  text: string;
}

// 标签组件
const Tag = ({ label }: TagProps) => (
  <View style={styles.tag}>
    <Text style={styles.tagText}>{label}</Text>
  </View>
);

// 引言卡片组件
const QuoteCard = ({ content, author, isAI = false }: QuoteProps) => (
  <View style={styles.quoteCard}>
    <Text style={styles.quoteContent}>{content}</Text>
    <View style={styles.quoteAuthor}>
      <View style={[styles.quoteAvatar, isAI ? styles.aiQuoteAvatar : styles.userQuoteAvatar]}>
        <Ionicons name={isAI ? 'mic' : 'person'} size={12} color="white" />
      </View>
      <Text style={styles.quoteAuthorName}>{author}</Text>
    </View>
  </View>
);

// 列表项组件
const ListItem = ({ text }: ListItemProps) => (
  <View style={styles.listItem}>
    <View style={styles.bulletPoint} />
    <Text style={styles.listItemText}>{text}</Text>
  </View>
);

export default function Summary() {
  const { id } = useLocalSearchParams();

  // 状态定义
  const [isLoading, setIsLoading] = useState(true);
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [summary, setSummary] = useState<PodcastSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 加载播客详情和摘要
  useEffect(() => {
    async function loadPodcastSummary() {
      if (!id) {
        setError('未找到播客ID');
        setIsLoading(false);
        return;
      }

      try {
        const podcastData = await PodcastService.getPodcastDetails(id as string);
        setPodcast(podcastData.podcast);
        setSummary(podcastData.summary);
      } catch (err) {
        console.error('加载播客摘要失败:', err);
        setError('无法加载播客摘要，请稍后重试');
      } finally {
        setIsLoading(false);
      }
    }

    loadPodcastSummary();
  }, [id]);

  // 格式化标签
  const formatTags = (tags?: string[] | null) => {
    if (!tags || tags.length === 0) {
      return ['人工智能', '播客', '对话'];
    }
    return tags;
  };

  // 加载中状态
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>内容总结</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>加载播客总结...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // 错误状态
  if (error || !podcast) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>内容总结</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
          <Text style={styles.errorText}>{error || '找不到播客总结'}</Text>
          <TouchableOpacity style={styles.backButtonLarge} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>返回</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // 如果没有摘要数据，显示提示信息
  if (
    !summary ||
    (!summary.key_points?.length &&
      !summary.notable_quotes?.length &&
      !summary.practical_tips?.length &&
      !summary.follow_up_actions?.length &&
      !summary.summary_text)
  ) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>内容总结</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="document-text-outline" size={48} color="#6b7280" />
          <Text style={styles.errorText}>此播客暂无总结内容</Text>
          <TouchableOpacity style={styles.backButtonLarge} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>返回</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>内容总结</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryTitle}>{podcast.title}</Text>

          <View style={styles.summaryMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color="#6b7280" />
              <Text style={styles.metaText}>{podcast.formattedDuration || '0分钟'}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={16} color="#6b7280" />
              <Text style={styles.metaText}>{podcast.date || '最近更新'}</Text>
            </View>
          </View>

          <View style={styles.tagsContainer}>
            {formatTags(podcast.tags).map((tag, index) => (
              <Tag key={index} label={tag} />
            ))}
          </View>
        </View>

        {summary.summary_text && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text-outline" size={20} color="#6366f1" />
              <Text style={styles.sectionTitle}>整体摘要</Text>
            </View>
            <View style={styles.sectionContent}>
              <MarkdownRenderer content={summary.summary_text} />
            </View>
          </View>
        )}

        {summary.key_points && summary.key_points.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="bulb-outline" size={20} color="#6366f1" />
              <Text style={styles.sectionTitle}>主要观点</Text>
            </View>

            <View style={styles.sectionContent}>
              {summary.key_points.map((point, index) => (
                <ListItem key={index} text={point} />
              ))}
            </View>
          </View>
        )}

        {summary.notable_quotes && summary.notable_quotes.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="chatbubble-outline" size={20} color="#6366f1" />
              <Text style={styles.sectionTitle}>精彩观点</Text>
            </View>

            <View style={styles.sectionContent}>
              {summary.notable_quotes.map((quote, index) => (
                <QuoteCard key={index} content={quote} author={podcast.hostName || '播客主持人'} isAI={true} />
              ))}
            </View>
          </View>
        )}

        {summary.practical_tips && summary.practical_tips.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="list-outline" size={20} color="#6366f1" />
              <Text style={styles.sectionTitle}>实用技巧</Text>
            </View>

            <View style={styles.sectionContent}>
              {summary.practical_tips.map((tip, index) => (
                <ListItem text={tip} key={index} />
              ))}
            </View>
          </View>
        )}

        {summary.follow_up_actions && summary.follow_up_actions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="trending-up-outline" size={20} color="#6366f1" />
              <Text style={styles.sectionTitle}>后续行动</Text>
            </View>

            <View style={styles.sectionContent}>
              {summary.follow_up_actions.map((step, index) => (
                <ListItem key={index} text={step} />
              ))}
            </View>
          </View>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.primaryButton}>
            <Ionicons name="download-outline" size={18} color="white" />
            <Text style={styles.primaryButtonText}>保存笔记</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton}>
            <Ionicons name="share-social-outline" size={18} color="#4b5563" />
            <Text style={styles.secondaryButtonText}>分享</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
    paddingBottom: 32,
  },
  summaryHeader: {
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  summaryMeta: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#ede9fe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    color: '#6366f1',
    fontWeight: '500',
    fontSize: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  sectionContent: {},
  listItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6366f1',
    marginTop: 8,
    marginRight: 12,
  },
  listItemText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: '#4b5563',
  },
  quoteCard: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    position: 'relative',
  },
  quoteContent: {
    fontSize: 15,
    lineHeight: 22,
    fontStyle: 'italic',
    marginBottom: 12,
    color: '#4b5563',
  },
  quoteAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quoteAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  userQuoteAvatar: {
    backgroundColor: '#4f46e5',
  },
  aiQuoteAvatar: {
    backgroundColor: '#6366f1',
  },
  quoteAuthorName: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButtonText: {
    color: '#4b5563',
    fontWeight: '600',
    marginLeft: 8,
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
  summaryText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#4b5563',
  },
  tipItem: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tipAction: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#374151',
  },
  tipStep: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  tipStepNumber: {
    backgroundColor: '#6366f1',
    color: 'white',
    width: 22,
    height: 22,
    borderRadius: 11,
    textAlign: 'center',
    lineHeight: 22,
    fontSize: 12,
    fontWeight: '600',
    marginRight: 10,
    marginTop: 2,
  },
  tipStepText: {
    flex: 1,
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
});
