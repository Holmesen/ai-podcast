import { createDeepSeek } from '@ai-sdk/deepseek';
import { generateText, streamText } from 'ai';

// 创建DeepSeek提供商实例
const deepseekProvider = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY || '',
});

export async function POST(req: Request) {
  try {
    // 从请求中提取消息和隐藏提示参数
    const { messages = [], body = {}, stream = true } = await req.json();
    const { hidePrompt = false } = body;

    // 记录请求信息，帮助调试
    console.log('Stream mode:', stream ? 'enabled' : 'disabled');
    console.log('Chat API received request with', messages.length, 'messages');
    if (messages.length > 0) {
      console.log('Last message:', messages[messages.length - 1]?.content?.slice(0, 100));
    }
    console.log('Hide prompt:', hidePrompt);

    // 检查消息格式
    if (!Array.isArray(messages)) {
      console.error('Invalid message format:', messages);
      return new Response(JSON.stringify({ error: '无效的消息格式' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 确保使用正确的模型
    const model = deepseekProvider('deepseek-chat');

    // 如果需要隐藏提示消息，则处理消息数组
    let finalMessages = messages;
    if (hidePrompt && messages.length >= 2) {
      // 找到最后一条用户消息
      const lastUserMessageIndex = messages.findIndex((msg, idx) => msg.role === 'user' && idx === messages.length - 1);

      if (lastUserMessageIndex !== -1) {
        // 从消息数组中移除最后一条用户消息
        finalMessages = [...messages.slice(0, lastUserMessageIndex), ...messages.slice(lastUserMessageIndex + 1)];

        // 记录操作
        console.log('隐藏了最后一条用户提示消息');
      }
    }

    // 根据stream参数决定使用流式响应还是非流式响应
    if (stream) {
      // 使用流式响应
      const result = streamText({
        model,
        messages: finalMessages,
      });

      // 确保结果是一个流
      if (!result) {
        console.error('Failed to create stream');
        return new Response(JSON.stringify({ error: '创建流失败' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // 转换为AI SDK期望的响应格式
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
    } else {
      // 使用非流式响应
      const result = generateText({
        model,
        messages: finalMessages,
      });
      const { text } = await result;
      return new Response(JSON.stringify({ text, role: 'assistant' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
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
