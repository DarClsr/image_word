import { createPinia } from 'pinia';

const pinia = createPinia();

export const setupStore = (app: import('vue').App) => {
  app.use(pinia);
};

export { pinia };

export * from './modules/auth';
export * from './modules/app';
