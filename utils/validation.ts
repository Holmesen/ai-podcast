export const validateEmail = (email: string): string | null => {
  if (!email) return '请输入邮箱地址';

  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  if (!emailRegex.test(email)) return '请输入有效的邮箱地址';

  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) return '请输入密码';
  if (password.length < 6) return '密码长度至少为6个字符';

  return null;
};

export const validateUsername = (username: string): string | null => {
  if (!username) return '请输入用户名';
  if (username.length < 3) return '用户名长度至少为3个字符';
  if (username.length > 20) return '用户名长度不能超过20个字符';

  // 用户名只能包含字母、数字、下划线和连字符
  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  if (!usernameRegex.test(username)) return '用户名只能包含字母、数字、下划线和连字符';

  return null;
};

export const validateDisplayName = (displayName: string): string | null => {
  if (!displayName) return null; // 显示名称是可选的
  if (displayName.length > 50) return '显示名称长度不能超过50个字符';

  return null;
};

export const validateConfirmPassword = (password: string, confirmPassword: string): string | null => {
  if (!confirmPassword) return '请确认密码';
  if (password !== confirmPassword) return '两次输入的密码不一致';

  return null;
};
