import type { Router } from 'vue-router';
import { useAuthStore } from '@/store/modules/auth';

export const setupRouterGuard = (router: Router) => {
  router.beforeEach(async (to, _, next) => {
    const authStore = useAuthStore();

    if (to.meta.public) {
      return next();
    }

    if (to.meta.requiresAuth && !authStore.isLoggedIn) {
      return next({ name: 'Login', query: { redirect: to.fullPath } });
    }

    const roles = to.meta.roles as string[] | undefined;
    if (roles && !authStore.hasRole(roles)) {
      return next({ name: 'Dashboard' });
    }

    const permissions = to.meta.permissions as string[] | undefined;
    if (permissions && !authStore.hasPermission(permissions)) {
      return next({ name: 'Dashboard' });
    }

    next();
  });
};
