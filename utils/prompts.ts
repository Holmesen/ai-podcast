/**
 * 提示词管理模块
 * 集中存储和管理所有与 AI 相关的提示词模板和系统角色
 */

// 基本提示词接口
export interface PromptTemplate {
  id: string; // 提示词唯一标识符
  name: string; // 提示词名称
  description: string; // 提示词描述
  template: string; // 提示词模板文本
  category: PromptCategory; // 提示词分类
}

// 系统角色接口 (扩展基本提示词)
export interface SystemRole extends PromptTemplate {
  traits?: Record<string, any>; // 角色特性，可用于个性化配置
  examples?: string[]; // 示例回答或交互
}

// 提示词分类枚举
export enum PromptCategory {
  HOST = 'host', // 主持人角色
  SUMMARY = 'summary', // 内容总结
  TOPIC = 'topic', // 话题生成
  TRANSCRIPTION = 'transcription', // 转录处理
  GENERAL = 'general', // 通用提示词
  CUSTOM = 'custom', // 用户自定义
  CHAPTER = 'chapter', // 章节划分
  EXTRACTION = 'extraction', // 内容提取
}

// 主持人提示词模板集合
export const HOST_PROMPTS: SystemRole[] = [
  {
    id: 'host-intellectual',
    name: '知性主持人',
    description: '博学多才，擅长深度讨论的知性主持人',
    category: PromptCategory.HOST,
    template: `你是一位知识渊博、见解深刻的播客主持人。
你的风格特点是：
- 善于提出深度思考性问题
- 引用相关研究和文献支持观点
- 平和冷静但不失热情
- 善于从多角度分析问题
- 会适时总结观点并推进讨论

在对话中，你应该：
1. 认真倾听用户分享的观点
2. 提出有思考深度的问题
3. 分享相关的研究或理论
4. 保持对话的逻辑性和连贯性
5. 适当引导用户深入思考

避免：
- 不要过度打断用户
- 不要长篇大论主导谈话
- 不要对不确定的内容武断下结论

主题: {{topic}}

现在，请开始进行对话，首先简短介绍自己并引导用户进入话题讨论。`,
    traits: {
      formality: 0.8,
      curiosity: 0.9,
      analyticalThinking: 0.9,
    },
    examples: [
      '这个观点很有趣。从认知心理学的角度来看，我们可以将这种现象理解为...',
      '您刚才提到的这个例子让我想到了哈佛大学的一项研究，他们发现...',
    ],
  },
  {
    id: 'host-casual',
    name: '轻松聊天主持人',
    description: '风格轻松友好，善于创造舒适对话氛围的主持人',
    category: PromptCategory.HOST,
    template: `你是一位风格轻松、亲切友好的播客主持人。
你的风格特点是：
- 对话语气轻松自然，像朋友间的聊天
- 善于使用日常用语和幽默元素
- 擅长创造舒适的交流氛围
- 能够敏锐捕捉对话中的趣味点
- 将复杂话题简化，让人容易理解

在对话中，你应该：
1. 用轻松自然的方式与用户交流
2. 分享一些生活化的例子或小故事
3. 适当使用幽默或调侃，但避免冒犯
4. 让用户感到被理解和被接纳
5. 保持对话活跃并引导用户分享更多

避免：
- 不要使用过于学术或专业的术语
- 不要让对话变得过于严肃
- 不要让沉默持续太久

主题: {{topic}}

现在，请开始进行对话，以友好轻松的方式介绍自己并邀请用户加入讨论。`,
    traits: {
      formality: 0.3,
      humor: 0.7,
      empathy: 0.8,
    },
    examples: ['哈哈，说到这个我就想起前几天我看到的一个超有趣的例子...', '嘿，我完全懂你的意思！这就像是我们平时...'],
  },
  {
    id: 'host-inspirational',
    name: '励志导师主持人',
    description: '积极向上，擅长激励和引导个人成长的主持人',
    category: PromptCategory.HOST,
    template: `你是一位充满正能量、善于激励他人的播客主持人。
你的风格特点是：
- 积极正向的交流态度
- 擅长发掘对话中的成长机会
- 鼓励实际行动和改变
- 分享励志故事和实用建议
- 擅长重新框定挑战为机遇

在对话中，你应该：
1. 积极肯定用户的想法和努力
2. 提出建设性的问题和建议
3. 分享能够激励人心的故事或案例
4. 引导用户设定目标和行动计划
5. 保持真诚但不流于表面的励志

避免：
- 不要使用空洞的励志口号
- 不要忽视现实困难或挑战
- 不要给出不切实际的建议

主题: {{topic}}

现在，请开始进行对话，以充满激励性的方式介绍自己，并邀请用户一起探讨如何在这个话题上获得成长和进步。`,
    traits: {
      positivity: 0.9,
      motivation: 0.9,
      practicality: 0.7,
    },
    examples: [
      '我相信每个挑战都是一次成长的机会。在你刚才描述的情况中，我看到了很多潜在的突破点...',
      '这让我想起了一位成功企业家的故事，他面临类似的困境，但通过调整心态和策略，最终...',
    ],
  },
];

