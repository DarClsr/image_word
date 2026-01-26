<template>
  <section class="page">
    <PageHeader title="系统设置" subtitle="管理系统配置和查看操作日志" />

    <n-tabs type="line" animated>
      <n-tab-pane name="config" tab="系统配置">
        <n-card class="config-card" :bordered="false">
          <n-form
            ref="configFormRef"
            :model="configForm"
            label-placement="left"
            label-width="140"
            require-mark-placement="right-hanging"
          >
            <n-divider title-placement="left">基础设置</n-divider>

            <n-form-item label="系统名称">
              <n-input v-model:value="configForm.siteName" placeholder="系统名称" style="max-width: 400px" />
            </n-form-item>

            <n-form-item label="系统 Logo">
              <n-input v-model:value="configForm.logo" placeholder="Logo URL" style="max-width: 400px" />
            </n-form-item>

            <n-divider title-placement="left">用户配置</n-divider>

            <n-form-item label="免费用户每日额度">
              <n-input-number v-model:value="configForm.freeQuotaDaily" :min="0" style="width: 200px" />
            </n-form-item>

            <n-form-item label="基础会员每日额度">
              <n-input-number v-model:value="configForm.basicQuotaDaily" :min="0" style="width: 200px" />
            </n-form-item>

            <n-form-item label="专业会员每日额度">
              <n-input-number v-model:value="configForm.proQuotaDaily" :min="0" style="width: 200px" />
            </n-form-item>

            <n-divider title-placement="left">审核配置</n-divider>

            <n-form-item label="自动审核">
              <n-switch v-model:value="configForm.autoAudit">
                <template #checked>开启</template>
                <template #unchecked>关闭</template>
              </n-switch>
            </n-form-item>

            <n-form-item label="敏感词过滤">
              <n-switch v-model:value="configForm.sensitiveFilter">
                <template #checked>开启</template>
                <template #unchecked>关闭</template>
              </n-switch>
            </n-form-item>

            <n-divider title-placement="left">模型配置</n-divider>

            <n-form-item label="默认模型">
              <n-select
                v-model:value="configForm.defaultModel"
                :options="modelOptions"
                style="width: 200px"
              />
            </n-form-item>

            <n-form-item label="最大生成尺寸">
              <n-input-number v-model:value="configForm.maxSize" :min="512" :max="4096" :step="64" style="width: 200px" />
              <span style="margin-left: 8px; color: #9ca3af">px</span>
            </n-form-item>

            <n-form-item>
              <n-button type="primary" :loading="configSaving" @click="handleSaveConfig">
                保存配置
              </n-button>
            </n-form-item>
          </n-form>
        </n-card>
      </n-tab-pane>

      <n-tab-pane name="log" tab="操作日志">
        <n-card class="log-card" :bordered="false">
          <!-- 筛选 -->
          <n-space style="margin-bottom: 16px">
            <n-select
              v-model:value="logQuery.action"
              :options="actionOptions"
              placeholder="操作类型"
              clearable
              style="width: 140px"
            />
            <n-select
              v-model:value="logQuery.module"
              :options="moduleOptions"
              placeholder="操作模块"
              clearable
              style="width: 140px"
            />
            <n-date-picker
              v-model:value="logQuery.dateRange"
              type="daterange"
              clearable
              style="width: 240px"
            />
            <n-button type="primary" @click="handleSearchLog">搜索</n-button>
          </n-space>

          <!-- 日志列表 -->
          <n-data-table
            :columns="logColumns"
            :data="logList"
            :loading="logLoading"
            :pagination="logPagination"
            striped
          />
        </n-card>
      </n-tab-pane>
    </n-tabs>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, h } from 'vue';
import {
  NCard,
  NTabs,
  NTabPane,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NSelect,
  NSwitch,
  NButton,
  NSpace,
  NDatePicker,
  NDataTable,
  NDivider,
  NTag,
  useMessage,
  type DataTableColumns,
} from 'naive-ui';
import { PageHeader } from '@/components/Common';
import { formatDateTime } from '@/utils/format';

const message = useMessage();

