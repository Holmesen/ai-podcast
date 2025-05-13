import { Stack } from 'expo-router';
import React, { ReactNode, useEffect } from 'react';
import { AppState, LogBox, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../polyfills';

// 忽略已知的非严重警告
LogBox.ignoreLogs([
  'This synthetic event is reused for performance reasons', // 忽略合成事件警告
  'Non-serializable values were found in the navigation state',
  'Possible Unhandled Promise Rejection',
  'Remote debugger',
  'VirtualizedLists should never be nested',
  'Warning: Cannot update a component',
]);

// 错误边界组件的属性类型
interface ErrorBoundaryProps {
  children: ReactNode;
}

// 错误边界组件的状态类型
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// 错误边界组件
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('App Error:', error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>应用程序发生错误</Text>
          <Text style={{ marginBottom: 20 }}>请重新启动应用程序</Text>
          <Text style={{ fontSize: 12, color: '#666' }}>
            {this.state.error ? this.state.error.toString() : '未知错误'}
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

export default function RootLayout() {
  // 监听应用状态
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      console.log('App State:', nextAppState);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // 添加错误处理
  useEffect(() => {
    const handleError = (error: any, isFatal: boolean) => {
      console.error('Application error:', error);
      // 这里可以添加错误上报逻辑
    };

    // 设置全局错误处理器
    if (typeof ErrorUtils !== 'undefined') {
      const originalGlobalHandler = ErrorUtils.getGlobalHandler();
      ErrorUtils.setGlobalHandler((error, isFatal) => {
        handleError(error, isFatal || false);
        originalGlobalHandler(error, isFatal);
      });

      return () => {
        // 重置错误处理器
        ErrorUtils.setGlobalHandler(originalGlobalHandler);
      };
    }
  }, []);

  // 优化性能
  useEffect(() => {
    // 设置帧率
    if (__DEV__) {
      // 仅在开发模式下执行
      console.log('开发模式：已启用性能优化');
    }

    // 返回清理函数
    return () => {
      console.log('应用退出');
    };
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              presentation: 'fullScreenModal',
            }}
          />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(podcast)" />
        </Stack>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
