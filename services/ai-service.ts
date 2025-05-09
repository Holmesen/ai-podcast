import { deepseek } from '@ai-sdk/deepseek';
import { generateText } from 'ai';

interface AIResponse {
  reasoning: string;
  text: string;
  providerMetadata?: {
    deepseek?: {
      promptCacheHitTokens?: number;
      promptCacheMissTokens?: number;
    };
  };
}

export class AIService {
  private static instance: AIService;
  private apiKey: string;

  private constructor() {
    // 使用环境变量中的 API key
    this.apiKey = process.env.DEEPSEEK_API_KEY || '';

    if (!this.apiKey) {
      throw new Error('DEEPSEEK_API_KEY 环境变量未设置');
    }
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  /**
   * 使用 DeepSeek 模型生成文本
   * @param prompt 输入提示词
   * @returns 包含推理过程、生成文本和提供商元数据的 Promise
   */
  public async generateText(prompt: string): Promise<AIResponse> {
    try {
      // 使用默认 provider 实例
      const result = await generateText({
        model: deepseek('deepseek-chat'), // 使用 deepseek-chat 模型进行普通文本生成
        prompt,
      });

      if (!result.text) {
        throw new Error('AI 模型未生成文本');
      }

      return {
        reasoning: result.reasoning || '',
        text: result.text,
        providerMetadata: result.providerMetadata,
      };
    } catch (error) {
      console.error('生成文本时出错:', error);
      if (error instanceof Error) {
        throw new Error(`文本生成失败: ${error.message}`);
      }
      throw new Error('使用 AI 模型生成文本失败');
    }
  }

  /**
   * 使用 DeepSeek 推理模型生成带推理过程的文本
   * @param prompt 输入提示词
   * @returns 包含推理过程和生成文本的 Promise
   */
  public async generateTextWithReasoning(prompt: string): Promise<AIResponse> {
    try {
      const result = await generateText({
        model: deepseek('deepseek-reasoner'), // 使用 deepseek-reasoner 模型进行推理任务
        prompt,
      });

      if (!result.text) {
        throw new Error('AI 模型未生成文本');
      }

      return {
        reasoning: result.reasoning || '',
        text: result.text,
        providerMetadata: result.providerMetadata,
      };
    } catch (error) {
      console.error('生成推理文本时出错:', error);
      if (error instanceof Error) {
        throw new Error(`推理文本生成失败: ${error.message}`);
      }
      throw new Error('生成推理文本失败');
    }
  }

  /**
   * 生成播客摘要
   * @param content 播客内容
   * @returns 生成的摘要 Promise
   */
  public async generatePodcastSummary(content: string): Promise<string> {
    try {
      const prompt = `请提供以下播客内容的简明摘要:\n\n${content}`;
      const { text } = await this.generateText(prompt);
      return text;
    } catch (error) {
      console.error('生成播客摘要时出错:', error);
      if (error instanceof Error) {
        throw new Error(`生成播客摘要失败: ${error.message}`);
      }
      throw new Error('生成播客摘要失败');
    }
  }

  /**
   * 生成播客主题
   * @param context 用于生成主题的上下文或主题
   * @returns 生成的主题列表 Promise
   */
  public async generatePodcastTopics(context: string): Promise<string[]> {
    try {
      const prompt = `根据以下上下文生成5个有吸引力的播客主题:\n\n${context}\n\n请以JSON字符串数组的形式格式化响应。`;
      const { text } = await this.generateText(prompt);

      // 解析响应为 JSON
      const topics = JSON.parse(text) as string[];
      return topics;
    } catch (error) {
      console.error('生成播客主题时出错:', error);
      if (error instanceof Error) {
        throw new Error(`生成播客主题失败: ${error.message}`);
      }
      throw new Error('生成播客主题失败');
    }
  }
}
