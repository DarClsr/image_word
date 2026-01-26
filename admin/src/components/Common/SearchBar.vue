<template>
  <n-card class="search-bar" size="small" :bordered="false">
    <n-form
      ref="formRef"
      :model="modelValue"
      label-placement="left"
      :label-width="labelWidth"
      :show-feedback="false"
    >
      <n-grid :x-gap="16" :y-gap="16" :cols="cols" responsive="screen">
        <slot></slot>
        <n-gi class="search-bar__actions" :span="actionSpan">
          <n-space>
            <n-button type="primary" :loading="loading" @click="handleSearch">
              <template #icon>
                <n-icon><SearchOutline /></n-icon>
              </template>
              搜索
            </n-button>
            <n-button @click="handleReset">
              <template #icon>
                <n-icon><RefreshOutline /></n-icon>
              </template>
              重置
            </n-button>
            <slot name="extra"></slot>
          </n-space>
        </n-gi>
      </n-grid>
    </n-form>
  </n-card>
</template>

<script setup lang="ts">
import {
  NCard,
  NForm,
  NGrid,
  NGi,
  NSpace,
  NButton,
  NIcon,
} from 'naive-ui';
import { SearchOutline, RefreshOutline } from '@vicons/ionicons5';

/**
 * 搜索栏组件
 */
withDefaults(
  defineProps<{
    /** 表单数据 */
    modelValue: Record<string, unknown>;
    /** 加载状态 */
    loading?: boolean;
    /** 标签宽度 */
    labelWidth?: number | string;
    /** 列数配置 */
    cols?: string;
    /** 操作区占用列数 */
    actionSpan?: number;
  }>(),
  {
    loading: false,
    labelWidth: 80,
    cols: '1 s:2 m:3 l:4',
    actionSpan: 1,
  }
);

const emit = defineEmits<{
  (e: 'search'): void;
  (e: 'reset'): void;
  (e: 'update:modelValue', value: Record<string, unknown>): void;
}>();

const handleSearch = () => {
  emit('search');
};

const handleReset = () => {
  emit('reset');
};
</script>

<style scoped>
.search-bar {
  background: var(--color-bg-card, #fff);
  border-radius: 12px;
  margin-bottom: 16px;
}

.search-bar :deep(.n-card__content) {
  padding: 16px 20px;
}

.search-bar__actions {
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
}

@media (max-width: 640px) {
  .search-bar__actions {
    justify-content: flex-start;
  }
}
</style>
