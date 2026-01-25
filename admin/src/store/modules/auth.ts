import { defineStore } from 'pinia';

interface AuthState {
  token: string | null;
  roles: string[];
  permissions: string[];
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: null,
    roles: [],
    permissions: [],
  }),
  getters: {
    isLoggedIn: (state) => Boolean(state.token),
  },
  actions: {
    setToken(token: string | null) {
      this.token = token;
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
      return required.some((permission) => this.permissions.includes(permission));
    },
    reset() {
      this.token = null;
      this.roles = [];
      this.permissions = [];
    },
  },
});
