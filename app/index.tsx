import { Redirect, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useAuth } from '../hooks/useAuth';

/**
 * 应用入口点 - 根据登录状态自动跳转到相应页面
 */
export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // 在身份验证状态加载完成后标记组件为就绪
    if (!isLoading) {
      setIsReady(true);
    }
  }, [isLoading]);

  // 等待身份验证状态加载完毕
  if (!isReady) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  // 根据登录状态重定向到相应页面
  if (isAuthenticated) {
    // 已登录，重定向到标签页首页
    return <Redirect href="/(tabs)" />;
  } else {
    // 未登录，重定向到登录页
    return <Redirect href="/(auth)/login" />;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
});
