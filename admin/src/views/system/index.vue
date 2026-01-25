<template>
  <section class="page">
    <n-space vertical size="large">
      <n-page-header title="系统设置" subtitle="全局配置、公告与安全策略。" />
      <n-card title="基础配置">
        <n-form :model="settings" label-placement="left" label-width="100">
          <n-form-item label="站点名称">
            <n-input v-model:value="settings.siteName" placeholder="图文生成后台" />
          </n-form-item>
          <n-form-item label="公告">
            <n-input v-model:value="settings.announcement" type="textarea" placeholder="输入全站公告" />
          </n-form-item>
          <n-form-item label="默认配额">
            <n-input-number v-model:value="settings.defaultQuota" :min="0" />
          </n-form-item>
          <n-form-item label="默认主题">
            <n-select v-model:value="settings.defaultTheme" :options="themeOptions" />
          </n-form-item>
          <n-form-item label="启用审核">
            <n-switch v-model:value="settings.enableAudit" />
          </n-form-item>
        </n-form>
        <template #footer>
          <n-space justify="end">
            <n-button @click="resetSettings">重置</n-button>
            <n-button type="primary" @click="saveSettings">保存设置</n-button>
          </n-space>
        </template>
      </n-card>

      <n-card title="安全策略">
        <n-space vertical size="large">
          <n-space justify="space-between" align="center">
            <div>
              <div class="item-title">登录失败锁定</div>
              <div class="item-desc">连续失败 5 次自动锁定 15 分钟</div>
            </div>
            <n-switch v-model:value="settings.enableLock" />
          </n-space>
          <n-space justify="space-between" align="center">
            <div>
              <div class="item-title">操作日志</div>
              <div class="item-desc">记录所有后台关键操作</div>
            </div>
            <n-switch v-model:value="settings.enableAuditLog" />
          </n-space>
        </n-space>
      </n-card>
    </n-space>
  </section>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import {
  NButton,
  NCard,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NPageHeader,
  NSelect,
  NSpace,
  NSwitch,
  useMessage,
} from 'naive-ui';

const message = useMessage();

const settings = reactive({
  siteName: '图文生成后台',
  announcement: '欢迎使用图文生成后台管理系统。',
  defaultQuota: 100,
  defaultTheme: 'auto',
  enableAudit: true,
  enableLock: true,
  enableAuditLog: true,
});

const themeOptions = [
  { label: '跟随系统', value: 'auto' },
  { label: '亮色模式', value: 'light' },
  { label: '暗色模式', value: 'dark' },
];

const resetSettings = () => {
  settings.siteName = '图文生成后台';
  settings.announcement = '欢迎使用图文生成后台管理系统。';
  settings.defaultQuota = 100;
  settings.defaultTheme = 'auto';
  settings.enableAudit = true;
  settings.enableLock = true;
  settings.enableAuditLog = true;
  message.success('已重置为默认值');
};

const saveSettings = () => {
  message.success('设置已保存（本地模拟）');
};
</script>

<style scoped>
.page {
  width: 100%;
}

.item-title {
  font-weight: 600;
}

.item-desc {
  color: #6b7280;
  font-size: 12px;
}
</style>
