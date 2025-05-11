import * as SecureStore from 'expo-secure-store';
import { AIService } from './ai-service';
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
    status: 'published' | 'draft' | 'private' | 'all' = 'published'
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
  async getUserPodcastStats(userId?: string): Promise<{
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

  /**
   * 创建新的播客记录
   * @param userId 用户ID
   * @param hostId 主持人ID
   * @param topicId 话题ID（可选）
   * @param title 播客标题
   * @param description 播客描述（可选）
   * @param customTopic 自定义话题（当没有topicId时使用）
   * @returns 创建的播客对象或null
   */
  async createPodcast(
    userId: string,
    hostId: string,
    title: string,
    description?: string,
    topicId?: string,
    customTopic?: string
  ): Promise<Podcast | null> {
    try {
      if (!userId) {
        const storedUserId = await SecureStore.getItemAsync('userId');
        if (!storedUserId) throw new Error('未找到用户ID');
        userId = storedUserId;
      }

      // 创建新播客记录
      const { data, error } = await supabase
        .from('podcast')
        .insert([
          {
            user_id: userId,
            host_id: hostId,
            topic_id: topicId,
            custom_topic: !topicId ? customTopic : undefined,
            title,
            description,
            duration: 0, // 初始时长为0
            publish_status: 'draft', // 初始状态为草稿
            plays_count: 0,
            favorites_count: 0,
            is_downloadable: true,
            show_ai_attribution: true,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      return formatPodcast(data) as Podcast;
    } catch (error) {
      console.error('创建播客错误:', error);
      return null;
    }
  },

  /**
   * 保存对话消息到数据库
   * @param podcastId 播客ID
   * @param message 消息内容
   * @param speakerType 发言类型 (host 或 user)
   * @param timestamp 时间戳（秒）
   * @param audioUrl 音频URL（可选）
   * @returns 保存的消息
   */
  async saveMessage(
    podcastId: string,
    message: string,
    speakerType: 'host' | 'user',
    timestamp: number,
    audioUrl?: string
  ): Promise<PodcastMessage | null> {
    try {
      const { data, error } = await supabase
        .from('podcast_message')
        .insert([
          {
            podcast_id: podcastId,
            speaker_type: speakerType,
            content: message,
            timestamp: timestamp,
            audio_segment_url: speakerType === 'host' ? audioUrl : undefined,
            original_audio_url: speakerType === 'user' ? audioUrl : undefined,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data as PodcastMessage;
    } catch (error) {
      console.error('保存消息错误:', error);
      return null;
    }
  },

  /**
   * 获取播客的所有对话消息
   * @param podcastId 播客ID
   * @returns 消息列表
   */
  async getMessages(podcastId: string): Promise<PodcastMessage[]> {
    try {
      const { data, error } = await supabase
        .from('podcast_message')
        .select('*')
        .eq('podcast_id', podcastId)
        .order('timestamp', { ascending: true });

      if (error) throw error;
      return data as PodcastMessage[];
    } catch (error) {
      console.error('获取消息错误:', error);
      return [];
    }
  },

  /**
   * 导出播客对话为文本
   * @param podcastId 播客ID
   * @returns 格式化的对话文本
   */
  async exportConversationText(podcastId: string): Promise<string> {
    try {
      const messages = await this.getMessages(podcastId);

      // 获取播客信息
      const { data: podcast, error } = await supabase
        .from('podcast')
        .select('title, host_id')
        .eq('id', podcastId)
        .single();

      if (error) throw error;

      // 获取主持人信息
      const { data: host } = await supabase.from('podcast_host').select('name').eq('id', podcast.host_id).single();

      let result = `# ${podcast.title}\n\n`;
      const hostName = host?.name || 'AI主持人';

      messages.forEach((msg) => {
        const speaker = msg.speaker_type === 'host' ? hostName : '用户';
        result += `**${speaker}**: ${msg.content}\n\n`;
      });

      return result;
    } catch (error) {
      console.error('导出对话文本错误:', error);
      return '无法导出对话';
    }
  },

  /**
   * 更新播客信息
   * @param podcastId 播客ID
   * @param updates 需要更新的字段
   * @returns 是否成功更新
   */
  async updatePodcast(
    podcastId: string,
    updates: Partial<{
      title: string;
      description: string;
      duration: number;
      publish_status: 'draft' | 'published' | 'private';
      cover_image_url: string;
      audio_url: string;
      tags: string[];
      is_downloadable: boolean;
      show_ai_attribution: boolean;
    }>
  ): Promise<boolean> {
    try {
      const { error } = await supabase.from('podcast').update(updates).eq('id', podcastId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('更新播客错误:', error);
      return false;
    }
  },

  /**
   * 计算并更新播客时长
   * 根据对话消息计算播客总时长并更新
   * @param podcastId 播客ID
   * @returns 更新后的时长（秒）
   */
  async updatePodcastDuration(podcastId: string): Promise<number> {
    try {
      // 获取所有消息
      const messages = await this.getMessages(podcastId);

      // 假设每个用户消息平均需要10秒，AI回复平均需要15秒
      let totalDuration = 0;

      messages.forEach((msg) => {
        // 根据消息类型和长度估算时长
        const contentLength = msg.content.length;
        const baseTime = msg.speaker_type === 'user' ? 10 : 15;
        const messageDuration = baseTime + Math.floor(contentLength / 30);

        totalDuration += messageDuration;
      });

      // 更新播客时长
      await this.updatePodcast(podcastId, { duration: totalDuration });

      return totalDuration;
    } catch (error) {
      console.error('更新播客时长错误:', error);
      return 0;
    }
  },

  /**
   * 发布播客
   * 将播客状态设置为已发布
   * @param podcastId 播客ID
   * @returns 是否成功发布
   */
  async publishPodcast(podcastId: string): Promise<boolean> {
    try {
      // 先更新时长
      await this.updatePodcastDuration(podcastId);

      // 设置为已发布状态
      const { error } = await supabase
        .from('podcast')
        .update({
          publish_status: 'published',
          published_at: new Date().toISOString(),
        })
        .eq('id', podcastId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('发布播客错误:', error);
      return false;
    }
  },

  /**
   * 创建播客总结
   * 基于对话内容生成并保存播客总结
   * @param podcastId 播客ID
   * @param aiService 用于生成总结的AI服务
   * @returns 是否成功创建总结
   */
  async createPodcastSummary(podcastId: string, aiService: AIService): Promise<boolean> {
    try {
      // 获取播客详情和消息
      const { podcast, messages } = await this.getPodcastDetails(podcastId);

      if (!podcast || messages.length === 0) {
        throw new Error('没有足够的对话内容生成总结');
      }

      // 获取主持人信息
      const { data: host } = await supabase.from('podcast_host').select('name').eq('id', podcast.host_id).single();

      const hostName = host?.name || 'AI主持人';

      // 提取对话内容
      const conversationText = messages
        .map((msg) => {
          const speaker = msg.speaker_type === 'host' ? hostName : '用户';
          return `${speaker}: ${msg.content}`;
        })
        .join('\n\n');

      // 生成关键点提示
      const keyPointsPrompt = `
        请从以下对话中提取5-7个关键观点，每个观点用简短的一句话表示：
        
        ${conversationText}
        
        请以JSON数组格式返回结果，仅返回数组，不要有任何前缀或后缀。
      `;

      // 生成精彩语录提示
      const quotesPrompt = `
        请从以下对话中提取3-5个最有价值、最有见解的语录，保留原话：
        
        ${conversationText}
        
        请以JSON数组格式返回结果，仅返回数组，不要有任何前缀或后缀。
      `;

      // 生成实用建议提示
      const tipsPrompt = `
        请基于以下对话内容，提供3-5条实用的建议或行动步骤：
        
        ${conversationText}
        
        请以JSON数组格式返回结果，仅返回数组，不要有任何前缀或后缀。
      `;

      // 生成总结文本提示
      const summaryPrompt = `
        请对以下对话进行200-300字的简明总结，提炼主要内容和价值：
        
        ${conversationText}
      `;

      console.log('开始生成播客总结内容...');

      // 使用非流式接口生成内容，避免JSON解析问题
      const [keyPointsText, quotesText, tipsText, summaryText] = await Promise.all([
        aiService.generateTextNonStreaming(keyPointsPrompt),
        aiService.generateTextNonStreaming(quotesPrompt),
        aiService.generateTextNonStreaming(tipsPrompt),
        aiService.generateTextNonStreaming(summaryPrompt),
      ]);

      console.log('所有AI内容生成完成');

      // 解析JSON响应
      let keyPoints: string[] = [];
      try {
        keyPoints = JSON.parse(keyPointsText);
      } catch (e) {
        // 处理非JSON格式响应
        console.log('关键点不是有效的JSON格式，尝试分行解析...');
        keyPoints = keyPointsText.split('\n').filter((line: string) => line.trim().length > 0);
        console.error('关键点解析错误:', e);
      }

      let quotes: string[] = [];
      try {
        quotes = JSON.parse(quotesText);
      } catch (e) {
        console.log('精彩语录不是有效的JSON格式，尝试分行解析...');
        quotes = quotesText.split('\n').filter((line: string) => line.trim().length > 0);
        console.error('精彩语录解析错误:', e);
      }

      let tips: string[] = [];
      try {
        tips = JSON.parse(tipsText);
      } catch (e) {
        console.log('实用建议不是有效的JSON格式，尝试分行解析...');
        tips = tipsText.split('\n').filter((line: string) => line.trim().length > 0);
        console.error('实用建议解析错误:', e);
      }

      // 创建或更新播客总结记录
      const { data: existingSummary } = await supabase
        .from('podcast_summary')
        .select('id')
        .eq('podcast_id', podcastId)
        .maybeSingle();

      if (existingSummary) {
        // 更新现有总结
        await supabase
          .from('podcast_summary')
          .update({
            key_points: keyPoints,
            notable_quotes: quotes,
            practical_tips: tips,
            summary_text: summaryText,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingSummary.id);
      } else {
        // 创建新的总结
        await supabase.from('podcast_summary').insert([
          {
            podcast_id: podcastId,
            key_points: keyPoints,
            notable_quotes: quotes,
            practical_tips: tips,
            summary_text: summaryText,
          },
        ]);
      }

      console.log('播客总结已保存到数据库');
      return true;
    } catch (error) {
      console.error('创建播客总结错误:', error);
      return false;
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
