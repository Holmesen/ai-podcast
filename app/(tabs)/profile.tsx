import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  RefreshControl,
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
import { DEFAULT_BLURHASH, generateAvatarUrl } from '../../utils/image-utils';

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

// 骨架屏组件 - 个人资料卡片
function ProfileSkeleton() {
  return (
    <View style={styles.profileSection}>
      <SkeletonItem style={styles.profileImageSkeleton} />
      <SkeletonItem style={styles.nameSkeleton} />
      <SkeletonItem style={styles.bioSkeleton} />
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <SkeletonItem style={styles.statValueSkeleton} />
          <SkeletonItem style={styles.statLabelSkeleton} />
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <SkeletonItem style={styles.statValueSkeleton} />
          <SkeletonItem style={styles.statLabelSkeleton} />
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <SkeletonItem style={styles.statValueSkeleton} />
          <SkeletonItem style={styles.statLabelSkeleton} />
        </View>
      </View>
    </View>
  );
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

export default function Profile() {
  const { user } = useAuth();
  const [userPodcasts, setUserPodcasts] = useState<Podcast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalPodcasts: 0,
    totalTopics: 0,
    totalMinutes: 0,
  });

  // 加载用户播客数据
  const loadUserData = useCallback(async () => {
    if (!user) return;

    try {
      // 获取用户播客
      const podcasts = await PodcastService.getUserPodcasts(user.id, 3, 'published');
      setUserPodcasts(podcasts);

      // 获取用户统计数据
      const userStats = await PodcastService.getUserPodcastStats(user.id);
      setStats(userStats);
    } catch (error) {
      console.error('加载用户数据错误:', error);
      Alert.alert('错误', '加载用户数据失败，请重试');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user]);

  // 下拉刷新
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadUserData();
  }, [loadUserData]);

  // 组件挂载时加载数据
  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // 如果用户尚未加载完成或未登录，显示占位数据
  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>加载用户数据...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // 导航到播客详情页
  const navigateToPodcastDetails = (podcastId: string) => {
    router.push({
      pathname: '/(podcast)/details/[id]',
      params: { id: podcastId },
    });
  };

  // 处理开始新播客
  const handleStartNewPodcast = () => {
    router.push('/(tabs)/record');
  };

  // 导航到设置页面
  const navigateToSettings = () => {
    router.push('/(profile)/settings' as any);
  };

  // 导航到"我的播客"页面
  const navigateToAllPodcasts = () => {
    router.push('/(profile)/my-podcasts' as any);
  };

  // 获取用户的显示名称
  const getDisplayName = () => {
    if (user.display_name) return user.display_name;
    if (user.username) return user.username;
    return '用户';
  };

  // 获取用户头像
  const getAvatarUrl = () => {
    if (user.avatar_url) return user.avatar_url;
    return generateAvatarUrl(user.display_name || user.username);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#007AFF']} // Android
            tintColor="#007AFF" // iOS
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>个人资料</Text>
          <TouchableOpacity style={styles.settingsButton} onPress={navigateToSettings}>
            <Ionicons name="settings-outline" size={24} color="#111827" />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          // 加载中的骨架屏
          <>
            <ProfileSkeleton />
            <View style={styles.section}>
              <View style={styles.sectionTitleContainer}>
                <View style={[styles.sectionTitleSkeleton, styles.skeletonAnimation]} />
                <View style={[styles.sectionLinkSkeleton, styles.skeletonAnimation]} />
              </View>
              <PodcastCardSkeleton />
              <PodcastCardSkeleton />
            </View>
          </>
        ) : (
          // 加载完成的内容
          <>
            <View style={styles.profileSection}>
              <Image
                source={{
                  uri: getAvatarUrl(),
                }}
                style={styles.profileImage}
                contentFit="cover"
                placeholder={{ blurhash: DEFAULT_BLURHASH }}
                transition={300}
                cachePolicy="memory-disk"
              />
              <Text style={styles.profileName}>{getDisplayName()}</Text>
              <Text style={styles.profileBio}>{user.bio || '这个人很懒，还没有填写个人简介'}</Text>

              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.totalPodcasts}</Text>
                  <Text style={styles.statLabel}>播客</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.totalTopics}</Text>
                  <Text style={styles.statLabel}>话题</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.totalMinutes}</Text>
                  <Text style={styles.statLabel}>分钟</Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionTitleContainer}>
                <Text style={styles.sectionTitle}>我的播客</Text>
                <TouchableOpacity onPress={navigateToAllPodcasts}>
                  <Text style={styles.sectionTitleLink}>查看全部</Text>
                </TouchableOpacity>
              </View>

              {userPodcasts.length > 0 ? (
                userPodcasts.map((podcast) => (
                  <PodcastCard
                    key={podcast.id}
                    title={podcast.title}
                    host={podcast.hostName || '你与 AI 主持人'}
                    duration={podcast.formattedDuration || '0分钟'}
                    date={podcast.date || '未知时间'}
                    imageUrl={podcast.cover_image_url || 'https://via.placeholder.com/150'}
                    onPress={() => navigateToPodcastDetails(podcast.id)}
                  />
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="mic-off-outline" size={40} color="#9ca3af" style={styles.emptyStateIcon} />
                  <Text style={styles.emptyStateText}>你还没有创建任何播客</Text>
                  <Text style={styles.emptyStateSubtext}>点击下方按钮开始录制你的第一个播客吧</Text>
                </View>
              )}
            </View>
          </>
        )}

        <TouchableOpacity style={styles.startRecordingButton} onPress={handleStartNewPodcast}>
          <Ionicons name="mic-outline" size={20} color="white" style={styles.buttonIcon} />
          <Text style={styles.startRecordingButtonText}>开始新的播客</Text>
        </TouchableOpacity>
      </ScrollView>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  settingsButton: {
    padding: 8,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  profileBio: {
    color: '#6b7280',
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    color: '#6b7280',
    fontSize: 14,
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: '#e5e7eb',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  sectionTitleLink: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 30,
    marginBottom: 16,
  },
  emptyStateIcon: {
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#4b5563',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  startRecordingButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
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
  profileImageSkeleton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  nameSkeleton: {
    width: 120,
    height: 24,
    borderRadius: 4,
    marginBottom: 8,
  },
  bioSkeleton: {
    width: 250,
    height: 16,
    borderRadius: 4,
    marginBottom: 24,
  },
  statValueSkeleton: {
    width: 30,
    height: 22,
    borderRadius: 4,
    marginBottom: 4,
  },
  statLabelSkeleton: {
    width: 40,
    height: 14,
    borderRadius: 4,
  },
  sectionTitleSkeleton: {
    width: 100,
    height: 20,
    borderRadius: 4,
  },
  sectionLinkSkeleton: {
    width: 60,
    height: 14,
    borderRadius: 4,
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
