<template>
  <div class="page-header">
    <div class="page-header__main">
      <div class="page-header__info">
        <h1 class="page-header__title">{{ title }}</h1>
        <p v-if="subtitle" class="page-header__subtitle">{{ subtitle }}</p>
      </div>
      <div v-if="$slots.default" class="page-header__actions">
        <slot></slot>
      </div>
    </div>
    <div v-if="$slots.extra" class="page-header__extra">
      <slot name="extra"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 页面标题组件
 */
defineProps<{
  /** 标题 */
  title: string;
  /** 副标题 */
  subtitle?: string;
}>();
</script>

<style scoped>
.page-header {
  margin: var(--space-4) 0 var(--space-6);
  padding: var(--space-5);
  background: var(--color-bg-card);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}

.page-header__main {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.page-header__info {
  flex: 1;
  min-width: 0;
}

.page-header__title {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  color: var(--color-text, #111827);
  line-height: 1.4;
}

.page-header__subtitle {
  margin: 6px 0 0;
  font-size: 14px;
  color: var(--color-muted, #6b7280);
  line-height: 1.5;
}

.page-header__actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.page-header__extra {
  margin-top: 16px;
}

@media (max-width: 640px) {
  .page-header__main {
    flex-direction: column;
    align-items: stretch;
  }

  .page-header__actions {
    margin-top: 12px;
  }
}
</style>
