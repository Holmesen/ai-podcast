/**
 * 转录服务
 * 负责音频转录和转录文本处理
 */

import { promptService } from './prompt-service';

/**
 * 命名实体结果接口
 */
export interface NamedEntities {
  人物: string[];
  组织: string[];
  地点: string[];
  产品: string[];
  事件: string[];
}

/**
 * 章节信息接口
 */
export interface ChapterInfo {
  title: string;
  content: string;
}

/**
 * 引述信息接口
 */
export interface QuoteInfo {
  quote: string;
  speaker: string;
  context: string;
}

/**
 * 时间戳章节信息接口
 */
export interface TimestampedChapter {
  title: string;
  startTime: number;
  endTime: number;
  summary: string;
}

/**
 * 转录处理服务类
 */
export class TranscriptionService {
  private static instance: TranscriptionService;

  private constructor() {
    // 单例模式初始化
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): TranscriptionService {
    if (!TranscriptionService.instance) {
      TranscriptionService.instance = new TranscriptionService();
    }
    return TranscriptionService.instance;
  }

  /**
   * 清理和优化自动转录文本
   * @param transcript 原始转录文本
   * @returns 清理后的转录文本
   */
  public async cleanTranscript(transcript: string): Promise<string> {
    try {
      return await promptService.cleanTranscript(transcript);
    } catch (error) {
      console.error('清理转录文本失败:', error);
      return transcript;
    }
  }

  /**
   * 增强转录文本的可读性
   * @param transcript 原始转录文本
   * @returns 增强后的转录文本
   */
  public async enhanceTranscript(transcript: string): Promise<string> {
    try {
      return await promptService.enhanceTranscript(transcript);
    } catch (error) {
      console.error('增强转录文本失败:', error);
      return transcript;
    }
  }

  /**
   * 将转录文本转换为对话格式
   * @param transcript 原始转录文本
   * @returns 格式化后的对话文本
   */
  public async convertToDialogue(transcript: string): Promise<string> {
    try {
      return await promptService.convertToDialogueFormat(transcript);
    } catch (error) {
      console.error('转换为对话格式失败:', error);
      return transcript;
    }
  }

  /**
   * 提取转录文本中的关键主题
   * @param transcript 转录文本
   * @param count 提取的主题数量
   * @returns 关键主题列表
   */
  public async extractTopics(transcript: string, count: number = 3): Promise<string[]> {
    try {
      return await promptService.extractKeyTopics(transcript, count);
    } catch (error) {
      console.error('提取转录主题失败:', error);
      return [];
    }
  }

  /**
   * 从转录文本中提取命名实体
   * @param transcript 转录文本
   * @returns 命名实体分类结果
   */
  public async extractEntities(transcript: string): Promise<NamedEntities> {
    try {
      const result = await promptService.extractNamedEntities(transcript);
      // 确保返回的结果符合NamedEntities接口要求
      return {
        人物: result['人物'] || [],
        组织: result['组织'] || [],
        地点: result['地点'] || [],
        产品: result['产品'] || [],
        事件: result['事件'] || [],
      };
    } catch (error) {
      console.error('提取命名实体失败:', error);
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
   * @param count 提取的引述数量
   * @returns 引述列表
   */
  public async extractQuotes(transcript: string, count: number = 3): Promise<QuoteInfo[]> {
    try {
      return await promptService.extractQuotes(transcript, count);
    } catch (error) {
      console.error('提取引述失败:', error);
      return [];
    }
  }

  /**
   * 将长转录文本分段为章节
   * @param transcript 完整转录文本
   * @param chapterCount 期望的章节数量
   * @returns 章节内容列表
   */
  public async segmentIntoChapters(transcript: string, chapterCount: number = 5): Promise<ChapterInfo[]> {
    try {
      return await promptService.segmentTranscript(transcript, chapterCount);
    } catch (error) {
      console.error('分段转录失败:', error);
      return [
        {
          title: '转录内容',
          content: transcript,
        },
      ];
    }
  }

  /**
   * 生成带时间戳的章节信息
   * @param transcript 转录文本
   * @param duration 音频总时长（秒）
   * @returns 带时间戳的章节信息
   */
  public async generateChapterTimestamps(transcript: string, duration: number): Promise<TimestampedChapter[]> {
    try {
      return await promptService.generateTimestamps(transcript, duration);
    } catch (error) {
      console.error('生成章节时间戳失败:', error);
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
   * 创建完整的转录分析报告
   * @param transcript 转录文本
   * @param duration 音频时长（秒）
   * @returns 综合分析报告
   */
  public async createTranscriptReport(
    transcript: string,
    duration: number
  ): Promise<{
    cleanedTranscript: string;
    mainTopics: string[];
    entities: NamedEntities;
    keyQuotes: QuoteInfo[];
    chapters: TimestampedChapter[];
  }> {
    try {
      // 并行执行多个分析任务
      const [cleanedTranscript, mainTopics, entities, keyQuotes, chapters] = await Promise.all([
        this.cleanTranscript(transcript),
        this.extractTopics(transcript, 5),
        this.extractEntities(transcript),
        this.extractQuotes(transcript, 3),
        this.generateChapterTimestamps(transcript, duration),
      ]);

      return {
        cleanedTranscript,
        mainTopics,
        entities,
        keyQuotes,
        chapters,
      };
    } catch (error) {
      console.error('创建转录分析报告失败:', error);
      // 返回一个最小化的报告
      return {
        cleanedTranscript: transcript,
        mainTopics: [],
        entities: {
          人物: [],
          组织: [],
          地点: [],
          产品: [],
          事件: [],
        },
        keyQuotes: [],
        chapters: [
          {
            title: '完整内容',
            startTime: 0,
            endTime: duration,
            summary: '完整音频内容',
          },
        ],
      };
    }
  }
}

// 导出单例实例
export const transcriptionService = TranscriptionService.getInstance();
