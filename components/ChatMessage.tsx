import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import MarkdownRenderer from './MarkdownRenderer';
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
        {isAI ? <MarkdownRenderer content={content} /> : <Text style={styles.messageTextUser}>{content}</Text>}
      </View>
    </View>
  );
}

export function ThinkingIndicator() {
  // 创建三个动画值，用于三个点的动画
  const dot1Animation = useRef(new Animated.Value(0)).current;
  const dot2Animation = useRef(new Animated.Value(0)).current;
  const dot3Animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 创建顺序动画，让三个点依次上下跳动
    const createDotAnimation = (animatedValue: Animated.Value, delay: number) => {
      return Animated.sequence([
        // 添加延迟，创建依次跳动的效果
        Animated.delay(delay),
        // 使用弹性缓动的循环动画
        Animated.loop(
          Animated.sequence([
            // 放大且上移
            Animated.timing(animatedValue, {
              toValue: 1,
              duration: 400,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            // 恢复原状
            Animated.timing(animatedValue, {
              toValue: 0,
              duration: 400,
              easing: Easing.in(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        ),
      ]);
    };

    // 启动三个点的动画，依次延迟，形成波浪效果
    Animated.parallel([
      createDotAnimation(dot1Animation, 0),
      createDotAnimation(dot2Animation, 150),
      createDotAnimation(dot3Animation, 300),
    ]).start();

    // 清理函数，停止动画
    return () => {
      dot1Animation.stopAnimation();
      dot2Animation.stopAnimation();
      dot3Animation.stopAnimation();
    };
  }, [dot1Animation, dot2Animation, dot3Animation]);

  // 创建动画样式
  const animatedDotStyle = (animation: Animated.Value) => {
    return {
      transform: [
        {
          translateY: animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -8], // 上移8个单位
          }),
        },
        {
          scale: animation.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.3], // 放大到1.3倍
          }),
        },
      ],
      opacity: animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0.4, 0.9], // 透明度从0.4变为0.9
      }),
    };
  };

  return (
    <View style={styles.thinking}>
      <Animated.View style={[styles.thinkingDot, animatedDotStyle(dot1Animation)]} />
      <Animated.View style={[styles.thinkingDot, animatedDotStyle(dot2Animation)]} />
      <Animated.View style={[styles.thinkingDot, animatedDotStyle(dot3Animation)]} />
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
    borderTopLeftRadius: 4,
  },
  messageContentUser: {
    backgroundColor: colors.primary,
    borderTopRightRadius: 4,
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
    alignItems: 'center',
    gap: 8,
    padding: 16,
    paddingLeft: 20,
    marginBottom: 24,
  },
  thinkingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    opacity: 0.4,
  },
  thinkingDotMiddle: {
    opacity: 0.6,
  },
});
