import { createDeepSeek } from '@ai-sdk/deepseek';
import { streamText } from 'ai';

// 创建自定义 DeepSeek 提供商实例，显式传入 API 密钥
const deepseekProvider = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY || process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY || '',
});

export async function POST(req: Request) {
  try {
    // 从请求中提取消息
    const { messages } = await req.json();

    // 检查消息格式
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: '无效的消息格式' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('Processing reasoning messages:', JSON.stringify(messages).slice(0, 100) + '...');

    // 生成文本流，使用推理模型
    const result = streamText({
      model: deepseekProvider('deepseek-reasoner'),
      messages,
    });

    console.log('Reasoning stream created successfully');

    // 返回流响应，包括推理过程
    return result.toDataStreamResponse({
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Encoding': 'none',
      },
      sendReasoning: true, // 发送推理过程到客户端
    });
  } catch (error) {
    console.error('Reasoning API error:', error);
    return new Response(JSON.stringify({ error: '处理推理请求时出错' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
