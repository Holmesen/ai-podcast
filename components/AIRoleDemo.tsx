import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Button,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import useAIRole from '../hooks/useAIRole';
import { SystemRole } from '../utils/prompts';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
}

export function AIRoleDemo() {
  // 使用自定义的 Hook
  const [{ role, isLoading, error, availableTemplates }, { createRole, getResponse, updateRole }] = useAIRole();

  // 本地状态
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [userInput, setUserInput] = useState('');
  const [conversationTopic, setConversationTopic] = useState('创造力与创新');
  const [messages, setMessages] = useState<Message[]>([]);
  const [customInstructions, setCustomInstructions] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);

  // 初始化时选择第一个模板
  useEffect(() => {
    if (availableTemplates.length > 0 && !selectedTemplate) {
      setSelectedTemplate(availableTemplates[0].id);
    }
  }, [availableTemplates]);

  // 创建角色
  const handleCreateRole = async () => {
    try {
      const newRole = await createRole(selectedTemplate, {
        additionalInstructions: customInstructions,
      });

      // 添加主持人欢迎消息
      setTimeout(async () => {
        const welcomeMessage = await getResponse('', { topic: conversationTopic });
        addMessage('ai', welcomeMessage);
      }, 500);
    } catch (err) {
      console.error('创建角色失败:', err);
    }
  };

  // 发送消息
  const handleSendMessage = async () => {
    if (!userInput.trim() || !role) return;

    // 添加用户消息到聊天
    addMessage('user', userInput);
    const currentInput = userInput;
    setUserInput('');

    try {
      // 构建聊天历史
      const history = messages.map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      }));

      // 获取 AI 响应
      const response = await getResponse(currentInput, {
        topic: conversationTopic,
        conversationHistory: history,
      });

      // 添加 AI 响应到聊天
      addMessage('ai', response);
    } catch (err) {
      console.error('获取响应失败:', err);
    }
  };

  // 添加消息到聊天
  const addMessage = (role: 'user' | 'ai', content: string) => {
    setMessages((prev) => [...prev, { id: Date.now().toString(), role, content }]);
  };

  // 更新角色指令
  const handleUpdateInstructions = async () => {
    if (!role) return;

    try {
      await updateRole({
        additionalInstructions: customInstructions,
      });
    } catch (err) {
      console.error('更新角色失败:', err);
    }
  };

  // 渲染消息气泡
  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageBubble, item.role === 'user' ? styles.userBubble : styles.aiBubble]}>
      <Text style={styles.messageText}>{item.content}</Text>
    </View>
  );

  // 渲染模板选择项
  const renderTemplateItem = ({ item }: { item: SystemRole }) => (
    <TouchableOpacity
      style={[styles.templateItem, selectedTemplate === item.id && styles.selectedTemplate]}
      onPress={() => setSelectedTemplate(item.id)}
    >
      <Text style={styles.templateName}>{item.name}</Text>
      <Text style={styles.templateDescription}>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>AI 角色演示</Text>

      {/* 角色选择与创建 */}
      {!role ? (
        <View style={styles.setupSection}>
          <Text style={styles.sectionTitle}>选择角色模板</Text>

          <TouchableOpacity style={styles.dropdownToggle} onPress={() => setShowTemplates(!showTemplates)}>
            <Text style={styles.dropdownText}>
              {selectedTemplate
                ? availableTemplates.find((t) => t.id === selectedTemplate)?.name || '选择模板'
                : '选择模板'}
            </Text>
          </TouchableOpacity>

          {showTemplates && (
            <FlatList
              data={availableTemplates}
              renderItem={renderTemplateItem}
              keyExtractor={(item) => item.id}
              style={styles.templatesList}
            />
          )}

          <Text style={styles.label}>对话主题</Text>
          <TextInput
            style={styles.input}
            value={conversationTopic}
            onChangeText={setConversationTopic}
            placeholder="输入对话主题"
          />

          <Text style={styles.label}>自定义指令 (可选)</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={customInstructions}
            onChangeText={setCustomInstructions}
            placeholder="添加额外指令..."
            multiline
            numberOfLines={3}
          />

          <Button title="创建角色" onPress={handleCreateRole} disabled={!selectedTemplate || isLoading} />
        </View>
      ) : (
        // 对话界面
        <View style={styles.chatSection}>
          <View style={styles.roleInfoCard}>
            <Text style={styles.roleName}>{role.name}</Text>
            <Text style={styles.roleDescription}>{role.description}</Text>
            <Text style={styles.topicText}>主题: {conversationTopic}</Text>
          </View>

          {customInstructions && (
            <View style={styles.instructionsCard}>
              <Text style={styles.instructionsTitle}>自定义指令:</Text>
              <Text style={styles.instructionsText}>{customInstructions}</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                value={customInstructions}
                onChangeText={setCustomInstructions}
                placeholder="修改指令..."
                multiline
                numberOfLines={3}
              />
              <Button title="更新指令" onPress={handleUpdateInstructions} disabled={isLoading} />
            </View>
          )}

          {/* 消息列表 */}
          <View style={styles.messagesContainer}>
            <FlatList
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              style={styles.messagesList}
            />
          </View>

          {/* 输入区域 */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, styles.messageInput]}
              value={userInput}
              onChangeText={setUserInput}
              placeholder="输入消息..."
              multiline
            />
            <Button title="发送" onPress={handleSendMessage} disabled={!userInput.trim() || isLoading} />
          </View>

          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#0000ff" />
              <Text style={styles.loadingText}>AI 正在思考...</Text>
            </View>
          )}
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>错误: {error.message}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  setupSection: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  dropdownToggle: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  dropdownText: {
    fontSize: 16,
  },
  templatesList: {
    maxHeight: 200,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
  },
  templateItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedTemplate: {
    backgroundColor: '#e6f7ff',
  },
  templateName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  templateDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: 'white',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  chatSection: {
    flex: 1,
  },
  roleInfoCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  roleName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  roleDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  topicText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
    color: '#0066cc',
  },
  instructionsCard: {
    backgroundColor: '#fffde7',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    marginBottom: 16,
  },
  messagesContainer: {
    flex: 1,
    marginBottom: 16,
  },
  messagesList: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
    elevation: 2,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
    maxWidth: '80%',
    elevation: 1,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#dcf8c6',
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#eeeeee',
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageInput: {
    flex: 1,
    marginRight: 8,
    marginBottom: 0,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  errorText: {
    color: '#d32f2f',
  },
});

export default AIRoleDemo;
