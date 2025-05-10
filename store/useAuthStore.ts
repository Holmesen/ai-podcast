import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { AuthService, LoginUserParams, RegisterUserParams, User } from '../services/supabase';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // 操作函数
  login: (params: LoginUserParams) => Promise<{ success: boolean; error?: string }>;
  register: (params: RegisterUserParams) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  // 加载用户数据
  loadUser: async () => {
    try {
      const user = await AuthService.getCurrentUser();
      set({ user, isAuthenticated: !!user, isLoading: false });
    } catch (error) {
      console.error('加载用户失败', error);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  // 登录方法
  login: async ({ email, password }: LoginUserParams) => {
    try {
      const { user, error } = await AuthService.loginUser({ email, password });

      if (error) {
        return { success: false, error: error.message };
      }

      if (user) {
        // 存储用户ID到 SecureStore 中
        await SecureStore.setItemAsync('userId', user.id);
        set({ user, isAuthenticated: true });
        return { success: true };
      } else {
        return { success: false, error: '登录失败，请重试' };
      }
    } catch (error) {
      console.error('登录处理错误', error);
      return { success: false, error: '登录过程中出现错误' };
    }
  },

  // 注册方法
  register: async ({ email, password, username, display_name }: RegisterUserParams) => {
    try {
      const { user, error } = await AuthService.registerUser({
        email,
        password,
        username,
        display_name,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (user) {
        // 注册成功后自动登录
        await SecureStore.setItemAsync('userId', user.id);
        set({ user, isAuthenticated: true });
        return { success: true };
      } else {
        return { success: false, error: '注册失败，请重试' };
      }
    } catch (error) {
      console.error('注册处理错误', error);
      return { success: false, error: '注册过程中出现错误' };
    }
  },

  // 登出方法
  logout: async () => {
    await AuthService.logout();
    set({ user: null, isAuthenticated: false });
  },
}));
