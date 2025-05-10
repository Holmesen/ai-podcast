import * as SecureStore from 'expo-secure-store';
import { supabase } from './supabase';

export interface Podcast {
  id: string;
  user_id: string;
  host_id: string;
  topic_id?: string;
  title: string;
  description?: string;
  custom_topic?: string;
  duration: number; // 数据库中是秒数而非字符串
  publish_status: 'draft' | 'published' | 'private'; // 对应数据库中的 publish_status
  cover_image_url?: string; // 对应数据库中的 cover_image_url
  audio_url?: string;
  tags?: string[];
  plays_count: number; // 对应数据库中的 plays_count
  favorites_count: number; // 对应数据库中的 favorites_count
  is_downloadable: boolean;
  show_ai_attribution: boolean;
  created_at: string;
  published_at?: string;
  updated_at: string;
  date?: string; // 格式化后的显示日期(非数据库字段)

  // 以下字段用于前端展示，非数据库直接字段
  hostName?: string; // 存储主持人名称(关联 podcast_host 表)
  formattedDuration?: string; // 格式化后的时长，如"25分钟"
}

export interface PodcastChapter {
  id: string;
  podcast_id: string;
  title: string;
  start_time: number;
  end_time: number;
  summary?: string;
  created_at: string;
  updated_at: string;
}

export interface PodcastMessage {
  id: string;
  podcast_id: string;
  speaker_type: 'host' | 'user';
  content: string;
  timestamp: number;
  audio_segment_url?: string;
  original_audio_url?: string;
  created_at: string;
}

export interface PodcastSummary {
  id: string;
  podcast_id: string;
  key_points?: string[];
  notable_quotes?: string[];
  practical_tips?: string[];
  follow_up_actions?: string[];
  summary_text?: string;
  created_at: string;
  updated_at: string;
}

export interface Host {
  id: string;
  name: string;
  style: string;
  avatar_url: string;
  description: string;
  expertise: string[];
  voice_id?: string;
  personality_traits?: Record<string, any>;
  prompt_template?: string;
  is_featured: boolean;
  is_custom: boolean;
  created_at: string;
  updated_at: string;
}

