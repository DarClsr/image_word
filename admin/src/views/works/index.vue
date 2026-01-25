<template>
  <section class="page">
    <n-space vertical size="large">
      <n-page-header title="作品管理" subtitle="审核、下架与管理作品。" />
      <n-card>
        <n-space align="center" justify="space-between" wrap>
          <n-space>
            <n-input v-model:value="keyword" placeholder="搜索作品标题/作者" clearable />
            <n-select v-model:value="statusFilter" :options="statusOptions" />
          </n-space>
          <n-space>
            <n-button type="primary" :disabled="!checkedRowKeys.length" @click="batchApprove">
              批量审核
            </n-button>
            <n-button :disabled="!checkedRowKeys.length" @click="batchDelete">批量删除</n-button>
          </n-space>
        </n-space>
      </n-card>
      <n-card title="作品列表">
        <n-data-table
          :columns="columns"
          :data="filteredData"
          :bordered="false"
          :row-key="rowKey"
          checkable
          v-model:checked-row-keys="checkedRowKeys"
        />
      </n-card>
    </n-space>
  </section>
</template>

<script setup lang="ts">
import { computed, h, ref } from 'vue';
import type { DataTableColumns } from 'naive-ui';
import { NButton, NCard, NDataTable, NInput, NPageHeader, NSelect, NSpace, NTag, useMessage } from 'naive-ui';

interface WorkItem {
  id: number;
  title: string;
  author: string;
  model: string;
  status: '待审' | '通过' | '驳回';
  createdAt: string;
}

const keyword = ref('');
const statusFilter = ref<'all' | '待审' | '通过' | '驳回'>('all');
const checkedRowKeys = ref<number[]>([]);
const message = useMessage();

const statusOptions = [
  { label: '全部状态', value: 'all' },
  { label: '待审', value: '待审' },
  { label: '通过', value: '通过' },
  { label: '驳回', value: '驳回' },
];

const data = ref<WorkItem[]>([
  { id: 1, title: '山水画风格日落', author: 'user_001', model: 'SDXL', status: '待审', createdAt: '2026-01-25' },
  { id: 2, title: '赛博城市夜景', author: 'user_002', model: 'DALL·E', status: '通过', createdAt: '2026-01-24' },
  { id: 3, title: '动漫人物半身像', author: 'user_003', model: 'SD 1.5', status: '驳回', createdAt: '2026-01-23' },
]);

const rowKey = (row: WorkItem) => row.id;

const filteredData = computed(() => {
  return data.value.filter((item) => {
    const matchesKeyword = !keyword.value || item.title.includes(keyword.value) || item.author.includes(keyword.value);
    const matchesStatus = statusFilter.value === 'all' || item.status === statusFilter.value;
    return matchesKeyword && matchesStatus;
  });
});

const updateStatus = (row: WorkItem, status: WorkItem['status']) => {
  row.status = status;
  message.success(`已更新为${status}`);
};

const handleDelete = (row: WorkItem) => {
  data.value = data.value.filter((item) => item.id !== row.id);
  checkedRowKeys.value = checkedRowKeys.value.filter((key) => key !== row.id);
  message.success('已删除作品');
};

const batchApprove = () => {
  data.value.forEach((item) => {
    if (checkedRowKeys.value.includes(item.id)) {
      item.status = '通过';
    }
  });
  message.success('批量审核完成');
};

const batchDelete = () => {
  data.value = data.value.filter((item) => !checkedRowKeys.value.includes(item.id));
  checkedRowKeys.value = [];
  message.success('批量删除完成');
};

const columns: DataTableColumns<WorkItem> = [
  { title: '作品标题', key: 'title' },
  { title: '作者', key: 'author' },
  { title: '模型', key: 'model' },
  {
    title: '状态',
    key: 'status',
    render(row) {
      const type = row.status === '通过' ? 'success' : row.status === '驳回' ? 'error' : 'warning';
      return h(NTag, { type, round: true, size: 'small' }, { default: () => row.status });
    },
  },
  { title: '提交时间', key: 'createdAt' },
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
              { size: 'small', type: 'success', onClick: () => updateStatus(row, '通过') },
              { default: () => '通过' }
            ),
            h(
              NButton,
              { size: 'small', type: 'warning', onClick: () => updateStatus(row, '驳回') },
              { default: () => '驳回' }
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
</style>
