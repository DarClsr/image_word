<template>
  <n-config-provider :theme="theme" :theme-overrides="themeOverrides">
    <n-global-style />
    <n-message-provider>
      <router-view />
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { GlobalThemeOverrides } from 'naive-ui';
import { NConfigProvider, NGlobalStyle, NMessageProvider, darkTheme } from 'naive-ui';
import { useTheme } from '@/composables/useTheme';

const { resolvedTheme } = useTheme();
const theme = computed(() => (resolvedTheme.value === 'dark' ? darkTheme : null));
const themeOverrides = computed<GlobalThemeOverrides>(() => {
  if (resolvedTheme.value === 'dark') {
    return {
      common: {
        bodyColor: '#0b1120',
        cardColor: '#111827',
        textColorBase: '#e5e7eb',
        textColor1: '#e5e7eb',
        textColor2: '#cbd5f5',
        borderColor: '#1f2937',
        primaryColor: '#60a5fa',
        primaryColorHover: '#93c5fd',
        primaryColorPressed: '#3b82f6',
      },
      Layout: {
        color: '#0f172a',
        headerColor: '#0f172a',
        siderColor: '#0f172a',
      },
      Menu: {
        itemTextColor: '#e5e7eb',
        itemTextColorHover: '#ffffff',
        itemColorHover: 'rgba(96, 165, 250, 0.16)',
        itemColorActive: 'rgba(96, 165, 250, 0.22)',
        itemTextColorActive: '#ffffff',
        itemIconColor: '#9ca3af',
        itemIconColorHover: '#ffffff',
        itemIconColorActive: '#ffffff',
      },
      PageHeader: {
        titleTextColor: '#e5e7eb',
        subtitleTextColor: '#9ca3af',
      },
      Card: {
        color: '#111827',
        borderColor: '#1f2937',
      },
    };
  }

  return {
    common: {
      bodyColor: '#f5f7fb',
      cardColor: '#ffffff',
      textColorBase: '#111827',
      textColor1: '#111827',
      textColor2: '#6b7280',
      borderColor: '#e5e7eb',
      primaryColor: '#3b82f6',
      primaryColorHover: '#2563eb',
      primaryColorPressed: '#1d4ed8',
    },
    Layout: {
      color: '#f5f7f9',
      headerColor: '#ffffff',
      siderColor: '#ffffff',
    },
    Menu: {
      itemTextColor: '#374151',
      itemTextColorHover: '#111827',
      itemColorHover: 'rgba(59, 130, 246, 0.08)',
      itemColorActive: 'rgba(59, 130, 246, 0.12)',
      itemTextColorActive: '#1d4ed8',
      itemIconColor: '#6b7280',
      itemIconColorHover: '#111827',
      itemIconColorActive: '#1d4ed8',
    },
    Card: {
      color: '#ffffff',
      borderColor: '#eef0f3',
    },
  };
});
</script>
