import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SearchBar } from '../../components/SearchBar';
import { colors } from '../../components/theme';

interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState('');

  // 分类数据
  const categories: Category[] = [
    { id: '1', name: '科技', icon: 'laptop-outline', count: 25 },
    { id: '2', name: '艺术', icon: 'color-palette-outline', count: 18 },
    { id: '3', name: '商业', icon: 'briefcase-outline', count: 30 },
    { id: '4', name: '健康', icon: 'fitness-outline', count: 22 },
    { id: '5', name: '教育', icon: 'school-outline', count: 15 },
    { id: '6', name: '娱乐', icon: 'film-outline', count: 28 },
    { id: '7', name: '美食', icon: 'restaurant-outline', count: 20 },
    { id: '8', name: '旅行', icon: 'airplane-outline', count: 16 },
    { id: '9', name: '体育', icon: 'football-outline', count: 12 },
    { id: '10', name: '文学', icon: 'book-outline', count: 14 },
    { id: '11', name: '历史', icon: 'time-outline', count: 10 },
    { id: '12', name: '心理', icon: 'heart-outline', count: 19 },
  ];

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity style={styles.categoryItem} onPress={() => {}}>
      <View style={styles.categoryIcon}>
        <Ionicons name={item.icon as any} size={28} color={colors.primary} />
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
      <Text style={styles.categoryCount}>{item.count}+ 话题</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>探索话题</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="options-outline" size={24} color={colors.neutral700} />
        </TouchableOpacity>
      </View>

      <SearchBar placeholder="搜索话题或关键词" value={searchQuery} onChangeText={setSearchQuery} />

      <View style={styles.trendingSection}>
        <Text style={styles.sectionTitle}>热门话题</Text>
        <View style={styles.trendingTags}>
          <TouchableOpacity style={styles.trendingTag}>
            <Text style={styles.trendingTagText}>#AI技术</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.trendingTag}>
            <Text style={styles.trendingTagText}>#心理健康</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.trendingTag}>
            <Text style={styles.trendingTagText}>#职场成长</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.trendingTag}>
            <Text style={styles.trendingTagText}>#创意思维</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.trendingTag}>
            <Text style={styles.trendingTagText}>#生活方式</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.sectionTitle}>所有分类</Text>

      <FlatList
        data={categories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.categoriesContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const shadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 3,
  elevation: 2,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerButton: {
    padding: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
  },
  trendingSection: {
    marginTop: 8,
  },
  trendingTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
  },
  trendingTag: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  trendingTagText: {
    color: colors.primary,
    fontWeight: '500',
    fontSize: 14,
  },
  categoriesContainer: {
    padding: 8,
    paddingBottom: 120, // 为底部TabBar留出空间
  },
  categoryItem: {
    flex: 1,
    backgroundColor: 'white',
    margin: 8,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    ...shadow,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 13,
    color: colors.neutral500,
  },
});
