import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/modules/auth';
import { StorageKeys, removeStorage } from '@/utils/storage';

/**
 * 权限相关组合函数
 */
export const useAuth = () => {
  const router = useRouter();
  const authStore = useAuthStore();

  /** 是否已登录 */
  const isLoggedIn = computed(() => authStore.isLoggedIn);

  /** 当前用户角色 */
  const roles = computed(() => authStore.roles);

  /** 当前用户权限 */
  const permissions = computed(() => authStore.permissions);

  /** Token */
  const token = computed(() => authStore.token);

  /**
   * 检查是否有指定角色
   * @param requiredRoles 需要的角色列表（任一即可）
   */
  const hasRole = (requiredRoles: string | string[]): boolean => {
    const roleList = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    if (roleList.length === 0) return true;
    return roleList.some((role) => authStore.roles.includes(role));
  };

  /**
   * 检查是否有指定权限
   * @param requiredPermissions 需要的权限列表（任一即可）
   */
  const hasPermission = (requiredPermissions: string | string[]): boolean => {
    const permList = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];
    if (permList.length === 0) return true;
    // 超级管理员拥有所有权限
    if (authStore.roles.includes('super_admin')) return true;
    return permList.some((perm) => authStore.permissions.includes(perm));
  };

  /**
   * 检查是否有所有指定权限
   */
  const hasAllPermissions = (requiredPermissions: string[]): boolean => {
    if (requiredPermissions.length === 0) return true;
    if (authStore.roles.includes('super_admin')) return true;
    return requiredPermissions.every((perm) => authStore.permissions.includes(perm));
  };

  /**
   * 登出
   */
  const logout = async () => {
    authStore.reset();
    removeStorage(StorageKeys.TOKEN);
    removeStorage(StorageKeys.REFRESH_TOKEN);
    removeStorage(StorageKeys.USER_INFO);
    await router.replace({ name: 'Login' });
  };

  /**
   * 跳转到登录页
   */
  const toLogin = (redirect?: string) => {
    const query = redirect ? { redirect } : undefined;
    router.replace({ name: 'Login', query });
  };

  return {
    // 状态
    isLoggedIn,
    roles,
    permissions,
    token,
    // 方法
    hasRole,
    hasPermission,
    hasAllPermissions,
    logout,
    toLogin,
  };
};

/**
 * 权限指令辅助
 */
export const usePermissionDirective = () => {
  const { hasPermission } = useAuth();

  /**
   * 检查元素是否应该显示
   */
  const checkPermission = (permission: string | string[]): boolean => {
    return hasPermission(permission);
  };

  return { checkPermission };
};
