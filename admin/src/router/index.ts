import { createRouter, createWebHistory } from 'vue-router';
import { basicRoutes } from './routes';
import { setupRouterGuard } from './guard';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: basicRoutes,
  scrollBehavior() {
    return { top: 0 };
  },
});

export const setupRouter = (app: import('vue').App) => {
  app.use(router);
  setupRouterGuard(router);
};

export default router;
