import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PodcastCard } from '../../components/PodcastCard';
import { QuickAction } from '../../components/QuickAction';
import { SearchBar } from '../../components/SearchBar';
import { TopicCard } from '../../components/TopicCard';
import { Podcast, PodcastService } from '../../services/podcast-service';
import { Topic, TopicService } from '../../services/topic-service';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(true);
  const [isLoadingPodcasts, setIsLoadingPodcasts] = useState(true);

  const { user } = useAuth();
  const router = useRouter();

  // 获取推荐话题
  useEffect(() => {
    const fetchTopics = async () => {
      setIsLoadingTopics(true);
      try {
        // 获取推荐话题，限制为4个，只获取推荐的话题
        const topicsData = await TopicService.getTopics(4, true);
        setTopics(topicsData);
      } catch (error) {
        console.error('获取话题失败:', error);
      } finally {
        setIsLoadingTopics(false);
      }
    };

    fetchTopics();
  }, []);

  // 获取最近的播客
  useEffect(() => {
    const fetchRecentPodcasts = async () => {
      setIsLoadingPodcasts(true);
      try {
        if (user?.id) {
          // 获取当前用户最近的播客，状态为已发布
          const podcastsData = await PodcastService.getUserPodcasts(user.id, 3, 'published');
          setPodcasts(podcastsData);
        }
      } catch (error) {
        console.error('获取播客失败:', error);
      } finally {
        setIsLoadingPodcasts(false);
      }
    };

    if (user) {
      fetchRecentPodcasts();
    }
  }, [user]);

  // 导航到播客详情页
  const navigateToPodcastDetails = (podcastId: string) => {
    router.push({
      pathname: '/(podcast)/details/[id]',
      params: { id: podcastId },
    });
  };

  // 导航到话题详情页
  const navigateToTopicDetails = (topicId: string) => {
    // 这里我们使用简单的方式导航，等待话题详情页面创建后再完善
    router.push('/');
    // 后续可以改为：
    // router.push({
    //   pathname: "/(topics)/[id]",
    //   params: { id: topicId }
    // });
  };

  // 查看全部话题
  const handleViewAllTopics = () => {
    // 目前导航回首页，等待话题列表页面创建后再完善
    router.push('/');
  };

  // 查看全部播客
  const handleViewAllPodcasts = () => {
    // 目前导航回首页，等待播客列表页面创建后再完善
    router.push('/');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>你好，{user?.display_name || user?.username}</Text>
          <Text style={styles.headerSubtitle}>今天想聊些什么？</Text>
        </View>

        <SearchBar placeholder="搜索话题、内容或播客" value={searchQuery} onChangeText={setSearchQuery} />

        <QuickAction
          title="开始新播客"
          subtitle="记录你的独特见解和思考"
          icon="mic-outline"
          actionText="立即开始"
          href="/record"
        />

        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>推荐话题</Text>
            <TouchableOpacity onPress={handleViewAllTopics}>
              <Text style={styles.sectionTitleLink}>查看全部</Text>
            </TouchableOpacity>
          </View>

          {isLoadingTopics ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#6366f1" />
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollContent}
            >
              {topics.length > 0 ? (
                topics.map((topic) => (
                  <TopicCard
                    key={topic.id}
                    title={topic.title}
                    episodeCount={`${topic.popularity_score}+ 热度`}
                    imageUrl={topic.background_image_url}
                    onPress={() => navigateToTopicDetails(topic.id)}
                  />
                ))
              ) : (
                <Text style={styles.emptyText}>暂无推荐话题</Text>
              )}
            </ScrollView>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>近期播客</Text>
            <TouchableOpacity onPress={handleViewAllPodcasts}>
              <Text style={styles.sectionTitleLink}>查看全部</Text>
            </TouchableOpacity>
          </View>

          {isLoadingPodcasts ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#6366f1" />
            </View>
          ) : (
            <>
              {podcasts.length > 0 ? (
                podcasts.map((podcast) => (
                  <PodcastCard
                    key={podcast.id}
                    title={podcast.title}
                    host={podcast.hostName || ''}
                    duration={podcast.formattedDuration || ''}
                    date={podcast.date || ''}
                    imageUrl={
                      podcast.cover_image_url ||
                      'https://images.unsplash.com/photo-1589903308904-1010c2294adc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
                    }
                    onPress={() => navigateToPodcastDetails(podcast.id)}
                  />
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>暂无近期播客</Text>
                  <TouchableOpacity style={styles.createButton} onPress={() => router.push('/record')}>
                    <Text style={styles.createButtonText}>创建您的第一个播客</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
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
  header: {
    paddingVertical: 16,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  headerSubtitle: {
    color: '#6b7280',
    fontSize: 16,
  },
  devExamplesCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  devExamplesContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  devIcon: {
    marginRight: 12,
  },
  devExamplesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0369a1',
  },
  devExamplesSubtitle: {
    fontSize: 13,
    color: '#0ea5e9',
    marginTop: 2,
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
  horizontalScrollContent: {
    paddingBottom: 8,
    gap: 16,
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#6b7280',
    textAlign: 'center',
    padding: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 16,
  },
  createButton: {
    marginTop: 12,
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    color: 'white',
    fontWeight: '500',
  },
});
