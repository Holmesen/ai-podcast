import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import MarkdownRenderer from './MarkdownRenderer';
import { colors } from './theme';

export type MessageType = 'ai' | 'user';

interface ChatMessageProps {
  type: MessageType;
  content: string;
  done: boolean;
}

export function ChatMessage({ type, content, done = false }: ChatMessageProps) {
  const isAI = type === 'ai';

  // 添加平滑打字机效果
  const cursorOpacity = useRef(new Animated.Value(0)).current;

  // 设置光标闪烁动画
  useEffect(() => {
    if (!done && isAI) {
      // 创建闪烁动画
      Animated.loop(
        Animated.sequence([
          Animated.timing(cursorOpacity, {
            toValue: 1,
            duration: 500,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(cursorOpacity, {
            toValue: 0,
            duration: 500,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // 停止动画，隐藏光标
      Animated.timing(cursorOpacity, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }).start();
    }

    return () => {
      cursorOpacity.stopAnimation();
    };
  }, [cursorOpacity, done, isAI]);

  return (
    <View style={[styles.message, isAI ? styles.messageAI : styles.messageUser]}>
      <View style={[styles.messageAvatar, isAI ? styles.aiAvatar : styles.userAvatar]}>
        <Ionicons name={isAI ? 'mic' : 'person'} size={20} color="white" />
      </View>
      <View style={[styles.messageContent, isAI ? styles.messageContentAI : styles.messageContentUser]}>
        {isAI ? (
          <View style={styles.aiMessageContainer}>
            {done ? (
              <MarkdownRenderer content={content} />
            ) : (
              <View style={styles.typingContainer}>
                <Text style={styles.messageTextAI}>{content}</Text>
                <Animated.View style={[styles.cursor, { opacity: cursorOpacity }]} />
              </View>
            )}
          </View>
        ) : (
          <Text style={styles.messageTextUser}>{content}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  message: {
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
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  aiAvatar: {
    backgroundColor: colors.primary,
    marginRight: 8,
  },
  userAvatar: {
    backgroundColor: colors.secondary,
    marginLeft: 8,
  },
  messageContent: {
    padding: 12,
    borderRadius: 12,
    maxWidth: '80%',
  },
  messageContentAI: {
    backgroundColor: colors.neutral100,
  },
  messageContentUser: {
    backgroundColor: colors.primary,
  },
  messageTextAI: {
    color: colors.neutral800,
    fontSize: 16,
    lineHeight: 22,
  },
  messageTextUser: {
    color: 'white',
    fontSize: 16,
    lineHeight: 22,
  },
  aiMessageContainer: {
    position: 'relative',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cursor: {
    width: 2,
    height: 18,
    backgroundColor: colors.primary,
    marginLeft: 2,
  },
});
