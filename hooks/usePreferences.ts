import { usePreferencesStore } from '../store/usePreferencesStore';

/**
 * 用户偏好钩子 - 提供应用偏好设置的状态和方法
 */
export function usePreferences() {
  const {
    theme,
    notifications,
    audioQuality,
    downloadOverCellular,
    setTheme,
    setNotifications,
    setAudioQuality,
    setDownloadOverCellular,
    resetToDefaults,
  } = usePreferencesStore();

  // 当前是否为深色模式
  const isDarkMode = () => {
    if (theme.mode === 'system') {
      // 这里应该根据系统设置判断
      // 简化起见，这里假设系统是亮色模式
      return false;
    }
    return theme.mode === 'dark';
  };

  return {
    theme,
    notifications,
    audioQuality,
    downloadOverCellular,
    isDarkMode: isDarkMode(),
    setTheme,
    setNotifications,
    setAudioQuality,
    setDownloadOverCellular,
    resetToDefaults,
  };
}

export default usePreferences;
