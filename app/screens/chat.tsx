import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StreamingChatInterface } from '../../components/StreamingChatInterface';
import { colors } from '../../components/theme';
import { AIService } from '../../services/ai-service';
import { Host, PodcastService } from '../../services/podcast-service';

interface TopicInfo {
  topicId: string;
  podcastId?: string;
  topicTitle?: string;
  topicDescription?: string;
}

export default function Chat() {
  const [topicInfo, setTopicInfo] = useState<TopicInfo | null>(null);
  const [podcastId, setPodcastId] = useState<string | null>(null);
  const [host, setHost] = useState<Host | null>(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 加载已选择的话题和播客信息
  useEffect(() => {
    const loadSelectedTopic = async () => {
      try {
        // 获取话题信息
        const topicData = await AsyncStorage.getItem('selectedTopic');

        if (topicData) {
          // 已有话题选择，解析数据
          const parsedTopicInfo = JSON.parse(topicData);
          setTopicInfo(parsedTopicInfo);

          // 检查是否有关联的播客ID
          if (parsedTopicInfo.podcastId) {
            setPodcastId(parsedTopicInfo.podcastId);
          } else {
            // 没有关联的播客ID，需要创建新播客
            await createNewPodcast(parsedTopicInfo);
          }
        } else {
          // 没有话题选择，返回到record tab
          router.replace('/(tabs)/record');
          return;
        }
      } catch (error) {
        console.error('加载话题数据失败:', error);
        router.replace('/(tabs)/record');
        return;
      }

      setInitialLoadDone(true);
    };

    loadSelectedTopic();
  }, []);

  // 加载主持人信息
  useEffect(() => {
    const loadHostInfo = async () => {
      if (podcastId) {
        setIsLoading(true);
        try {
          // 获取播客详情，包括主持人信息
          const { podcast } = await PodcastService.getPodcastDetails(podcastId);

          if (podcast && podcast.host_id) {
            // 获取主持人详情
            const hosts = await PodcastService.getHosts();
            const currentHost = hosts.find((h) => h.id === podcast.host_id);

            if (currentHost) {
              setHost(currentHost);
            }
          }
        } catch (error) {
          console.error('加载主持人信息失败:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (podcastId) {
      loadHostInfo();
    }
  }, [podcastId]);

  // 创建新播客
  const createNewPodcast = async (topicInfo: TopicInfo) => {
    try {
      // 获取当前用户ID
      const userId = await SecureStore.getItemAsync('userId');
      if (!userId) {
        throw new Error('用户未登录');
      }

      // 获取推荐的主持人
      const hosts = await PodcastService.getHosts(true);

      if (hosts.length === 0) {
        throw new Error('无法获取主持人信息');
      }

      // 默认使用第一个推荐主持人
      const selectedHost = hosts[0];
      setHost(selectedHost);

      // 构建播客标题和描述
      const podcastTitle = topicInfo.topicTitle || '未命名播客';
      const podcastDescription = topicInfo.topicDescription || '与AI主持人的对话';

      // 创建新的播客记录
      const podcast = await PodcastService.createPodcast(
        userId,
        selectedHost.id,
        podcastTitle,
        podcastDescription,
        topicInfo.topicId,
        topicInfo.topicTitle
      );

      if (!podcast) {
        throw new Error('创建播客失败');
      }

      // 更新topicInfo，添加podcastId
      const updatedTopicInfo = {
        ...topicInfo,
        podcastId: podcast.id,
      };

      // 保存更新后的话题信息
      await AsyncStorage.setItem('selectedTopic', JSON.stringify(updatedTopicInfo));

      // 更新状态
      setTopicInfo(updatedTopicInfo);
      setPodcastId(podcast.id);
    } catch (error) {
      console.error('创建播客失败:', error);
      // 创建失败，返回到record tab
      router.replace('/(tabs)/record');
    }
  };

  // 完成对话并返回
  const finishConversation = async () => {
    try {
      if (podcastId) {
        // 更新播客状态为已发布
        await PodcastService.publishPodcast(podcastId);
      }
    } catch (error) {
      console.error('发布播客错误:', error);
    } finally {
      // 无论发布是否成功，都返回录制页面
      router.replace('/(tabs)/record');
    }
  };

  // 对话完成后的回调
  const handleConversationComplete = async () => {
    try {
      if (podcastId) {
        // 更新播客时长
        await PodcastService.updatePodcastDuration(podcastId);

        // 生成并保存播客总结
        const aiService = AIService.getInstance();
        await PodcastService.createPodcastSummary(podcastId, aiService);

        // 完成对话，发布播客并返回
        finishConversation();
      }
    } catch (error) {
      console.error('处理对话完成错误:', error);
      // 发生错误时也尝试完成对话
      finishConversation();
    }
  };

  // 如果还没有完成初始加载或正在加载，显示加载界面
  if (!initialLoadDone || isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>正在准备对话...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* 顶部导航 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={finishConversation}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>对话模式</Text>
        {podcastId && (
          <Link
            href={{
              pathname: '/(podcast)/summary/[id]',
              params: {
                id: podcastId,
              },
            }}
            asChild
          >
            <TouchableOpacity>
              <Ionicons name="list-outline" size={24} color="#111827" />
            </TouchableOpacity>
          </Link>
        )}
      </View>

      {/* 主持人信息 */}
      <View style={styles.hostInfo}>
        <View style={styles.hostAvatar}>
          <Ionicons name="mic" size={22} color="white" />
        </View>
        <View>
          <Text style={styles.hostName}>{host?.name || 'AI主持人'}</Text>
          <Text style={styles.hostTitle}>AI 播客主持人</Text>
        </View>
      </View>

      {/* 播客信息 */}
      <View style={styles.podcastInfo}>
        <View style={styles.podcastInfoIcon}>
          <Ionicons name="bulb-outline" size={20} color="#6366f1" />
        </View>
        <View style={styles.podcastInfoContent}>
          <Text style={styles.podcastInfoTitle}>{topicInfo?.topicTitle || '创意思维方法'}</Text>
          <Text style={styles.podcastInfoDescription} numberOfLines={2}>
            {topicInfo?.topicDescription || '突破思维局限，激发创造力的实用技巧。'}
          </Text>
        </View>
      </View>

      {/* 主要聊天区域 - 使用流式聊天组件 */}
      {podcastId && host ? (
        <StreamingChatInterface
          podcastId={podcastId}
          hostName={host.name}
          hostAvatarUrl={host.avatar_url}
          onSaveComplete={handleConversationComplete}
        />
      ) : (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>无法加载对话。请稍后再试。</Text>
        </View>
      )}
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
    marginTop: 12,
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
    textAlign: 'center',
    fontSize: 16,
    color: colors.error,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f5',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
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
    fontWeight: 'bold',
    color: '#111827',
  },
  hostTitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  podcastInfo: {
    flexDirection: 'row',
    backgroundColor: '#eef2ff',
    padding: 12,
    borderRadius: 8,
    margin: 16,
    marginTop: 0,
  },
  podcastInfoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  podcastInfoContent: {
    flex: 1,
  },
  podcastInfoTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#4f46e5',
    marginBottom: 4,
  },
  podcastInfoDescription: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
});
