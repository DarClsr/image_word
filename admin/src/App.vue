<template>
  <n-config-provider :theme="theme" :theme-overrides="themeOverrides" :locale="zhCN" :date-locale="dateZhCN">
    <n-global-style />
    <n-message-provider>
      <n-dialog-provider>
        <n-notification-provider>
          <router-view />
        </n-notification-provider>
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { GlobalThemeOverrides } from 'naive-ui';
import {
  NConfigProvider,
  NGlobalStyle,
  NMessageProvider,
  NDialogProvider,
  NNotificationProvider,
  darkTheme,
  zhCN,
  dateZhCN,
} from 'naive-ui';
import { useTheme } from '@/composables/useTheme';

const { resolvedTheme } = useTheme();
const theme = computed(() => (resolvedTheme.value === 'dark' ? darkTheme : null));

// 亮色主题覆盖
const lightThemeOverrides: GlobalThemeOverrides = {
  common: {
    // 基础颜色
    bodyColor: '#f8fafc',
    cardColor: '#ffffff',
    modalColor: '#ffffff',
    popoverColor: '#ffffff',
    tableColor: '#ffffff',
    inputColor: '#ffffff',

    // 文字颜色
    textColorBase: '#0f172a',
    textColor1: '#0f172a',
    textColor2: '#334155',
    textColor3: '#64748b',
    textColorDisabled: '#94a3b8',
    placeholderColor: '#94a3b8',

    // 边框颜色
    borderColor: '#e2e8f0',
    dividerColor: '#e2e8f0',

    // 主题色 - 靛蓝
    primaryColor: '#4f46e5',
    primaryColorHover: '#4338ca',
    primaryColorPressed: '#3730a3',
    primaryColorSuppl: '#6366f1',

    // 功能色
    successColor: '#059669',
    successColorHover: '#047857',
    successColorPressed: '#065f46',
    successColorSuppl: '#10b981',

    warningColor: '#d97706',
    warningColorHover: '#b45309',
    warningColorPressed: '#92400e',
    warningColorSuppl: '#f59e0b',

    errorColor: '#dc2626',
    errorColorHover: '#b91c1c',
    errorColorPressed: '#991b1b',
    errorColorSuppl: '#ef4444',

    infoColor: '#2563eb',
    infoColorHover: '#1d4ed8',
    infoColorPressed: '#1e40af',
    infoColorSuppl: '#3b82f6',

    // 圆角
    borderRadius: '8px',
    borderRadiusSmall: '6px',
  },

  Layout: {
    color: '#f8fafc',
    headerColor: '#ffffff',
    siderColor: '#ffffff',
    footerColor: '#f8fafc',
  },

  Menu: {
    itemTextColor: '#475569',
    itemTextColorHover: '#0f172a',
    itemTextColorActive: '#4f46e5',
    itemTextColorChildActive: '#4f46e5',
    itemColorHover: 'rgba(79, 70, 229, 0.08)',
    itemColorActive: 'rgba(79, 70, 229, 0.12)',
    itemColorActiveCollapsed: 'rgba(79, 70, 229, 0.12)',
    itemIconColor: '#64748b',
    itemIconColorHover: '#0f172a',
    itemIconColorActive: '#4f46e5',
    itemIconColorChildActive: '#4f46e5',
    arrowColor: '#94a3b8',
    arrowColorHover: '#64748b',
    arrowColorActive: '#4f46e5',
    arrowColorChildActive: '#4f46e5',
  },

  Card: {
    color: '#ffffff',
    colorModal: '#ffffff',
    colorPopover: '#ffffff',
    borderColor: '#e2e8f0',
    borderRadius: '12px',
    titleTextColor: '#0f172a',
    titleFontSizeMedium: '16px',
    titleFontSizeLarge: '18px',
    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)',
  },

  Button: {
    textColor: '#0f172a',
    textColorHover: '#0f172a',
    textColorPressed: '#0f172a',
    textColorFocus: '#0f172a',
    textColorDisabled: '#94a3b8',

    // 主要按钮
    colorPrimary: '#4f46e5',
    colorHoverPrimary: '#4338ca',
    colorPressedPrimary: '#3730a3',
    colorFocusPrimary: '#4f46e5',
    colorDisabledPrimary: '#c7d2fe',
    textColorPrimary: '#ffffff',
    textColorHoverPrimary: '#ffffff',
    textColorPressedPrimary: '#ffffff',
    textColorFocusPrimary: '#ffffff',
    textColorDisabledPrimary: '#ffffff',

    // 成功按钮
    colorSuccess: '#059669',
    colorHoverSuccess: '#047857',
    colorPressedSuccess: '#065f46',
    textColorSuccess: '#ffffff',

    // 警告按钮
    colorWarning: '#d97706',
    colorHoverWarning: '#b45309',
    colorPressedWarning: '#92400e',
    textColorWarning: '#ffffff',

    // 错误按钮
    colorError: '#dc2626',
    colorHoverError: '#b91c1c',
    colorPressedError: '#991b1b',
    textColorError: '#ffffff',

    // 次要按钮
    colorSecondary: '#ffffff',
    colorHoverSecondary: '#f8fafc',
    colorPressedSecondary: '#f1f5f9',
    colorFocusSecondary: '#ffffff',
    colorDisabledSecondary: '#f1f5f9',
    borderSecondary: '1px solid #e2e8f0',
    borderHoverSecondary: '1px solid #cbd5e1',
    borderPressedSecondary: '1px solid #94a3b8',
    borderFocusSecondary: '1px solid #4f46e5',
    borderDisabledSecondary: '1px solid #e2e8f0',

    // 文字按钮
    textColorText: '#475569',
    textColorTextHover: '#0f172a',
    textColorTextPressed: '#334155',
    textColorTextPrimary: '#4f46e5',
    textColorTextHoverPrimary: '#4338ca',
    textColorTextPressedPrimary: '#3730a3',
    textColorTextSuccess: '#059669',
    textColorTextHoverSuccess: '#047857',
    textColorTextPressedSuccess: '#065f46',
    textColorTextWarning: '#d97706',
    textColorTextHoverWarning: '#b45309',
    textColorTextPressedWarning: '#92400e',
    textColorTextError: '#dc2626',
    textColorTextHoverError: '#b91c1c',
    textColorTextPressedError: '#991b1b',

    borderRadiusTiny: '4px',
    borderRadiusSmall: '6px',
    borderRadiusMedium: '8px',
    borderRadiusLarge: '10px',
  },

  DataTable: {
    thColor: '#f8fafc',
    thColorHover: '#f1f5f9',
    thTextColor: '#475569',
    thFontWeight: '600',
    tdColor: '#ffffff',
    tdColorHover: '#f8fafc',
    tdColorStriped: '#f8fafc',
    tdTextColor: '#334155',
    borderColor: '#e2e8f0',
    borderColorModal: '#e2e8f0',
    borderRadius: '8px',
  },

  Input: {
    color: '#ffffff',
    colorFocus: '#ffffff',
    colorDisabled: '#f1f5f9',
    textColor: '#0f172a',
    textColorDisabled: '#94a3b8',
    placeholderColor: '#94a3b8',
    placeholderColorDisabled: '#cbd5e1',
    border: '1px solid #e2e8f0',
    borderHover: '1px solid #cbd5e1',
    borderFocus: '1px solid #4f46e5',
    borderDisabled: '1px solid #e2e8f0',
    borderRadius: '8px',
    boxShadowFocus: '0 0 0 3px rgba(79, 70, 229, 0.1)',
    heightMedium: '40px',
    heightLarge: '44px',
  },

  Select: {
    peers: {
      InternalSelection: {
        color: '#ffffff',
        colorActive: '#ffffff',
        colorDisabled: '#f1f5f9',
        textColor: '#0f172a',
        textColorDisabled: '#94a3b8',
        placeholderColor: '#94a3b8',
        border: '1px solid #e2e8f0',
        borderHover: '1px solid #cbd5e1',
        borderActive: '1px solid #4f46e5',
        borderFocus: '1px solid #4f46e5',
        borderDisabled: '1px solid #e2e8f0',
        borderRadius: '8px',
        boxShadowActive: '0 0 0 3px rgba(79, 70, 229, 0.1)',
        boxShadowFocus: '0 0 0 3px rgba(79, 70, 229, 0.1)',
        heightMedium: '40px',
        heightLarge: '44px',
      },
      InternalSelectMenu: {
        color: '#ffffff',
        optionColorActive: 'rgba(79, 70, 229, 0.08)',
        optionColorPending: 'rgba(79, 70, 229, 0.04)',
      },
    },
  },

  Tag: {
    color: '#f1f5f9',
    colorBordered: '#ffffff',
    textColor: '#475569',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',

    // 预设颜色
    colorPrimary: '#eef2ff',
    textColorPrimary: '#4f46e5',
    borderPrimary: '1px solid #c7d2fe',

    colorSuccess: '#ecfdf5',
    textColorSuccess: '#059669',
    borderSuccess: '1px solid #a7f3d0',

    colorWarning: '#fffbeb',
    textColorWarning: '#d97706',
    borderWarning: '1px solid #fde68a',

    colorError: '#fef2f2',
    textColorError: '#dc2626',
    borderError: '1px solid #fecaca',

    colorInfo: '#eff6ff',
    textColorInfo: '#2563eb',
    borderInfo: '1px solid #bfdbfe',
  },

  Pagination: {
    itemColor: '#ffffff',
    itemColorHover: '#f8fafc',
    itemColorPressed: '#f1f5f9',
    itemColorActive: '#4f46e5',
    itemColorDisabled: '#f1f5f9',
    itemTextColor: '#475569',
    itemTextColorHover: '#0f172a',
    itemTextColorPressed: '#334155',
    itemTextColorActive: '#ffffff',
    itemTextColorDisabled: '#94a3b8',
    itemBorder: '1px solid #e2e8f0',
    itemBorderHover: '1px solid #cbd5e1',
    itemBorderPressed: '1px solid #94a3b8',
    itemBorderActive: '1px solid #4f46e5',
    itemBorderDisabled: '1px solid #e2e8f0',
    itemBorderRadius: '8px',
    buttonColor: '#ffffff',
    buttonColorHover: '#f8fafc',
    buttonColorPressed: '#f1f5f9',
    buttonBorder: '1px solid #e2e8f0',
    buttonBorderHover: '1px solid #cbd5e1',
    buttonBorderPressed: '1px solid #94a3b8',
    buttonIconColor: '#64748b',
    buttonIconColorHover: '#475569',
    buttonIconColorPressed: '#334155',
  },

  PageHeader: {
    titleTextColor: '#0f172a',
    titleFontSize: '24px',
    titleFontWeight: '600',
    subtitleTextColor: '#64748b',
    subtitleFontSize: '14px',
    backColor: '#f8fafc',
    backColorHover: '#f1f5f9',
    backColorPressed: '#e2e8f0',
  },

  Modal: {
    color: '#ffffff',
    textColor: '#0f172a',
    borderRadius: '16px',
    boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 10px 10px -5px rgba(15, 23, 42, 0.04)',
  },

  Drawer: {
    color: '#ffffff',
    textColor: '#0f172a',
  },

  Form: {
    labelTextColor: '#334155',
    labelFontSize: '14px',
    labelFontWeight: '500',
    labelPadding: '0 0 8px 0',
    feedbackTextColor: '#64748b',
    feedbackTextColorError: '#dc2626',
  },

  Checkbox: {
    color: '#ffffff',
    colorChecked: '#4f46e5',
    colorDisabled: '#f1f5f9',
    colorDisabledChecked: '#c7d2fe',
    border: '1px solid #e2e8f0',
    borderChecked: '1px solid #4f46e5',
    borderFocus: '1px solid #4f46e5',
    borderDisabled: '1px solid #e2e8f0',
    borderDisabledChecked: '1px solid #c7d2fe',
    borderRadius: '6px',
    checkMarkColor: '#ffffff',
  },

  Radio: {
    color: '#ffffff',
    colorDisabled: '#f1f5f9',
    colorActive: '#4f46e5',
    border: '1px solid #e2e8f0',
    borderActive: '1px solid #4f46e5',
    borderDisabled: '1px solid #e2e8f0',
    borderDisabledActive: '1px solid #c7d2fe',
    boxShadowActive: '0 0 0 3px rgba(79, 70, 229, 0.1)',
    textColor: '#334155',
    textColorDisabled: '#94a3b8',
    dotColorActive: '#4f46e5',
    dotColorDisabled: '#cbd5e1',
  },

  Switch: {
    color: '#e2e8f0',
    colorActive: '#4f46e5',
    colorDisabled: '#f1f5f9',
    colorDisabledActive: '#c7d2fe',
    railColor: '#e2e8f0',
    railColorActive: '#4f46e5',
    railColorDisabled: '#f1f5f9',
    buttonColor: '#ffffff',
    buttonColorActive: '#ffffff',
    boxShadowFocus: '0 0 0 3px rgba(79, 70, 229, 0.1)',
  },

  Slider: {
    fillColor: '#4f46e5',
    fillColorHover: '#4338ca',
    railColor: '#e2e8f0',
    railColorHover: '#cbd5e1',
    handleColor: '#ffffff',
    handleColorHover: '#ffffff',
    handleColorPressed: '#f8fafc',
    handleBoxShadow: '0 1px 3px rgba(15, 23, 42, 0.1)',
    handleBoxShadowHover: '0 2px 6px rgba(15, 23, 42, 0.15)',
    handleBoxShadowPressed: '0 1px 2px rgba(15, 23, 42, 0.1)',
    handleBoxShadowFocus: '0 0 0 3px rgba(79, 70, 229, 0.2)',
  },

  Progress: {
    fillColor: '#4f46e5',
    fillColorSuccess: '#059669',
    fillColorError: '#dc2626',
    fillColorWarning: '#d97706',
    railColor: '#e2e8f0',
    railColorSuccess: '#d1fae5',
    railColorError: '#fee2e2',
    railColorWarning: '#fef3c7',
    textColor: '#334155',
    textColorCircle: '#0f172a',
    fontSize: '12px',
    fontSizeCircle: '16px',
  },

  Badge: {
    color: '#dc2626',
    textColor: '#ffffff',
  },

  Avatar: {
    color: '#4f46e5',
    textColor: '#ffffff',
  },

  Tooltip: {
    color: '#0f172a',
    textColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.1), 0 2px 4px -2px rgba(15, 23, 42, 0.1)',
    padding: '8px 12px',
  },

  Popover: {
    color: '#ffffff',
    textColor: '#0f172a',
    borderRadius: '12px',
    boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.1), 0 4px 6px -4px rgba(15, 23, 42, 0.1)',
  },

  Dropdown: {
    color: '#ffffff',
    textColor: '#334155',
    optionColorHover: 'rgba(79, 70, 229, 0.08)',
    optionColorActive: 'rgba(79, 70, 229, 0.12)',
    dividerColor: '#e2e8f0',
    borderRadius: '10px',
    boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.1), 0 4px 6px -4px rgba(15, 23, 42, 0.1)',
  },

  Steps: {
    stepHeaderFontSize: '14px',
    indicatorColor: '#e2e8f0',
    indicatorColorProcess: '#4f46e5',
    indicatorColorWait: '#e2e8f0',
    indicatorColorFinish: '#4f46e5',
    indicatorColorError: '#dc2626',
    indicatorTextColorProcess: '#ffffff',
    indicatorTextColorWait: '#94a3b8',
    indicatorTextColorFinish: '#ffffff',
    indicatorTextColorError: '#ffffff',
    splitorColor: '#e2e8f0',
    splitorColorProcess: '#e2e8f0',
    headerTextColorProcess: '#0f172a',
    headerTextColorWait: '#64748b',
    headerTextColorFinish: '#0f172a',
    headerTextColorError: '#dc2626',
    descriptionTextColor: '#64748b',
  },

  Tabs: {
    colorSegment: '#f8fafc',
    tabColorSegment: '#ffffff',
    tabColorSegmentActive: '#4f46e5',
    tabTextColorSegment: '#475569',
    tabTextColorSegmentActive: '#ffffff',
    tabTextColorHover: '#0f172a',
    tabTextColorActive: '#4f46e5',
    tabTextColorDisabled: '#94a3b8',
    barColor: '#4f46e5',
    borderColor: '#e2e8f0',
    borderRadius: '8px',
  },

  DatePicker: {
    panelColor: '#ffffff',
    panelTextColor: '#0f172a',
    itemColorHover: 'rgba(79, 70, 229, 0.08)',
    itemColorActive: '#4f46e5',
    itemTextColorActive: '#ffffff',
    itemTextColorDisabled: '#94a3b8',
    itemColorDisabled: 'transparent',
    itemColorIncludedActive: 'rgba(79, 70, 229, 0.1)',
    itemTextColorIncludedActive: '#4f46e5',
    borderRadius: '8px',
  },

  TimePicker: {
    panelColor: '#ffffff',
    itemColorHover: 'rgba(79, 70, 229, 0.08)',
    itemColorActive: '#4f46e5',
    itemTextColorActive: '#ffffff',
    itemTextColorDisabled: '#94a3b8',
    borderRadius: '8px',
  },

  Tree: {
    nodeColorHover: 'rgba(79, 70, 229, 0.08)',
    nodeColorSelected: 'rgba(79, 70, 229, 0.12)',
    nodeTextColor: '#334155',
    nodeTextColorSelected: '#4f46e5',
  },

  Transfer: {
    listColor: '#ffffff',
    listTitleTextColor: '#475569',
    headerTextColor: '#0f172a',
    itemColorHover: 'rgba(79, 70, 229, 0.08)',
    itemTextColor: '#334155',
  },

  Upload: {
    draggerColor: '#f8fafc',
    draggerColorHover: '#f1f5f9',
    draggerBorderColor: '#e2e8f0',
    draggerBorderColorHover: '#cbd5e1',
    itemTextColor: '#334155',
    itemTextColorError: '#dc2626',
    itemIconColor: '#64748b',
  },

  Calendar: {
    color: '#ffffff',
    textColor: '#0f172a',
    titleFontSize: '16px',
    dayTextColor: '#334155',
    dayTextColorDisabled: '#94a3b8',
    dayColor: 'transparent',
    dayColorHover: 'rgba(79, 70, 229, 0.08)',
    dayColorActive: '#4f46e5',
    dayTextColorActive: '#ffffff',
    barColor: '#4f46e5',
  },

  Collapse: {
    color: '#ffffff',
    textColor: '#0f172a',
    dividerColor: '#e2e8f0',
    titleFontSize: '14px',
    titleFontWeight: '500',
    arrowColor: '#64748b',
  },

  Split: {
    color: '#f8fafc',
    dividerColor: '#e2e8f0',
  },

  Statistic: {
    labelFontSize: '14px',
    labelFontWeight: '400',
    labelTextColor: '#64748b',
    valueFontSize: '28px',
    valueFontWeight: '600',
    valueTextColor: '#0f172a',
    prefixTextColor: '#64748b',
    suffixTextColor: '#64748b',
  },

  Thing: {
    titleTextColor: '#0f172a',
    titleFontSize: '14px',
    titleFontWeight: '500',
    descriptionTextColor: '#64748b',
    descriptionFontSize: '13px',
  },

  List: {
    color: '#ffffff',
    colorHover: '#f8fafc',
    textColor: '#334155',
    borderColor: '#e2e8f0',
  },

  Log: {
    loaderColor: '#4f46e5',
    highlightBackgroundColor: 'rgba(79, 70, 229, 0.1)',
  },

  Result: {
    titleTextColor: '#0f172a',
    titleFontSize: '20px',
    titleFontWeight: '600',
    descriptionTextColor: '#64748b',
    descriptionFontSize: '14px',
    iconColorSuccess: '#059669',
    iconColorWarning: '#d97706',
    iconColorError: '#dc2626',
    iconColorInfo: '#2563eb',
    iconColor404: '#64748b',
  },

  Empty: {
    iconColor: '#cbd5e1',
    textColor: '#64748b',
    textColorDisabled: '#94a3b8',
  },

  Anchor: {
    linkTextColor: '#64748b',
    linkTextColorHover: '#4f46e5',
    linkTextColorPressed: '#4338ca',
    linkTextColorActive: '#4f46e5',
    railColor: '#e2e8f0',
    railColorActive: '#4f46e5',
  },

  BackTop: {
    color: '#ffffff',
    colorHover: '#f8fafc',
    colorPressed: '#f1f5f9',
    textColor: '#64748b',
    boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.1), 0 2px 4px -2px rgba(15, 23, 42, 0.1)',
    boxShadowHover: '0 10px 15px -3px rgba(15, 23, 42, 0.1), 0 4px 6px -4px rgba(15, 23, 42, 0.1)',
    boxShadowPressed: '0 1px 3px rgba(15, 23, 42, 0.1)',
  },

  Breadcrumb: {
    itemTextColor: '#64748b',
    itemTextColorHover: '#4f46e5',
    itemTextColorPressed: '#4338ca',
    itemTextColorActive: '#0f172a',
    separatorColor: '#cbd5e1',
    fontSize: '14px',
  },

  LoadingBar: {
    color: '#4f46e5',
    colorError: '#dc2626',
  },

  Skeleton: {
    color: '#f1f5f9',
    colorEnd: '#e2e8f0',
  },

  Spin: {
    color: '#4f46e5',
    opacity: 0.8,
  },
};

