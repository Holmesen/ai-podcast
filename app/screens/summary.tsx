import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface QuoteProps {
  content: string;
  author: string;
  isAI?: boolean;
}

interface TagProps {
  label: string;
}

interface ListItemProps {
  text: string;
}

// 标签组件
const Tag = ({ label }: TagProps) => (
  <View style={styles.tag}>
    <Text style={styles.tagText}>{label}</Text>
  </View>
);

// 引言卡片组件
const QuoteCard = ({ content, author, isAI = false }: QuoteProps) => (
  <View style={styles.quoteCard}>
    <Text style={styles.quoteContent}>{content}</Text>
    <View style={styles.quoteAuthor}>
      <View style={[styles.quoteAvatar, isAI ? styles.aiQuoteAvatar : styles.userQuoteAvatar]}>
        <Ionicons name={isAI ? 'mic' : 'person'} size={12} color="white" />
      </View>
      <Text style={styles.quoteAuthorName}>{author}</Text>
    </View>
  </View>
);

// 列表项组件
const ListItem = ({ text }: ListItemProps) => (
  <View style={styles.listItem}>
    <View style={styles.bulletPoint} />
    <Text style={styles.listItemText}>{text}</Text>
  </View>
);

export default function Summary() {
  // 这些数据应该从实际的对话中生成
  const summaryData = {
    title: '创意思维方法与实践',
    meta: {
      duration: '25 分钟',
      date: '2023.06.15',
    },
    tags: ['创意思维', '跨领域学习', '创新方法', '团队合作'],
    mainPoints: [
      '跨领域学习是激发创意的有效方法，通过连接不同领域的知识可以产生新的解决方案',
      '仿生学是一个将自然界的解决方案应用到人类问题上的学科，是跨领域创新的典型例子',
      '创意思维需要支持性的环境，开放的团队氛围使人们能够自由表达想法',
      '创新过程中的失败是学习和成长的重要部分，需要被团队接纳和理解',
    ],
    quotes: [
      {
        content:
          '我曾经在设计一个产品时借鉴了生物学中的自组织系统概念，让产品更具适应性和可扩展性。这种跨领域思考帮助我们解决了产品架构的问题。',
        author: '李明',
      },
      {
        content:
          '创意思维需要一个支持性的环境。开放的团队氛围可以让人更自由地表达想法，而不必担心被否定。团队成员应该被鼓励尝试新想法，即使可能会失败。',
        author: '李明',
      },
    ],
    tips: [
      '定期阅读不同领域的书籍和文章，寻找跨领域联系',
      '使用思维导图工具将不同概念联系起来，发现新的关联',
      '在团队中建立"无审判"的讨论环境，鼓励所有想法的表达',
      '为创意活动提供专门的时间和空间，如创意工作坊或头脑风暴会议',
      '将失败视为学习过程，通过反思和调整不断改进',
    ],
    nextSteps: [
      '尝试每周阅读一本跨领域的书籍，并记录可能应用到工作中的灵感',
      '组织团队创意工作坊，实践开放式讨论和头脑风暴技巧',
      '研究成功的跨领域创新案例，分析其应用方法',
      '建立个人创意日记，记录每天的新想法和灵感',
    ],
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>内容总结</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryTitle}>{summaryData.title}</Text>

          <View style={styles.summaryMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color="#6b7280" />
              <Text style={styles.metaText}>{summaryData.meta.duration}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={16} color="#6b7280" />
              <Text style={styles.metaText}>{summaryData.meta.date}</Text>
            </View>
          </View>

          <View style={styles.tagsContainer}>
            {summaryData.tags.map((tag, index) => (
              <Tag key={index} label={tag} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="bulb-outline" size={20} color="#6366f1" />
            <Text style={styles.sectionTitle}>主要观点</Text>
          </View>

          <View style={styles.sectionContent}>
            {summaryData.mainPoints.map((point, index) => (
              <ListItem key={index} text={point} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="chatbubble-outline" size={20} color="#6366f1" />
            <Text style={styles.sectionTitle}>精彩观点</Text>
          </View>

          <View style={styles.sectionContent}>
            {summaryData.quotes.map((quote, index) => (
              <QuoteCard key={index} content={quote.content} author={quote.author} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="list-outline" size={20} color="#6366f1" />
            <Text style={styles.sectionTitle}>实用技巧</Text>
          </View>

          <View style={styles.sectionContent}>
            {summaryData.tips.map((tip, index) => (
              <ListItem key={index} text={tip} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="trending-up-outline" size={20} color="#6366f1" />
            <Text style={styles.sectionTitle}>后续行动</Text>
          </View>

          <View style={styles.sectionContent}>
            {summaryData.nextSteps.map((step, index) => (
              <ListItem key={index} text={step} />
            ))}
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.primaryButton}>
            <Ionicons name="download-outline" size={18} color="white" />
            <Text style={styles.primaryButtonText}>保存笔记</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton}>
            <Ionicons name="share-social-outline" size={18} color="#4b5563" />
            <Text style={styles.secondaryButtonText}>分享</Text>
          </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
    paddingBottom: 32,
  },
  summaryHeader: {
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  summaryMeta: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#ede9fe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    color: '#6366f1',
    fontWeight: '500',
    fontSize: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  sectionContent: {},
  listItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6366f1',
    marginTop: 8,
    marginRight: 12,
  },
  listItemText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: '#4b5563',
  },
  quoteCard: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    position: 'relative',
  },
  quoteContent: {
    fontSize: 15,
    lineHeight: 22,
    fontStyle: 'italic',
    marginBottom: 12,
    color: '#4b5563',
  },
  quoteAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quoteAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  userQuoteAvatar: {
    backgroundColor: '#4f46e5',
  },
  aiQuoteAvatar: {
    backgroundColor: '#6366f1',
  },
  quoteAuthorName: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButtonText: {
    color: '#4b5563',
    fontWeight: '600',
    marginLeft: 8,
  },
});
