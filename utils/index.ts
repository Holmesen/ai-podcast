import Constants from 'expo-constants';

/**
 * 生成API路径的完整URL
 * @param relativePath 相对路径，如 '/api/chat'
 * @returns 完整的API URL
 */
export const generateAPIUrl = (relativePath: string) => {
  try {
    // 确保路径格式正确
    const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;

    // 开发环境处理
    if (__DEV__) {
      // 获取Expo服务器地址
      const origin = Constants.experienceUrl
        ? Constants.experienceUrl.replace('exp://', 'http://')
        : 'http://localhost:8081';

      const url = origin.concat(path);
      console.log(`[DEV] API URL: ${url}`);
      return url;
    }

    // 生产环境处理
    const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
      console.error('环境变量EXPO_PUBLIC_API_BASE_URL未定义，使用默认值');
      // 使用默认值，避免应用崩溃
      return `https://api.default.com${path}`;
    }

    // 标准化baseUrl，移除结尾斜杠
    const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

    const url = normalizedBaseUrl.concat(path);
    console.log(`[PROD] API URL: ${url}`);
    return url;
  } catch (error) {
    console.error('生成API URL时发生错误:', error);
    // 返回一个回退URL，避免应用崩溃
    return `http://localhost:8081${relativePath.startsWith('/') ? relativePath : `/${relativePath}`}`;
  }
};

// 导出提示词管理模块
export * from './prompts';
