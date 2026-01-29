import { defineStore } from 'pinia';
import { StorageKeys, getStorage, setStorage, removeStorage } from '@/utils/storage';
import type { AdminInfo } from '@/api/auth';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  admin: AdminInfo | null;
  roles: string[];
  permissions: string[];
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: getStorage<string>(StorageKeys.TOKEN) || null,
    refreshToken: getStorage<string>(StorageKeys.REFRESH_TOKEN) || null,
    admin: getStorage<AdminInfo>(StorageKeys.USER_INFO) || null,
    roles: [],
    permissions: [],
  }),
  getters: {
    isLoggedIn: (state) => Boolean(state.token),
    username: (state) => state.admin?.username || '',
    realName: (state) => state.admin?.realName || state.admin?.username || '',
  },
  actions: {
    /**
     * 设置登录信息
     */
    setLoginInfo(data: { accessToken: string; refreshToken: string; admin: AdminInfo }) {
      this.token = data.accessToken;
      this.refreshToken = data.refreshToken;
      this.admin = data.admin;
      this.roles = [data.admin.role];
      this.permissions = data.admin.permissions;

      // 持久化
      setStorage(StorageKeys.TOKEN, data.accessToken);
      setStorage(StorageKeys.REFRESH_TOKEN, data.refreshToken);
      setStorage(StorageKeys.USER_INFO, data.admin);
    },
    setToken(token: string | null) {
      this.token = token;
      if (token) {
        setStorage(StorageKeys.TOKEN, token);
      } else {
        removeStorage(StorageKeys.TOKEN);
      }
    },
    setRoles(roles: string[]) {
      this.roles = roles;
    },
    setPermissions(permissions: string[]) {
      this.permissions = permissions;
    },
    hasRole(required: string[] = []) {
      if (!required.length) return true;
      return required.some((role) => this.roles.includes(role));
    },
    hasPermission(required: string[] = []) {
      if (!required.length) return true;
      // 超级管理员拥有所有权限
      if (this.admin?.role === 'super_admin') return true;
      return required.some((permission) => this.permissions.includes(permission));
    },
    reset() {
      this.token = null;
      this.refreshToken = null;
      this.admin = null;
      this.roles = [];
      this.permissions = [];

      removeStorage(StorageKeys.TOKEN);
      removeStorage(StorageKeys.REFRESH_TOKEN);
      removeStorage(StorageKeys.USER_INFO);
    },
  },
});
