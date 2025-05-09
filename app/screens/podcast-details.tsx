import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PodcastDetails() {
  const params = useLocalSearchParams();
  const { id } = params;

  // 在实际应用中，这里会根据 id 从 API 获取播客详情
  // 这里使用模拟数据
  const podcastDetails = {
    id: id || '1',
    title: 'AI 与未来工作',
    host: 'AI 主持人 Sarah',
    date: '2023年10月15日',
    duration: '25分钟',
    imageUrl:
      'https://images.unsplash.com/photo-1589903308904-1010c2294adc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    description:
      '在这一期播客中，我们讨论了人工智能如何改变未来的工作方式。随着AI技术的快速发展，许多传统职业正在经历巨大变革，同时也创造了新的就业机会和职业路径。我们探讨了如何为这个变化做好准备，以及如何利用AI提高自己的工作效率和创新能力。',
    topics: ['人工智能', '未来工作', '职业发展', '技术创新'],
    highlights: [
      {
        timestamp: '00:02:15',
        title: '人工智能在职场中的应用',
        content: '讨论了各行业中AI应用的实例和影响',
      },
      {
        timestamp: '00:08:42',
        title: '未来十年最有前景的职业',
        content: '预测了AI时代最有发展潜力的新兴职业',
      },
      {
        timestamp: '00:15:30',
        title: '如何与AI协同工作',
        content: '分享了提高AI工具使用效率的实用技巧',
      },
      {
        timestamp: '00:19:54',
        title: '培养AI时代的核心竞争力',
        content: '探讨了人类在AI时代仍然具有优势的能力',
      },
    ],
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>

        <View style={styles.podcastHeader}>
          <Image source={{ uri: podcastDetails.imageUrl }} style={styles.podcastImage} />
          <View style={styles.podcastInfo}>
            <Text style={styles.podcastTitle}>{podcastDetails.title}</Text>
            <Text style={styles.podcastHost}>与 {podcastDetails.host}</Text>
            <View style={styles.podcastMeta}>
              <Text style={styles.podcastDate}>{podcastDetails.date}</Text>
              <View style={styles.bulletSeparator} />
              <Text style={styles.podcastDuration}>{podcastDetails.duration}</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="play" size={22} color="white" />
            <Text style={styles.actionButtonText}>播放</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
            <Ionicons name="share-outline" size={22} color="#6366f1" />
            <Text style={styles.secondaryButtonText}>分享</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>播客介绍</Text>
          <Text style={styles.descriptionText}>{podcastDetails.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>话题标签</Text>
          <View style={styles.topicsContainer}>
            {podcastDetails.topics.map((topic, index) => (
              <View key={index} style={styles.topicTag}>
                <Text style={styles.topicTagText}>{topic}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>播客精彩片段</Text>
          {podcastDetails.highlights.map((highlight, index) => (
            <View key={index} style={styles.highlightItem}>
              <View style={styles.timestampContainer}>
                <Ionicons name="time-outline" size={16} color="#6b7280" />
                <Text style={styles.timestampText}>{highlight.timestamp}</Text>
              </View>
              <Text style={styles.highlightTitle}>{highlight.title}</Text>
              <Text style={styles.highlightContent}>{highlight.content}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.newConversationButton}>
          <Ionicons name="chatbubble-outline" size={20} color="white" style={styles.buttonIcon} />
          <Text style={styles.newConversationButtonText}>开始相关对话</Text>
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
  backButton: {
    padding: 8,
    marginBottom: 16,
  },
  podcastHeader: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  podcastImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginRight: 16,
  },
  podcastInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  podcastTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  podcastHost: {
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 8,
  },
  podcastMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  podcastDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  bulletSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#6b7280',
    marginHorizontal: 8,
  },
  podcastDuration: {
    fontSize: 14,
    color: '#6b7280',
  },
  actionsContainer: {
    flexDirection: 'row',
    marginBottom: 32,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#6366f1',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.05,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButtonText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
  },
  topicsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  topicTag: {
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  topicTagText: {
    color: '#4b5563',
    fontSize: 14,
  },
  highlightItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timestampText: {
    color: '#6b7280',
    fontSize: 14,
    marginLeft: 4,
  },
  highlightTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  highlightContent: {
    color: '#4b5563',
    fontSize: 14,
  },
  newConversationButton: {
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
  newConversationButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 8,
  },
});
