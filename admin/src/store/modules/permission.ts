import { defineStore } from 'pinia';
import type { RouteRecordRaw } from 'vue-router';
import { basicRoutes } from '@/router/routes';

interface PermissionState {
  routes: RouteRecordRaw[];
}

export const usePermissionStore = defineStore('permission', {
  state: (): PermissionState => ({
    routes: basicRoutes,
  }),
  actions: {
    setRoutes(routes: RouteRecordRaw[]) {
      this.routes = routes;
    },
  },
});
