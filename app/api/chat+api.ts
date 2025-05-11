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

    // 记录请求信息，帮助调试
    console.log('Chat API received request with', messages.length, 'messages');
    console.log('Last message:', messages[messages.length - 1]);

    // 检查消息格式
    if (!messages || !Array.isArray(messages)) {
      console.error('Invalid message format:', messages);
      return new Response(JSON.stringify({ error: '无效的消息格式' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 确保使用正确的模型
    const model = deepseekProvider('deepseek-chat');

    // 生成文本流，使用默认配置
    const result = streamText({
      model,
      messages,
    });

    // 确保结果是一个流
    if (!result) {
      console.error('Failed to create stream');
      return new Response(JSON.stringify({ error: '创建流失败' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('Stream created successfully, sending response');

    // 返回流响应，设置适当的头部以优化流式显示
    return result.toDataStreamResponse({
      headers: {
        'Content-Type': 'application/octet-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Content-Type-Options': 'nosniff',
        'Content-Encoding': 'none',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: '处理请求时出错: ' + (error instanceof Error ? error.message : String(error)) }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
