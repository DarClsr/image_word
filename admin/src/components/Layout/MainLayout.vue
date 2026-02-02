<template>
  <n-layout has-sider class="layout-root">
    <n-layout-sider
      collapse-mode="width"
      :collapsed-width="72"
      :width="260"
      :collapsed="appStore.collapsed"
      :native-scrollbar="false"
      class="layout-sider"
      @collapse="appStore.collapsed = true"
      @expand="appStore.collapsed = false"
    >
      <Sidebar />
    </n-layout-sider>
    <n-layout class="layout-content">
      <HeaderBar />
      <n-layout-content class="layout-main">
        <router-view />
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<script setup lang="ts">
import { NLayout, NLayoutSider, NLayoutContent } from 'naive-ui';
import { useAppStore } from '@/store/modules/app';
import Sidebar from './Sidebar.vue';
import HeaderBar from './HeaderBar.vue';

const appStore = useAppStore();
</script>

<style scoped>
.layout-root {
  height: 100vh;
  background: var(--app-bg-gradient);
}

.layout-sider {
  background: var(--color-bg-card);
  border-right: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}

.layout-sider :deep(.n-layout-sider-scroll-container) {
  display: flex;
  flex-direction: column;
}

.layout-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: transparent;
}

.layout-content :deep(.n-layout-scroll-container) {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.layout-main {
  flex: 1;
  min-height: 0;
  padding: var(--spacing-6);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: transparent;
}

.layout-main :deep(.n-layout-scroll-container) {
  flex: 1;
  min-height: 0;
}
</style>
