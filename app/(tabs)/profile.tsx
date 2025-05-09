import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PodcastCard } from '../../components/PodcastCard';

export default function Profile() {
  // 用户播客数据
  const userPodcasts = [
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

  // 导航到播客详情页
  const navigateToPodcastDetails = (podcastId: string) => {
    Alert.alert('播客详情', `查看播客ID: ${podcastId}`);
    // 暂时使用Alert替代实际导航，避免路由路径问题
  };

  // 处理开始新播客
  const handleStartNewPodcast = () => {
    Alert.alert('新播客', '开始录制新的播客');
    // 在此添加导航到话题选择页面的逻辑
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>个人资料</Text>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color="#111827" />
          </TouchableOpacity>
        </View>

        <View style={styles.profileSection}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
            }}
            style={styles.profileImage}
          />
          <Text style={styles.profileName}>李明</Text>
          <Text style={styles.profileBio}>热爱探索、学习和分享的思考者</Text>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>播客</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>48</Text>
              <Text style={styles.statLabel}>话题</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>320</Text>
              <Text style={styles.statLabel}>分钟</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>我的播客</Text>
            <TouchableOpacity>
              <Text style={styles.sectionTitleLink}>查看全部</Text>
            </TouchableOpacity>
          </View>

          {userPodcasts.map((podcast) => (
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
});