// 暗色主题覆盖
const darkThemeOverrides: GlobalThemeOverrides = {
  common: {
    // 基础颜色
    bodyColor: '#0b1120',
    cardColor: '#1e293b',
    modalColor: '#1e293b',
    popoverColor: '#1e293b',
    tableColor: '#1e293b',
    inputColor: '#0f172a',

    // 文字颜色
    textColorBase: '#f1f5f9',
    textColor1: '#f1f5f9',
    textColor2: '#cbd5e1',
    textColor3: '#94a3b8',
    textColorDisabled: '#64748b',
    placeholderColor: '#64748b',

    // 边框颜色
    borderColor: 'rgba(255, 255, 255, 0.1)',
    dividerColor: 'rgba(255, 255, 255, 0.1)',

    // 主题色 - 亮靛蓝
    primaryColor: '#818cf8',
    primaryColorHover: '#a5b4fc',
    primaryColorPressed: '#6366f1',
    primaryColorSuppl: '#818cf8',

    // 功能色
    successColor: '#34d399',
    successColorHover: '#6ee7b7',
    successColorPressed: '#10b981',
    successColorSuppl: '#34d399',

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

    // 圆角
    borderRadius: '8px',
    borderRadiusSmall: '6px',
  },

  Layout: {
    color: '#0b1120',
    headerColor: '#0f172a',
    siderColor: '#0f172a',
    footerColor: '#0b1120',
  },

  Menu: {
    itemTextColor: '#cbd5e1',
    itemTextColorHover: '#f1f5f9',
    itemTextColorActive: '#818cf8',
    itemTextColorChildActive: '#818cf8',
    itemColorHover: 'rgba(129, 140, 248, 0.12)',
    itemColorActive: 'rgba(129, 140, 248, 0.18)',
    itemColorActiveCollapsed: 'rgba(129, 140, 248, 0.18)',
    itemIconColor: '#94a3b8',
    itemIconColorHover: '#f1f5f9',
    itemIconColorActive: '#818cf8',
    itemIconColorChildActive: '#818cf8',
    arrowColor: '#64748b',
    arrowColorHover: '#94a3b8',
    arrowColorActive: '#818cf8',
    arrowColorChildActive: '#818cf8',
  },

  Card: {
    color: '#1e293b',
    colorModal: '#1e293b',
    colorPopover: '#1e293b',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    titleTextColor: '#f1f5f9',
    titleFontSizeMedium: '16px',
    titleFontSizeLarge: '18px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)',
  },

  Button: {
    textColor: '#f1f5f9',
    textColorHover: '#f1f5f9',
    textColorPressed: '#f1f5f9',
    textColorFocus: '#f1f5f9',
    textColorDisabled: '#64748b',

    // 主要按钮
    colorPrimary: '#4f46e5',
    colorHoverPrimary: '#6366f1',
    colorPressedPrimary: '#4338ca',
    colorFocusPrimary: '#4f46e5',
    colorDisabledPrimary: '#3730a3',
    textColorPrimary: '#ffffff',
    textColorHoverPrimary: '#ffffff',
    textColorPressedPrimary: '#ffffff',
    textColorFocusPrimary: '#ffffff',
    textColorDisabledPrimary: '#a5b4fc',

    // 成功按钮
    colorSuccess: '#059669',
    colorHoverSuccess: '#10b981',
    colorPressedSuccess: '#047857',
    textColorSuccess: '#ffffff',

    // 警告按钮
    colorWarning: '#d97706',
    colorHoverWarning: '#f59e0b',
    colorPressedWarning: '#b45309',
    textColorWarning: '#ffffff',

    // 错误按钮
    colorError: '#dc2626',
    colorHoverError: '#ef4444',
    colorPressedError: '#b91c1c',
    textColorError: '#ffffff',

    // 次要按钮
    colorSecondary: '#1e293b',
    colorHoverSecondary: '#334155',
    colorPressedSecondary: '#0f172a',
    colorFocusSecondary: '#1e293b',
    colorDisabledSecondary: '#0f172a',
    borderSecondary: '1px solid rgba(255, 255, 255, 0.1)',
    borderHoverSecondary: '1px solid rgba(255, 255, 255, 0.2)',
    borderPressedSecondary: '1px solid rgba(255, 255, 255, 0.15)',
    borderFocusSecondary: '1px solid #818cf8',
    borderDisabledSecondary: '1px solid rgba(255, 255, 255, 0.05)',

    // 文字按钮
    textColorText: '#cbd5e1',
    textColorTextHover: '#f1f5f9',
    textColorTextPressed: '#94a3b8',
    textColorTextPrimary: '#818cf8',
    textColorTextHoverPrimary: '#a5b4fc',
    textColorTextPressedPrimary: '#6366f1',
    textColorTextSuccess: '#34d399',
    textColorTextHoverSuccess: '#6ee7b7',
    textColorTextPressedSuccess: '#10b981',
    textColorTextWarning: '#fbbf24',
    textColorTextHoverWarning: '#fcd34d',
    textColorTextPressedWarning: '#f59e0b',
    textColorTextError: '#f87171',
    textColorTextHoverError: '#fca5a5',
    textColorTextPressedError: '#ef4444',

    borderRadiusTiny: '4px',
    borderRadiusSmall: '6px',
    borderRadiusMedium: '8px',
    borderRadiusLarge: '10px',
  },

  DataTable: {
    thColor: '#0f172a',
    thColorHover: '#1e293b',
    thTextColor: '#e2e8f0',
    thFontWeight: '600',
    tdColor: '#1e293b',
    tdColorHover: '#334155',
    tdColorStriped: '#0f172a',
    tdTextColor: '#e2e8f0',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderColorModal: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
  },

  Input: {
    color: '#0f172a',
    colorFocus: '#0f172a',
    colorDisabled: '#1e293b',
    textColor: '#f1f5f9',
    textColorDisabled: '#64748b',
    placeholderColor: '#64748b',
    placeholderColorDisabled: '#475569',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderHover: '1px solid rgba(255, 255, 255, 0.2)',
    borderFocus: '1px solid #818cf8',
    borderDisabled: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '8px',
    boxShadowFocus: '0 0 0 3px rgba(129, 140, 248, 0.15)',
    heightMedium: '40px',
    heightLarge: '44px',
  },

  Select: {
    peers: {
      InternalSelection: {
        color: '#0f172a',
        colorActive: '#0f172a',
        colorDisabled: '#1e293b',
        textColor: '#f1f5f9',
        textColorDisabled: '#64748b',
        placeholderColor: '#64748b',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderHover: '1px solid rgba(255, 255, 255, 0.2)',
        borderActive: '1px solid #818cf8',
        borderFocus: '1px solid #818cf8',
        borderDisabled: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '8px',
        boxShadowActive: '0 0 0 3px rgba(129, 140, 248, 0.15)',
        boxShadowFocus: '0 0 0 3px rgba(129, 140, 248, 0.15)',
        heightMedium: '40px',
        heightLarge: '44px',
      },
      InternalSelectMenu: {
        color: '#1e293b',
        optionColorActive: 'rgba(129, 140, 248, 0.15)',
        optionColorPending: 'rgba(129, 140, 248, 0.08)',
      },
    },
  },

  Tag: {
    color: '#334155',
    colorBordered: '#1e293b',
    textColor: '#e2e8f0',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',

    // 预设颜色
    colorPrimary: 'rgba(79, 70, 229, 0.2)',
    textColorPrimary: '#818cf8',
    borderPrimary: '1px solid rgba(129, 140, 248, 0.3)',

    colorSuccess: 'rgba(16, 185, 129, 0.2)',
    textColorSuccess: '#34d399',
    borderSuccess: '1px solid rgba(52, 211, 153, 0.3)',

    colorWarning: 'rgba(245, 158, 11, 0.2)',
    textColorWarning: '#fbbf24',
    borderWarning: '1px solid rgba(251, 191, 36, 0.3)',

    colorError: 'rgba(239, 68, 68, 0.2)',
    textColorError: '#f87171',
    borderError: '1px solid rgba(248, 113, 113, 0.3)',

    colorInfo: 'rgba(59, 130, 246, 0.2)',
    textColorInfo: '#60a5fa',
    borderInfo: '1px solid rgba(96, 165, 250, 0.3)',
  },

  Pagination: {
    itemColor: '#1e293b',
    itemColorHover: '#334155',
    itemColorPressed: '#0f172a',
    itemColorActive: '#4f46e5',
    itemColorDisabled: '#0f172a',
    itemTextColor: '#cbd5e1',
    itemTextColorHover: '#f1f5f9',
    itemTextColorPressed: '#94a3b8',
    itemTextColorActive: '#ffffff',
    itemTextColorDisabled: '#475569',
    itemBorder: '1px solid rgba(255, 255, 255, 0.1)',
    itemBorderHover: '1px solid rgba(255, 255, 255, 0.2)',
    itemBorderPressed: '1px solid rgba(255, 255, 255, 0.15)',
    itemBorderActive: '1px solid #4f46e5',
    itemBorderDisabled: '1px solid rgba(255, 255, 255, 0.05)',
    itemBorderRadius: '8px',
    buttonColor: '#1e293b',
    buttonColorHover: '#334155',
    buttonColorPressed: '#0f172a',
    buttonBorder: '1px solid rgba(255, 255, 255, 0.1)',
    buttonBorderHover: '1px solid rgba(255, 255, 255, 0.2)',
    buttonBorderPressed: '1px solid rgba(255, 255, 255, 0.15)',
    buttonIconColor: '#94a3b8',
    buttonIconColorHover: '#cbd5e1',
    buttonIconColorPressed: '#64748b',
  },

  PageHeader: {
    titleTextColor: '#f1f5f9',
    titleFontSize: '24px',
    titleFontWeight: '600',
    subtitleTextColor: '#94a3b8',
    subtitleFontSize: '14px',
    backColor: '#1e293b',
    backColorHover: '#334155',
    backColorPressed: '#0f172a',
  },

  Modal: {
    color: '#1e293b',
    textColor: '#f1f5f9',
    borderRadius: '16px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)',
  },

  Drawer: {
    color: '#1e293b',
    textColor: '#f1f5f9',
  },

  Form: {
    labelTextColor: '#e2e8f0',
    labelFontSize: '14px',
    labelFontWeight: '500',
    labelPadding: '0 0 8px 0',
    feedbackTextColor: '#94a3b8',
    feedbackTextColorError: '#f87171',
  },

  Checkbox: {
    color: '#0f172a',
    colorChecked: '#4f46e5',
    colorDisabled: '#1e293b',
    colorDisabledChecked: '#3730a3',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderChecked: '1px solid #4f46e5',
    borderFocus: '1px solid #818cf8',
    borderDisabled: '1px solid rgba(255, 255, 255, 0.1)',
    borderDisabledChecked: '1px solid #3730a3',
    borderRadius: '6px',
    checkMarkColor: '#ffffff',
  },

  Radio: {
    color: '#0f172a',
    colorDisabled: '#1e293b',
    colorActive: '#4f46e5',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderActive: '1px solid #4f46e5',
    borderDisabled: '1px solid rgba(255, 255, 255, 0.1)',
    borderDisabledActive: '1px solid #3730a3',
    boxShadowActive: '0 0 0 3px rgba(129, 140, 248, 0.15)',
    textColor: '#e2e8f0',
    textColorDisabled: '#64748b',
    dotColorActive: '#4f46e5',
    dotColorDisabled: '#475569',
  },

  Switch: {
    color: '#334155',
    colorActive: '#4f46e5',
    colorDisabled: '#1e293b',
    colorDisabledActive: '#3730a3',
    railColor: '#334155',
    railColorActive: '#4f46e5',
    railColorDisabled: '#1e293b',
    buttonColor: '#f1f5f9',
    buttonColorActive: '#f1f5f9',
    boxShadowFocus: '0 0 0 3px rgba(129, 140, 248, 0.15)',
  },

  Slider: {
    fillColor: '#4f46e5',
    fillColorHover: '#6366f1',
    railColor: '#334155',
    railColorHover: '#475569',
    handleColor: '#f1f5f9',
    handleColorHover: '#ffffff',
    handleColorPressed: '#e2e8f0',
    handleBoxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
    handleBoxShadowHover: '0 2px 6px rgba(0, 0, 0, 0.4)',
    handleBoxShadowPressed: '0 1px 2px rgba(0, 0, 0, 0.3)',
    handleBoxShadowFocus: '0 0 0 3px rgba(129, 140, 248, 0.2)',
  },

  Progress: {
    fillColor: '#4f46e5',
    fillColorSuccess: '#10b981',
    fillColorError: '#ef4444',
    fillColorWarning: '#f59e0b',
    railColor: '#334155',
    railColorSuccess: 'rgba(16, 185, 129, 0.2)',
    railColorError: 'rgba(239, 68, 68, 0.2)',
    railColorWarning: 'rgba(245, 158, 11, 0.2)',
    textColor: '#e2e8f0',
    textColorCircle: '#f1f5f9',
    fontSize: '12px',
    fontSizeCircle: '16px',
  },

  Badge: {
    color: '#ef4444',
    textColor: '#ffffff',
  },

  Avatar: {
    color: '#4f46e5',
    textColor: '#ffffff',
  },

  Tooltip: {
    color: '#f1f5f9',
    textColor: '#0f172a',
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.2)',
    padding: '8px 12px',
  },

  Popover: {
    color: '#1e293b',
    textColor: '#f1f5f9',
    borderRadius: '12px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.3)',
  },

  Dropdown: {
    color: '#1e293b',
    textColor: '#e2e8f0',
    optionColorHover: 'rgba(129, 140, 248, 0.12)',
    optionColorActive: 'rgba(129, 140, 248, 0.18)',
    dividerColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.3)',
  },

  Steps: {
    stepHeaderFontSize: '14px',
    indicatorColor: '#334155',
    indicatorColorProcess: '#4f46e5',
    indicatorColorWait: '#334155',
    indicatorColorFinish: '#4f46e5',
    indicatorColorError: '#ef4444',
    indicatorTextColorProcess: '#ffffff',
    indicatorTextColorWait: '#64748b',
    indicatorTextColorFinish: '#ffffff',
    indicatorTextColorError: '#ffffff',
    splitorColor: '#334155',
    splitorColorProcess: '#334155',
    headerTextColorProcess: '#f1f5f9',
    headerTextColorWait: '#64748b',
    headerTextColorFinish: '#f1f5f9',
    headerTextColorError: '#ef4444',
    descriptionTextColor: '#94a3b8',
  },

  Tabs: {
    colorSegment: '#0f172a',
    tabColorSegment: '#1e293b',
    tabColorSegmentActive: '#4f46e5',
    tabTextColorSegment: '#94a3b8',
    tabTextColorSegmentActive: '#ffffff',
    tabTextColorHover: '#e2e8f0',
    tabTextColorActive: '#818cf8',
    tabTextColorDisabled: '#475569',
    barColor: '#818cf8',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
  },

  DatePicker: {
    panelColor: '#1e293b',
    panelTextColor: '#f1f5f9',
    itemColorHover: 'rgba(129, 140, 248, 0.12)',
    itemColorActive: '#4f46e5',
    itemTextColorActive: '#ffffff',
    itemTextColorDisabled: '#64748b',
    itemColorDisabled: 'transparent',
    itemColorIncludedActive: 'rgba(79, 70, 229, 0.2)',
    itemTextColorIncludedActive: '#818cf8',
    borderRadius: '8px',
  },

  TimePicker: {
    panelColor: '#1e293b',
    itemColorHover: 'rgba(129, 140, 248, 0.12)',
    itemColorActive: '#4f46e5',
    itemTextColorActive: '#ffffff',
    itemTextColorDisabled: '#64748b',
    borderRadius: '8px',
  },

  Tree: {
    nodeColorHover: 'rgba(129, 140, 248, 0.12)',
    nodeColorSelected: 'rgba(129, 140, 248, 0.18)',
    nodeTextColor: '#e2e8f0',
    nodeTextColorSelected: '#818cf8',
  },

  Transfer: {
    listColor: '#1e293b',
    listTitleTextColor: '#94a3b8',
    headerTextColor: '#f1f5f9',
    itemColorHover: 'rgba(129, 140, 248, 0.12)',
    itemTextColor: '#e2e8f0',
  },

  Upload: {
    draggerColor: '#0f172a',
    draggerColorHover: '#1e293b',
    draggerBorderColor: 'rgba(255, 255, 255, 0.1)',
    draggerBorderColorHover: 'rgba(255, 255, 255, 0.2)',
    itemTextColor: '#e2e8f0',
    itemTextColorError: '#f87171',
    itemIconColor: '#94a3b8',
  },

  Calendar: {
    color: '#1e293b',
    textColor: '#f1f5f9',
    titleFontSize: '16px',
    dayTextColor: '#e2e8f0',
    dayTextColorDisabled: '#475569',
    dayColor: 'transparent',
    dayColorHover: 'rgba(129, 140, 248, 0.12)',
    dayColorActive: '#4f46e5',
    dayTextColorActive: '#ffffff',
    barColor: '#818cf8',
  },

  Collapse: {
    color: '#1e293b',
    textColor: '#f1f5f9',
    dividerColor: 'rgba(255, 255, 255, 0.1)',
    titleFontSize: '14px',
    titleFontWeight: '500',
    arrowColor: '#94a3b8',
  },

  Split: {
    color: '#0f172a',
    dividerColor: 'rgba(255, 255, 255, 0.1)',
  },

  Statistic: {
    labelFontSize: '14px',
    labelFontWeight: '400',
    labelTextColor: '#94a3b8',
    valueFontSize: '28px',
    valueFontWeight: '600',
    valueTextColor: '#f1f5f9',
    prefixTextColor: '#94a3b8',
    suffixTextColor: '#94a3b8',
  },

  Thing: {
    titleTextColor: '#f1f5f9',
    titleFontSize: '14px',
    titleFontWeight: '500',
    descriptionTextColor: '#94a3b8',
    descriptionFontSize: '13px',
  },

  List: {
    color: '#1e293b',
    colorHover: '#334155',
    textColor: '#e2e8f0',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },

  Log: {
    loaderColor: '#818cf8',
    highlightBackgroundColor: 'rgba(129, 140, 248, 0.15)',
  },

  Result: {
    titleTextColor: '#f1f5f9',
    titleFontSize: '20px',
    titleFontWeight: '600',
    descriptionTextColor: '#94a3b8',
    descriptionFontSize: '14px',
    iconColorSuccess: '#34d399',
    iconColorWarning: '#fbbf24',
    iconColorError: '#f87171',
    iconColorInfo: '#60a5fa',
    iconColor404: '#94a3b8',
  },

  Empty: {
    iconColor: '#475569',
    textColor: '#94a3b8',
    textColorDisabled: '#64748b',
  },

  Anchor: {
    linkTextColor: '#94a3b8',
    linkTextColorHover: '#818cf8',
    linkTextColorPressed: '#6366f1',
    linkTextColorActive: '#818cf8',
    railColor: '#334155',
    railColorActive: '#818cf8',
  },

  BackTop: {
    color: '#1e293b',
    colorHover: '#334155',
    colorPressed: '#0f172a',
    textColor: '#94a3b8',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.2)',
    boxShadowHover: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.3)',
    boxShadowPressed: '0 1px 3px rgba(0, 0, 0, 0.3)',
  },

  Breadcrumb: {
    itemTextColor: '#94a3b8',
    itemTextColorHover: '#818cf8',
    itemTextColorPressed: '#6366f1',
    itemTextColorActive: '#f1f5f9',
    separatorColor: '#475569',
    fontSize: '14px',
  },

  LoadingBar: {
    color: '#818cf8',
    colorError: '#f87171',
  },

  Skeleton: {
    color: '#334155',
    colorEnd: '#475569',
  },

  Spin: {
    color: '#818cf8',
    opacity: 0.8,
  },
};

const themeOverrides = computed<GlobalThemeOverrides>(() => {
  return resolvedTheme.value === 'dark' ? darkThemeOverrides : lightThemeOverrides;
});
</script>
