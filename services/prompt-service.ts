/**
 * 提示词服务
 * 负责提供与AI提示词相关的功能接口
 */

import {
  formatPrompt,
  getAllPrompts,
  getPromptById,
  getPromptsByCategory,
  PromptCategory,
  PromptTemplate,
} from '../utils/prompts';
import { AIResponse, AIService } from './ai-service';

// 扩展提示词结果接口
export interface PromptResult {
  text: string;
  reasoning?: string;
  metadata?: Record<string, any>;
}

// 播客总结结果接口
export interface PodcastSummaryResult {
  keyPoints: string[];
  quotes: string[];
  practicalTips: string[];
  followUpThoughts: string[];
  summary: string;
}

// 话题生成结果接口
export interface TopicSuggestion {
  title: string;
  description: string;
  directions: string[];
}

/**
 * 提示词服务类
 */
export class PromptService {
  private static instance: PromptService;
  private aiService: AIService;

  private constructor() {
    this.aiService = AIService.getInstance();
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): PromptService {
    if (!PromptService.instance) {
      PromptService.instance = new PromptService();
    }
    return PromptService.instance;
  }

  /**
   * 获取所有可用的提示词
   */
  public getAllPrompts(): PromptTemplate[] {
    return getAllPrompts();
  }

  /**
   * 按分类获取提示词
   * @param category 提示词分类
   */
  public getPromptsByCategory(category: PromptCategory): PromptTemplate[] {
    return getPromptsByCategory(category);
  }

  /**
   * 根据ID获取提示词
   * @param id 提示词ID
   */
  public getPromptById(id: string): PromptTemplate | undefined {
    return getPromptById(id);
  }

  /**
   * 使用提示词模板生成内容
   * @param promptId 提示词ID
   * @param variables 变量值映射
   */
  public async generateFromPrompt(
    promptId: string,
    variables: Record<string, string>,
    stream: boolean = true
  ): Promise<PromptResult> {
    const template = this.getPromptById(promptId);
    if (!template) {
      throw new Error(`找不到ID为 ${promptId} 的提示词模板`);
    }

    const formattedPrompt = formatPrompt(template.template, variables);
    const result = stream
      ? await this.aiService.generateText(formattedPrompt)
      : await this.aiService.generateTextNonStreaming(formattedPrompt);

    return {
      text: stream ? (result as AIResponse).text : (result as string),
      reasoning: stream ? (result as AIResponse).reasoning : undefined,
    };
  }

  /**
   * 生成播客内容摘要
   * @param content 播客内容
   */
  public async generatePodcastSummary(content: string): Promise<PodcastSummaryResult> {
    const promptId = 'podcast-summary';
    const variables = { content };

    const result = await this.generateFromPrompt(promptId, variables, false);

    try {
      // 尝试解析JSON格式的结果
      const parsedResult = JSON.parse(result.text) as PodcastSummaryResult;
      return parsedResult;
    } catch (e) {
      console.error('解析摘要JSON失败:', e);
      // 如果解析失败，返回一个默认结构
      return {
        keyPoints: [result.text],
        quotes: [],
        practicalTips: [],
        followUpThoughts: [],
        summary: '',
      };
    }
  }

  /**
   * 生成播客章节概要
   * @param content 章节内容
   */
  public async generateChapterSummary(content: string): Promise<string> {
    const promptId = 'chapter-summary';
    const variables = { content };

    const result = await this.generateFromPrompt(promptId, variables, false);
    return result.text;
  }

  /**
   * 生成播客话题建议
   * @param interests 用户兴趣领域
   */
  public async generateTopicSuggestions(interests: string): Promise<TopicSuggestion[]> {
    const promptId = 'generate-topics';
    const variables = { interests };

    const result = await this.generateFromPrompt(promptId, variables, false);

    try {
      // 尝试解析JSON格式的结果
      const parsedResult = JSON.parse(result.text) as TopicSuggestion[];
      return parsedResult;
    } catch (e) {
      console.error('解析话题建议JSON失败:', e);
      // 如果解析失败，返回一个空数组
      return [];
    }
  }

  /**
   * 拓展播客话题
   * @param topic 话题
   */
  public async extendTopic(topic: string): Promise<{
    deepeningQuestions: string[];
    perspectives: string[];
    examples: string[];
  }> {
    const promptId = 'extend-topic';
    const variables = { topic };

    const result = await this.generateFromPrompt(promptId, variables, false);

    try {
      // 尝试解析JSON格式的结果
      const parsedResult = JSON.parse(result.text) as {
        deepeningQuestions: string[];
        perspectives: string[];
        examples: string[];
      };
      return parsedResult;
    } catch (e) {
      console.error('解析话题拓展JSON失败:', e);
      // 如果解析失败，返回一个默认结构
      return {
        deepeningQuestions: [],
        perspectives: [],
        examples: [],
      };
    }
  }

  /**
   * 清理和优化自动转录文本
   * @param transcript 原始转录文本
   */
  public async cleanTranscript(transcript: string): Promise<string> {
    const promptId = 'clean-transcript';
    const variables = { transcript };

    const result = await this.generateFromPrompt(promptId, variables, false);
    return result.text;
  }

  /**
   * 内容审核
   * @param content 需要审核的内容
   */
  public async reviewContent(content: string): Promise<{
    approved: boolean;
    concerns: string[];
    suggestions: string[];
  }> {
    const promptId = 'content-review';
    const variables = { content };

    const result = await this.generateFromPrompt(promptId, variables, false);

    try {
      // 尝试解析JSON格式的结果
      const parsedResult = JSON.parse(result.text) as {
        approved: boolean;
        concerns: string[];
        suggestions: string[];
      };
      return parsedResult;
    } catch (e) {
      console.error('解析内容审核JSON失败:', e);
      // 如果解析失败，返回一个默认结构
      return {
        approved: false,
        concerns: ['无法解析审核结果'],
        suggestions: ['请重试或联系管理员'],
      };
    }
  }

