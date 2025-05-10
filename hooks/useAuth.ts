import { useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';

/**
 * 认证钩子 - 提供身份验证状态和方法
 */
export function useAuth() {
  const { user, isLoading, isAuthenticated, login, register, logout, loadUser } = useAuthStore();

  // 组件挂载时自动加载用户数据
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
  };
}

export default useAuth;
