import React, { useState } from 'react';
import { Button, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAI } from '../hooks/useAI';

export function AIDirectDemo() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<{
    reasoning: string;
    text: string;
    providerMetadata?: {
      deepseek?: {
        promptCacheHitTokens?: number;
        promptCacheMissTokens?: number;
      };
    };
  } | null>(null);

  const { isLoading, error, generateText, generateTextWithReasoning } = useAI();

  const handleGenerate = async (useReasoning: boolean = false) => {
    try {
      const response = useReasoning ? await generateTextWithReasoning(prompt) : await generateText(prompt);
      setResult(response);
    } catch (error) {
      console.error('生成文本时出错:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>AI 文本生成演示</Text>

      <TextInput
        style={styles.input}
        value={prompt}
        onChangeText={setPrompt}
        placeholder="输入提示词..."
        multiline
        numberOfLines={4}
      />

      <View style={styles.buttonContainer}>
        <Button
          title={isLoading ? '生成中...' : '生成文本'}
          onPress={() => handleGenerate(false)}
          disabled={isLoading || !prompt.trim()}
        />

        <View style={styles.buttonSpacer} />

        <Button
          title={isLoading ? '生成中...' : '带推理生成'}
          onPress={() => handleGenerate(true)}
          disabled={isLoading || !prompt.trim()}
        />
      </View>

      {error && <Text style={styles.error}>错误: {error.message}</Text>}

      {result && (
        <View style={styles.resultContainer}>
          {result.reasoning && (
            <>
              <Text style={styles.resultTitle}>推理过程:</Text>
              <Text style={styles.resultText}>{result.reasoning}</Text>
            </>
          )}

          <Text style={styles.resultTitle}>生成文本:</Text>
          <Text style={styles.resultText}>{result.text}</Text>

          {result.providerMetadata?.deepseek && (
            <View style={styles.metadataContainer}>
              <Text style={styles.resultTitle}>元数据:</Text>
              <Text style={styles.metadataText}>
                缓存命中令牌: {result.providerMetadata.deepseek.promptCacheHitTokens || 0}
              </Text>
              <Text style={styles.metadataText}>
                缓存未命中令牌: {result.providerMetadata.deepseek.promptCacheMissTokens || 0}
              </Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    minHeight: 100,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  buttonSpacer: {
    width: 16,
  },
  error: {
    color: 'red',
    marginTop: 16,
  },
  resultContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  resultText: {
    fontSize: 16,
    marginBottom: 16,
    lineHeight: 24,
  },
  metadataContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#e8e8e8',
    borderRadius: 6,
  },
  metadataText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
});
