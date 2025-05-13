/**
 * 使用 AI 角色的 React Hook
 */

import { useCallback, useEffect, useState } from 'react';
import { AIRole, AIRoleContext, AIRoleService } from '../services/ai-role-service';
import { SystemRole } from '../utils/prompts';

interface UseAIRoleState {
  role: AIRole | null;
  isLoading: boolean;
  error: Error | null;
  availableTemplates: SystemRole[];
}

interface UseAIRoleActions {
  createRole: (
    templateId: string,
    customization?: {
      name?: string;
      description?: string;
      traits?: Record<string, any>;
      additionalInstructions?: string;
    }
  ) => Promise<AIRole>;

  updateRole: (updates: {
    name?: string;
    description?: string;
    traits?: Record<string, any>;
    additionalInstructions?: string;
  }) => Promise<AIRole | null>;

  removeRole: () => void;

  getResponse: (userInput: string, context?: AIRoleContext) => Promise<string>;

  setRole: (role: AIRole | null) => void;
}

export function useAIRole(
  initialTemplateId?: string,
  initialCustomization?: {
    name?: string;
    description?: string;
    traits?: Record<string, any>;
    additionalInstructions?: string;
  }
): [UseAIRoleState, UseAIRoleActions] {
  // 获取服务实例
  const roleService = AIRoleService.getInstance();

  // 状态
  const [state, setState] = useState<UseAIRoleState>({
    role: null,
    isLoading: false,
    error: null,
    availableTemplates: roleService.getAvailableRoleTemplates(),
  });

  // 初始化
  useEffect(() => {
    if (initialTemplateId) {
      createRole(initialTemplateId, initialCustomization).catch((error) => {
        setState((prevState) => ({
          ...prevState,
          error: error as Error,
        }));
      });
    }
  }, []);

  // 创建角色
  const createRole = useCallback(
    async (
      templateId: string,
      customization?: {
        name?: string;
        description?: string;
        traits?: Record<string, any>;
        additionalInstructions?: string;
      }
    ): Promise<AIRole> => {
      setState((prevState) => ({
        ...prevState,
        isLoading: true,
        error: null,
      }));

      try {
        const newRole = roleService.createRole(templateId, customization);

        setState((prevState) => ({
          ...prevState,
          role: newRole,
          isLoading: false,
        }));

        return newRole;
      } catch (error) {
        setState((prevState) => ({
          ...prevState,
          isLoading: false,
          error: error as Error,
        }));

        throw error;
      }
    },
    [roleService]
  );

  // 更新角色
  const updateRole = useCallback(
    async (updates: {
      name?: string;
      description?: string;
      traits?: Record<string, any>;
      additionalInstructions?: string;
    }): Promise<AIRole | null> => {
      if (!state.role) {
        setState((prevState) => ({
          ...prevState,
          error: new Error('没有活跃的角色可以更新'),
        }));
        return null;
      }

      setState((prevState) => ({
        ...prevState,
        isLoading: true,
        error: null,
      }));

      try {
        const updatedRole = roleService.updateRole(state.role.id, updates);

        setState((prevState) => ({
          ...prevState,
          role: updatedRole,
          isLoading: false,
        }));

        return updatedRole;
      } catch (error) {
        setState((prevState) => ({
          ...prevState,
          isLoading: false,
          error: error as Error,
        }));

        return null;
      }
    },
    [state.role, roleService]
  );

  // 移除角色
  const removeRole = useCallback(() => {
    if (state.role) {
      roleService.removeRole(state.role.id);
      setState((prevState) => ({
        ...prevState,
        role: null,
      }));
    }
  }, [state.role, roleService]);

  // 获取角色响应
  const getResponse = useCallback(
    async (userInput: string, context?: AIRoleContext): Promise<string> => {
      if (!state.role) {
        throw new Error('没有活跃的角色可以响应');
      }

      setState((prevState) => ({
        ...prevState,
        isLoading: true,
        error: null,
      }));

      try {
        const response = await state.role.getResponse(userInput, context);

        setState((prevState) => ({
          ...prevState,
          isLoading: false,
        }));

        return response;
      } catch (error) {
        setState((prevState) => ({
          ...prevState,
          isLoading: false,
          error: error as Error,
        }));

        throw error;
      }
    },
    [state.role]
  );

  // 设置角色
  const setRole = useCallback((role: AIRole | null) => {
    setState((prevState) => ({
      ...prevState,
      role,
    }));
  }, []);

  // 组合返回值
  const actions: UseAIRoleActions = {
    createRole,
    updateRole,
    removeRole,
    getResponse,
    setRole,
  };

  return [state, actions];
}

export default useAIRole;
