<template>
  <section class="page">
    <n-space vertical size="large">
      <n-page-header title="用户管理" subtitle="查看用户列表、封禁与配额管理。" />
      <n-card>
        <n-space align="center" justify="space-between" wrap>
          <n-space>
            <n-input v-model:value="keyword" placeholder="搜索用户名/邮箱" clearable />
            <n-select v-model:value="statusFilter" :options="statusOptions" />
          </n-space>
          <n-button type="primary" @click="openCreate">新增用户</n-button>
        </n-space>
      </n-card>
      <n-card title="用户列表">
        <n-data-table :columns="columns" :data="filteredData" :bordered="false" :row-key="rowKey" />
      </n-card>
    </n-space>

    <n-modal v-model:show="showModal">
      <n-card class="modal-card" title="用户信息" :bordered="false" size="large">
        <n-form :model="form" label-placement="left" label-width="80">
          <n-form-item label="用户名">
            <n-input v-model:value="form.username" placeholder="请输入用户名" />
          </n-form-item>
          <n-form-item label="邮箱">
            <n-input v-model:value="form.email" placeholder="请输入邮箱" />
          </n-form-item>
          <n-form-item label="配额">
            <n-input-number v-model:value="form.quota" :min="0" />
          </n-form-item>
          <n-form-item label="启用状态">
            <n-switch v-model:value="form.active" />
          </n-form-item>
        </n-form>
        <template #footer>
          <n-space justify="end">
            <n-button @click="showModal = false">取消</n-button>
            <n-button type="primary" @click="handleSave">保存</n-button>
          </n-space>
        </template>
      </n-card>
    </n-modal>
  </section>
</template>

<script setup lang="ts">
import { computed, h, reactive, ref } from 'vue';
import type { DataTableColumns } from 'naive-ui';
import {
  NButton,
  NCard,
  NDataTable,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NModal,
  NPageHeader,
  NSelect,
  NSpace,
  NSwitch,
  NTag,
  useMessage,
} from 'naive-ui';

interface UserItem {
  id: number;
  username: string;
  email: string;
  quota: number;
  active: boolean;
  createdAt: string;
}

const keyword = ref('');
const statusFilter = ref<'all' | 'active' | 'disabled'>('all');
const showModal = ref(false);
const editingId = ref<number | null>(null);
const message = useMessage();

const statusOptions = [
  { label: '全部状态', value: 'all' },
  { label: '启用', value: 'active' },
  { label: '停用', value: 'disabled' },
];

const form = reactive({
  username: '',
  email: '',
  quota: 100,
  active: true,
});

const data = ref<UserItem[]>([
  { id: 1, username: 'admin', email: 'admin@example.com', quota: 500, active: true, createdAt: '2026-01-20' },
  { id: 2, username: 'user_001', email: 'user001@example.com', quota: 120, active: true, createdAt: '2026-01-22' },
  { id: 3, username: 'user_002', email: 'user002@example.com', quota: 0, active: false, createdAt: '2026-01-23' },
]);

const rowKey = (row: UserItem) => row.id;

const filteredData = computed(() => {
  return data.value.filter((item) => {
    const matchesKeyword =
      !keyword.value || item.username.includes(keyword.value) || item.email.includes(keyword.value);
    const matchesStatus =
      statusFilter.value === 'all' ||
      (statusFilter.value === 'active' ? item.active : !item.active);
    return matchesKeyword && matchesStatus;
  });
});

const openCreate = () => {
  editingId.value = null;
  form.username = '';
  form.email = '';
  form.quota = 100;
  form.active = true;
  showModal.value = true;
};

const openEdit = (row: UserItem) => {
  editingId.value = row.id;
  form.username = row.username;
  form.email = row.email;
  form.quota = row.quota;
  form.active = row.active;
  showModal.value = true;
};

const handleSave = () => {
  if (!form.username.trim()) {
    message.warning('请输入用户名');
    return;
  }
  if (!form.email.trim()) {
    message.warning('请输入邮箱');
    return;
  }

  if (editingId.value === null) {
    const id = Math.max(0, ...data.value.map((item) => item.id)) + 1;
    data.value.unshift({
      id,
      username: form.username.trim(),
      email: form.email.trim(),
      quota: form.quota,
      active: form.active,
      createdAt: new Date().toISOString().slice(0, 10),
    });
    message.success('新增用户成功');
  } else {
    const target = data.value.find((item) => item.id === editingId.value);
    if (target) {
      target.username = form.username.trim();
      target.email = form.email.trim();
      target.quota = form.quota;
      target.active = form.active;
      message.success('更新用户成功');
    }
  }

  showModal.value = false;
};

const toggleStatus = (row: UserItem) => {
  row.active = !row.active;
  message.success(row.active ? '已启用用户' : '已停用用户');
};

const resetQuota = (row: UserItem) => {
  row.quota = 100;
  message.success('已重置配额');
};

const columns: DataTableColumns<UserItem> = [
  { title: '用户名', key: 'username' },
  { title: '邮箱', key: 'email' },
  { title: '配额', key: 'quota' },
  {
    title: '状态',
    key: 'active',
    render(row) {
      return h(
        NTag,
        { type: row.active ? 'success' : 'default', round: true, size: 'small' },
        { default: () => (row.active ? '启用' : '停用') }
      );
    },
  },
  { title: '注册时间', key: 'createdAt' },
  {
    title: '操作',
    key: 'actions',
    render(row) {
      return h(
        NSpace,
        { size: 8 },
        {
          default: () => [
            h(NButton, { size: 'small', onClick: () => openEdit(row) }, { default: () => '编辑' }),
            h(
              NButton,
              { size: 'small', type: row.active ? 'warning' : 'success', onClick: () => toggleStatus(row) },
              { default: () => (row.active ? '停用' : '启用') }
            ),
            h(NButton, { size: 'small', onClick: () => resetQuota(row) }, { default: () => '重置配额' }),
          ],
        }
      );
    },
  },
];
</script>

<style scoped>
.page {
  width: 100%;
}

.modal-card {
  width: min(460px, 94vw);
}
</style>
