import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PodcastCard } from '../../components/PodcastCard';
import { useAuth } from '../../hooks/useAuth';
import { Podcast, PodcastService } from '../../services/podcast-service';

// 骨架屏动画包装组件
function SkeletonItem({ style }: { style: any }) {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [pulseAnim]);

  return <Animated.View style={[style, styles.skeletonAnimation, { opacity: pulseAnim }]} />;
}

// 骨架屏组件 - 播客卡片
function PodcastCardSkeleton() {
  return (
    <View style={styles.podcastCardSkeleton}>
      <SkeletonItem style={styles.podcastImageSkeleton} />
      <View style={styles.podcastContentSkeleton}>
        <SkeletonItem style={styles.podcastTitleSkeleton} />
        <SkeletonItem style={styles.podcastHostSkeleton} />
        <SkeletonItem style={styles.podcastMetaSkeleton} />
      </View>
    </View>
  );
}

export default function MyPodcasts() {
  const { user } = useAuth();
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [filteredPodcasts, setFilteredPodcasts] = useState<Podcast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<'all' | 'published' | 'draft' | 'private'>('all');

  // 加载用户所有播客
  const loadPodcasts = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // 获取用户所有播客，不限制数量 - 启用延迟以演示加载效果
      const userPodcasts = await PodcastService.getUserPodcasts(user.id, 0, 'all');
      setPodcasts(userPodcasts);
      applyFilter(userPodcasts, currentFilter);
    } catch (error) {
      console.error('加载播客错误:', error);
      Alert.alert('错误', '加载播客失败，请重试');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [user, currentFilter]);

  // 应用过滤器
  const applyFilter = (podcastList: Podcast[], filter: 'all' | 'published' | 'draft' | 'private') => {
    if (filter === 'all') {
      setFilteredPodcasts(podcastList);
    } else {
      setFilteredPodcasts(podcastList.filter((podcast) => podcast.publish_status === filter));
    }
  };

  // 处理过滤器更改
  const handleFilterChange = (filter: 'all' | 'published' | 'draft' | 'private') => {
    setCurrentFilter(filter);
    applyFilter(podcasts, filter);
  };

  // 下拉刷新
  const handleRefresh = () => {
    setRefreshing(true);
    loadPodcasts();
  };

  // 组件挂载时加载数据
  useEffect(() => {
    loadPodcasts();
  }, [loadPodcasts]);

  // 导航到播客详情
  const navigateToPodcastDetails = (podcastId: string) => {
    router.push({
      pathname: `/screens/podcast-details`,
      params: { id: podcastId },
    });
  };

  // 返回上一页
  const handleGoBack = () => {
    router.back();
  };

  // 渲染播客卡片
  const renderPodcastItem = ({ item }: { item: Podcast }) => (
    <View style={styles.podcastCardContainer}>
      <PodcastCard
        title={item.title}
        host={item.hostName || '你与 AI 主持人'}
        duration={item.formattedDuration || '0分钟'}
        date={item.date || '未知时间'}
        imageUrl={item.cover_image_url || 'https://via.placeholder.com/150'}
        onPress={() => navigateToPodcastDetails(item.id)}
      />
      {getStatusBadge(item.publish_status)}
    </View>
  );

  // 显示播客状态标签
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return (
          <View style={[styles.statusBadge, styles.publishedBadge]}>
            <Text style={styles.badgeText}>已发布</Text>
          </View>
        );
      case 'draft':
        return (
          <View style={[styles.statusBadge, styles.draftBadge]}>
            <Text style={styles.badgeText}>草稿</Text>
          </View>
        );
      case 'private':
        return (
          <View style={[styles.statusBadge, styles.privateBadge]}>
            <Text style={styles.badgeText}>私密</Text>
          </View>
        );
      default:
        return null;
    }
  };

  // 渲染空状态
  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>正在加载播客...</Text>
        </View>
      );
    }

    if (podcasts.length > 0 && filteredPodcasts.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="filter-outline" size={48} color="#9ca3af" style={styles.emptyStateIcon} />
          <Text style={styles.emptyStateText}>没有找到符合条件的播客</Text>
          <Text style={styles.emptyStateSubtext}>尝试更改筛选条件或创建新的播客</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Ionicons name="mic-off-outline" size={48} color="#9ca3af" style={styles.emptyStateIcon} />
        <Text style={styles.emptyStateText}>你还没有创建任何播客</Text>
        <Text style={styles.emptyStateSubtext}>点击下方按钮开始录制你的第一个播客吧</Text>
        <TouchableOpacity style={styles.startRecordingButton} onPress={() => router.push('/(tabs)/record')}>
          <Ionicons name="mic-outline" size={20} color="white" style={styles.buttonIcon} />
          <Text style={styles.startRecordingButtonText}>开始新的播客</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // 渲染骨架屏
  const renderSkeletonLoading = () => {
    return (
      <>
        <PodcastCardSkeleton />
        <PodcastCardSkeleton />
        <PodcastCardSkeleton />
        <PodcastCardSkeleton />
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>我的播客</Text>
        <View style={styles.placeholderButton} />
      </View>

      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>状态筛选:</Text>
        <View style={styles.filterButtons}>
          <TouchableOpacity
            style={[styles.filterButton, currentFilter === 'all' && styles.activeFilterButton]}
            onPress={() => handleFilterChange('all')}
          >
            <Text style={[styles.filterButtonText, currentFilter === 'all' && styles.activeFilterText]}>全部</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, currentFilter === 'published' && styles.activeFilterButton]}
            onPress={() => handleFilterChange('published')}
          >
            <Text style={[styles.filterButtonText, currentFilter === 'published' && styles.activeFilterText]}>
              已发布
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, currentFilter === 'draft' && styles.activeFilterButton]}
            onPress={() => handleFilterChange('draft')}
          >
            <Text style={[styles.filterButtonText, currentFilter === 'draft' && styles.activeFilterText]}>草稿</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, currentFilter === 'private' && styles.activeFilterButton]}
            onPress={() => handleFilterChange('private')}
          >
            <Text style={[styles.filterButtonText, currentFilter === 'private' && styles.activeFilterText]}>私密</Text>
          </TouchableOpacity>
        </View>
      </View>

      {isLoading && !refreshing ? (
        <ScrollView style={styles.contentContainer}>{renderSkeletonLoading()}</ScrollView>
      ) : (
        <FlatList
          data={filteredPodcasts}
          renderItem={renderPodcastItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          ListEmptyComponent={renderEmptyState()}
        />
      )}
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
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 8,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  placeholderButton: {
    width: 40,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
    paddingTop: 0,
  },
  filterContainer: {
    padding: 16,
    paddingTop: 0,
    paddingBottom: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#4b5563',
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 16,
  },
  activeFilterButton: {
    backgroundColor: '#6366f1',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#4b5563',
  },
  activeFilterText: {
    color: '#ffffff',
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
    paddingBottom: 32,
  },
  podcastCardContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
  },
  publishedBadge: {
    backgroundColor: '#10b981',
  },
  draftBadge: {
    backgroundColor: '#9ca3af',
  },
  privateBadge: {
    backgroundColor: '#6366f1',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#6b7280',
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyStateIcon: {
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#4b5563',
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  startRecordingButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  startRecordingButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 8,
  },
  // 骨架屏样式
  skeletonAnimation: {
    backgroundColor: '#e5e7eb',
    overflow: 'hidden',
    position: 'relative',
  },
  podcastCardSkeleton: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    height: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  podcastImageSkeleton: {
    width: 80,
    height: 80,
  },
  podcastContentSkeleton: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  podcastTitleSkeleton: {
    width: '80%',
    height: 16,
    borderRadius: 4,
    marginBottom: 4,
  },
  podcastHostSkeleton: {
    width: '50%',
    height: 13,
    borderRadius: 4,
    marginBottom: 8,
  },
  podcastMetaSkeleton: {
    width: '70%',
    height: 13,
    borderRadius: 4,
  },
});
