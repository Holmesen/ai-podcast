import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from './theme';

export type MessageType = 'ai' | 'user';

interface ChatMessageProps {
  type: MessageType;
  content: string;
}

export function ChatMessage({ type, content }: ChatMessageProps) {
  const isAI = type === 'ai';

  return (
    <View style={[styles.message, isAI ? styles.messageAI : styles.messageUser]}>
      <View style={[styles.messageAvatar, isAI ? styles.aiAvatar : styles.userAvatar]}>
        <Ionicons name={isAI ? 'mic' : 'person'} size={20} color="white" />
      </View>
      <View style={[styles.messageContent, isAI ? styles.messageContentAI : styles.messageContentUser]}>
        <Text style={[styles.messageText, isAI ? styles.messageTextAI : styles.messageTextUser]}>{content}</Text>
      </View>
    </View>
  );
}

export function ThinkingIndicator() {
  return (
    <View style={styles.thinking}>
      <View style={styles.thinkingDot} />
      <View style={[styles.thinkingDot, styles.thinkingDotMiddle]} />
      <View style={styles.thinkingDot} />
    </View>
  );
}

const styles = StyleSheet.create({
  message: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  messageAI: {
    alignItems: 'flex-start',
  },
  messageUser: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
  },
  messageAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiAvatar: {
    backgroundColor: colors.primary,
    marginRight: 12,
  },
  userAvatar: {
    backgroundColor: colors.secondary,
    marginLeft: 12,
  },
  messageContent: {
    padding: 12,
    maxWidth: '80%',
    borderRadius: 24,
  },
  messageContentAI: {
    backgroundColor: colors.neutral100,
    borderBottomLeftRadius: 4,
  },
  messageContentUser: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  messageTextAI: {
    color: colors.neutral800,
  },
  messageTextUser: {
    color: 'white',
  },
  thinking: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    marginBottom: 24,
  },
  thinkingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.neutral400,
    opacity: 0.4,
  },
  thinkingDotMiddle: {
    opacity: 0.6,
  },
});
