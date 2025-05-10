import { FontAwesome } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AuthButton } from '../../components/auth/AuthButton';
import { AuthInput } from '../../components/auth/AuthInput';
import { SocialButton } from '../../components/auth/SocialButton';
import { useAuth } from '../../hooks/useAuth';
import {
  validateConfirmPassword,
  validateDisplayName,
  validateEmail,
  validatePassword,
  validateUsername,
} from '../../utils/validation';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [emailError, setEmailError] = useState<string | undefined>(undefined);
  const [usernameError, setUsernameError] = useState<string | undefined>(undefined);
  const [displayNameError, setDisplayNameError] = useState<string | undefined>(undefined);
  const [passwordError, setPasswordError] = useState<string | undefined>(undefined);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | undefined>(undefined);

  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { register } = useAuth();

  const handleRegister = async () => {
    // 验证表单
    const emailValidationError = validateEmail(email);
    const usernameValidationError = validateUsername(username);
    const displayNameValidationError = validateDisplayName(displayName);
    const passwordValidationError = validatePassword(password);
    const confirmPasswordValidationError = validateConfirmPassword(password, confirmPassword);

    setEmailError(emailValidationError || undefined);
    setUsernameError(usernameValidationError || undefined);
    setDisplayNameError(displayNameValidationError || undefined);
    setPasswordError(passwordValidationError || undefined);
    setConfirmPasswordError(confirmPasswordValidationError || undefined);

    if (
      emailValidationError ||
      usernameValidationError ||
      displayNameValidationError ||
      passwordValidationError ||
      confirmPasswordValidationError
    ) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await register({
        email,
        username,
        password,
        display_name: displayName || undefined,
      });

      if (result.success) {
        Alert.alert('注册成功', '账号已成功注册', [{ text: '确定', onPress: () => router.replace('/(tabs)') }]);
      } else {
        Alert.alert('注册失败', result.error || '注册时发生错误，请重试');
      }
    } catch (error) {
      console.error('注册错误:', error);
      Alert.alert('注册失败', '发生未知错误，请重试');
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

      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <FontAwesome name="microphone" size={40} color="#fff" />
        </View>
        <Text style={styles.title}>创建新账号</Text>
        <Text style={styles.subtitle}>加入 AI 播客采访，开始你的思想之旅</Text>
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
          label="用户名"
          value={username}
          onChangeText={(text) => {
            setUsername(text);
            setUsernameError(undefined);
          }}
          placeholder="用户名 (唯一标识)"
          error={usernameError}
        />

        <AuthInput
          label="昵称 (可选)"
          value={displayName}
          onChangeText={(text) => {
            setDisplayName(text);
            setDisplayNameError(undefined);
          }}
          placeholder="你希望被如何称呼"
          error={displayNameError}
        />

        <AuthInput
          label="密码"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setPasswordError(undefined);
          }}
          placeholder="至少6个字符"
          secureTextEntry
          error={passwordError}
        />

        <AuthInput
          label="确认密码"
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            setConfirmPasswordError(undefined);
          }}
          placeholder="再次输入密码"
          secureTextEntry
          error={confirmPasswordError}
        />

        <AuthButton
          title="注册"
          onPress={handleRegister}
          isLoading={isLoading}
          disabled={isLoading}
          style={styles.registerButton}
        />
      </View>

      <View style={styles.socialContainer}>
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>或使用以下方式注册</Text>
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
          已有账号？{' '}
          <Link href="/login" asChild>
            <Text style={styles.footerLink}>立即登录</Text>
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
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
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
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: 24,
  },
  registerButton: {
    marginTop: 16,
  },
  socialContainer: {
    marginBottom: 24,
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
    marginTop: 16,
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
