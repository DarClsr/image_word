<template>
  <div class="image-preview">
    <!-- 缩略图 -->
    <div
      class="image-preview__thumb"
      :style="{ width: `${size}px`, height: `${size}px` }"
      @click="handlePreview"
    >
      <img
        v-if="src"
        :src="src"
        :alt="alt"
        class="image-preview__img"
        @error="handleError"
      />
      <div v-else class="image-preview__placeholder">
        <n-icon :size="24"><ImageOutline /></n-icon>
      </div>
      <div v-if="src" class="image-preview__overlay">
        <n-icon :size="20"><ExpandOutline /></n-icon>
      </div>
    </div>

    <!-- 预览弹窗 -->
    <n-modal v-model:show="showModal" preset="card" class="image-preview__modal">
      <template #header>
        <span>{{ alt || '图片预览' }}</span>
      </template>
      <div class="image-preview__full">
        <img :src="src" :alt="alt" />
      </div>
      <template #footer>
        <n-space justify="center">
          <n-button @click="handleDownload">
            <template #icon>
              <n-icon><DownloadOutline /></n-icon>
            </template>
            下载
          </n-button>
          <n-button @click="showModal = false">关闭</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { NModal, NButton, NSpace, NIcon } from 'naive-ui';
import { ImageOutline, ExpandOutline, DownloadOutline } from '@vicons/ionicons5';

/**
 * 图片预览组件
 */
const props = withDefaults(
  defineProps<{
    /** 图片地址 */
    src?: string;
    /** 图片描述 */
    alt?: string;
    /** 缩略图尺寸 */
    size?: number;
    /** 文件名（下载用） */
    filename?: string;
  }>(),
  {
    size: 80,
    alt: '图片',
  }
);

const showModal = ref(false);

const handlePreview = () => {
  if (props.src) {
    showModal.value = true;
  }
};

const handleError = (e: Event) => {
  const target = e.target as HTMLImageElement;
  target.style.display = 'none';
};

const handleDownload = () => {
  if (!props.src) return;

  const link = document.createElement('a');
  link.href = props.src;
  link.download = props.filename || `image_${Date.now()}.png`;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
</script>

<style scoped>
.image-preview__thumb {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  background: var(--color-bg-page, #f5f7f9);
  border: 1px solid var(--color-border, #e5e7eb);
  transition: all 0.2s ease;
}

.image-preview__thumb:hover {
  border-color: var(--color-primary, #3b82f6);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.image-preview__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-preview__placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-muted, #9ca3af);
}

.image-preview__overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.image-preview__thumb:hover .image-preview__overlay {
  opacity: 1;
}

.image-preview__modal {
  width: min(90vw, 800px);
}

.image-preview__full {
  display: flex;
  align-items: center;
  justify-content: center;
  max-height: 70vh;
  overflow: auto;
}

.image-preview__full img {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  border-radius: 8px;
}
</style>
