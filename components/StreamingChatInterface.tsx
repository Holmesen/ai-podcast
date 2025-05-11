import { useChat } from '@ai-sdk/react';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { fetch as expoFetch } from 'expo/fetch';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { PodcastService } from '../services/podcast-service';
import { generateAPIUrl } from '../utils';
import { ChatMessage, ThinkingIndicator } from './ChatMessage';
import { colors } from './theme';

interface StreamingChatInterfaceProps {
  podcastId: string;
  hostName: string;
  hostAvatarUrl?: string;
  onSaveComplete?: () => void;
}

export function StreamingChatInterface({
  podcastId,
  hostName,
  hostAvatarUrl,
  onSaveComplete,
}: StreamingChatInterfaceProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [initialMessage, setInitialMessage] = useState<string | null>(null);
  const [messagesLoaded, setMessagesLoaded] = useState(false);
  const savedMessagesRef = useRef<Set<string>>(new Set());

  // 使用 AI SDK 的 useChat 钩子
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading: isChatLoading,
    error,
  } = useChat({
    // 使用 expo/fetch 而不是原生的 fetch
    fetch: expoFetch as unknown as typeof globalThis.fetch,
    api: generateAPIUrl('/api/chat'),
    // 多步工具调用，每个消息最多5个步骤
    maxSteps: 5,
    id: podcastId, // 使用播客ID作为对话ID
    // 在消息完成时保存到数据库
    onFinish: async (message) => {
      try {
        if (message.role === 'assistant' && message.content) {
          // 避免重复保存相同的消息
          if (!savedMessagesRef.current.has(message.id)) {
            savedMessagesRef.current.add(message.id);
            // 保存AI回复到数据库
            const timestamp = Math.floor(Date.now() / 1000);
            await PodcastService.saveMessage(podcastId, message.content, 'host', timestamp);
            // 更新播客时长
            await PodcastService.updatePodcastDuration(podcastId);
            console.log('已保存AI回复到数据库', message.id);
          }
        }
      } catch (err) {
        console.error('保存消息失败:', err);
      }
    },
  });

  // 获取当前用户ID
  useEffect(() => {
    const getUserId = async () => {
      const id = await SecureStore.getItemAsync('userId');
      setUserId(id);
    };
    getUserId();
  }, []);

  // 加载初始消息
  useEffect(() => {
    const loadInitialMessage = async () => {
      if (messagesLoaded) return;

      setIsLoading(true);
      try {
        // 获取播客信息以便在欢迎消息中引用
        const { podcast, messages: existingMessages } = await PodcastService.getPodcastDetails(podcastId);

        // 如果已有消息，不需要创建欢迎消息
        if (existingMessages && existingMessages.length > 0) {
          setMessagesLoaded(true);
          setIsLoading(false);
          return;
        }

        if (podcast) {
          const welcomeMessage = `嗨，欢迎来到我们的播客！我是${hostName}。今天我们要聊聊${podcast.title}。${
            podcast.description || '我很期待和你的对话。'
          }你对这个话题有什么看法呢？`;

          // 保存欢迎消息到数据库
          const timestamp = Math.floor(Date.now() / 1000);
          await PodcastService.saveMessage(podcastId, welcomeMessage, 'host', timestamp);

          // 设置初始消息
          setInitialMessage(welcomeMessage);
          setMessagesLoaded(true);
        }
      } catch (error) {
        console.error('加载初始信息失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (podcastId && !messagesLoaded) {
      loadInitialMessage();
    }
  }, [podcastId, hostName, messagesLoaded]);

  // 当消息更新时滚动到底部
  useEffect(() => {
    if (messages.length > 0 && scrollViewRef.current) {
      const timeoutId = setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [messages]);

  // 处理表单提交
  const handleMessageSubmit = () => {
    // 首先将用户消息保存到数据库
    const saveUserMessage = async () => {
      if (input.trim() && podcastId) {
        try {
          const timestamp = Math.floor(Date.now() / 1000);
          await PodcastService.saveMessage(podcastId, input, 'user', timestamp);
        } catch (err) {
          console.error('保存用户消息失败:', err);
        }
      }
    };

    // 保存消息后提交到 AI
    saveUserMessage().then(() => {
      handleSubmit();
      Keyboard.dismiss();
    });
  };

  // 完成对话
  const completeConversation = async () => {
    if (!podcastId) return;

    setIsCompleting(true);

    try {
      // 确保所有消息都已保存到数据库
      const messagesToSave = messages.filter(
        (msg) => msg.role === 'assistant' && !savedMessagesRef.current.has(msg.id)
      );

      for (const msg of messagesToSave) {
        if (msg.content) {
          savedMessagesRef.current.add(msg.id);
          const timestamp = Math.floor(Date.now() / 1000);
          await PodcastService.saveMessage(podcastId, msg.content, 'host', timestamp);
        }
      }

      // 更新播客时长
      await PodcastService.updatePodcastDuration(podcastId);

      // 调用回调
      if (onSaveComplete) {
        onSaveComplete();
      }
    } catch (error) {
      console.error('完成对话错误:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  // 处理输入变化
  const onChangeText = (text: string) => {
    handleInputChange({
      target: { value: text },
    } as unknown as React.ChangeEvent<HTMLInputElement>);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>加载对话...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* 显示初始欢迎消息（如果有） */}
        {initialMessage && messages.length === 0 && <ChatMessage type="ai" content={initialMessage} />}

        {/* 显示所有消息，包括流式显示的消息 */}
        {messages.map((message) => (
          <ChatMessage key={message.id} type={message.role === 'assistant' ? 'ai' : 'user'} content={message.content} />
        ))}

        {/* 显示错误消息 */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>错误: {error.message}</Text>
          </View>
        )}

        {/* 显示加载状态 */}
        {isChatLoading && messages.length > 0 && messages[messages.length - 1].role !== 'assistant' && (
          <ThinkingIndicator />
        )}

        {/* 完成对话按钮 */}
        {messages.length > 0 && !isChatLoading && (
          <View style={styles.actionButtonContainer}>
            <TouchableOpacity style={styles.completeButton} onPress={completeConversation} disabled={isCompleting}>
              <Text style={styles.completeButtonText}>{isCompleting ? '正在完成...' : '完成对话'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* 输入框区域 */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="输入消息..."
          value={input}
          onChangeText={onChangeText}
          multiline
          maxLength={1000}
          editable={!isCompleting && !isChatLoading}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!input.trim() || isChatLoading || isCompleting) && styles.sendButtonDisabled]}
          onPress={handleMessageSubmit}
          disabled={!input.trim() || isChatLoading || isCompleting}
        >
          <Ionicons name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.neutral700,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContentContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.neutral200,
    backgroundColor: 'white',
  },
  input: {
    flex: 1,
    backgroundColor: colors.neutral100,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxHeight: 120,
    fontSize: 16,
  },
  sendButton: {
    marginLeft: 12,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.neutral300,
  },
  actionButtonContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  completeButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  completeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  errorContainer: {
    padding: 12,
    backgroundColor: colors.error + '20',
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
  },
});