  /**
   * 生成特定场景的AI提示词
   * @param scenario 场景描述
   * @param goal 目标
   * @param style 风格要求
   */
  public async generateMetaPrompt(scenario: string, goal: string, style: string): Promise<string> {
    const promptId = 'meta-prompt';
    const variables = { scenario, goal, style };

    const result = await this.generateFromPrompt(promptId, variables, false);
    return result.text;
  }

  /**
   * 将转录文本分段为章节
   * @param transcript 转录文本
   * @param chapterCount 期望的章节数量
   */
  public async segmentTranscript(
    transcript: string,
    chapterCount: number = 5
  ): Promise<{ title: string; content: string }[]> {
    const promptId = 'segment-transcript';
    const variables = {
      transcript,
      chapterCount: chapterCount.toString(),
    };

    const result = await this.generateFromPrompt(promptId, variables, false);

    try {
      // 尝试解析JSON格式的结果
      const parsedResult = JSON.parse(result.text) as { title: string; content: string }[];
      return parsedResult;
    } catch (e) {
      console.error('解析章节JSON失败:', e);
      // 如果解析失败，返回一个默认结构
      return [
        {
          title: '完整内容',
          content: transcript,
        },
      ];
    }
  }

  /**
   * 生成转录文本的时间戳
   * @param transcript 转录文本
   * @param duration 音频总时长（秒）
   */
  public async generateTimestamps(
    transcript: string,
    duration: number
  ): Promise<{ title: string; startTime: number; endTime: number; summary: string }[]> {
    const promptId = 'generate-timestamps';
    const variables = {
      transcript,
      duration: duration.toString(),
    };

    const result = await this.generateFromPrompt(promptId, variables, false);

    try {
      // 尝试解析JSON格式的结果
      const parsedResult = JSON.parse(result.text) as {
        title: string;
        startTime: number;
        endTime: number;
        summary: string;
      }[];
      return parsedResult;
    } catch (e) {
      console.error('解析时间戳JSON失败:', e);
      // 如果解析失败，返回一个默认结构
      return [
        {
          title: '完整内容',
          startTime: 0,
          endTime: duration,
          summary: '完整音频内容',
        },
      ];
    }
  }

  /**
   * 提取转录文本中的关键主题
   * @param transcript 转录文本
   * @param topicCount 要提取的主题数量
   */
  public async extractKeyTopics(transcript: string, topicCount: number = 5): Promise<string[]> {
    const promptId = 'extract-key-topics';
    const variables = {
      transcript,
      topicCount: topicCount.toString(),
    };

    const result = await this.generateFromPrompt(promptId, variables, false);

    try {
      // 尝试解析JSON格式的结果
      const parsedResult = JSON.parse(result.text) as string[];
      return parsedResult;
    } catch (e) {
      console.error('解析主题JSON失败:', e);
      // 如果解析失败，尝试按行分割
      const topics = result.text
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .slice(0, topicCount);

      return topics.length > 0 ? topics : ['未能提取主题'];
    }
  }

  /**
   * 提取转录文本中的命名实体
   * @param transcript 转录文本
   */
  public async extractNamedEntities(transcript: string): Promise<Record<string, string[]>> {
    const promptId = 'extract-named-entities';
    const variables = { transcript };

    const result = await this.generateFromPrompt(promptId, variables, false);

    try {
      // 尝试解析JSON格式的结果
      const parsedResult = JSON.parse(result.text) as Record<string, string[]>;
      return parsedResult;
    } catch (e) {
      console.error('解析命名实体JSON失败:', e);
      // 如果解析失败，返回一个空对象
      return {
        人物: [],
        组织: [],
        地点: [],
        产品: [],
        事件: [],
      };
    }
  }

  /**
   * 提取重要引述
   * @param transcript 转录文本
   * @param quoteCount 要提取的引述数量
   */
  public async extractQuotes(
    transcript: string,
    quoteCount: number = 3
  ): Promise<{ quote: string; speaker: string; context: string }[]> {
    const promptId = 'extract-quotes';
    const variables = {
      transcript,
      quoteCount: quoteCount.toString(),
    };

    const result = await this.generateFromPrompt(promptId, variables, false);

    try {
      // 尝试解析JSON格式的结果
      const parsedResult = JSON.parse(result.text) as {
        quote: string;
        speaker: string;
        context: string;
      }[];
      return parsedResult;
    } catch (e) {
      console.error('解析引述JSON失败:', e);
      // 如果解析失败，返回一个空数组
      return [];
    }
  }

  /**
   * 增强转录文本的可读性和流畅度
   * @param transcript 原始转录文本
   */
  public async enhanceTranscript(transcript: string): Promise<string> {
    const promptId = 'enhance-transcript';
    const variables = { transcript };

    const result = await this.generateFromPrompt(promptId, variables, false);
    return result.text;
  }

  /**
   * 将转录文本转换为对话格式
   * @param transcript 原始转录文本
   */
  public async convertToDialogueFormat(transcript: string): Promise<string> {
    const promptId = 'transcript-to-dialogue';
    const variables = { transcript };

    const result = await this.generateFromPrompt(promptId, variables, false);
    return result.text;
  }
}

// 导出单例实例
export const promptService = PromptService.getInstance();
