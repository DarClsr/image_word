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
        modalColor: '#1e293b',
        popoverColor: '#1e293b',
        tableColor: '#111827',
        tableColorHover: '#1e293b',
        tableColorStriped: '#0f172a',
        inputColor: '#1e293b',
        inputColorDisabled: '#0f172a',
        textColorBase: '#e5e7eb',
        textColor1: '#f1f5f9',
        textColor2: '#cbd5e1',
        textColor3: '#94a3b8',
        textColorDisabled: '#64748b',
        placeholderColor: '#64748b',
        borderColor: '#334155',
        dividerColor: '#334155',
        primaryColor: '#60a5fa',
        primaryColorHover: '#93c5fd',
        primaryColorPressed: '#3b82f6',
        primaryColorSuppl: '#60a5fa',
        successColor: '#4ade80',
        successColorHover: '#86efac',
        successColorPressed: '#22c55e',
        successColorSuppl: '#4ade80',
        warningColor: '#fbbf24',
        warningColorHover: '#fcd34d',
        warningColorPressed: '#f59e0b',
        warningColorSuppl: '#fbbf24',
        errorColor: '#f87171',
        errorColorHover: '#fca5a5',
        errorColorPressed: '#ef4444',
        errorColorSuppl: '#f87171',
        infoColor: '#60a5fa',
        infoColorHover: '#93c5fd',
        infoColorPressed: '#3b82f6',
        infoColorSuppl: '#60a5fa',
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
        titleTextColor: '#f1f5f9',
        subtitleTextColor: '#94a3b8',
      },
      Card: {
        color: '#111827',
        borderColor: '#1f2937',
      },
      Button: {
        textColor: '#e5e7eb',
        textColorHover: '#ffffff',
        textColorPressed: '#cbd5e1',
        textColorFocus: '#ffffff',
        // text 类型按钮颜色
        textColorTextPrimary: '#60a5fa',
        textColorTextHoverPrimary: '#93c5fd',
        textColorTextPressedPrimary: '#3b82f6',
        textColorTextFocusPrimary: '#93c5fd',
        textColorTextSuccess: '#4ade80',
        textColorTextHoverSuccess: '#86efac',
        textColorTextPressedSuccess: '#22c55e',
        textColorTextError: '#f87171',
        textColorTextHoverError: '#fca5a5',
        textColorTextPressedError: '#ef4444',
        textColorTextWarning: '#fbbf24',
        textColorTextHoverWarning: '#fcd34d',
        textColorTextPressedWarning: '#f59e0b',
        textColorTextInfo: '#60a5fa',
        textColorTextHoverInfo: '#93c5fd',
        textColorTextPressedInfo: '#3b82f6',
        // ghost 类型按钮颜色
        textColorGhostPrimary: '#60a5fa',
        textColorGhostHoverPrimary: '#93c5fd',
        textColorGhostPressedPrimary: '#3b82f6',
        textColorGhostError: '#f87171',
        textColorGhostHoverError: '#fca5a5',
        textColorGhostPressedError: '#ef4444',
        // 默认按钮
        colorSecondary: '#1e293b',
        colorSecondaryHover: '#334155',
        colorSecondaryPressed: '#0f172a',
        borderHover: '1px solid #475569',
        borderPressed: '1px solid #334155',
      },
      DataTable: {
        thColor: '#0f172a',
        thTextColor: '#e5e7eb',
        tdColor: '#111827',
        tdColorHover: '#1e293b',
        tdColorStriped: '#0f172a',
        borderColor: '#1f2937',
      },
      Input: {
        color: '#1e293b',
        colorFocus: '#1e293b',
        borderHover: '1px solid #60a5fa',
        borderFocus: '1px solid #60a5fa',
        placeholderColor: '#64748b',
      },
      Select: {
        peers: {
          InternalSelection: {
            color: '#1e293b',
            colorActive: '#1e293b',
            borderHover: '1px solid #60a5fa',
            borderFocus: '1px solid #60a5fa',
            placeholderColor: '#64748b',
          },
        },
      },
      Tag: {
        colorBordered: 'transparent',
      },
      Pagination: {
        itemTextColor: '#cbd5e1',
        itemTextColorHover: '#ffffff',
        itemTextColorActive: '#ffffff',
        itemColorHover: '#334155',
        itemColorActive: '#3b82f6',
        itemBorderActive: '1px solid #3b82f6',
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
