import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface ThemePreference {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
}

export interface NotificationPreference {
  enabled: boolean;
  newPodcasts: boolean;
  favorites: boolean;
  comments: boolean;
}

export interface PreferencesState {
  theme: ThemePreference;
  notifications: NotificationPreference;
  audioQuality: 'low' | 'medium' | 'high';
  downloadOverCellular: boolean;

  // 更新主题
  setTheme: (theme: Partial<ThemePreference>) => void;
  // 更新通知设置
  setNotifications: (notifications: Partial<NotificationPreference>) => void;
  // 更新音频质量
  setAudioQuality: (quality: 'low' | 'medium' | 'high') => void;
  // 更新是否允许在蜂窝网络下下载
  setDownloadOverCellular: (allow: boolean) => void;
  // 重置所有偏好设置为默认值
  resetToDefaults: () => void;
}

// 默认偏好设置
const defaultPreferences = {
  theme: {
    mode: 'system' as const,
    primaryColor: '#6366f1',
  },
  notifications: {
    enabled: true,
    newPodcasts: true,
    favorites: true,
    comments: false,
  },
  audioQuality: 'medium' as const,
  downloadOverCellular: false,
};

// 创建带持久化的 Zustand store
export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      ...defaultPreferences,

      // 更新主题
      setTheme: (theme) =>
        set((state) => ({
          theme: { ...state.theme, ...theme },
        })),

      // 更新通知设置
      setNotifications: (notifications) =>
        set((state) => ({
          notifications: { ...state.notifications, ...notifications },
        })),

      // 更新音频质量
      setAudioQuality: (quality) => set({ audioQuality: quality }),

      // 更新是否允许在蜂窝网络下下载
      setDownloadOverCellular: (allow) => set({ downloadOverCellular: allow }),

      // 重置所有偏好设置为默认值
      resetToDefaults: () => set(defaultPreferences),
    }),
    {
      name: 'user-preferences',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
