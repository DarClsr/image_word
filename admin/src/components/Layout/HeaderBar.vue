<template>
  <n-layout-header class="header">
    <div class="header__left">
      <n-button quaternary circle class="header__toggle" @click="appStore.toggleSidebar()">
        <template #icon>
          <n-icon size="20">
            <MenuOutline />
          </n-icon>
        </template>
      </n-button>
      <n-breadcrumb class="header__breadcrumb">
        <n-breadcrumb-item v-for="item in breadcrumb" :key="item.path">
          {{ item.label }}
        </n-breadcrumb-item>
      </n-breadcrumb>
    </div>
    <div class="header__right">
      <n-popselect v-model:value="theme" :options="themeOptions" trigger="hover">
        <n-button quaternary circle class="header__btn">
          <template #icon>
            <n-icon size="20">
              <ColorPaletteOutline />
            </n-icon>
          </template>
        </n-button>
      </n-popselect>
      <n-dropdown :options="userMenu" @select="handleMenuSelect">
        <div class="header__user">
          <n-avatar round size="medium" class="header__avatar">A</n-avatar>
          <span class="header__username">Admin</span>
          <n-icon size="16" class="header__arrow">
            <ChevronDownOutline />
          </n-icon>
        </div>
      </n-dropdown>
    </div>
  </n-layout-header>
</template>

<script setup lang="ts">
import { computed, h } from 'vue';
import { useRoute } from 'vue-router';
import {
  NBreadcrumb,
  NBreadcrumbItem,
  NButton,
  NDropdown,
  NIcon,
  NLayoutHeader,
  NAvatar,
  NPopselect,
} from 'naive-ui';
import { ColorPaletteOutline, MenuOutline, LogOutOutline, ChevronDownOutline } from '@vicons/ionicons5';
import { useAppStore, type ThemeMode } from '@/store/modules/app';
import { useAuthStore } from '@/store/modules/auth';
import { useTheme } from '@/composables/useTheme';

const route = useRoute();
const appStore = useAppStore();
const authStore = useAuthStore();
const { setTheme } = useTheme();

const theme = computed({
  get: () => appStore.theme,
  set: (value: string) => setTheme(value as ThemeMode),
});

const breadcrumb = computed(() => {
  const matched = route.matched.filter((item) => item.meta?.title);
  return matched.map((item) => ({
    path: item.path,
    label: item.meta!.title as string,
  }));
});

const themeOptions = [
  { label: '亮色模式', value: 'light' },
  { label: '暗色模式', value: 'dark' },
];

const userMenu = [
  {
    label: '退出登录',
    key: 'logout',
    icon: () =>
      h(NIcon, null, {
        default: () => h(LogOutOutline),
      }),
  },
];

const handleMenuSelect = (key: string) => {
  if (key === 'logout') {
    authStore.reset();
  }
};
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-6);
  height: 72px;
  background: var(--color-bg-card);
  border-bottom: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}

.header__left {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
}

.header__toggle {
  color: var(--color-text-secondary);
}

.header__toggle:hover {
  color: var(--color-text-primary);
  background: var(--color-bg-hover) !important;
}

.header__breadcrumb {
  font-size: 14px;
}

.header__breadcrumb :deep(.n-breadcrumb-item__link) {
  color: var(--color-text-secondary);
  font-weight: 500;
}

.header__breadcrumb :deep(.n-breadcrumb-item__link:hover) {
  color: var(--primary-color);
}

.header__breadcrumb :deep(.n-breadcrumb-item__separator) {
  color: var(--color-text-disabled);
  margin: 0 var(--spacing-2);
}

.header__right {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.header__btn {
  color: var(--color-text-secondary);
}

.header__btn:hover {
  color: var(--color-text-primary);
  background: var(--color-bg-hover) !important;
}

.header__user {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.header__user:hover {
  background: var(--color-bg-hover);
}

.header__avatar {
  background: var(--primary-gradient);
  color: white;
  font-weight: 600;
}

.header__username {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.header__arrow {
  color: var(--color-text-disabled);
}
</style>
