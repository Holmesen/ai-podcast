import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomTopicButton } from '../../components/CustomTopicButton';
import { SearchBar } from '../../components/SearchBar';
import { TopicSelectionItem } from '../../components/TopicSelectionItem';

interface TopicItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

export default function TopicSelection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState('2'); // 默认选中第二个话题

  // 话题数据
  const topics: TopicItem[] = [
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
    {
      id: '4',
      title: '心理健康管理',
      description: '探索现代生活中维护心理健康的策略',
      imageUrl:
        'https://images.unsplash.com/photo-1541544741938-0af808871cc0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    },
    {
      id: '5',
      title: '职业规划发展',
      description: '解析个人职业生涯规划的关键要素',
      imageUrl:
        'https://images.unsplash.com/photo-1522881451255-f59ad836fdfb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1472&q=80',
    },
    {
      id: '6',
      title: '可持续生活',
      description: '探讨如何在日常生活中践行环保理念',
      imageUrl:
        'https://images.unsplash.com/photo-1515169067868-5387ec356754?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    },
  ];

  // 创建自定义话题的处理函数
  const handleCustomTopic = () => {
    // 实现自定义话题功能
  };

  // 开始对话按钮处理函数
  const handleStartConversation = () => {
    router.push('/(tabs)/record');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.navHeader}>
        <TouchableOpacity style={styles.navBack} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>选择话题</Text>
      </View>

      <Text style={styles.sectionDesc}>
        选择一个你感兴趣的话题，AI 主持人将围绕这个主题与你深入对话，探讨独特见解。
      </Text>

      <SearchBar placeholder="搜索更多话题" value={searchQuery} onChangeText={setSearchQuery} />

      <Text style={styles.sectionTitle}>推荐话题</Text>

      <ScrollView style={styles.topicsContainer} contentContainerStyle={styles.topicsContent}>
        <View style={styles.topicGrid}>
          {topics.map((topic) => (
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

        <CustomTopicButton onPress={handleCustomTopic} />

        <View style={styles.spacer} />
      </ScrollView>

      <View style={styles.actionFooter}>
        <TouchableOpacity style={styles.actionButton} onPress={handleStartConversation}>
          <Text style={styles.actionButtonText}>开始对话</Text>
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
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
  },
  navBack: {
    marginRight: 16,
    padding: 4,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  sectionDesc: {
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 15,
    lineHeight: 22,
    color: '#4b5563',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  topicsContainer: {
    flex: 1,
  },
  topicsContent: {
    paddingHorizontal: 16,
  },
  topicGrid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8, // 抵消 topicGridItem 的 padding
  },
  topicGridItem: {
    width: '50%',
    padding: 8,
    marginBottom: 16,
  },
  spacer: {
    height: 100, // 为底部按钮腾出空间
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
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
