import type { RouteRecordRaw } from 'vue-router';

export const basicRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { public: true, title: '登录' },
  },
  {
    path: '/',
    component: () => import('@/components/Layout/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '数据面板', icon: 'stats-chart-outline' },
      },
      {
        path: 'category',
        name: 'Category',
        component: () => import('@/views/category/index.vue'),
        meta: { title: '分类管理', icon: 'albums-outline' },
      },
      {
        path: 'works',
        name: 'Works',
        component: () => import('@/views/works/index.vue'),
        meta: { title: '作品管理', icon: 'image-outline' },
      },
      {
        path: 'user',
        name: 'User',
        component: () => import('@/views/user/index.vue'),
        meta: { title: '用户管理', icon: 'people-outline' },
      },
      {
        path: 'ad',
        name: 'Ad',
        component: () => import('@/views/ad/index.vue'),
        meta: { title: '广告管理', icon: 'videocam-outline' },
      },
      {
        path: 'system',
        name: 'System',
        component: () => import('@/views/system/index.vue'),
        meta: { title: '系统设置', icon: 'settings-outline' },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/system/NotFound.vue'),
    meta: { public: true, title: '404' },
  },
];
