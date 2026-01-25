<template>
  <section class="page">
    <n-space vertical size="large">
      <n-page-header title="分类管理" subtitle="维护分类、排序与启用状态。" />
      <n-card>
        <n-space align="center" justify="space-between">
          <n-input v-model:value="keyword" placeholder="搜索分类" clearable />
          <n-space>
            <n-button type="primary" @click="openCreate">新增分类</n-button>
            <n-button @click="sortByCount">按作品数排序</n-button>
          </n-space>
        </n-space>
      </n-card>
      <n-card title="分类列表">
        <n-data-table :columns="columns" :data="filteredData" :bordered="false" :row-key="rowKey" />
      </n-card>
    </n-space>

    <n-modal v-model:show="showModal">
      <n-card class="modal-card" title="分类信息" :bordered="false" size="large">
        <n-form :model="form" label-placement="left" label-width="80">
          <n-form-item label="分类名称">
            <n-input v-model:value="form.name" placeholder="请输入分类名称" />
          </n-form-item>
          <n-form-item label="启用状态">
            <n-switch v-model:value="form.status" />
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
  NModal,
  NPageHeader,
  NSpace,
  NSwitch,
  NTag,
  useMessage,
} from 'naive-ui';

interface CategoryItem {
  id: number;
  name: string;
  count: number;
  status: boolean;
  updatedAt: string;
}

const keyword = ref('');
const showModal = ref(false);
const editingId = ref<number | null>(null);
const message = useMessage();

const form = reactive({
  name: '',
  status: true,
});

const data = ref<CategoryItem[]>([
  { id: 1, name: '国风', count: 128, status: true, updatedAt: '2026-01-25' },
  { id: 2, name: '写实', count: 86, status: true, updatedAt: '2026-01-24' },
  { id: 3, name: '动漫', count: 45, status: false, updatedAt: '2026-01-22' },
]);

const formatDate = () => new Date().toISOString().slice(0, 10);

const rowKey = (row: CategoryItem) => row.id;

const filteredData = computed(() => {
  if (!keyword.value) return data.value;
  return data.value.filter((item) => item.name.includes(keyword.value));
});

const openCreate = () => {
  editingId.value = null;
  form.name = '';
  form.status = true;
  showModal.value = true;
};

const openEdit = (row: CategoryItem) => {
  editingId.value = row.id;
  form.name = row.name;
  form.status = row.status;
  showModal.value = true;
};

const handleSave = () => {
  if (!form.name.trim()) {
    message.warning('请输入分类名称');
    return;
  }

  if (editingId.value === null) {
    const id = Math.max(0, ...data.value.map((item) => item.id)) + 1;
    data.value.unshift({
      id,
      name: form.name.trim(),
      count: 0,
      status: form.status,
      updatedAt: formatDate(),
    });
    message.success('新增分类成功');
  } else {
    const target = data.value.find((item) => item.id === editingId.value);
    if (target) {
      target.name = form.name.trim();
      target.status = form.status;
      target.updatedAt = formatDate();
      message.success('编辑分类成功');
    }
  }

  showModal.value = false;
};

const toggleStatus = (row: CategoryItem, value: boolean) => {
  row.status = value;
  row.updatedAt = formatDate();
};

const handleDelete = (row: CategoryItem) => {
  data.value = data.value.filter((item) => item.id !== row.id);
  message.success('已删除分类');
};

const sortByCount = () => {
  data.value = [...data.value].sort((a, b) => b.count - a.count);
};

const columns: DataTableColumns<CategoryItem> = [
  { title: '分类名称', key: 'name' },
  { title: '作品数', key: 'count' },
  {
    title: '状态',
    key: 'status',
    render(row) {
      return h(
        NTag,
        { type: row.status ? 'success' : 'default', round: true, size: 'small' },
        { default: () => (row.status ? '启用' : '停用') }
      );
    },
  },
  { title: '更新时间', key: 'updatedAt' },
  {
    title: '操作',
    key: 'actions',
    render(row) {
      return h(
        NSpace,
        { size: 8 },
        {
          default: () => [
            h(
              NButton,
              { size: 'small', onClick: () => openEdit(row) },
              { default: () => '编辑' }
            ),
            h(
              NButton,
              {
                size: 'small',
                type: row.status ? 'warning' : 'success',
                onClick: () => toggleStatus(row, !row.status),
              },
              { default: () => (row.status ? '停用' : '启用') }
            ),
            h(
              NButton,
              { size: 'small', type: 'error', onClick: () => handleDelete(row) },
              { default: () => '删除' }
            ),
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
  width: min(420px, 94vw);
}
</style>
