<template>
  <n-layout-header bordered class="header">
    <div class="header__left">
      <n-button quaternary circle @click="appStore.toggleSidebar()">
        <template #icon>
          <n-icon>
            <MenuOutline />
          </n-icon>
        </template>
      </n-button>
      <n-breadcrumb>
        <n-breadcrumb-item v-for="item in breadcrumb" :key="item.path">
          {{ item.label }}
        </n-breadcrumb-item>
      </n-breadcrumb>
    </div>
    <div class="header__right">
      <n-popselect v-model:value="theme" :options="themeOptions" trigger="hover">
        <n-button quaternary circle>
          <template #icon>
            <n-icon>
              <ColorPaletteOutline />
            </n-icon>
          </template>
        </n-button>
      </n-popselect>
      <n-dropdown :options="userMenu" @select="handleMenuSelect">
        <n-avatar round size="medium">A</n-avatar>
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
import { ColorPaletteOutline, MenuOutline, LogOutOutline } from '@vicons/ionicons5';
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
  padding: 0 24px;
  height: 64px;
  background: var(--color-bg-card, #fff);
}

.header__left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header__right {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>
