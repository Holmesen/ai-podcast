import React, { useState } from 'react';
import { Button, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AIChatDemo } from '../../components/AIChatDemo';
import { AIDirectDemo } from '../../components/AIDirectDemo';
import { AIReasoningDemo } from '../../components/AIReasoningDemo';

export default function Home() {
  const [demoType, setDemoType] = useState<'chat' | 'reasoning' | 'direct' | null>(null);

  const renderDemo = () => {
    switch (demoType) {
      case 'chat':
        return <AIChatDemo />;
      case 'reasoning':
        return <AIReasoningDemo />;
      case 'direct':
        return <AIDirectDemo />;
      default:
        return (
          <View style={styles.selectionContainer}>
            <Text style={styles.title}>DeepSeek AI 演示</Text>
            <Text style={styles.description}>
              本演示展示了如何在 React Native 应用中集成 DeepSeek AI 服务。 选择下面的一个演示模式。
            </Text>

            <View style={styles.buttonContainer}>
              <Button title="聊天演示" onPress={() => setDemoType('chat')} />

              <Button title="推理演示" onPress={() => setDemoType('reasoning')} />

              <Button title="直接调用演示" onPress={() => setDemoType('direct')} />
            </View>
          </View>
        );
    }
  };

  return (
    <ScrollView style={styles.container}>
      {demoType && <Button title="返回" onPress={() => setDemoType(null)} color="#666" />}

      {renderDemo()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  selectionContainer: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
    color: '#555',
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
});