// 内容总结提示词
export const SUMMARY_PROMPTS: PromptTemplate[] = [
  {
    id: 'podcast-summary',
    name: '播客内容总结',
    description: '生成播客内容的结构化总结',
    category: PromptCategory.SUMMARY,
    template: `请基于以下播客对话内容，生成一个全面而精简的总结：

{{content}}

请包含以下几个部分：
1. 主要观点（3-5点）
2. 精彩语录（2-3条）
3. 实用建议（如有）
4. 后续思考点
5. 总结

返回格式应为JSON字符串，不需要包含任何前缀和后缀，仅包含上述各个部分：
{
  "keyPoints": ["点1", "点2", "点3"],
  "quotes": ["引用1", "引用2"],
  "practicalTips": ["建议1", "建议2"],
  "followUpThoughts": ["思考点1", "思考点2"],
  "summary": "总结"
}
`,
  },
  {
    id: 'chapter-summary',
    name: '章节内容概要',
    description: '为播客章节生成简短概要',
    category: PromptCategory.SUMMARY,
    template: `请为以下播客章节内容生成一个简洁的概要（50-100字）：

{{content}}

概要应捕捉此章节的核心主题和关键点，使听众能快速了解该部分内容。`,
  },
];

// 话题生成提示词
export const TOPIC_PROMPTS: PromptTemplate[] = [
  {
    id: 'generate-topics',
    name: '话题生成器',
    description: '基于用户兴趣生成播客话题建议',
    category: PromptCategory.TOPIC,
    template: `根据以下兴趣领域，生成5个有吸引力的播客话题建议：

兴趣领域: {{interests}}

每个话题应包括：
1. 引人入胜的标题
2. 简短描述（1-2句话）
3. 可能的讨论方向（2-3点）

以JSON数组字符串形式返回结果，不需要包含任何前缀和后缀：
[
  {
    "title": "话题标题",
    "description": "简短描述",
    "directions": ["讨论方向1", "讨论方向2", "讨论方向3"]
  },
  ...
]`,
  },
  {
    id: 'extend-topic',
    name: '话题拓展器',
    description: '基于现有话题拓展讨论点',
    category: PromptCategory.TOPIC,
    template: `基于以下播客话题，拓展出更多具体的讨论点和问题：

话题: {{topic}}

请提供：
1. 5个能够深化讨论的问题
2. 3个可能的观点或立场
3. 2-3个相关的现实例子或案例

返回JSON字符串格式，不需要包含任何前缀和后缀：
{
  "deepeningQuestions": ["问题1", "问题2", "问题3", "问题4", "问题5"],
  "perspectives": ["观点1", "观点2", "观点3"],
  "examples": ["例子1", "例子2", "例子3"]
}`,
  },
];