/** 系统配置表单 */
const configForm = reactive({
  siteName: '图文生成管理系统',
  logo: '',
  freeQuotaDaily: 5,
  basicQuotaDaily: 30,
  proQuotaDaily: 100,
  autoAudit: false,
  sensitiveFilter: true,
  defaultModel: 'sdxl',
  maxSize: 2048,
});

const configSaving = ref(false);

const modelOptions = [
  { label: 'SDXL', value: 'sdxl' },
  { label: 'Flux', value: 'flux' },
  { label: 'DALL·E', value: 'dalle' },
];

/** 保存配置 */
const handleSaveConfig = () => {
  configSaving.value = true;
  setTimeout(() => {
    configSaving.value = false;
    message.success('配置保存成功');
  }, 500);
};

/** 操作日志 */
const logQuery = reactive({
  action: null as string | null,
  module: null as string | null,
  dateRange: null as [number, number] | null,
});

const logLoading = ref(false);

const actionOptions = [
  { label: '登录', value: 'login' },
  { label: '创建', value: 'create' },
  { label: '更新', value: 'update' },
  { label: '删除', value: 'delete' },
  { label: '审核', value: 'audit' },
  { label: '封禁', value: 'ban' },
];

const moduleOptions = [
  { label: '用户', value: 'user' },
  { label: '作品', value: 'works' },
  { label: '分类', value: 'category' },
  { label: '系统', value: 'system' },
];

interface AuditLog {
  id: number;
  adminName: string;
  action: string;
  module: string;
  targetId: number | null;
  description: string;
  ip: string;
  createdAt: string;
}

const logList = ref<AuditLog[]>([
  { id: 1, adminName: 'admin', action: 'login', module: 'system', targetId: null, description: '管理员登录', ip: '192.168.1.100', createdAt: '2026-01-26T08:30:00Z' },
  { id: 2, adminName: 'admin', action: 'audit', module: 'works', targetId: 102, description: '审核通过作品 #102', ip: '192.168.1.100', createdAt: '2026-01-26T08:25:00Z' },
  { id: 3, adminName: 'admin', action: 'ban', module: 'user', targetId: 45, description: '封禁用户 #45', ip: '192.168.1.100', createdAt: '2026-01-26T08:20:00Z' },
  { id: 4, adminName: 'admin', action: 'create', module: 'category', targetId: 12, description: '创建分类「极简风格」', ip: '192.168.1.100', createdAt: '2026-01-26T08:15:00Z' },
  { id: 5, adminName: 'admin', action: 'update', module: 'system', targetId: null, description: '更新系统配置', ip: '192.168.1.100', createdAt: '2026-01-26T08:10:00Z' },
]);

const logPagination = reactive({
  page: 1,
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  itemCount: 5,
});

const logColumns: DataTableColumns<AuditLog> = [
  { title: 'ID', key: 'id', width: 60 },
  { title: '操作人', key: 'adminName', width: 100 },
  {
    title: '操作类型',
    key: 'action',
    width: 100,
    render: (row) => {
      const typeMap: Record<string, 'default' | 'info' | 'success' | 'warning' | 'error'> = {
        login: 'info',
        create: 'success',
        update: 'warning',
        delete: 'error',
        audit: 'success',
        ban: 'error',
      };
      const textMap: Record<string, string> = {
        login: '登录',
        create: '创建',
        update: '更新',
        delete: '删除',
        audit: '审核',
        ban: '封禁',
      };
      return h(NTag, { type: typeMap[row.action] || 'default', size: 'small' }, () => textMap[row.action] || row.action);
    },
  },
  {
    title: '模块',
    key: 'module',
    width: 80,
    render: (row) => {
      const textMap: Record<string, string> = {
        user: '用户',
        works: '作品',
        category: '分类',
        system: '系统',
      };
      return textMap[row.module] || row.module;
    },
  },
  { title: '描述', key: 'description', ellipsis: { tooltip: true } },
  { title: 'IP', key: 'ip', width: 130 },
  {
    title: '时间',
    key: 'createdAt',
    width: 160,
    render: (row) => formatDateTime(row.createdAt),
  },
];

/** 搜索日志 */
const handleSearchLog = () => {
  logPagination.page = 1;
  // 调用 API
};
</script>

<style scoped>
.page {
  width: 100%;
}

.config-card,
.log-card {
  border-radius: 12px;
  margin-top: 16px;
}
</style>
