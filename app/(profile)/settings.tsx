import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { usePreferences } from '../../hooks/usePreferences';

export default function Settings() {
  const { logout } = useAuth();
  const { theme, notifications, setTheme, setNotifications } = usePreferences();

  // 处理退出登录
  const handleLogout = async () => {
    Alert.alert('退出登录', '确定要退出当前账号吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '确定',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  // 处理主题切换
  const handleThemeChange = (themeMode: 'light' | 'dark' | 'system') => {
    setTheme({ mode: themeMode });
  };

  // 处理通知设置切换
  const handleToggleNotification = (key: 'enabled' | 'newPodcasts' | 'favorites' | 'comments', value: boolean) => {
    const updatedSettings = { ...notifications, [key]: value };
    setNotifications(updatedSettings);
  };

  // 返回上一页
  const handleGoBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>设置</Text>
          <View style={styles.placeholderButton} />
        </View>

        {/* 账户设置 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>账户设置</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/(profile)/profile-edit' as any)}>
              <View style={styles.settingContent}>
                <Ionicons name="person-outline" size={22} color="#6366f1" style={styles.settingIcon} />
                <Text style={styles.settingText}>编辑个人资料</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => router.push('/(profile)/change-password' as any)}
            >
              <View style={styles.settingContent}>
                <Ionicons name="lock-closed-outline" size={22} color="#6366f1" style={styles.settingIcon} />
                <Text style={styles.settingText}>修改密码</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => router.push('/(profile)/privacy-settings' as any)}
            >
              <View style={styles.settingContent}>
                <Ionicons name="shield-outline" size={22} color="#6366f1" style={styles.settingIcon} />
                <Text style={styles.settingText}>隐私设置</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 外观设置 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>外观</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={[styles.themeOption, theme.mode === 'light' && styles.themeOptionSelected]}
              onPress={() => handleThemeChange('light')}
            >
              <View style={styles.themeRadio}>
                {theme.mode === 'light' && <View style={styles.themeRadioSelected} />}
              </View>
              <Text style={styles.settingText}>浅色模式</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.themeOption, theme.mode === 'dark' && styles.themeOptionSelected]}
              onPress={() => handleThemeChange('dark')}
            >
              <View style={styles.themeRadio}>
                {theme.mode === 'dark' && <View style={styles.themeRadioSelected} />}
              </View>
              <Text style={styles.settingText}>深色模式</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.themeOption, theme.mode === 'system' && styles.themeOptionSelected]}
              onPress={() => handleThemeChange('system')}
            >
              <View style={styles.themeRadio}>
                {theme.mode === 'system' && <View style={styles.themeRadioSelected} />}
              </View>
              <Text style={styles.settingText}>跟随系统</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 通知设置 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>通知</Text>
          <View style={styles.card}>
            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <Ionicons name="notifications-outline" size={22} color="#6366f1" style={styles.settingIcon} />
                <Text style={styles.settingText}>推送通知</Text>
              </View>
              <Switch
                value={notifications.enabled}
                onValueChange={(value) => handleToggleNotification('enabled', value)}
                trackColor={{ false: '#d1d5db', true: '#c7d2fe' }}
                thumbColor={notifications.enabled ? '#6366f1' : '#f3f4f6'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <Ionicons name="mic-outline" size={22} color="#6366f1" style={styles.settingIcon} />
                <Text style={styles.settingText}>新播客通知</Text>
              </View>
              <Switch
                value={notifications.newPodcasts}
                onValueChange={(value) => handleToggleNotification('newPodcasts', value)}
                trackColor={{ false: '#d1d5db', true: '#c7d2fe' }}
                thumbColor={notifications.newPodcasts ? '#6366f1' : '#f3f4f6'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <Ionicons name="heart-outline" size={22} color="#6366f1" style={styles.settingIcon} />
                <Text style={styles.settingText}>收藏内容更新</Text>
              </View>
              <Switch
                value={notifications.favorites}
                onValueChange={(value) => handleToggleNotification('favorites', value)}
                trackColor={{ false: '#d1d5db', true: '#c7d2fe' }}
                thumbColor={notifications.favorites ? '#6366f1' : '#f3f4f6'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <Ionicons name="chatbubbles-outline" size={22} color="#6366f1" style={styles.settingIcon} />
                <Text style={styles.settingText}>评论通知</Text>
              </View>
              <Switch
                value={notifications.comments}
                onValueChange={(value) => handleToggleNotification('comments', value)}
                trackColor={{ false: '#d1d5db', true: '#c7d2fe' }}
                thumbColor={notifications.comments ? '#6366f1' : '#f3f4f6'}
              />
            </View>
          </View>
        </View>

        {/* 关于应用 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>关于</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/(profile)/about' as any)}>
              <View style={styles.settingContent}>
                <Ionicons name="information-circle-outline" size={22} color="#6366f1" style={styles.settingIcon} />
                <Text style={styles.settingText}>关于应用</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => router.push('/(profile)/privacy-policy' as any)}
            >
              <View style={styles.settingContent}>
                <Ionicons name="document-text-outline" size={22} color="#6366f1" style={styles.settingIcon} />
                <Text style={styles.settingText}>隐私政策</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => router.push('/(profile)/terms-of-service' as any)}
            >
              <View style={styles.settingContent}>
                <Ionicons name="reader-outline" size={22} color="#6366f1" style={styles.settingIcon} />
                <Text style={styles.settingText}>服务条款</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 退出登录 */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>退出登录</Text>
        </TouchableOpacity>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>AI播客 v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  placeholderButton: {
    width: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#4b5563',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 12,
  },
  settingText: {
    fontSize: 16,
    color: '#111827',
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  themeOptionSelected: {
    backgroundColor: '#f9fafb',
  },
  themeRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#6366f1',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeRadioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6366f1',
  },
  logoutButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  logoutButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  versionContainer: {
    alignItems: 'center',
  },
  versionText: {
    color: '#9ca3af',
    fontSize: 14,
  },
});
