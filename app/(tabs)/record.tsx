import { Ionicons } from '@expo/vector-icons';
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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content:
        '嗨，欢迎来到我们的播客！今天我们要聊聊创意思维方法。无论是工作还是生活中，创造力都是一项宝贵的能力。你平时是如何激发自己的创意的呢？',
      sender: 'ai',
      timestamp: new Date(),
    },
    {
      id: '2',
      content: '我经常通过阅读不同领域的书籍来获取灵感，觉得跨领域的思维碰撞很有帮助。',
      sender: 'user',
      timestamp: new Date(),
    },
    {
      id: '3',
      content:
        '跨领域学习确实是激发创意的好方法！许多创新都来自于将不同领域的知识连接起来。你能举个例子说明这种跨领域思维如何帮助你解决了一个具体问题吗？',
      sender: 'ai',
      timestamp: new Date(),
    },
    {
      id: '4',
      content:
        '我曾经在设计一个产品时借鉴了生物学中的自组织系统概念，让产品更具适应性和可扩展性。这种跨领域思考帮助我们解决了产品架构的问题。',
      sender: 'user',
      timestamp: new Date(),
    },
    {
      id: '5',
      content:
        '这是个很棒的例子！将生物学原理应用到产品设计中确实很有创意。仿生学就是这样一个将自然界的解决方案应用到人类问题上的学科。你觉得在培养创意思维的过程中，环境因素有多重要？比如工作环境、团队氛围等。',
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // 当消息更新时滚动到底部
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
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
          '环境因素确实非常重要！创意思维需要一个支持性的环境。开放的团队氛围可以让人更自由地表达想法，而不必担心被否定。你们团队是如何营造创新氛围的？',
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* 顶部导航 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
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
          <Text style={styles.podcastInfoTitle}>创意思维方法</Text>
          <Text style={styles.podcastInfoDesc}>突破思维局限，激发创造力的实用技巧</Text>
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
