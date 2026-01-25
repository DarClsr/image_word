<template>
  <n-layout has-sider class="layout-root">
    <n-layout-sider
      bordered
      collapse-mode="width"
      :collapsed-width="64"
      :width="240"
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
}

.layout-sider {
  width: 220px;
  background: var(--color-bg-card, #fff);
}

.layout-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--app-bg);
}

.layout-content :deep(.n-layout-scroll-container) {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.layout-main {
  flex: 1;
  min-height: 0;
  padding: 24px;
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
