import { fetch as expoFetch } from 'expo/fetch';
import { generateAPIUrl } from '../utils';

export interface AIResponse {
  reasoning?: string;
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

  private constructor() {
    // 单例模式初始化
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  /**
   * 使用 API 路由生成文本
   * @param prompt 输入提示词
   * @returns 包含生成文本和元数据的 Promise
   */
  public async generateText(prompt: string): Promise<AIResponse> {
    try {
      // 创建消息格式 - 支持聊天或单一提示词
      const messages = Array.isArray(prompt) ? prompt : [{ role: 'user', content: prompt }];

      // 使用 expo/fetch 调用 API
      const response = await expoFetch(generateAPIUrl('/api/chat'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });

      // 检查响应
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API 响应错误 (${response.status}): ${errorText}`);
      }

      // 读取流响应
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法获取响应流');
      }

      let result = '';
      let done = false;

      // 读取整个流
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;

        if (value) {
          // 解码并累积文本
          const text = new TextDecoder().decode(value);
          result += text;
        }
      }

      // 解析结果 - 处理可能的JSON格式
      try {
        // 尝试解析为JSON
        const parsedResult = JSON.parse(result);
        return {
          text: parsedResult.text || parsedResult.content || parsedResult,
          reasoning: parsedResult.reasoning,
        };
      } catch (e) {
        console.error(e);
        // 如果不是有效的JSON，直接返回文本
        return { text: result };
      }
    } catch (error) {
      console.error('生成文本时出错:', error);
      if (error instanceof Error) {
        throw new Error(`文本生成失败: ${error.message}`);
      }
      throw new Error('使用 AI 模型生成文本失败');
    }
  }

  /**
   * 使用推理 API 生成带推理过程的文本
   * @param prompt 输入提示词
   * @returns 包含推理过程和生成文本的 Promise
   */
  public async generateTextWithReasoning(prompt: string): Promise<AIResponse> {
    try {
      // 创建消息格式
      const messages = Array.isArray(prompt) ? prompt : [{ role: 'user', content: prompt }];

      // 使用 API 路由
      const response = await expoFetch(generateAPIUrl('/api/reasoning+api'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });

      // 检查响应
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`推理 API 响应错误 (${response.status}): ${errorText}`);
      }

      // 读取流响应
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法获取推理响应流');
      }

      let result = '';
      let reasoning = '';
      let done = false;

      // 读取整个流
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;

        if (value) {
          const chunk = new TextDecoder().decode(value);

          // 尝试解析块
          try {
            const data = JSON.parse(chunk);
            if (data.reasoning) reasoning = data.reasoning;
            if (data.text) result += data.text;
          } catch (e) {
            console.error(e);
            // 如果不是 JSON，添加到结果
            result += chunk;
          }
        }
      }

      return {
        text: result,
        reasoning: reasoning,
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

      try {
        // 尝试解析响应为 JSON
        const topics = JSON.parse(text) as string[];
        return topics;
      } catch (e) {
        console.error(e);
        // 如果无法解析为JSON，按行分割
        const lines = text.split('\n').filter((line) => line.trim().length > 0);
        return lines.length > 0 ? lines : [text];
      }
    } catch (error) {
      console.error('生成播客主题时出错:', error);
      if (error instanceof Error) {
        throw new Error(`生成播客主题失败: ${error.message}`);
      }
      throw new Error('生成播客主题失败');
    }
  }

  /**
   * 非流式生成文本 - 用于需要完整返回结果的场景，解决JSON解析问题
   * @param prompt 输入提示词
   * @returns 纯文本结果，不包含流式处理
   */
  public async generateTextNonStreaming(prompt: string): Promise<string> {
    try {
      // 创建消息格式 - 支持聊天或单一提示词
      const messages = Array.isArray(prompt) ? prompt : [{ role: 'user', content: prompt }];

      // 使用 expo/fetch 调用 API，添加非流式参数
      const response = await expoFetch(generateAPIUrl('/api/chat'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          stream: false, // 关键参数：禁用流式响应
        }),
      });

      // 检查响应
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API 响应错误 (${response.status}): ${errorText}`);
      }

      // 直接获取完整响应
      const data = await response.json();

      // 提取文本
      let resultText = '';
      if (typeof data === 'object') {
        resultText = data.text || data.content || JSON.stringify(data);
      } else {
        resultText = String(data);
      }

      return Promise.resolve(resultText);
    } catch (error) {
      console.error('非流式生成文本时出错:', error);
      if (error instanceof Error) {
        return `文本生成失败: ${error.message}`;
      }
      return '使用 AI 模型生成文本失败';
    }
  }
}
