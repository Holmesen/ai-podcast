import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { router } from 'expo-router';
// import * as SecureStore from 'expo-secure-store';
import * as SecureStore from '@/utils/storage';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomTopicButton } from '../../components/CustomTopicButton';
import { SearchBar } from '../../components/SearchBar';
import { TopicSelectionItem } from '../../components/TopicSelectionItem';
import { PodcastService } from '../../services/podcast-service';
import { TopicService } from '../../services/topic-service';
import { DEFAULT_BLURHASH } from '../../utils/image-utils';

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
  deleted_at?: string; // 软删除时间
}

export default function RecordTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [ongoingTopics, setOngoingTopics] = useState<OngoingTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [filteredTopics, setFilteredTopics] = useState<TopicItem[]>([]);

  // 回收站相关状态
  const [showRecycleBin, setShowRecycleBin] = useState(false);
  const [deletedPodcasts, setDeletedPodcasts] = useState<OngoingTopic[]>([]);
  const [isRecycleBinLoading, setIsRecycleBinLoading] = useState(false);

  // 下拉刷新状态
  const [refreshing, setRefreshing] = useState(false);

  // 加载话题数据
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

  // 加载进行中的话题
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
        // 如果数据库中没有数据，清空ongoingTopics
        setOngoingTopics([]);
        await AsyncStorage.removeItem('ongoingTopics');
      }
    } catch (error) {
      console.error('加载进行中话题失败:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false); // 结束刷新状态
    }
  };

  // 初始加载数据
  useEffect(() => {
    fetchTopics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 加载进行中的话题
  useEffect(() => {
    // 只有在话题加载完成后才加载进行中的话题
    if (topics.length > 0) {
      loadOngoingTopics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topics]);

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

  // 添加加载回收站内容的useEffect
  useEffect(() => {
    // 只有在回收站打开时才加载
    if (showRecycleBin) {
      loadDeletedPodcasts();
    }
  }, [showRecycleBin]);

  // 下拉刷新处理函数
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // 从数据库重新获取数据
    await fetchTopics();
    await loadOngoingTopics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 加载已删除的播客
  const loadDeletedPodcasts = async () => {
    setIsRecycleBinLoading(true);
    try {
      // 获取用户ID
      const userId = await SecureStore.getItemAsync('userId');
      if (!userId) {
        setIsRecycleBinLoading(false);
        return;
      }

      // 获取已删除的播客
      const deletedPoddcastsData = await PodcastService.getDeletedPodcasts(userId);

      // 转换为OngoingTopic格式
      const formattedPodcasts: OngoingTopic[] = deletedPoddcastsData.map((podcast) => ({
        podcastId: podcast.id,
        topicId: podcast.topic_id || '',
        topicTitle: podcast.title,
        topicDescription: podcast.description || '',
        imageUrl:
          podcast.cover_image_url ||
          'https://images.unsplash.com/photo-1516383607781-913a19294fd1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80',
        lastMessageTime: new Date(podcast.deleted_at || podcast.updated_at).toLocaleDateString(),
        messageCount: 0, // 这里可能需要通过额外API获取消息数
        deleted_at: podcast.deleted_at,
      }));

      setDeletedPodcasts(formattedPodcasts);
    } catch (error) {
      console.error('加载已删除播客失败:', error);
    } finally {
      setIsRecycleBinLoading(false);
    }
  };

  // 恢复已删除的播客
  const handleRestorePodcast = async (topic: OngoingTopic) => {
    if (!topic.podcastId) return;

    try {
      const success = await PodcastService.restorePodcast(topic.podcastId);

      if (success) {
        // 从删除列表中移除
        setDeletedPodcasts((prev) => prev.filter((p) => p.podcastId !== topic.podcastId));

        // 添加到进行中列表
        const restoredTopic: OngoingTopic = {
          ...topic,
          lastMessageTime: new Date().toLocaleDateString(),
        };

        const updatedOngoingTopics = [restoredTopic, ...ongoingTopics];
        setOngoingTopics(updatedOngoingTopics);

        // 更新本地存储
        await AsyncStorage.setItem('ongoingTopics', JSON.stringify(updatedOngoingTopics));

        Alert.alert('恢复成功', `"${topic.topicTitle}"已恢复`);
      } else {
        Alert.alert('恢复失败', '无法恢复该播客，请稍后重试');
      }
    } catch (error) {
      console.error('恢复播客出错:', error);
      Alert.alert('恢复失败', '发生错误，请稍后重试');
    }
  };

  // 永久删除播客
  const handlePermanentDelete = async (topic: OngoingTopic) => {
    if (!topic.podcastId) return;

    Alert.alert(
      '永久删除',
      `确定要永久删除"${topic.topicTitle}"吗？此操作无法撤销。`,
      [
        {
          text: '取消',
          style: 'cancel',
        },
        {
          text: '永久删除',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await PodcastService.deletePodcast(topic.podcastId!);

              if (success) {
                // 从删除列表中移除
                setDeletedPodcasts((prev) => prev.filter((p) => p.podcastId !== topic.podcastId));
                Alert.alert('删除成功', '播客已永久删除');
              } else {
                Alert.alert('删除失败', '无法删除该播客，请稍后重试');
              }
            } catch (error) {
              console.error('永久删除播客出错:', error);
              Alert.alert('删除失败', '发生错误，请稍后重试');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

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

      // 导航到选择主持人页面，而不是直接进入聊天
      router.push({
        pathname: '/screens/select-host' as any,
      });
    } catch (error) {
      console.error('保存话题失败:', error);
    }
  };

  // 删除播客
  const handleDeletePodcast = async (topic: OngoingTopic) => {
    if (!topic.podcastId) {
      // 如果没有podcastId，这是一个本地记录，直接从本地存储中删除
      const updatedTopics = ongoingTopics.filter((t) =>
        topic.podcastId ? t.podcastId !== topic.podcastId : t.topicId !== topic.topicId
      );
      setOngoingTopics(updatedTopics);
      await AsyncStorage.setItem('ongoingTopics', JSON.stringify(updatedTopics));
      return;
    }

    // 显示确认对话框
    Alert.alert(
      '移到回收站',
      `确定要将"${topic.topicTitle}"移到回收站吗？您可以稍后从回收站恢复。`,
      [
        {
          text: '取消',
          style: 'cancel',
        },
        {
          text: '移到回收站',
          style: 'destructive',
          onPress: async () => {
            try {
              // 调用服务软删除播客
              const success = await PodcastService.softDeletePodcast(topic.podcastId!);

              if (success) {
                // 从状态中移除
                const updatedTopics = ongoingTopics.filter((t) => t.podcastId !== topic.podcastId);
                setOngoingTopics(updatedTopics);

                // 更新本地存储
                await AsyncStorage.setItem('ongoingTopics', JSON.stringify(updatedTopics));

                // 如果当前选中的话题被删除，也需要清理
                const currentTopic = await AsyncStorage.getItem('selectedTopic');
                if (currentTopic) {
                  const parsedTopic = JSON.parse(currentTopic);
                  if (parsedTopic.podcastId === topic.podcastId) {
                    await AsyncStorage.removeItem('selectedTopic');
                  }
                }
              } else {
                Alert.alert('操作失败', '无法移动该播客到回收站，请稍后重试。');
              }
            } catch (error) {
              console.error('删除播客出错:', error);
              Alert.alert('操作失败', '发生错误，请稍后重试。');
            }
          },
        },
      ],
      { cancelable: true }
    );
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

      // 检查该播客的详细信息，判断是否已经设置了hostRoleId
      if (topic.podcastId) {
        try {
          const savedTopicData = await AsyncStorage.getItem(`topicInfo_${topic.podcastId}`);
          if (savedTopicData) {
            const savedTopic = JSON.parse(savedTopicData);
            if (savedTopic.hostRoleId) {
              // 如果已经有hostRoleId，直接进入topic-chat
              router.push({
                pathname: '/screens/topic-chat' as any,
              });
              return;
            }
          }
        } catch (error) {
          console.error('检查保存的话题信息失败:', error);
        }
      }

      // 如果没有找到hostRoleId，导航到对话页面
      router.push({
        pathname: '/screens/select-host' as any,
      });
    } catch (error) {
      console.error('设置当前话题失败:', error);
    }
  };

  // 渲染进行中的话题项
  const renderOngoingTopicItem = (topic: OngoingTopic) => (
    <View key={topic.podcastId || topic.topicId} style={styles.ongoingTopicContainer}>
      <TouchableOpacity style={styles.ongoingTopicItem} onPress={() => continueConversation(topic)}>
        <Image
          source={{ uri: topic.imageUrl }}
          style={styles.ongoingTopicImage}
          contentFit="cover"
          placeholder={{ blurhash: DEFAULT_BLURHASH }}
          transition={300}
          cachePolicy="memory-disk"
        />
        <View style={styles.ongoingTopicContent}>
          <Text style={styles.ongoingTopicTitle}>{topic.topicTitle}</Text>
          <Text style={styles.ongoingTopicMeta}>
            上次更新: {topic.lastMessageTime} · {topic.messageCount} 条消息
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeletePodcast(topic)}>
        <Ionicons name="trash-outline" size={20} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );

  // 渲染回收站中的播客项
  const renderDeletedPodcastItem = (topic: OngoingTopic) => (
    <View key={topic.podcastId} style={styles.ongoingTopicContainer}>
      <View style={styles.ongoingTopicItem}>
        <Image
          source={{ uri: topic.imageUrl }}
          style={styles.ongoingTopicImage}
          contentFit="cover"
          placeholder={{ blurhash: DEFAULT_BLURHASH }}
          transition={300}
          cachePolicy="memory-disk"
        />
        <View style={styles.ongoingTopicContent}>
          <Text style={styles.ongoingTopicTitle}>{topic.topicTitle}</Text>
          <Text style={styles.ongoingTopicMeta}>删除于: {topic.lastMessageTime}</Text>
        </View>
        <View style={styles.deletedItemActions}>
          <TouchableOpacity
            style={[styles.actionIconButton, styles.restoreButton]}
            onPress={() => handleRestorePodcast(topic)}
          >
            <Ionicons name="refresh-outline" size={18} color="#3b82f6" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionIconButton, styles.permanentDeleteButton]}
            onPress={() => handlePermanentDelete(topic)}
          >
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
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

  // 渲染加载中状态
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

  // 切换回收站显示状态
  const toggleRecycleBin = () => {
    setShowRecycleBin(!showRecycleBin);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>录制播客</Text>
        <TouchableOpacity style={styles.recycleBinButton} onPress={toggleRecycleBin}>
          <Ionicons name={showRecycleBin ? 'albums-outline' : 'trash-outline'} size={22} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#6366f1']}
            tintColor={'#6366f1'}
            title={'正在刷新...'}
            titleColor={'#6b7280'}
          />
        }
      >
        {/* 回收站内容 */}
        {showRecycleBin ? (
          <View style={styles.recycleBinSection}>
            <View style={styles.recycleBinHeader}>
              <Text style={styles.sectionTitle}>回收站</Text>
              <TouchableOpacity onPress={toggleRecycleBin}>
                <Text style={styles.backButton}>返回</Text>
              </TouchableOpacity>
            </View>

            {isRecycleBinLoading ? (
              <View style={styles.recycleBinLoadingContainer}>
                <ActivityIndicator size="small" color="#6366f1" />
                <Text style={styles.recycleBinLoadingText}>加载中...</Text>
              </View>
            ) : deletedPodcasts.length > 0 ? (
              <View style={styles.ongoingTopicsList}>{deletedPodcasts.map(renderDeletedPodcastItem)}</View>
            ) : (
              <View style={styles.emptyRecycleBin}>
                <Ionicons name="trash-outline" size={48} color="#d1d5db" />
                <Text style={styles.emptyRecycleBinText}>回收站为空</Text>
              </View>
            )}
          </View>
        ) : (
          <>
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
          </>
        )}
      </ScrollView>

      {!showRecycleBin && (
        <View style={styles.actionFooter}>
          <TouchableOpacity
            style={[styles.actionButton, !selectedTopicId && styles.actionButtonDisabled]}
            onPress={startNewConversation}
            disabled={!selectedTopicId}
          >
            <Text style={styles.actionButtonText}>开始新对话</Text>
          </TouchableOpacity>
        </View>
      )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  ongoingTopicContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  ongoingTopicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
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
  deleteButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
    borderRadius: 12,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 3,
    zIndex: 2,
  },
  recycleBinButton: {
    padding: 8,
  },
  recycleBinSection: {
    flex: 1,
  },
  recycleBinHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 16,
  },
  backButton: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '500',
  },
  recycleBinLoadingContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recycleBinLoadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6b7280',
  },
  emptyRecycleBin: {
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyRecycleBinText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9ca3af',
    fontWeight: '500',
  },
  deletedItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  restoreButton: {
    backgroundColor: '#eff6ff',
  },
  permanentDeleteButton: {
    backgroundColor: '#fef2f2',
  },
});