export const PodcastService = {
  /**
   * 获取用户的播客
   * @param userId 用户ID，如果不提供则获取当前登录用户的播客
   * @param limit 限制返回的数量
   * @param status 播客状态筛选
   * @param enableDelay 是否启用延迟以模拟网络加载（仅用于开发环境）
   */
  async getUserPodcasts(
    userId?: string,
    limit: number = 20,
    status: 'published' | 'draft' | 'private' | 'all' = 'published',
  ): Promise<Podcast[]> {
    try {
      if (!userId) {
        const storedUserId = await SecureStore.getItemAsync('userId');
        if (!storedUserId) return [];
        userId = storedUserId;
      }

      // 需要同时获取主持人信息
      let query = supabase
        .from('podcast')
        .select(
          `
          *,
          host:host_id(name)
        `
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (status !== 'all') {
        query = query.eq('publish_status', status);
      }

      if (limit > 0) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      // 格式化数据
      return data.map((podcast) => formatPodcast(podcast));
    } catch (error) {
      console.error('获取用户播客错误:', error);
      return [];
    }
  },

  /**
   * 获取播客详情
   * @param podcastId 播客ID
   */
  async getPodcastDetails(podcastId: string): Promise<{
    podcast: Podcast | null;
    chapters: PodcastChapter[];
    messages: PodcastMessage[];
    summary: PodcastSummary | null;
  }> {
    try {
      // 获取播客详情，同时获取主持人信息
      const { data: podcast, error: podcastError } = await supabase
        .from('podcast')
        .select(
          `
          *,
          host:host_id(*)
        `
        )
        .eq('id', podcastId)
        .single();

      if (podcastError) throw podcastError;

      // 获取播客章节
      const { data: chapters, error: chaptersError } = await supabase
        .from('podcast_chapter')
        .select('*')
        .eq('podcast_id', podcastId)
        .order('start_time', { ascending: true });

      if (chaptersError) throw chaptersError;

      // 获取播客对话信息
      const { data: messages, error: messagesError } = await supabase
        .from('podcast_message')
        .select('*')
        .eq('podcast_id', podcastId)
        .order('timestamp', { ascending: true });

      if (messagesError) throw messagesError;

      // 获取播客总结
      const { data: summary } = await supabase.from('podcast_summary').select('*').eq('podcast_id', podcastId).single();

      return {
        podcast: podcast ? formatPodcast(podcast) : null,
        chapters: chapters || [],
        messages: messages || [],
        summary: summary || null,
      };
    } catch (error) {
      console.error('获取播客详情错误:', error);
      return {
        podcast: null,
        chapters: [],
        messages: [],
        summary: null,
      };
    }
  },

  /**
   * 获取用户播客统计
   * @param userId 用户ID，如果不提供则获取当前登录用户的统计
   * @param enableDelay 是否启用延迟以模拟网络加载（仅用于开发环境）
   */
  async getUserPodcastStats(
    userId?: string
  ): Promise<{
    totalPodcasts: number;
    totalTopics: number;
    totalMinutes: number;
  }> {
    try {
      if (!userId) {
        const storedUserId = await SecureStore.getItemAsync('userId');
        if (!storedUserId) return { totalPodcasts: 0, totalTopics: 0, totalMinutes: 0 };
        userId = storedUserId;
      }

      // 获取播客总数
      const { count: podcastCount, error: countError } = await supabase
        .from('podcast')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('publish_status', 'published');

      if (countError) throw countError;

      // 获取播客数据用于计算其他统计
      const { data: podcasts, error: podcastsError } = await supabase
        .from('podcast')
        .select('duration, tags, topic_id, custom_topic')
        .eq('user_id', userId)
        .eq('publish_status', 'published');

      if (podcastsError) throw podcastsError;

      // 计算话题总数（去重）
      const uniqueTopics = new Set<string>();

      // 计算总时长（秒）
      let totalSeconds = 0;

      podcasts.forEach((podcast) => {
        // 累加话题
        if (podcast.topic_id) {
          uniqueTopics.add(podcast.topic_id);
        }
        if (podcast.custom_topic) {
          uniqueTopics.add(podcast.custom_topic);
        }
        if (podcast.tags && Array.isArray(podcast.tags)) {
          podcast.tags.forEach((tag) => uniqueTopics.add(tag));
        }

        // 累加时长（使用秒数）
        if (podcast.duration) {
          totalSeconds += podcast.duration;
        }
      });

      // 将秒数转换为分钟
      const totalMinutes = Math.round(totalSeconds / 60);

      return {
        totalPodcasts: podcastCount || 0,
        totalTopics: uniqueTopics.size,
        totalMinutes,
      };
    } catch (error) {
      console.error('获取用户播客统计错误:', error);
      return { totalPodcasts: 0, totalTopics: 0, totalMinutes: 0 };
    }
  },

  /**
   * 增加播客播放次数
   * @param podcastId 播客ID
   * @param userId 用户ID
   */
  async incrementPlayCount(podcastId: string, userId?: string): Promise<void> {
    try {
      // 更新播客播放次数
      await supabase.rpc('increment_podcast_plays', {
        podcast_id: podcastId,
      });

      // 如果有用户ID，则更新播放历史
      if (userId) {
        const { data: existingHistory } = await supabase
          .from('podcast_play_history')
          .select('id, play_count')
          .eq('user_id', userId)
          .eq('podcast_id', podcastId)
          .single();

        if (existingHistory) {
          // 更新现有记录
          await supabase
            .from('podcast_play_history')
            .update({
              play_count: existingHistory.play_count + 1,
              last_played_at: new Date().toISOString(),
            })
            .eq('id', existingHistory.id);
        } else {
          // 创建新记录
          await supabase.from('podcast_play_history').insert({
            user_id: userId,
            podcast_id: podcastId,
            play_count: 1,
          });
        }
      }
    } catch (error) {
      console.error('更新播放次数错误:', error);
    }
  },

  /**
   * 获取AI主持人列表
   */
  async getHosts(featured: boolean = false): Promise<Host[]> {
    try {
      let query = supabase.from('podcast_host').select('*');

      if (featured) {
        query = query.eq('is_featured', true);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('获取主持人列表错误:', error);
      return [];
    }
  },
};

// 辅助函数：格式化播客数据
function formatPodcast(podcast: any): Podcast {
  // 处理日期格式
  const date = new Date(podcast.created_at);
  const now = new Date();

  // 计算日期显示
  let dateDisplay = '';
  const dayDiff = Math.floor((now.getTime() - date.getTime()) / (24 * 60 * 60 * 1000));

  if (dayDiff === 0) {
    dateDisplay = '今天';
  } else if (dayDiff === 1) {
    dateDisplay = '昨天';
  } else if (dayDiff < 7) {
    dateDisplay = `${dayDiff}天前`;
  } else if (dayDiff < 30) {
    dateDisplay = `${Math.floor(dayDiff / 7)}周前`;
  } else {
    dateDisplay = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  }

  // 格式化时长
  const formattedDuration = formatDuration(podcast.duration);

  // 提取主持人名称
  const hostName = podcast.host?.name || '未知主持人';

  return {
    ...podcast,
    date: dateDisplay,
    formattedDuration,
    hostName,
  };
}

// 辅助函数：格式化时长（秒转为分钟）
function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0分钟';

  const minutes = Math.round(seconds / 60);
  return `${minutes}分钟`;
}
