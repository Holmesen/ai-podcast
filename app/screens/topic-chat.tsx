import { AIChatInterface } from '@/components/AIChatInterface';
import { colors } from '@/components/theme';
import { AIService } from '@/services/ai-service';
import { Podcast, PodcastService } from '@/services/podcast-service';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface TopicInfo {
  topicId: string;
  podcastId?: string;
  topicTitle?: string;
  topicDescription?: string;
  hostRoleId?: string; // 主持人角色ID
}

export default function TopicChatScreen() {
  const [topicInfo, setTopicInfo] = useState<TopicInfo | null>(null);
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hostName, setHostName] = useState('AI主持人');

  // 加载话题和播客信息
  useEffect(() => {
    const loadData = async () => {
      try {
        // 获取话题信息
        const topicData = await AsyncStorage.getItem('selectedTopic');

        if (!topicData) {
          Alert.alert('错误', '未找到话题信息');
          router.replace('/(tabs)/record');
          return;
        }

        // 解析话题数据
        const parsedTopicInfo = JSON.parse(topicData);
        setTopicInfo(parsedTopicInfo);

        // 检查是否有播客ID
        if (!parsedTopicInfo.podcastId) {
          Alert.alert('错误', '未找到关联的播客');
          router.replace('/(tabs)/record');
          return;
        }

        // 加载播客信息
        const { podcast: podcastData } = await PodcastService.getPodcastDetails(parsedTopicInfo.podcastId);
        if (!podcastData) {
          Alert.alert('错误', '无法加载播客信息');
          router.replace('/(tabs)/record');
          return;
        }

        setPodcast(podcastData);

        // 根据主持人角色ID设置主持人名称
        if (parsedTopicInfo.hostRoleId) {
          // 根据hostRoleId设置主持人名称
          switch (parsedTopicInfo.hostRoleId) {
            case 'host-intellectual':
              setHostName('知性主持人');
              break;
            case 'host-casual':
              setHostName('轻松聊天主持人');
              break;
            case 'host-inspirational':
              setHostName('励志导师主持人');
              break;
            default:
              setHostName('AI主持人');
          }
        }
      } catch (error) {
        console.error('加载数据失败:', error);
        Alert.alert('错误', '加载数据失败，请重试');
        router.replace('/(tabs)/record');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // 对话完成后的回调
  const handleConversationComplete = async () => {
    try {
      if (podcast?.id) {
        // 更新播客时长
        await PodcastService.updatePodcastDuration(podcast.id);

        // 生成并保存播客总结
        const aiService = AIService.getInstance();
        await PodcastService.createPodcastSummary(podcast.id, aiService);

        // 返回录制页面
        finishConversation();
      }
    } catch (error) {
      console.error('对话完成处理失败:', error);
      finishConversation();
    }
  };

  // 完成对话并返回
  const finishConversation = async () => {
    try {
      if (podcast?.id) {
        // 更新播客状态为已发布
        await PodcastService.publishPodcast(podcast.id);
      }
    } catch (error) {
      console.error('发布播客失败:', error);
    } finally {
      // 返回录制页面
      router.replace('/(tabs)/record');
    }
  };

  // 加载中状态
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>正在准备对话...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // 没有必要的数据
  if (!topicInfo || !podcast || !topicInfo.topicTitle) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          <Text style={styles.errorText}>无法加载对话数据</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/(tabs)/record')}>
            <Text style={styles.backButtonText}>返回</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* 顶部导航 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={finishConversation}>
          <Ionicons name="arrow-back" size={24} color={colors.neutral800} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>主题对话</Text>
        <Link
          href={{
            pathname: '/(podcast)/edit/[id]' as any,
            params: {
              id: podcast?.id,
            },
          }}
          disabled={!podcast?.id}
          asChild
        >
          <TouchableOpacity>
            <Ionicons name="settings-outline" size={24} color={colors.neutral800} />
          </TouchableOpacity>
        </Link>
      </View>

      {/* 主持人和话题信息 */}
      <View style={styles.infoContainer}>
        <View style={styles.hostInfo}>
          <View style={styles.hostAvatar}>
            <Ionicons name="mic" size={22} color="white" />
          </View>
          <View>
            <Text style={styles.hostName}>{hostName}</Text>
            <Text style={styles.hostTitle}>AI 播客主持人</Text>
          </View>
        </View>

        <View style={styles.topicInfo}>
          <View style={styles.topicIcon}>
            <Ionicons name="chatbubbles-outline" size={20} color={colors.primary} />
          </View>
          <View style={styles.topicContent}>
            <Text style={styles.topicTitle}>{topicInfo.topicTitle}</Text>
            <Text style={styles.topicDescription} numberOfLines={2}>
              {topicInfo.topicDescription || '与AI主持人的深度对话'}
            </Text>
          </View>
        </View>
      </View>

      {/* 主题聊天界面，使用AI SDK的useChat实现 */}
      <View style={styles.chatContainer}>
        <AIChatInterface
          chatId={podcast.id}
          topic={topicInfo.topicTitle}
          hostRoleId={topicInfo.hostRoleId || 'host-intellectual'}
          hostName={hostName}
          onConversationComplete={handleConversationComplete}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.neutral700,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    color: colors.neutral800,
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral200,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.neutral800,
  },
  infoContainer: {
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral200,
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  hostAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  hostName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral800,
  },
  hostTitle: {
    fontSize: 14,
    color: colors.neutral600,
  },
  topicInfo: {
    flexDirection: 'row',
    backgroundColor: colors.primaryLight,
    padding: 12,
    borderRadius: 8,
    margin: 16,
    marginTop: 0,
    marginBottom: 16,
  },
  topicIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  topicContent: {
    flex: 1,
  },
  topicTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4,
  },
  topicDescription: {
    fontSize: 14,
    color: colors.neutral700,
    lineHeight: 20,
  },
  chatContainer: {
    flex: 1,
  },
});
