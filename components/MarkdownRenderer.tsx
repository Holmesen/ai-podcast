import React from 'react';
import { StyleSheet, useColorScheme } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { colors } from './theme';

interface MarkdownRendererProps {
  content: string;
  style?: any;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, style }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // 基础样式定义
  const baseStyles = StyleSheet.create({
    body: {
      color: isDark ? '#e5e7eb' : '#1f2937',
      fontSize: 16,
      lineHeight: 24,
    },
    heading1: {
      color: isDark ? '#f9fafb' : '#111827',
      fontSize: 24,
      fontWeight: 'bold',
      marginTop: 16,
      marginBottom: 8,
    },
    heading2: {
      color: isDark ? '#f9fafb' : '#111827',
      fontSize: 20,
      fontWeight: 'bold',
      marginTop: 16,
      marginBottom: 8,
    },
    heading3: {
      color: isDark ? '#f9fafb' : '#111827',
      fontSize: 18,
      fontWeight: 'bold',
      marginTop: 12,
      marginBottom: 6,
    },
    paragraph: {
      marginBottom: 12,
      marginTop: 4,
    },
    link: {
      color: colors.primary,
      textDecorationLine: 'underline',
    },
    blockquote: {
      borderLeftWidth: 4,
      borderLeftColor: isDark ? '#6b7280' : '#d1d5db',
      paddingLeft: 12,
      marginLeft: 8,
      marginVertical: 8,
      fontStyle: 'italic',
    },
    code_inline: {
      backgroundColor: isDark ? '#374151' : '#f3f4f6',
      color: isDark ? '#e5e7eb' : '#1f2937',
      fontFamily: 'monospace',
      paddingHorizontal: 4,
      borderRadius: 4,
    },
    code_block: {
      backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
      padding: 12,
      borderRadius: 6,
      marginVertical: 8,
      fontFamily: 'monospace',
    },
    bullet_list: {
      marginVertical: 8,
    },
    ordered_list: {
      marginVertical: 8,
    },
    list_item: {
      flexDirection: 'row',
      marginVertical: 4,
    },
    bullet_list_icon: {
      marginTop: 6,
      marginRight: 8,
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: isDark ? '#9ca3af' : '#6b7280',
    },
    ordered_list_icon: {
      marginTop: 2,
      marginRight: 8,
      fontSize: 14,
      color: isDark ? '#9ca3af' : '#6b7280',
    },
    hr: {
      backgroundColor: isDark ? '#374151' : '#e5e7eb',
      height: 1,
      marginVertical: 16,
    },
  });

  // 自定义链接处理函数
  const handleLinkPress = (url: string) => {
    // 可以根据需要添加自定义逻辑，如使用Linking打开URL或导航到应用内页面
    console.log('Link pressed:', url);
    return true; // 返回true使用默认行为，即使用Linking.openURL打开链接
  };

  return (
    <Markdown style={{ ...baseStyles, ...style }} onLinkPress={handleLinkPress}>
      {content}
    </Markdown>
  );
};

export default MarkdownRenderer;
