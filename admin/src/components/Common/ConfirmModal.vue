<template>
  <n-modal
    v-model:show="visible"
    preset="dialog"
    :type="type"
    :title="title"
    :positive-text="confirmText"
    :negative-text="cancelText"
    :loading="loading"
    @positive-click="handleConfirm"
    @negative-click="handleCancel"
    @close="handleCancel"
  >
    <template #icon>
      <n-icon :size="28">
        <component :is="iconComponent" />
      </n-icon>
    </template>
    <div class="confirm-modal__content">
      {{ content }}
    </div>
    <template v-if="requireInput" #action>
      <div class="confirm-modal__input">
        <n-input
          v-model:value="inputValue"
          :placeholder="`请输入 ${props.confirmInputText} 确认`"
          @keyup.enter="handleConfirm"
        />
      </div>
      <n-space justify="end" style="margin-top: 16px">
        <n-button @click="handleCancel">{{ cancelText }}</n-button>
        <n-button
          type="error"
          :loading="loading"
          :disabled="inputValue !== props.confirmInputText"
          @click="handleConfirm"
        >
          {{ confirmText }}
        </n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { NModal, NButton, NSpace, NInput, NIcon } from 'naive-ui';
import {
  AlertCircleOutline,
  WarningOutline,
  CloseCircleOutline,
  CheckmarkCircleOutline,
} from '@vicons/ionicons5';

/**
 * 确认弹窗组件
 */
const props = withDefaults(
  defineProps<{
    /** 显示状态 */
    visible: boolean;
    /** 标题 */
    title?: string;
    /** 内容 */
    content: string;
    /** 类型 */
    type?: 'info' | 'success' | 'warning' | 'error';
    /** 确认按钮文字 */
    confirmText?: string;
    /** 取消按钮文字 */
    cancelText?: string;
    /** 加载状态 */
    loading?: boolean;
    /** 是否需要输入确认 */
    requireInput?: boolean;
    /** 需要输入的确认文字 */
    confirmInputText?: string;
  }>(),
  {
    title: '确认操作',
    type: 'warning',
    confirmText: '确定',
    cancelText: '取消',
    loading: false,
    requireInput: false,
    confirmInputText: '确认删除',
  }
);

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();

const inputValue = ref('');

const iconComponent = computed(() => {
  const icons = {
    info: AlertCircleOutline,
    success: CheckmarkCircleOutline,
    warning: WarningOutline,
    error: CloseCircleOutline,
  };
  return icons[props.type];
});

const handleConfirm = () => {
  if (props.requireInput && inputValue.value !== props.confirmInputText) {
    return;
  }
  emit('confirm');
};

const handleCancel = () => {
  inputValue.value = '';
  emit('update:visible', false);
  emit('cancel');
};
</script>

<style scoped>
.confirm-modal__content {
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text, #374151);
}

.confirm-modal__input {
  margin-top: 16px;
}
</style>
