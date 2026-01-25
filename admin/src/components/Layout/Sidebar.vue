<template>
  <div class="sidebar" :class="{ 'sidebar--collapsed': appStore.collapsed }">
    <div class="sidebar__brand">
      <span class="sidebar__logo">IW</span>
      <span v-if="!appStore.collapsed" class="sidebar__title">图文生成后台</span>
    </div>
    <n-menu
      v-model:value="activeKey"
      :collapsed="appStore.collapsed"
       :collapsed-width="64"
          :collapsed-icon-size="22"
      :options="menuOptions"
      @update:value="handleSelect"
    />
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
}



.sidebar__brand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-weight: 600;
  font-size: 16px;
  padding: 16px 12px;
}

.sidebar--collapsed .sidebar__brand {
  justify-content: center;
}

.sidebar__logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--primary-color, #18a058);
  color: #fff;
}
</style>
