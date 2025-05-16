import { colors } from '@/components/theme';
import { PodcastService } from '@/services/podcast-service';
import { HOST_PROMPTS } from '@/utils/prompts';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface TopicInfo {
  topicId: string;
  podcastId?: string;
  topicTitle?: string;
  topicDescription?: string;
}

export interface HostInfo {
  id: string;
  name: string;
  description: string;
  avatar_url?: string;
  promptId: string;
}

export default function SelectHostScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [topicInfo, setTopicInfo] = useState<TopicInfo | null>(null);
  const [selectedHostId, setSelectedHostId] = useState<string>('host-intellectual');
  const [hosts, setHosts] = useState<HostInfo[]>([]);
  const [isCreatingPodcast, setIsCreatingPodcast] = useState(false);

  // 加载主持人数据和当前话题信息
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // 加载当前选择的话题
        const topicData = await AsyncStorage.getItem('selectedTopic');
        if (!topicData) {
          // 没有话题选择，返回到record页面
          router.replace('/(tabs)/record');
          return;
        }

        // 解析话题数据
        const parsedTopicInfo = JSON.parse(topicData);
        setTopicInfo(parsedTopicInfo);

        // 如果已经有podcastId，说明是从已有播客进入的，直接进入对话页面
        if (parsedTopicInfo.podcastId) {
          router.replace('/screens/topic-chat' as any);
          return;
        }

        // 准备主持人数据
        const hostInfoList: HostInfo[] = HOST_PROMPTS.map((prompt) => ({
          id: prompt.id,
          name: prompt.name,
          description: prompt.description,
          promptId: prompt.id,
          avatar_url:
            prompt.id === 'host-intellectual'
              ? 'https://images.unsplash.com/photo-1613743389929-9c235f72d689?q=80&w=3269&auto=format&fit=crop'
              : prompt.id === 'host-casual'
              ? 'https://images.unsplash.com/photo-1569930782211-5b80a1fbb1ce?q=80&w=3280&auto=format&fit=crop'
              : 'https://images.unsplash.com/photo-1537881667896-76ca8d592de7?q=80&w=3270&auto=format&fit=crop',
        }));
        setHosts(hostInfoList);
      } catch (error) {
        console.error('加载数据失败:', error);
        // 发生错误，返回到record页面
        router.replace('/(tabs)/record');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // 创建并导航到新播客
  const createPodcastAndNavigate = async () => {
    if (!topicInfo || isCreatingPodcast) return;

    setIsCreatingPodcast(true);
    try {
      // 获取当前用户ID
      const userId = await SecureStore.getItemAsync('userId');
      if (!userId) {
        throw new Error('用户未登录');
      }

      // 获取选中的主持人信息
      const selectedHost = hosts.find((host) => host.id === selectedHostId);
      if (!selectedHost) {
        throw new Error('未选择主持人');
      }

      // 从数据库获取主持人ID
      const hostList = await PodcastService.getHosts();
      const dbHost = hostList[0]; // 使用第一个主持人

      // 构建播客标题和描述
      const podcastTitle = topicInfo.topicTitle || '未命名播客';
      const podcastDescription = topicInfo.topicDescription || '与AI主持人的对话';

      // 创建新的播客记录
      const podcast = await PodcastService.createPodcast(
        userId,
        dbHost.id, // 使用数据库主持人ID
        podcastTitle,
        podcastDescription,
        topicInfo.topicId,
        topicInfo.topicTitle
      );

      if (!podcast) {
        throw new Error('创建播客失败');
      }

      // 更新topicInfo，添加podcastId和主持人ID
      const updatedTopicInfo = {
        ...topicInfo,
        podcastId: podcast.id,
        hostRoleId: selectedHostId, // 保存选择的主持人角色ID
      };

      // 保存更新后的话题信息
      await AsyncStorage.setItem('selectedTopic', JSON.stringify(updatedTopicInfo));

      // 额外保存一份信息到特定的键，便于之后查找
      await AsyncStorage.setItem(`topicInfo_${podcast.id}`, JSON.stringify(updatedTopicInfo));

      // 导航到主题对话页面
      router.replace('/screens/topic-chat' as any);
    } catch (error) {
      console.error('创建播客失败:', error);
      // 创建失败，返回到record页面
      router.replace('/(tabs)/record');
    } finally {
      setIsCreatingPodcast(false);
    }
  };

  // 渲染主持人卡片
  const renderHostItem = ({ item }: { item: HostInfo }) => {
    const isSelected = selectedHostId === item.id;

    return (
      <TouchableOpacity
        style={[styles.hostCard, isSelected && styles.selectedHostCard]}
        onPress={() => setSelectedHostId(item.id)}
      >
        <Image source={{ uri: item.avatar_url }} style={styles.hostAvatar} contentFit="cover" transition={300} />
        <View style={styles.hostCardContent}>
          <Text style={[styles.hostName, isSelected && styles.selectedHostName]}>{item.name}</Text>
          <Text style={styles.hostDescription} numberOfLines={3}>
            {item.description}
          </Text>
        </View>
        {isSelected && (
          <View style={styles.selectedIndicator}>
            <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>正在加载主持人信息...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.neutral800} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>选择主持人</Text>
      </View>

      <View style={styles.topicInfoContainer}>
        <View style={styles.topicInfoIcon}>
          <Ionicons name="chatbubbles-outline" size={20} color="white" />
        </View>
        <View>
          <Text style={styles.topicLabel}>当前话题</Text>
          <Text style={styles.topicTitle}>{topicInfo?.topicTitle || '未知话题'}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>选择你喜欢的主持人风格</Text>
      <Text style={styles.sectionDescription}>
        不同的主持人有不同的交流风格和专长领域，选择一个最适合当前话题的主持人。
      </Text>

      <FlatList
        data={hosts}
        renderItem={renderHostItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.hostList}
      />

      <View style={styles.actionFooter}>
        <TouchableOpacity
          style={[styles.actionButton, isCreatingPodcast && styles.disabledButton]}
          onPress={createPodcastAndNavigate}
          disabled={isCreatingPodcast}
        >
          {isCreatingPodcast ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.actionButtonText}>开始对话</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral50,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral200,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.neutral800,
  },
  topicInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral200,
  },
  topicInfoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  topicLabel: {
    fontSize: 14,
    color: colors.neutral600,
    marginBottom: 4,
  },
  topicTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral800,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 16,
    color: colors.neutral800,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.neutral600,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  hostList: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  hostCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.neutral200,
  },
  selectedHostCard: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  hostAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  hostCardContent: {
    flex: 1,
  },
  hostName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral800,
    marginBottom: 8,
  },
  selectedHostName: {
    color: colors.primary,
  },
  hostDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.neutral600,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  actionFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: colors.neutral200,
    elevation: 2,
  },
  actionButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: colors.neutral400,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
