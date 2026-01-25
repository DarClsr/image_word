import { computed, watchEffect } from 'vue';
import { useMediaQuery } from '@vueuse/core';
import { useAppStore } from '@/store/modules/app';

export const useTheme = () => {
  const appStore = useAppStore();
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');

  const applyTheme = (theme: string) => {
    document.documentElement.setAttribute('data-theme', theme);
  };

  const resolvedTheme = computed(() => {
    if (appStore.theme === 'auto') {
      return prefersDark.value ? 'dark' : 'light';
    }
    return appStore.theme;
  });

  watchEffect(() => {
    applyTheme(resolvedTheme.value);
  });

  return {
    theme: appStore,
    setTheme: appStore.setTheme,
    resolvedTheme,
  };
};
