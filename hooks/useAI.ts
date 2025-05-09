import { useState } from 'react';
import { AIService } from '../services/ai-service';

interface AIResponse {
  reasoning: string;
  text: string;
  providerMetadata?: {
    deepseek?: {
      promptCacheHitTokens?: number;
      promptCacheMissTokens?: number;
    };
  };
}

interface UseAIResult {
  isLoading: boolean;
  error: Error | null;
  generateText: (prompt: string) => Promise<AIResponse>;
  generateTextWithReasoning: (prompt: string) => Promise<AIResponse>;
  generatePodcastSummary: (content: string) => Promise<string>;
  generatePodcastTopics: (context: string) => Promise<string[]>;
}

export function useAI(): UseAIResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const aiService = AIService.getInstance();

  const handleError = (error: unknown) => {
    const errorMessage = error instanceof Error ? error.message : '发生未知错误';
    setError(new Error(errorMessage));
    throw error;
  };

  const generateText = async (prompt: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await aiService.generateText(prompt);
      return result;
    } catch (error) {
      return handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateTextWithReasoning = async (prompt: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await aiService.generateTextWithReasoning(prompt);
      return result;
    } catch (error) {
      return handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const generatePodcastSummary = async (content: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const summary = await aiService.generatePodcastSummary(content);
      return summary;
    } catch (error) {
      return handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const generatePodcastTopics = async (context: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const topics = await aiService.generatePodcastTopics(context);
      return topics;
    } catch (error) {
      return handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    generateText,
    generateTextWithReasoning,
    generatePodcastSummary,
    generatePodcastTopics,
  };
}
