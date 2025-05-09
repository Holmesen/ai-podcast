import { useChat } from '@ai-sdk/react';
import { fetch as expoFetch } from 'expo/fetch';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { generateAPIUrl } from '../utils';

export function AIChatDemo() {
  const { messages, error, handleInputChange, input, handleSubmit } = useChat({
    fetch: expoFetch as unknown as typeof globalThis.fetch,
    api: generateAPIUrl('/api/chat'),
    onError: (error) => console.error(error, '错误'),
  });

  if (error) return <Text style={styles.error}>{error.message}</Text>;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <Text style={styles.title}>AI 聊天演示</Text>

        <ScrollView style={styles.messagesContainer}>
          {messages.map((m) => (
            <View key={m.id} style={styles.messageWrapper}>
              <View>
                <Text style={styles.roleName}>{m.role === 'user' ? '用户' : 'AI'}</Text>
                <Text style={styles.messageContent}>{m.content}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="输入消息..."
            value={input}
            onChange={(e) =>
              handleInputChange({
                ...e,
                target: {
                  ...e.target,
                  value: e.nativeEvent.text,
                },
              } as unknown as React.ChangeEvent<HTMLInputElement>)
            }
            onSubmitEditing={(e) => {
              handleSubmit(e);
              e.preventDefault();
            }}
            autoFocus={true}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
  },
  innerContainer: {
    height: '95%',
    display: 'flex',
    flexDirection: 'column',
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 16,
    textAlign: 'center',
  },
  messagesContainer: {
    flex: 1,
  },
  messageWrapper: {
    marginVertical: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  roleName: {
    fontWeight: '700',
    marginBottom: 4,
    fontSize: 16,
  },
  messageContent: {
    fontSize: 16,
    lineHeight: 24,
  },
  inputContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  error: {
    color: 'red',
    padding: 16,
    fontSize: 16,
  },
});
