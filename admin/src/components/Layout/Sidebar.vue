<template>
  <div class="sidebar" :class="{ 'sidebar--collapsed': appStore.collapsed }">
    <div class="sidebar__brand">
      <div class="sidebar__logo">
        <span class="sidebar__logo-text">IW</span>
      </div>
      <span v-if="!appStore.collapsed" class="sidebar__title">图文生成后台</span>
    </div>
    <div class="sidebar__menu">
      <n-menu
        v-model:value="activeKey"
        :collapsed="appStore.collapsed"
        :collapsed-width="72"
        :collapsed-icon-size="22"
        :options="menuOptions"
        @update:value="handleSelect"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, h, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { NMenu, NIcon } from 'naive-ui';
import type { MenuOption } from 'naive-ui';
import { useAppStore } from '@/store/modules/app';
import { StatsChartOutline, AlbumsOutline, ImageOutline, PeopleOutline, SettingsOutline } from '@vicons/ionicons5';

const router = useRouter();
const route = useRoute();
const appStore = useAppStore();

const activeKey = ref(route.name as string);

watch(
  () => route.name,
  (name) => {
    if (typeof name === 'string') {
      activeKey.value = name;
    }
  }
);

const renderIcon = (icon: any) => () =>
  h(NIcon, null, {
    default: () => h(icon),
  });

const menuOptions = computed<MenuOption[]>(() => [
  {
    key: 'Dashboard',
    label: '数据面板',
    icon: renderIcon(StatsChartOutline),
  },
  {
    key: 'Category',
    label: '分类管理',
    icon: renderIcon(AlbumsOutline),
  },
  {
    key: 'Works',
    label: '作品管理',
    icon: renderIcon(ImageOutline),
  },
  {
    key: 'User',
    label: '用户管理',
    icon: renderIcon(PeopleOutline),
  },
  {
    key: 'System',
    label: '系统设置',
    icon: renderIcon(SettingsOutline),
  },
]);

const handleSelect = (key: string) => {
  router.push({ name: key });
};
</script>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--color-bg-card);
}

.sidebar__brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: var(--spacing-5) var(--spacing-4);
  border-bottom: 1px solid var(--color-border);
}

.sidebar--collapsed .sidebar__brand {
  justify-content: center;
  padding: var(--spacing-5) var(--spacing-3);
}

.sidebar__logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-lg);
  background: var(--primary-gradient);
  box-shadow: var(--shadow-sm);
  flex-shrink: 0;
}

.sidebar__logo-text {
  font-size: 18px;
  font-weight: 700;
  color: white;
  letter-spacing: -0.5px;
}

.sidebar__title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
  letter-spacing: -0.3px;
}

.sidebar__menu {
  flex: 1;
  padding: var(--spacing-3) 0;
  overflow-y: auto;
}

.sidebar__menu :deep(.n-menu) {
  --n-item-height: 48px;
}

.sidebar__menu :deep(.n-menu-item) {
  margin: 2px var(--spacing-3);
  border-radius: var(--radius-lg);
}

.sidebar__menu :deep(.n-menu-item-content) {
  padding: 0 var(--spacing-3);
  border-radius: var(--radius-lg);
}

.sidebar__menu :deep(.n-menu-item-content--selected) {
  background: var(--primary-gradient) !important;
  box-shadow: var(--shadow-sm);
}

.sidebar__menu :deep(.n-menu-item-content--selected .n-menu-item-content__icon),
.sidebar__menu :deep(.n-menu-item-content--selected .n-menu-item-content-header) {
  color: white !important;
}

.sidebar__menu :deep(.n-menu-item-content:hover:not(.n-menu-item-content--selected)) {
  background: var(--color-bg-hover) !important;
}
</style>
