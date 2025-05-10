import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Keyboard, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Message {
  id: string;
  content: string;
  sender: 'ai' | 'user';
  timestamp: Date;
}

interface TopicInfo {
  topicId: string;
  topicTitle?: string;
  topicDescription?: string;
}

// 思考指示器组件
const ThinkingIndicator = () => (
  <View style={styles.thinkingContainer}>
    <View style={styles.thinkingDot} />
    <View style={[styles.thinkingDot, styles.thinkingDotMiddle]} />
    <View style={styles.thinkingDot} />
  </View>
);

// 消息组件
const ChatMessage = ({ message }: { message: Message }) => {
  const isAI = message.sender === 'ai';

  return (
    <View style={[styles.messageContainer, isAI ? styles.messageAI : styles.messageUser]}>
      <View style={[styles.messageAvatar, isAI ? styles.aiAvatar : styles.userAvatar]}>
        <Ionicons name={isAI ? 'mic' : 'person'} size={16} color="white" />
      </View>
      <View style={[styles.messageContent, isAI ? styles.messageContentAI : styles.messageContentUser]}>
        <Text style={[styles.messageText, isAI ? {} : styles.messageTextUser]}>{message.content}</Text>
      </View>
    </View>
  );
};

export default function Chat() {
  const [topicInfo, setTopicInfo] = useState<TopicInfo | null>(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // 加载已选择的话题（如果有）
  useEffect(() => {
    const loadSelectedTopic = async () => {
      try {
        const topicData = await AsyncStorage.getItem('selectedTopic');
        if (topicData) {
          // 已有话题选择，解析数据
          const parsedTopicInfo = JSON.parse(topicData);
          setTopicInfo(parsedTopicInfo);
          setInitialLoadDone(true);
        } else {
          // 没有话题选择，返回到record tab
          router.replace('/(tabs)/record');
        }
      } catch (error) {
        console.error('加载话题数据失败:', error);
        // 出错时也重定向回record页面
        router.replace('/(tabs)/record');
      }
    };

    loadSelectedTopic();
  }, []);

  // 以下是原有代码，但会根据选择的话题进行调整
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // 当话题加载完成后，初始化聊天消息
  useEffect(() => {
    if (topicInfo && initialLoadDone) {
      // 尝试加载已存在的消息
      const loadMessages = async () => {
        try {
          const messagesData = await AsyncStorage.getItem(`messages_${topicInfo.topicId}`);
          if (messagesData) {
            const parsedMessages = JSON.parse(messagesData);
            // 转换日期字符串回Date对象
            const messagesWithDates = parsedMessages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
            }));
            setMessages(messagesWithDates);
            setIsThinking(false);
          } else {
            // 没有已存在的消息，创建初始消息
            const initialMessages: Message[] = [
              {
                id: '1',
                content: `嗨，欢迎来到我们的播客！今天我们要聊聊${topicInfo.topicTitle || '创意思维方法'}。${
                  topicInfo.topicDescription || '突破思维局限，激发创造力的实用技巧。'
                }你对这个话题有什么看法呢？`,
                sender: 'ai',
                timestamp: new Date(),
              },
            ];

            setMessages(initialMessages);
            // 保存初始消息
            await AsyncStorage.setItem(`messages_${topicInfo.topicId}`, JSON.stringify(initialMessages));
            // 初始消息后不需要显示思考状态
            setIsThinking(false);
          }
        } catch (error) {
          console.error('加载消息失败:', error);
          setIsThinking(false);
        }
      };

      loadMessages();
    }
  }, [topicInfo, initialLoadDone]);

  // 更新进行中的话题信息
  const updateOngoingTopic = async () => {
    if (!topicInfo) return;

    try {
      const ongoingTopicsData = await AsyncStorage.getItem('ongoingTopics');
      let ongoingTopics = ongoingTopicsData ? JSON.parse(ongoingTopicsData) : [];

      // 查找当前话题
      const existingIndex = ongoingTopics.findIndex((t: any) => t.topicId === topicInfo.topicId);

      if (existingIndex >= 0) {
        // 更新现有话题
        ongoingTopics[existingIndex].lastMessageTime = new Date().toLocaleDateString();
        ongoingTopics[existingIndex].messageCount = messages.length;
      }

      // 保存更新后的进行中话题
      await AsyncStorage.setItem('ongoingTopics', JSON.stringify(ongoingTopics));
    } catch (error) {
      console.error('更新进行中话题失败:', error);
    }
  };

  useEffect(() => {
    // 当消息更新时滚动到底部
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // 保存消息并更新话题信息
    if (messages.length > 0 && topicInfo) {
      // 保存消息
      AsyncStorage.setItem(`messages_${topicInfo.topicId}`, JSON.stringify(messages))
        .then(() => updateOngoingTopic())
        .catch((err) => console.error('保存消息失败:', err));
    }
  }, [messages, isThinking]);

  const sendMessage = () => {
    if (inputText.trim() === '') return;

    // 添加用户消息
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInputText('');
    setIsThinking(true);

    // 模拟AI思考后回复
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content:
          '这是个很棒的观点！关于' + (topicInfo?.topicTitle || '创意思维') + '，你还有什么想要分享的经验或者问题吗？',
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);
      setIsThinking(false);
    }, 2000);

    // 隐藏键盘
    Keyboard.dismiss();
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  // 完成对话并返回
  const finishConversation = () => {
    router.replace('/(tabs)/record');
  };

  // 如果还没有加载完毕，返回加载界面
  if (!initialLoadDone) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ThinkingIndicator />
          <Text style={styles.loadingText}>正在准备对话...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* 顶部导航 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={finishConversation}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>对话模式</Text>
        <Link href="/screens/summary" asChild>
          <TouchableOpacity>
            <Ionicons name="list-outline" size={24} color="#111827" />
          </TouchableOpacity>
        </Link>
      </View>

      {/* 主持人信息 */}
      <View style={styles.hostInfo}>
        <View style={styles.hostAvatar}>
          <Ionicons name="mic" size={22} color="white" />
        </View>
        <View>
          <Text style={styles.hostName}>Sarah</Text>
          <Text style={styles.hostTitle}>AI 播客主持人</Text>
        </View>
      </View>

      {/* 播客信息 */}
      <View style={styles.podcastInfo}>
        <View style={styles.podcastInfoIcon}>
          <Ionicons name="bulb-outline" size={20} color="#6366f1" />
        </View>
        <View style={styles.podcastInfoContent}>
          <Text style={styles.podcastInfoTitle}>{topicInfo?.topicTitle || '创意思维方法'}</Text>
          <Text style={styles.podcastInfoDesc}>
            {topicInfo?.topicDescription || '突破思维局限，激发创造力的实用技巧'}
          </Text>
        </View>
      </View>

      {/* 聊天消息区域 */}
      <ScrollView ref={scrollViewRef} style={styles.chatContainer} contentContainerStyle={styles.chatContentContainer}>
        {/* 对话操作按钮 */}
        <View style={styles.chatActions}>
          <TouchableOpacity style={styles.chatAction}>
            <Ionicons name="recording-outline" size={22} color="#4b5563" />
            <Text style={styles.chatActionText}>录音模式</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.chatAction}>
            <Ionicons name="share-social-outline" size={22} color="#4b5563" />
            <Text style={styles.chatActionText}>分享</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.chatAction}>
            <Ionicons name="star-outline" size={22} color="#4b5563" />
            <Text style={styles.chatActionText}>收藏</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.timeIndicator}>
          <Text style={styles.timeText}>
            今天 {new Date().getHours()}:{String(new Date().getMinutes()).padStart(2, '0')}
          </Text>
        </View>
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {isThinking && <ThinkingIndicator />}
      </ScrollView>

      {/* 输入区域 */}
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={[styles.voiceButton, isRecording ? styles.recordingActive : {}]}
          onPress={toggleRecording}
        >
          <Ionicons name={isRecording ? 'mic' : 'mic-outline'} size={22} color={isRecording ? 'white' : '#4b5563'} />
        </TouchableOpacity>

        <TextInput
          style={styles.textInput}
          placeholder="输入消息..."
          placeholderTextColor="#9CA3AF"
          value={inputText}
          onChangeText={setInputText}
          multiline
          onSubmitEditing={sendMessage}
        />

        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Ionicons name="paper-plane" size={18} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  hostAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  hostName: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  hostTitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  podcastInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 12,
    margin: 16,
    marginTop: 0,
    marginBottom: 12,
  },
  podcastInfoIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#ede9fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  podcastInfoContent: {
    flex: 1,
  },
  podcastInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  podcastInfoDesc: {
    fontSize: 14,
    color: '#6b7280',
  },
  chatActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    marginBottom: 16,
  },
  chatAction: {
    alignItems: 'center',
  },
  chatActionText: {
    fontSize: 12,
    color: '#4b5563',
    marginTop: 4,
  },
  timeIndicator: {
    alignItems: 'center',
    marginBottom: 16,
  },
  timeText: {
    fontSize: 13,
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  chatContentContainer: {
    paddingBottom: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '100%',
  },
  messageAI: {
    alignSelf: 'flex-start',
  },
  messageUser: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  aiAvatar: {
    backgroundColor: '#6366f1',
  },
  userAvatar: {
    backgroundColor: '#4f46e5',
  },
  messageContent: {
    padding: 12,
    borderRadius: 20,
    maxWidth: '75%',
  },
  messageContentAI: {
    backgroundColor: '#f3f4f6',
    borderBottomLeftRadius: 4,
  },
  messageContentUser: {
    backgroundColor: '#6366f1',
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  messageTextUser: {
    color: 'white',
  },
  thinkingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 48,
    marginBottom: 16,
  },
  thinkingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9CA3AF',
    marginRight: 4,
    opacity: 0.7,
    transform: [{ scale: 0.8 }],
  },
  thinkingDotMiddle: {
    opacity: 1,
    transform: [{ scale: 1 }],
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    backgroundColor: 'white',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
  },
  voiceButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  recordingActive: {
    backgroundColor: '#6366f1',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});
