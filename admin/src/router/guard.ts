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

    if (to.meta.roles && !authStore.hasRole(to.meta.roles)) {
      return next({ name: 'Dashboard' });
    }

    if (to.meta.permissions && !authStore.hasPermission(to.meta.permissions)) {
      return next({ name: 'Dashboard' });
    }

    next();
  });
};
