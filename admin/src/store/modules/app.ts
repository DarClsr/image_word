import { defineStore } from 'pinia';

export type ThemeMode = 'light' | 'dark' | 'auto';

interface AppState {
  collapsed: boolean;
  theme: ThemeMode;
}

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    collapsed: false,
    theme: 'dark',
  }),
  getters: {
    resolvedTheme(state) {
      if (state.theme === 'auto') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return state.theme;
    },
  },
  actions: {
    toggleSidebar() {
      this.collapsed = !this.collapsed;
    },
    setTheme(theme: ThemeMode) {
      this.theme = theme;
    },
  },
});
