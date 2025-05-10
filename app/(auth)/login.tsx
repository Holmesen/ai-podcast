import { FontAwesome } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AuthButton } from '../../components/auth/AuthButton';
import { AuthInput } from '../../components/auth/AuthInput';
import { SocialButton } from '../../components/auth/SocialButton';
import { useAuth } from '../../hooks/useAuth';
import { validateEmail, validatePassword } from '../../utils/validation';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>(undefined);
  const [passwordError, setPasswordError] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async () => {
    // 验证表单
    const emailValidationError = validateEmail(email);
    const passwordValidationError = validatePassword(password);

    setEmailError(emailValidationError || undefined);
    setPasswordError(passwordValidationError || undefined);

    if (emailValidationError || passwordValidationError) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await login({ email, password });

      if (result.success) {
        router.replace('/(tabs)');
      } else {
        Alert.alert('登录失败', result.error || '登录时发生错误，请重试');
      }
    } catch (error) {
      console.error('登录错误:', error);
      Alert.alert('登录失败', '发生未知错误，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    Alert.alert('社交登录', `${provider} 登录功能开发中...`);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <StatusBar style="dark" />

      <View style={styles.loginHeader}>
        <View style={styles.logoContainer}>
          <FontAwesome name="microphone" size={40} color="#fff" />
        </View>
        <Text style={styles.title}>欢迎回来</Text>
        <Text style={styles.subtitle}>登录你的 AI 播客采访账号</Text>
      </View>

      <View style={styles.formContainer}>
        <AuthInput
          label="邮箱"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setEmailError(undefined);
          }}
          placeholder="your@email.com"
          keyboardType="email-address"
          error={emailError}
        />

        <AuthInput
          label="密码"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setPasswordError(undefined);
          }}
          placeholder="输入密码"
          secureTextEntry
          error={passwordError}
        />

        <AuthButton
          title="登录"
          onPress={handleLogin}
          isLoading={isLoading}
          disabled={isLoading}
          style={styles.loginButton}
        />

        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>忘记密码？</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.socialContainer}>
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>或使用以下方式登录</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.socialButtons}>
          <SocialButton provider="wechat" onPress={() => handleSocialLogin('微信')} />
          <SocialButton provider="apple" onPress={() => handleSocialLogin('Apple')} />
          <SocialButton provider="google" onPress={() => handleSocialLogin('Google')} />
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          还没有账号？{' '}
          <Link href="/register" asChild>
            <Text style={styles.footerLink}>立即注册</Text>
          </Link>
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  contentContainer: {
    padding: 24,
    paddingTop: 40,
    minHeight: '100%',
  },
  loginHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  formContainer: {
    marginBottom: 32,
  },
  loginButton: {
    marginTop: 16,
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: 16,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#6366f1',
  },
  socialContainer: {
    marginBottom: 32,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    paddingHorizontal: 16,
    color: '#9ca3af',
    fontSize: 14,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
  },
  footerLink: {
    color: '#6366f1',
    fontWeight: '500',
  },
});
