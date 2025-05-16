import { PodcastMessage, PodcastService } from '@/services/podcast-service';
import { Message, useChat } from '@ai-sdk/react';
import { Ionicons } from '@expo/vector-icons';
import { fetch as expoFetch } from 'expo/fetch';
import React, { useEffect, useRef, useState } from 'react';
import { Keyboard, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { generateAPIUrl, getPromptById } from '../utils';
import { ChatMessage } from './ChatMessage';
import { ThinkingIndicator } from './ThinkingIndicator';
import { colors } from './theme';

// 加载历史消息
const loadHistoricalMessages = async (
  podcastId: string,
  setHistoricalMessages: (messages: PodcastMessage[]) => void,
  setMessages: (messages: Message[] | ((messages: Message[]) => Message[])) => void,
  savedMessagesRef: React.RefObject<Set<string>>,
  setHasLoadedHistorical: (loaded: boolean) => void
) => {
  try {
    console.log('正在加载历史消息...');
    const dbMessages = await PodcastService.getMessages(podcastId);

    if (dbMessages && dbMessages.length > 0) {
      setHistoricalMessages(dbMessages);

      // 将历史消息转换为useChat消息格式并加载
      // 注意：不包含系统消息，因为系统提示词不存储在数据库中
      const chatMessages: Message[] = dbMessages.map((msg, index) => ({
        id: `historical-${index}`,
        role: msg.speaker_type === 'host' ? 'assistant' : 'user',
        content: msg.content,
      }));

      // 将历史消息设置到useChat中
      setMessages(chatMessages);

      // 标记所有消息ID为已保存，防止重复保存
      chatMessages.forEach((msg) => {
        savedMessagesRef.current.add(msg.id);
      });

      console.log(`成功加载了${dbMessages.length}条历史消息`);
    } else {
      console.log('没有找到历史消息');
    }

    setHasLoadedHistorical(true);
  } catch (error) {
    console.error('加载历史消息失败:', error);
    setHasLoadedHistorical(true);
  }
};

// 创建系统提示词
const createSystemPrompt = (hostRoleId: string, topic?: string): string => {
  const promptTemplate = getPromptById(hostRoleId);
  if (!promptTemplate) {
    throw new Error(`找不到 ID 为 ${hostRoleId} 的提示词模板`);
  }
  // 获取基础系统提示词
  let systemPrompt = promptTemplate.template;

  // 如果有话题，添加话题相关引导
  if (topic) {
    systemPrompt = `${systemPrompt}\n\n你正在主持一个关于"${topic}"的播客。请确保对话紧密围绕这个主题展开，并避免讨论与此主题无关的内容。如果用户询问与主题无关的问题，请礼貌地将对话重新引导回主题。`;
  }

  return systemPrompt;
};

export interface AIChatInterfaceProps {
  /**
   * 聊天的唯一 ID，用于区分不同的聊天会话
   */
  chatId: string;
  /**
   * 初始消息，可用于显示欢迎消息或系统消息
   */
  initialMessages?: { id: string; role: 'user' | 'assistant' | 'system'; content: string }[];
  /**
   * 初始提示词，用于在用户未输入任何内容时显示
   */
  initialPrompt?: string;
  /**
   * 对话主题
   */
  topic?: string;
  /**
   * 主持人角色ID，用于调整AI的回复风格
   */
  hostRoleId?: string;
  /**
   * 对话完成时的回调函数
   */
  onConversationComplete?: () => Promise<void>;
  /**
   * 显示的主持人名称
   */
  hostName?: string;
}

/**
 * 使用 AI SDK 的 useChat 钩子实现的聊天界面组件
 */
export function AIChatInterface({
  chatId: podcastId,
  initialMessages = [],
  initialPrompt,
  topic,
  hostRoleId = 'host-intellectual',
  onConversationComplete,
  hostName = '主持人',
}: AIChatInterfaceProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [hasLoadedHistorical, setHasLoadedHistorical] = useState(false);
  const [, setHistoricalMessages] = useState<PodcastMessage[]>([]);
  const savedMessagesRef = useRef<Set<string>>(new Set());
  const [welcomeMessageGenerated, setWelcomeMessageGenerated] = useState(false);

  // 创建系统提示词
  const systemPrompt = createSystemPrompt(hostRoleId, topic);

  // 创建包含系统提示词的初始消息数组
  const messagesWithSystem = [{ id: 'system-1', role: 'system' as const, content: systemPrompt }, ...initialMessages];

  // 使用 AI SDK 的 useChat 钩子
  const { messages, input, handleInputChange, handleSubmit, isLoading, append, error, setMessages } = useChat({
    id: podcastId,
    initialMessages: messagesWithSystem,
    initialInput: initialPrompt || '',
    // 使用 expo/fetch 替代原生 fetch 以支持流式响应
    fetch: expoFetch as unknown as typeof globalThis.fetch,
    api: generateAPIUrl('/api/chat'),
    onError: (e) => {
      console.error('聊天出错:', e);
    },
    onFinish: (message) => {
      console.log('消息生成完成：', message);
      // 确保播客ID存在且已加载历史消息
      if (!podcastId || !hasLoadedHistorical || messages.length === 0) return;

      const saveNewMessages = async () => {
        try {
          // 将消息保存到数据库
          await PodcastService.saveMessage(
            podcastId,
            message.content,
            message.role === 'assistant' ? 'host' : 'user',
            Math.floor(Date.now() / 1000)
          );

          // 将消息ID添加到已保存集合
          savedMessagesRef.current.add(message.id);
          console.log(`已保存消息: ${message.id}, 类型: ${message.role}`);
        } catch (error) {
          console.error('保存消息到数据库失败:', error);
        }
      };

      if (message.role !== 'system' && message.id !== 'welcome-prompt' && !savedMessagesRef.current.has(message.id)) {
        saveNewMessages();
      }
    },
  });

  // 监听消息变化，将新消息保存到数据库
  // useEffect(() => {
  //   // 确保播客ID存在且已加载历史消息
  //   if (!podcastId || !hasLoadedHistorical || messages.length === 0) return;

  //   const saveNewMessages = async () => {
  //     try {
  //       // 过滤出需要保存的消息（不包括系统消息和已保存的消息）
  //       const messagesToSave = messages.filter(
  //         (msg) =>
  //           // 排除系统消息
  //           msg.role !== 'system' &&
  //           // 排除欢迎提示消息
  //           msg.id !== 'welcome-prompt' &&
  //           // 排除已保存的消息
  //           !savedMessagesRef.current.has(msg.id)
  //       );

  //       if (messagesToSave.length === 0) return;

  //       console.log(`准备保存 ${messagesToSave.length} 条新消息到数据库`);

  //       // 处理每条需要保存的消息
  //       for (const msg of messagesToSave) {
  //         // 将消息保存到数据库
  //         await PodcastService.saveMessage(
  //           podcastId,
  //           msg.content,
  //           msg.role === 'assistant' ? 'host' : 'user',
  //           Math.floor(Date.now() / 1000)
  //         );

  //         // 将消息ID添加到已保存集合
  //         savedMessagesRef.current.add(msg.id);
  //         console.log(`已保存消息: ${msg.id}, 类型: ${msg.role}`);
  //       }
  //     } catch (error) {
  //       console.error('保存消息到数据库失败:', error);
  //     }
  //   };

  //   saveNewMessages();
  // }, [messages, podcastId, hasLoadedHistorical]);

  // 加载历史消息
  useEffect(() => {
    if (podcastId && !hasLoadedHistorical) {
      loadHistoricalMessages(
        podcastId,
        setHistoricalMessages,
        (newMessages) => {
          // 将加载的历史消息与系统提示词合并
          if (Array.isArray(newMessages)) {
            setMessages([{ id: 'system-1', role: 'system', content: systemPrompt }, ...newMessages]);
          } else {
            // 如果是函数形式，需要转换
            setMessages((prevMessages) => {
              // 确保系统消息始终位于第一位
              const filteredPrevMessages = prevMessages.filter((msg) => msg.role !== 'system');
              return [{ id: 'system-1', role: 'system', content: systemPrompt }, ...filteredPrevMessages];
            });
          }
        },
        savedMessagesRef,
        setHasLoadedHistorical
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [podcastId, hasLoadedHistorical, systemPrompt]);

  // 生成欢迎语
  useEffect(() => {
    // 确保只生成一次欢迎语
    if (hasLoadedHistorical && !welcomeMessageGenerated && messages.length <= 1) {
      const generateWelcomeMessage = async () => {
        try {
          setWelcomeMessageGenerated(true);

          // 生成欢迎语的提示
          let welcomePrompt = '请简短地欢迎用户并介绍自己作为主持人';
          if (topic) {
            welcomePrompt += `，提及今天的播客主题是"${topic}"，并邀请用户开始讨论。`;
          } else {
            welcomePrompt += '，并邀请用户开始讨论。';
          }

          // 使用AI SDK的append方法添加欢迎消息
          // 这会触发流式响应
          await append(
            {
              role: 'user',
              content: welcomePrompt,
              id: 'welcome-prompt',
            },
            {
              // 添加自定义数据到请求体中
              body: {
                hidePrompt: true,
              },
            }
          );
        } catch (error) {
          console.error('生成欢迎语失败:', error);
        }
      };

      generateWelcomeMessage();
    }
  }, [hasLoadedHistorical, welcomeMessageGenerated, messages.length, topic, append]);

  // 自动滚动到底部
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    return () => clearTimeout(timer);
  }, [messages]);

  // 处理表单提交
  const submitMessage = (e?: { preventDefault?: () => void }) => {
    if (e?.preventDefault) e.preventDefault();

    if (!input.trim()) return;

    async function saveMessage() {
      // 将消息保存到数据库
      await PodcastService.saveMessage(podcastId, input, 'user', Math.floor(Date.now() / 1000));

      // 使用 AI SDK 的 handleSubmit 提交消息
      handleSubmit(e);
    }

    saveMessage();

    // 关闭键盘
    Keyboard.dismiss();
  };

  // 结束对话
  const completeConversation = async () => {
    if (!onConversationComplete) return;

    try {
      await onConversationComplete();
    } catch (error) {
      console.error('结束对话失败:', error);
    }
  };

  // 过滤出非系统消息用于显示
  const displayMessages = messages.filter((msg) => msg.role !== 'system' && msg.id !== 'welcome-prompt');

  return (
    <View style={styles.container}>
      <View style={styles.messagesContainer}>
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* 错误消息 */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>错误: {error.message}</Text>
            </View>
          )}

          {/* 聊天消息 */}
          {displayMessages.map((message) => (
            <ChatMessage
              key={message.id}
              type={message.role === 'user' ? 'user' : 'ai'}
              content={message.content}
              done={message.role !== 'assistant' || !isLoading}
            />
          ))}

          {/* 加载指示器 */}
          {isLoading &&
            (displayMessages.length === 0 || displayMessages[displayMessages.length - 1].role !== 'assistant') && (
              <ThinkingIndicator />
            )}
        </ScrollView>
      </View>

      {/* 输入区域 */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={(text) =>
            handleInputChange({
              target: { value: text },
            } as any)
          }
          placeholder="输入消息..."
          placeholderTextColor={colors.neutral500}
          multiline
          returnKeyType="send"
          blurOnSubmit={false}
          onSubmitEditing={submitMessage}
          editable={!isLoading}
        />

        <TouchableOpacity
          style={[styles.sendButton, (!input.trim() || isLoading) && styles.disabledButton]}
          onPress={submitMessage}
          disabled={!input.trim() || isLoading}
        >
          <Ionicons name="send" size={24} color={!input.trim() || isLoading ? colors.neutral400 : 'white'} />
        </TouchableOpacity>
      </View>

      {/* 完成对话按钮 */}
      <TouchableOpacity
        style={styles.completeButton}
        onPress={completeConversation}
        disabled={isLoading || displayMessages.length === 0}
      >
        <Text style={styles.completeButtonText}>{isLoading ? '生成中...' : '结束对话'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral50,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: colors.neutral800,
    fontSize: 14,
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.neutral100,
    borderTopWidth: 1,
    borderTopColor: colors.neutral200,
  },
  input: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    color: colors.neutral800,
    maxHeight: 100,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  disabledButton: {
    backgroundColor: colors.neutral300,
  },
  completeButton: {
    margin: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.secondary,
    alignItems: 'center',
  },
  completeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