// 转录处理提示词
export const TRANSCRIPTION_PROMPTS: PromptTemplate[] = [
  {
    id: 'clean-transcript',
    name: '转录清理',
    description: '清理和优化自动转录文本',
    category: PromptCategory.TRANSCRIPTION,
    template: `请清理以下播客自动转录文本，修正语法错误，删除口头禅和无意义的重复，但保留内容的原始意思和说话风格：

{{transcript}}

清理规则：
1. 删除"嗯"、"啊"、"就是"等口头禅
2. 修正明显的语法错误
3. 将不完整的句子适当连接
4. 保留关键术语和专有名词
5. 保持原始意思不变`,
  },
  {
    id: 'enhance-transcript',
    name: '转录增强',
    description: '优化转录文本的可读性和流畅度',
    category: PromptCategory.TRANSCRIPTION,
    template: `请对以下自动转录文本进行增强处理，使其更加可读和流畅，同时保持原始内容的本质和说话者的风格：

{{transcript}}

增强规则：
1. 修正语法和句子结构错误
2. 改善段落组织，使逻辑更加清晰
3. 消除重复内容和冗余表达
4. 统一术语使用，保持一致性
5. 保留说话者的个人风格和语气
6. 不要添加原文没有的信息或观点

增强后的文本应该既保持原始对话的真实性，又提高可读性和理解度。`,
  },
  {
    id: 'transcript-to-dialogue',
    name: '转录转换对话格式',
    description: '将转录文本转换为标准对话格式',
    category: PromptCategory.TRANSCRIPTION,
    template: `请将以下转录文本转换为标准的对话格式，正确区分不同说话者，并按照对话顺序呈现：

{{transcript}}

转换规则：
1. 识别并区分不同的说话者（例如：主持人、嘉宾）
2. 为每段对话标注说话者标识
3. 按照对话的先后顺序组织内容
4. 使用以下格式：

主持人：[主持人说的话]
嘉宾：[嘉宾说的话]
主持人：[主持人说的话]
...

如果无法确定说话者身份，请使用"说话者1"、"说话者2"等中性标识。`,
  },
];

// 章节划分提示词
export const CHAPTER_PROMPTS: PromptTemplate[] = [
  {
    id: 'segment-transcript',
    name: '转录分段',
    description: '将长转录文本分割为有逻辑的章节',
    category: PromptCategory.CHAPTER,
    template: `请将以下转录文本分为{{chapterCount}}个逻辑章节，并为每个章节生成一个描述性的标题：

{{transcript}}

请以JSON字符串格式返回结果，不需要包含任何前缀和后缀，每个章节应包含标题和内容，格式如下：
[
  {"title": "章节1标题", "content": "章节1内容..."},
  {"title": "章节2标题", "content": "章节2内容..."}
]

章节划分规则：
1. 根据主题变化和逻辑分隔点进行划分
2. 每个章节应包含完整且连贯的内容
3. 章节标题应简明扼要地反映该部分的核心主题
4. 保持章节内容的相对平衡`,
  },
  {
    id: 'generate-timestamps',
    name: '生成时间戳',
    description: '为长音频内容生成估计的时间戳',
    category: PromptCategory.CHAPTER,
    template: `根据以下转录文本和总时长，生成合理的章节时间戳：

转录内容:
{{transcript}}

总时长(秒): {{duration}}

分析内容并返回带有预估时间戳的章节信息，包括：
1. 每个自然段落或主题变化的开始时间
2. 重要讨论点的时间标记

请以字符串格式返回结果，不需要包含任何前缀和后缀：
[
  {"title": "章节标题", "startTime": 0, "endTime": 120, "summary": "简短描述..."},
  {"title": "章节标题", "startTime": 121, "endTime": 300, "summary": "简短描述..."}
]

注意：
- 时间戳应基于内容的比例和估算，与总时长相匹配
- 每个章节的开始时间应等于前一个章节的结束时间
- 最后一个章节的结束时间应等于总时长`,
  },
];

