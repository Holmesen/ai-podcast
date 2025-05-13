import { promptService, TopicSuggestion } from './prompt-service';
import { supabase } from './supabase';

export interface Topic {
  id: string;
  title: string;
  description: string;
  background_image_url: string;
  category_id: string;
  popularity_score: number;
  is_featured: boolean;
  keywords: string[];
  created_at: string;
  updated_at: string;
}

export interface TopicCategory {
  id: string;
  name: string;
  description: string;
  icon_name: string;
  color: string;
  display_order: number;
}

export const TopicService = {
  /**
   * 获取话题列表
   * @param limit 限制返回的数量
   * @param featured 是否只返回推荐话题
   * @param categoryId 按分类ID筛选
   */
  async getTopics(limit: number = 0, featured: boolean = false, categoryId?: string): Promise<Topic[]> {
    try {
      // 构建查询
      let query = supabase.from('podcast_topic').select('*');

      // 应用筛选条件
      if (featured) {
        query = query.eq('is_featured', true);
      }

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      // 按热度排序
      query = query.order('popularity_score', { ascending: false });

      // 应用限制
      if (limit > 0) {
        query = query.limit(limit);
      }

      // 执行查询
      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('获取话题列表失败:', error);
      return [];
    }
  },

  /**
   * 获取话题分类
   */
  async getTopicCategories(): Promise<TopicCategory[]> {
    try {
      const { data, error } = await supabase
        .from('podcast_topic_category')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('获取话题分类失败:', error);
      return [];
    }
  },

  /**
   * 获取单个话题详情
   * @param topicId 话题ID
   */
  async getTopicById(topicId: string): Promise<Topic | null> {
    try {
      const { data, error } = await supabase.from('podcast_topic').select('*').eq('id', topicId).single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('获取话题详情失败:', error);
      return null;
    }
  },

  /**
   * 搜索话题
   * @param searchTerm 搜索关键词
   */
  async searchTopics(searchTerm: string): Promise<Topic[]> {
    try {
      const { data, error } = await supabase
        .from('podcast_topic')
        .select('*')
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .order('popularity_score', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('搜索话题失败:', error);
      return [];
    }
  },

  /**
   * 根据用户兴趣生成话题建议
   * @param interests 用户兴趣关键词，逗号分隔
   * @param limit 返回的话题数量，默认为5
   */
  async generateTopicSuggestions(interests: string, limit: number = 5): Promise<TopicSuggestion[]> {
    try {
      // 使用promptService生成话题建议
      const suggestions = await promptService.generateTopicSuggestions(interests);

      // 限制返回数量
      return suggestions.slice(0, limit);
    } catch (error) {
      console.error('生成话题建议失败:', error);
      return [];
    }
  },

  /**
   * 拓展指定话题的讨论方向
   * @param topic 要拓展的话题
   */
  async extendTopic(topic: string): Promise<{
    deepeningQuestions: string[];
    perspectives: string[];
    examples: string[];
  }> {
    try {
      // 使用promptService拓展话题
      return await promptService.extendTopic(topic);
    } catch (error) {
      console.error('拓展话题失败:', error);
      return {
        deepeningQuestions: [],
        perspectives: [],
        examples: [],
      };
    }
  },

  /**
   * 审核话题内容
   * @param topicTitle 话题标题
   * @param topicDescription 话题描述
   */
  async reviewTopicContent(
    topicTitle: string,
    topicDescription: string
  ): Promise<{
    approved: boolean;
    concerns: string[];
    suggestions: string[];
  }> {
    try {
      const content = `标题: ${topicTitle}\n描述: ${topicDescription}`;
      // 使用promptService审核内容
      return await promptService.reviewContent(content);
    } catch (error) {
      console.error('话题内容审核失败:', error);
      return {
        approved: true, // 默认通过，避免阻塞用户操作
        concerns: [],
        suggestions: [],
      };
    }
  },
};
