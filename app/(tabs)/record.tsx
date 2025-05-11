import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomTopicButton } from '../../components/CustomTopicButton';
import { SearchBar } from '../../components/SearchBar';
import { TopicSelectionItem } from '../../components/TopicSelectionItem';
import { PodcastService } from '../../services/podcast-service';
import { TopicService } from '../../services/topic-service';

interface TopicItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

interface OngoingTopic {
  topicId: string;
  topicTitle: string;
  topicDescription: string;
  imageUrl: string;
  lastMessageTime: string;
  messageCount: number;
  podcastId?: string;
}

export default function RecordTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [ongoingTopics, setOngoingTopics] = useState<OngoingTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [filteredTopics, setFilteredTopics] = useState<TopicItem[]>([]);

  // 加载话题数据
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        // 获取推荐话题
        const topicData = await TopicService.getTopics(10, true);

        // 将数据转换为组件需要的格式
        const formattedTopics = topicData.map((topic) => ({
          id: topic.id,
          title: topic.title,
          description: topic.description,
          imageUrl:
            topic.background_image_url ||
            'https://images.unsplash.com/photo-1516383607781-913a19294fd1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80',
        }));

        setTopics(formattedTopics);
        setFilteredTopics(formattedTopics);

        // 如果有数据，默认选中第一个话题
        if (formattedTopics.length > 0) {
          setSelectedTopicId(formattedTopics[0].id);
        }
      } catch (error) {
        console.error('加载话题数据失败:', error);
        // 出错时设置一些默认话题，确保UI可用
        setTopics(getDefaultTopics());
        setFilteredTopics(getDefaultTopics());
        setSelectedTopicId('1');
      }
    };

    fetchTopics();
  }, []);

  // 搜索过滤话题
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredTopics(topics);
      return;
    }

    const lowerCaseQuery = searchQuery.toLowerCase();
    const filtered = topics.filter(
      (topic) =>
        topic.title.toLowerCase().includes(lowerCaseQuery) || topic.description.toLowerCase().includes(lowerCaseQuery)
    );

    setFilteredTopics(filtered);
  }, [searchQuery, topics]);

  // 加载进行中的话题
  useEffect(() => {
    const loadOngoingTopics = async () => {
      try {
        // 先获取用户ID
        const userId = await SecureStore.getItemAsync('userId');
        if (!userId) {
          setIsLoading(false);
          return;
        }

        // 获取用户的播客列表，筛选草稿状态的播客（进行中的播客）
        const userPodcasts = await PodcastService.getUserPodcasts(userId, 10, 'draft');

        // 如果有数据库中的播客数据
        if (userPodcasts && userPodcasts.length > 0) {
          const ongoingTopicsFromDB = await Promise.all(
            userPodcasts.map(async (podcast) => {
              // 对每个播客，获取消息数量
              const messages = await PodcastService.getMessages(podcast.id);

              // 查找话题数据
              let topicInfo;
              if (podcast.topic_id) {
                topicInfo = topics.find((t) => t.id === podcast.topic_id);
              }

              // 创建OngoingTopic对象
              return {
                podcastId: podcast.id,
                topicId: podcast.topic_id || '',
                topicTitle: podcast.title,
                topicDescription: podcast.description || '',
                imageUrl:
                  topicInfo?.imageUrl ||
                  podcast.cover_image_url ||
                  'https://images.unsplash.com/photo-1516383607781-913a19294fd1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80',
                lastMessageTime: new Date(podcast.updated_at).toLocaleDateString(),
                messageCount: messages.length,
              };
            })
          );

          // 更新进行中话题列表
          setOngoingTopics(ongoingTopicsFromDB);

          // 同时保存到AsyncStorage以便于离线访问
          await AsyncStorage.setItem('ongoingTopics', JSON.stringify(ongoingTopicsFromDB));
        } else {
          // 如果数据库中没有数据，尝试从AsyncStorage获取
          const ongoingTopicData = await AsyncStorage.getItem('ongoingTopics');
          const currentTopic = await AsyncStorage.getItem('selectedTopic');

          if (ongoingTopicData) {
            const parsedOngoingTopics = JSON.parse(ongoingTopicData);
            setOngoingTopics(parsedOngoingTopics);
          } else if (currentTopic) {
            // 如果没有进行中的话题记录，但有当前话题，添加到进行中
            const parsedTopic = JSON.parse(currentTopic);

            // 从话题列表中找到对应话题
            const topicInfo = topics.find((t) => t.id === parsedTopic.topicId);

            if (topicInfo) {
              const newOngoingTopic: OngoingTopic = {
                topicId: parsedTopic.topicId,
                topicTitle: parsedTopic.topicTitle || topicInfo.title,
                topicDescription: parsedTopic.topicDescription || topicInfo.description,
                imageUrl: topicInfo.imageUrl,
                lastMessageTime: new Date().toLocaleDateString(),
                messageCount: 1,
                podcastId: parsedTopic.podcastId,
              };

              setOngoingTopics([newOngoingTopic]);
              // 保存到存储中
              await AsyncStorage.setItem('ongoingTopics', JSON.stringify([newOngoingTopic]));
            }
          }
        }
      } catch (error) {
        console.error('加载进行中话题失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // 只有在话题加载完成后才加载进行中的话题
    if (topics.length > 0) {
      loadOngoingTopics();
    }
  }, [topics]);

  // 创建自定义话题
  const handleCustomTopic = () => {
    // 实现自定义话题功能
  };

  // 开始新对话
  const startNewConversation = async () => {
    // 获取选中的话题
    const selectedTopic = topics.find((topic) => topic.id === selectedTopicId);

    if (!selectedTopic) return;

    // 准备话题信息
    const topicInfo = {
      topicId: selectedTopicId,
      topicTitle: selectedTopic.title,
      topicDescription: selectedTopic.description,
    };

    try {
      // 存储选中的话题
      await AsyncStorage.setItem('selectedTopic', JSON.stringify(topicInfo));

      // 创建一个新的进行中话题
      const newOngoingTopic: OngoingTopic = {
        topicId: selectedTopicId,
        topicTitle: selectedTopic.title,
        topicDescription: selectedTopic.description,
        imageUrl: selectedTopic.imageUrl,
        lastMessageTime: new Date().toLocaleDateString(),
        messageCount: 0,
      };

      // 更新进行中话题列表
      const updatedOngoingTopics = [newOngoingTopic, ...ongoingTopics.filter((t) => t.topicId !== selectedTopicId)];
      setOngoingTopics(updatedOngoingTopics);
      await AsyncStorage.setItem('ongoingTopics', JSON.stringify(updatedOngoingTopics));

      // 导航到对话页面
      router.push({
        pathname: '/screens/chat',
      });
    } catch (error) {
      console.error('保存话题失败:', error);
    }
  };

  // 继续进行中的对话
  const continueConversation = async (topic: OngoingTopic) => {
    try {
      // 将选中的话题设置为当前话题，并包含podcastId
      const topicInfo = {
        topicId: topic.topicId,
        topicTitle: topic.topicTitle,
        topicDescription: topic.topicDescription,
        podcastId: topic.podcastId,
      };

      await AsyncStorage.setItem('selectedTopic', JSON.stringify(topicInfo));

      // 导航到对话页面
      router.push({
        pathname: '/screens/chat',
      });
    } catch (error) {
      console.error('设置当前话题失败:', error);
    }
  };

  // 渲染进行中的话题项
  const renderOngoingTopicItem = (topic: OngoingTopic) => (
    <TouchableOpacity
      key={topic.podcastId || topic.topicId}
      style={styles.ongoingTopicItem}
      onPress={() => continueConversation(topic)}
    >
      <Image source={{ uri: topic.imageUrl }} style={styles.ongoingTopicImage} />
      <View style={styles.ongoingTopicContent}>
        <Text style={styles.ongoingTopicTitle}>{topic.topicTitle}</Text>
        <Text style={styles.ongoingTopicMeta}>
          上次更新: {topic.lastMessageTime} · {topic.messageCount} 条消息
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
    </TouchableOpacity>
  );

  // 获取默认话题（当API加载失败时使用）
  const getDefaultTopics = (): TopicItem[] => [
    {
      id: '1',
      title: 'AI 技术趋势',
      description: '探讨人工智能最新发展及其对未来的影响',
      imageUrl:
        'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    },
    {
      id: '2',
      title: '创意思维方法',
      description: '突破思维局限，激发创造力的实用技巧',
      imageUrl:
        'https://images.unsplash.com/photo-1516383607781-913a19294fd1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80',
    },
    {
      id: '3',
      title: '数字化转型',
      description: '讨论企业如何应对数字化挑战与机遇',
      imageUrl:
        'https://images.unsplash.com/photo-1494253109108-2e30c049369b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    },
  ];

  // 如果正在加载数据，显示加载指示器
  if (isLoading && topics.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>加载话题中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>录制播客</Text>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* 正在进行的话题区域 */}
        {ongoingTopics.length > 0 && (
          <View style={styles.ongoingTopicsSection}>
            <Text style={styles.sectionTitle}>进行中的播客</Text>
            <View style={styles.ongoingTopicsList}>{ongoingTopics.map(renderOngoingTopicItem)}</View>
          </View>
        )}

        {/* 话题选择区域 */}
        <View style={styles.newTopicSection}>
          <Text style={styles.sectionTitle}>开始新的播客</Text>
          <Text style={styles.sectionDesc}>
            选择一个你感兴趣的话题，AI 主持人将围绕这个主题与你深入对话，探讨独特见解。
          </Text>

          <SearchBar placeholder="搜索更多话题" value={searchQuery} onChangeText={setSearchQuery} />

          {filteredTopics.length > 0 ? (
            <View style={styles.topicGrid}>
              {filteredTopics.map((topic) => (
                <View style={styles.topicGridItem} key={topic.id}>
                  <TopicSelectionItem
                    title={topic.title}
                    description={topic.description}
                    imageUrl={topic.imageUrl}
                    isSelected={selectedTopicId === topic.id}
                    onSelect={() => setSelectedTopicId(topic.id)}
                  />
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.noResultsContainer}>
              <Ionicons name="search-outline" size={48} color="#d1d5db" />
              <Text style={styles.noResultsText}>未找到相关话题</Text>
              <Text style={styles.noResultsSubText}>请尝试其他关键词或创建自定义话题</Text>
            </View>
          )}

          <CustomTopicButton onPress={handleCustomTopic} />
        </View>
      </ScrollView>

      <View style={styles.actionFooter}>
        <TouchableOpacity
          style={[styles.actionButton, !selectedTopicId && styles.actionButtonDisabled]}
          onPress={startNewConversation}
          disabled={!selectedTopicId}
        >
          <Text style={styles.actionButtonText}>开始新对话</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  scrollContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  sectionDesc: {
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 15,
    lineHeight: 22,
    color: '#4b5563',
  },
  ongoingTopicsSection: {
    marginBottom: 16,
  },
  ongoingTopicsList: {
    paddingHorizontal: 16,
  },
  ongoingTopicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  ongoingTopicImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
    marginRight: 12,
  },
  ongoingTopicContent: {
    flex: 1,
  },
  ongoingTopicTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#111827',
  },
  ongoingTopicMeta: {
    fontSize: 14,
    color: '#6b7280',
  },
  newTopicSection: {
    paddingBottom: 100, // 为底部按钮留出空间
  },
  topicGrid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
  },
  topicGridItem: {
    width: '50%',
    padding: 8,
    marginBottom: 16,
  },
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginVertical: 16,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
  },
  noResultsSubText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
  },
  actionFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  actionButton: {
    backgroundColor: '#6366f1',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  actionButtonDisabled: {
    backgroundColor: '#c7d2fe',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