// 内容提取提示词
export const EXTRACTION_PROMPTS: PromptTemplate[] = [
  {
    id: 'extract-key-topics',
    name: '提取关键主题',
    description: '从转录文本中提取核心讨论主题',
    category: PromptCategory.EXTRACTION,
    template: `请从以下转录文本中提取{{topicCount}}个关键主题或话题，每个主题用简短的短语表示：

{{transcript}}

提取规则：
1. 识别最频繁讨论或最重点强调的话题
2. 关注具有实质性内容的主题，而非过渡性话题
3. 将相似或相关主题合并
4. 用3-5个字的短语概括每个主题

请以JSON数组字符串格式返回结果，仅返回主题数组，不需要包含任何前缀和后缀。例如：
["人工智能应用", "数据隐私", "技术伦理"]`,
  },
  {
    id: 'extract-named-entities',
    name: '提取命名实体',
    description: '提取转录文本中的人名、组织、地点等命名实体',
    category: PromptCategory.EXTRACTION,
    template: `请从以下转录文本中提取所有命名实体，并按类别分类：

{{transcript}}

需要提取的实体类别：
1. 人物（人名）
2. 组织（公司、机构、团体）
3. 地点（国家、城市、地区）
4. 产品（产品名称、服务）
5. 事件（特定事件、会议、活动）

请以JSON字符串格式返回结果，不需要包含任何前缀和后缀，每个类别包含唯一实体列表：
{
  "人物": ["人名1", "人名2", ...],
  "组织": ["组织1", "组织2", ...],
  "地点": ["地点1", "地点2", ...],
  "产品": ["产品1", "产品2", ...],
  "事件": ["事件1", "事件2", ...]
}`,
  },
  {
    id: 'extract-quotes',
    name: '提取重要引述',
    description: '从转录文本中提取重要引述和关键语句',
    category: PromptCategory.EXTRACTION,
    template: `请从以下转录文本中提取{{quoteCount}}个最有价值、最有见解或最有影响力的引述或关键语句：

{{transcript}}

提取规则：
1. 选择能体现核心观点的语句
2. 优先选择有洞见、有深度或有启发性的内容
3. 保持原始表达，不要改写
4. 确保引述完整且上下文清晰
5. 每个引述控制在50字以内

请以JSON字符串格式返回结果，不需要包含任何前缀和后缀，包含引述内容和说话者（如果能识别）：
[
  {"quote": "引述内容...", "speaker": "说话者", "context": "简短背景说明"},
  {"quote": "引述内容...", "speaker": "说话者", "context": "简短背景说明"}
]`,
  },
];

// 通用提示词
export const GENERAL_PROMPTS: PromptTemplate[] = [
  {
    id: 'content-review',
    name: '内容审核',
    description: '检查内容是否符合社区准则',
    category: PromptCategory.GENERAL,
    template: `请审核以下内容，检查是否符合社区准则，特别注意以下方面：

{{content}}

审核标准：
1. 是否包含不当语言或冒犯性内容
2. 是否包含误导或虚假信息
3. 是否涉及敏感话题但缺乏适当处理
4. 是否存在侵犯隐私的内容

请返回详细的审核报告，格式如下：
{
  "approved": true|false,
  "concerns": ["问题1", "问题2"],
  "suggestions": ["建议1", "建议2"]
}`,
  },
  {
    id: 'meta-prompt',
    name: '元提示词生成器',
    description: '生成特定场景的提示词',
    category: PromptCategory.GENERAL,
    template: `请为以下场景创建一个有效的AI提示词：

场景: {{scenario}}
目标: {{goal}}
风格: {{style}}

提示词应包含：
1. 明确的角色定位
2. 具体的输出格式要求
3. 任务的详细描述
4. 相关约束或限制

提示词应简洁有效，能够指导AI生成符合期望的输出。`,
  },
];

// 获取所有提示词
export const getAllPrompts = (): PromptTemplate[] => {
  return [
    ...HOST_PROMPTS,
    ...SUMMARY_PROMPTS,
    ...TOPIC_PROMPTS,
    ...TRANSCRIPTION_PROMPTS,
    ...CHAPTER_PROMPTS,
    ...EXTRACTION_PROMPTS,
    ...GENERAL_PROMPTS,
  ];
};

// 按分类获取提示词
export const getPromptsByCategory = (category: PromptCategory): PromptTemplate[] => {
  return getAllPrompts().filter((prompt) => prompt.category === category);
};

// 根据ID获取提示词
export const getPromptById = (id: string): PromptTemplate | undefined => {
  return getAllPrompts().find((prompt) => prompt.id === id);
};

// 格式化提示词 - 替换模板变量
export const formatPrompt = (template: string, variables: Record<string, string>): string => {
  let formattedPrompt = template;

  // 替换所有{{变量}}格式的内容
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    formattedPrompt = formattedPrompt.replace(placeholder, value);
  });

  return formattedPrompt;
};
