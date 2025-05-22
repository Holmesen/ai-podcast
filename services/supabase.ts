import * as storageStore from '@/utils/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import * as ExpoCrypto from 'expo-crypto';
import { Platform } from 'react-native';
import 'react-native-url-polyfill/auto';

// SecureStore adapter for Supabase
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return storageStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    storageStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    storageStore.deleteItemAsync(key);
  },
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('缺少 Supabase 环境变量。请确保设置了 EXPO_PUBLIC_SUPABASE_URL 和 EXPO_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// 自定义用户相关操作，不使用 Supabase Auth
export interface RegisterUserParams {
  email: string;
  password: string;
  username: string;
  display_name?: string;
}

export interface LoginUserParams {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export const AuthService = {
  /**
   * 注册新用户
   */
  async registerUser({
    email,
    password,
    username,
    display_name,
  }: RegisterUserParams): Promise<{ user: User | null; error: Error | null }> {
    try {
      // 首先检查邮箱或用户名是否已存在
      const { data: existingUsers, error: checkError } = await supabase
        .from('podcast_user')
        .select('id')
        .or(`email.eq.${email},username.eq.${username}`)
        .limit(1);

      if (checkError) {
        throw checkError;
      }

      if (existingUsers && existingUsers.length > 0) {
        throw new Error('邮箱或用户名已被使用');
      }

      // 创建密码哈希
      const passwordHash = await hashPassword(password);

      // 插入新用户记录
      const { data, error } = await supabase
        .from('podcast_user')
        .insert([
          {
            email,
            password_hash: passwordHash,
            username,
            display_name: display_name || username,
            is_active: true,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      return { user: data as User, error: null };
    } catch (error) {
      console.error('注册用户错误:', error);
      return { user: null, error: error as Error };
    }
  },

  /**
   * 用户登录
   */
  async loginUser({ email, password }: LoginUserParams): Promise<{ user: User | null; error: Error | null }> {
    try {
      // 获取用户记录
      const { data: user, error } = await supabase.from('podcast_user').select('*').eq('email', email).single();

      if (error) throw error;
      if (!user) throw new Error('未找到用户');

      // 验证密码
      const isValidPassword = await verifyPassword(password, user.password_hash);
      if (!isValidPassword) {
        throw new Error('邮箱或密码不正确');
      }

      // 更新最后登录时间
      await supabase.from('podcast_user').update({ last_login_at: new Date().toISOString() }).eq('id', user.id);

      return { user: user as User, error: null };
    } catch (error) {
      console.error('登录错误:', error);
      return { user: null, error: error as Error };
    }
  },

  /**
   * 获取当前登录用户信息
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      // const userId = await storageStore.getItemAsync('userId');
      let userId = null;
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        userId = await storageStore.getItemAsync('userId');
      } else {
        userId = await AsyncStorage.getItem('userId');
      }
      if (!userId) return null;

      const { data, error } = await supabase.from('podcast_user').select('*').eq('id', userId).single();

      if (error || !data) return null;
      return data as User;
    } catch (error) {
      console.error('获取当前用户错误:', error);
      return null;
    }
  },

  /**
   * 用户登出
   */
  async logout(): Promise<void> {
    await storageStore.deleteItemAsync('userId');
  },
};

// 辅助函数：密码哈希
async function hashPassword(password: string): Promise<string> {
  // 生成盐值（使用 expo-crypto 的随机字节）
  const saltBytes = await ExpoCrypto.getRandomBytesAsync(16);
  const saltArray = Array.from(saltBytes);
  const saltString = saltArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  // 使用 SHA-256 对密码加盐哈希
  const hashHex = await ExpoCrypto.digestStringAsync(ExpoCrypto.CryptoDigestAlgorithm.SHA256, password + saltString);

  // 返回格式: "盐值:哈希值"
  return `${saltString}:${hashHex}`;
}

// 辅助函数：验证密码
async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    const [salt, hash] = storedHash.split(':');

    // 使用相同的盐值和方法重新计算哈希
    const hashHex = await ExpoCrypto.digestStringAsync(ExpoCrypto.CryptoDigestAlgorithm.SHA256, password + salt);

    // 比较计算的哈希和存储的哈希
    return hashHex === hash;
  } catch (error) {
    console.error('密码验证错误:', error);
    return false;
  }
}
