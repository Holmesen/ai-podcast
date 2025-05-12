import { ChatMessage } from '@/components/ChatMessage';
import { colors } from '@/components/theme';
import { Podcast, PodcastMessage, PodcastService } from '@/services/podcast-service';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ConversationView() {
  const { id, readonly } = useLocalSearchParams();
  const isReadOnly = readonly === 'true';
  const scrollViewRef = useRef<ScrollView>(null);

  // 状态定义
  const [isLoading, setIsLoading] = useState(true);
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [messages, setMessages] = useState<PodcastMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 加载播客详情和消息
  useEffect(() => {
    async function loadPodcastConversation() {
      if (!id) {
        setError('未找到播客ID');
        setIsLoading(false);
        return;
      }

      try {
        const podcastData = await PodcastService.getPodcastDetails(id as string);
        setPodcast(podcastData.podcast);
        setMessages(podcastData.messages);
      } catch (err) {
        console.error('加载播客对话失败:', err);
        setError('无法加载播客对话，请稍后重试');
      } finally {
        setIsLoading(false);
      }
    }

    loadPodcastConversation();
  }, [id]);

  // 当消息加载完成时滚动到底部
  useEffect(() => {
    if (messages.length > 0 && scrollViewRef.current) {
      const timeoutId = setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: false });
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [messages]);

  // 加载中状态
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>播客对话</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>加载播客对话...</Text>
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
          <Text style={styles.headerTitle}>播客对话</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
          <Text style={styles.errorText}>{error || '找不到播客对话'}</Text>
          <TouchableOpacity style={styles.backButtonLarge} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>返回</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // 无消息状态
  if (!messages || messages.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>播客对话</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="chatbubbles-outline" size={48} color="#6b7280" />
          <Text style={styles.errorText}>该播客暂无对话内容</Text>
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
        <Text style={styles.headerTitle}>播客对话</Text>
      </View>

      <View style={styles.podcastInfo}>
        <Text style={styles.podcastTitle}>{podcast.title}</Text>
        <Text style={styles.podcastHost}>与 {podcast.hostName || 'AI 主持人'}</Text>
        <Text style={styles.readOnlyLabel}>只读模式</Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContentContainer}
      >
        {messages.map((message, index) => (
          <ChatMessage key={index} type={message.speaker_type === 'host' ? 'ai' : 'user'} content={message.content} />
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>{isReadOnly ? '此对话为只读模式，无法继续发送消息' : null}</Text>
      </View>
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
    backgroundColor: 'white',
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  podcastInfo: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    backgroundColor: 'white',
  },
  podcastTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  podcastHost: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  readOnlyLabel: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '500',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContentContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
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
});
