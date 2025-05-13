/**
 * AI 角色服务
 * 负责管理 AI 角色、系统提示词和个性化行为
 */

import {
  formatPrompt,
  GENERAL_PROMPTS,
  getPromptById,
  HOST_PROMPTS,
  PromptCategory,
  PromptTemplate,
  SystemRole,
} from '../utils/prompts';
import { AIService } from './ai-service';

// AI 角色接口
export interface AIRole {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  personalityTraits?: Record<string, any>;
  getResponse(userInput: string, context?: any): Promise<string>;
}

// AI 角色上下文接口
export interface AIRoleContext {
  conversationHistory?: { role: string; content: string }[];
  topic?: string;
  userProfile?: Record<string, any>;
  additionalContext?: Record<string, any>;
}

/**
 * AI 角色管理服务类
 */
export class AIRoleService {
  private static instance: AIRoleService;
  private aiService: AIService;
  private activeRoles: Map<string, AIRole>; // 缓存活跃的角色实例

  private constructor() {
    this.aiService = AIService.getInstance();
    this.activeRoles = new Map();
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): AIRoleService {
    if (!AIRoleService.instance) {
      AIRoleService.instance = new AIRoleService();
    }
    return AIRoleService.instance;
  }

  /**
   * 创建一个新的 AI 角色
   * @param rolePromptId 角色提示词 ID
   * @param customization 角色自定义配置
   * @returns 创建的 AI 角色
   */
  public createRole(
    rolePromptId: string,
    customization?: {
      name?: string;
      description?: string;
      traits?: Record<string, any>;
      additionalInstructions?: string;
    }
  ): AIRole {
    // 获取角色提示词模板
    const promptTemplate = getPromptById(rolePromptId);
    if (!promptTemplate) {
      throw new Error(`找不到 ID 为 ${rolePromptId} 的提示词模板`);
    }

    // 构建角色实例
    const roleId = `role-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const role: AIRole = {
      id: roleId,
      name: customization?.name || promptTemplate.name,
      description: customization?.description || promptTemplate.description,
      systemPrompt: promptTemplate.template,
      personalityTraits: (promptTemplate as SystemRole).traits || {},

      // 获取角色响应的方法
      getResponse: async (userInput: string, context?: AIRoleContext): Promise<string> => {
        // 构建完整提示词
        const systemPrompt = this.buildRolePrompt(promptTemplate, customization?.additionalInstructions, context);

        // 构建消息数组
        const messages = this.buildConversationMessages(systemPrompt, userInput, context?.conversationHistory);

        // 调用 AI 服务获取响应
        const response = await this.aiService.generateText(JSON.stringify(messages));
        return response.text;
      },
    };

    // 应用自定义特性
    if (customization?.traits) {
      role.personalityTraits = {
        ...(role.personalityTraits || {}),
        ...customization.traits,
      };
    }

    // 缓存角色
    this.activeRoles.set(roleId, role);
    return role;
  }

  /**
   * 构建角色提示词
   * @param template 提示词模板
   * @param additionalInstructions 附加指令
   * @param context 上下文信息
   * @returns 完整的角色提示词
   */
  private buildRolePrompt(template: PromptTemplate, additionalInstructions?: string, context?: AIRoleContext): string {
    // 构建变量映射
    const variables: Record<string, string> = {};

    // 添加上下文变量
    if (context) {
      if (context.topic) variables.topic = context.topic;

      // 添加其他上下文变量
      if (context.additionalContext) {
        Object.entries(context.additionalContext).forEach(([key, value]) => {
          if (typeof value === 'string') {
            variables[key] = value;
          } else {
            variables[key] = JSON.stringify(value);
          }
        });
      }
    }

    // 格式化模板
    let prompt = formatPrompt(template.template, variables);

    // 添加附加指令
    if (additionalInstructions) {
      prompt += `\n\n额外指令:\n${additionalInstructions}`;
    }

    return prompt;
  }

  /**
   * 构建对话消息数组
   * @param systemPrompt 系统提示词
   * @param userInput 用户输入
   * @param history 对话历史
   * @returns 消息数组
   */
  private buildConversationMessages(
    systemPrompt: string,
    userInput: string,
    history?: { role: string; content: string }[]
  ): { role: string; content: string }[] {
    const messages: { role: string; content: string }[] = [{ role: 'system', content: systemPrompt }];

    // 添加历史消息（如果有）
    if (history && history.length > 0) {
      messages.push(...history);
    }

    // 添加当前用户输入
    messages.push({ role: 'user', content: userInput });

    return messages;
  }

  /**
   * 获取角色实例
   * @param roleId 角色 ID
   * @returns 角色实例或 undefined
   */
  public getRole(roleId: string): AIRole | undefined {
    return this.activeRoles.get(roleId);
  }

  /**
   * 更新角色配置
   * @param roleId 角色 ID
   * @param updates 更新内容
   * @returns 更新后的角色
   */
  public updateRole(
    roleId: string,
    updates: {
      name?: string;
      description?: string;
      traits?: Record<string, any>;
      additionalInstructions?: string;
    }
  ): AIRole {
    const role = this.getRole(roleId);
    if (!role) {
      throw new Error(`找不到 ID 为 ${roleId} 的角色`);
    }

    // 应用更新
    if (updates.name) role.name = updates.name;
    if (updates.description) role.description = updates.description;
    if (updates.traits) {
      role.personalityTraits = {
        ...(role.personalityTraits || {}),
        ...updates.traits,
      };
    }

    // 更新系统提示词（如果需要）
    if (updates.additionalInstructions) {
      // 这里我们需要重新获取原始模板并添加新的附加指令
      const originalTemplateId = this.extractOriginalTemplateId(role);
      const originalTemplate = getPromptById(originalTemplateId);
      if (originalTemplate) {
        role.systemPrompt = this.buildRolePrompt(
          originalTemplate,
          updates.additionalInstructions,
          undefined // 没有上下文变量
        );
      }
    }

    return role;
  }

  /**
   * 尝试从角色中提取原始模板 ID
   * 这是一个简化实现，实际使用时可能需要更好的存储机制
   */
  private extractOriginalTemplateId(role: AIRole): string {
    // 从所有主持人模板中查找匹配的
    const matchedHostPrompt = HOST_PROMPTS.find((p) => role.systemPrompt.includes(p.template.substring(0, 50)));

    if (matchedHostPrompt) return matchedHostPrompt.id;

    // 从通用模板中查找
    const matchedGeneralPrompt = GENERAL_PROMPTS.find((p) => role.systemPrompt.includes(p.template.substring(0, 50)));

    return matchedGeneralPrompt?.id || 'host-intellectual'; // 默认返回知性主持人
  }

  /**
   * 删除角色实例
   * @param roleId 角色 ID
   * @returns 是否成功删除
   */
  public removeRole(roleId: string): boolean {
    return this.activeRoles.delete(roleId);
  }

  /**
   * 获取可用角色模板列表
   * @param category 可选分类过滤
   * @returns 角色模板列表
   */
  public getAvailableRoleTemplates(category?: PromptCategory): SystemRole[] {
    // 主要返回主持人类型的角色
    if (category === PromptCategory.HOST || !category) {
      return HOST_PROMPTS;
    }
    return [];
  }

  /**
   * 创建默认的主持人角色
   * @returns 默认的主持人角色
   */
  public createDefaultHostRole(): AIRole {
    // 使用知性主持人模板
    return this.createRole('host-intellectual', {
      name: '知性AI主持人',
      description: '一位博学多才，善于深度分析的AI主持人',
      traits: {
        formality: 0.7,
        curiosity: 0.9,
        analyticalThinking: 0.8,
        empathy: 0.7,
      },
    });
  }
}
