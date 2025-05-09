import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PodcastCard } from '../../components/PodcastCard';
import { QuickAction } from '../../components/QuickAction';
import { SearchBar } from '../../components/SearchBar';
import { TopicCard } from '../../components/TopicCard';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');

  const router = useRouter();

  // 推荐话题数据
  const recommendedTopics = [
    {
      id: '1',
      title: '科技前沿',
      episodeCount: '25+ 话题',
      imageUrl:
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    },
    {
      id: '2',
      title: '心理健康',
      episodeCount: '18+ 话题',
      imageUrl:
        'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    },
    {
      id: '3',
      title: '创意写作',
      episodeCount: '12+ 话题',
      imageUrl:
        'https://images.unsplash.com/photo-1507668077129-56e32842fceb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80',
    },
    {
      id: '4',
      title: '职业发展',
      episodeCount: '20+ 话题',
      imageUrl:
        'https://images.unsplash.com/photo-1434626881859-194d67b2b86f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1474&q=80',
    },
  ];

  // 近期播客数据
  const recentPodcasts = [
    {
      id: '1',
      title: 'AI 与未来工作',
      host: '你与 AI 主持人 Sarah',
      duration: '25分钟',
      date: '昨天',
      imageUrl:
        'https://images.unsplash.com/photo-1589903308904-1010c2294adc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    },
    {
      id: '2',
      title: '高效学习策略',
      host: '你与 AI 主持人 Michael',
      duration: '18分钟',
      date: '3天前',
      imageUrl:
        'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    },
    {
      id: '3',
      title: '心灵成长之旅',
      host: '你与 AI 主持人 Emma',
      duration: '32分钟',
      date: '上周',
      imageUrl:
        'https://images.unsplash.com/photo-1516534775068-ba3e7458af70?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    },
  ];

  // 处理"查看全部"按钮点击
  const handleViewAll = () => {
    // Alert.alert('查看全部', '将显示全部话题');
    // 这里可以在稳定后替换为实际的路由导航
    router.push('/screens/AIDemo');
  };

  // 导航到播客详情页
  const navigateToPodcastDetails = (podcastId: string) => {
    router.push(`/screens/podcast-details?id=${podcastId}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>你好，李明</Text>
          <Text style={styles.headerSubtitle}>今天想聊些什么？</Text>
        </View>

        <SearchBar placeholder="搜索话题、内容或播客" value={searchQuery} onChangeText={setSearchQuery} />

        <QuickAction
          title="开始新播客"
          subtitle="记录你的独特见解和思考"
          icon="mic-outline"
          actionText="立即开始"
          href="/screens/topic-selection"
        />

        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>推荐话题</Text>
            <TouchableOpacity onPress={handleViewAll}>
              <Text style={styles.sectionTitleLink}>查看全部</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScrollContent}
          >
            {recommendedTopics.map((topic) => (
              <TopicCard
                key={topic.id}
                title={topic.title}
                episodeCount={topic.episodeCount}
                imageUrl={topic.imageUrl}
                onPress={() => {}} // 话题点击处理
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>近期播客</Text>
            <TouchableOpacity>
              <Text style={styles.sectionTitleLink}>查看全部</Text>
            </TouchableOpacity>
          </View>

          {recentPodcasts.map((podcast) => (
            <PodcastCard
              key={podcast.id}
              title={podcast.title}
              host={podcast.host}
              duration={podcast.duration}
              date={podcast.date}
              imageUrl={podcast.imageUrl}
              onPress={() => navigateToPodcastDetails(podcast.id)}
            />
          ))}
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
});
