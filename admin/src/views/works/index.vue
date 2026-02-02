<template>
  <section class="page">
    <PageHeader title="作品管理" subtitle="查看、审核和管理用户生成的作品">
      <n-space>
        <n-button :disabled="selectedKeys.length === 0" @click="handleBatchAudit('approved')">
          <template #icon>
            <n-icon><CheckmarkCircleOutline /></n-icon>
          </template>
          批量通过
        </n-button>
        <n-button :disabled="selectedKeys.length === 0" type="error" @click="handleBatchDelete">
          <template #icon>
            <n-icon><TrashOutline /></n-icon>
          </template>
          批量删除
        </n-button>
      </n-space>
    </PageHeader>

    <!-- 搜索栏 -->
    <n-card class="search-card" :bordered="false">
      <n-form :model="queryParams" label-placement="left" :show-feedback="false">
        <n-grid :x-gap="16" :y-gap="16" cols="2 s:3 m:4 l:5">
          <n-gi>
            <n-form-item label="关键词">
              <n-input v-model:value="queryParams.keyword" placeholder="提示词/用户" clearable />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="风格">
              <n-select v-model:value="queryParams.styleId" :options="styleOptions" placeholder="全部风格" clearable />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="状态">
              <n-select v-model:value="queryParams.status" :options="statusOptions" placeholder="全部状态" clearable />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="时间">
              <n-date-picker
               start-placeholder="开始时间"
               end-placeholder="结束时间"
               v-model:value="queryParams.dateRange" type="daterange" clearable style="width: 100%" />
            </n-form-item>
          </n-gi>
          <n-gi class="search-actions">
            <n-space>
              <n-button type="primary" @click="handleSearch">
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
            </n-space>
          </n-gi>
        </n-grid>
      </n-form>
    </n-card>

    <!-- 视图切换 -->
    <n-card class="content-card" :bordered="false">
      <template #header>
        <n-space align="center">
          <span>共 {{ pagination.total }} 条</span>
          <n-divider vertical />
          <n-radio-group v-model:value="viewMode" size="small">
            <n-radio-button value="table">
              <n-icon><ListOutline /></n-icon>
            </n-radio-button>
            <n-radio-button value="grid">
              <n-icon><GridOutline /></n-icon>
            </n-radio-button>
          </n-radio-group>
        </n-space>
      </template>

      <!-- 表格视图 -->
      <n-data-table
        v-if="viewMode === 'table'"
        :columns="columns"
        :data="dataList"
        :loading="loading"
        :pagination="paginationReactive"
        :row-key="(row: Work) => row.id"
        :checked-row-keys="selectedKeys"
        striped
        @update:checked-row-keys="handleSelectionChange"
        @update:page="onPageChange"
        @update:page-size="onPageSizeChange"
      />

      <!-- 卡片视图 -->
      <div v-else class="works-grid">
        <n-checkbox-group v-model:value="selectedKeys">
          <n-grid :x-gap="16" :y-gap="16" cols="4 m:5 l:6 xl:7">
            <n-gi v-for="item in dataList" :key="item.id">
              <div class="work-card" @click="handleView(item)">
                <n-checkbox :value="item.id" class="work-card__checkbox" @click.stop />
                <div class="work-card__image">
                  <img :src="item.thumbnailUrl" :alt="item.prompt" />
                  <n-tag
                    class="work-card__status"
                    :type="getStatusType(item.status)"
                    size="small"
                  >
                    {{ getStatusText(item.status) }}
                  </n-tag>
                </div>
                <div class="work-card__info">
                  <div class="work-card__prompt">{{ item.prompt }}</div>
                  <div class="work-card__meta">
                    <span>{{ item.style?.name || '-' }}</span>
                    <span>{{ formatRelativeTime(item.createdAt) }}</span>
                  </div>
                </div>
                <div class="work-card__actions">
                  <n-button text type="info" size="small" @click.stop="handleAudit(item, 'approved')">
                    通过
                  </n-button>
                  <n-button text type="error" size="small" @click.stop="handleAudit(item, 'rejected')">
                    拒绝
                  </n-button>
                </div>
              </div>
            </n-gi>
          </n-grid>
        </n-checkbox-group>

        <!-- 分页 -->
        <div class="pagination-wrapper">
          <n-pagination
            v-model:page="pagination.page"
            v-model:page-size="pagination.pageSize"
            :item-count="pagination.total"
            :page-sizes="[12, 24, 48]"
            show-size-picker
            @update:page="onPageChange"
            @update:page-size="onPageSizeChange"
          />
        </div>
      </div>
    </n-card>

    <!-- 详情弹窗 -->
    <n-modal
      v-model:show="detailModal.visible"
      preset="card"
      title="作品详情"
      style="width: 720px"
    >
      <div v-if="detailModal.data" class="work-detail">
        <div class="work-detail__image">
          <img :src="detailModal.data.imageUrl" :alt="detailModal.data.prompt" />
        </div>
        <n-descriptions :column="2" label-placement="left" bordered>
          <n-descriptions-item label="作品 ID">{{ detailModal.data.id }}</n-descriptions-item>
          <n-descriptions-item label="用户">{{ detailModal.data.user?.nickname || '-' }}</n-descriptions-item>
          <n-descriptions-item label="风格">{{ detailModal.data.style?.name || '-' }}</n-descriptions-item>
          <n-descriptions-item label="模型">{{ detailModal.data.model?.name || '-' }}</n-descriptions-item>
          <n-descriptions-item label="尺寸">{{ detailModal.data.width }} × {{ detailModal.data.height }}</n-descriptions-item>
          <n-descriptions-item label="状态">
            <n-tag :type="getStatusType(detailModal.data.status)" size="small">
              {{ getStatusText(detailModal.data.status) }}
            </n-tag>
          </n-descriptions-item>
          <n-descriptions-item label="提示词" :span="2">{{ detailModal.data.prompt }}</n-descriptions-item>
          <n-descriptions-item label="创建时间" :span="2">{{ formatDateTime(detailModal.data.createdAt) }}</n-descriptions-item>
        </n-descriptions>
      </div>
      <template #footer>
        <n-space justify="end">
          <n-button @click="detailModal.visible = false">关闭</n-button>
          <n-button type="primary" @click="handleAudit(detailModal.data!, 'approved')">通过</n-button>
          <n-button type="error" @click="handleAudit(detailModal.data!, 'rejected')">拒绝</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 审核弹窗 -->
    <n-modal v-model:show="auditModal.visible" preset="dialog" :title="auditModal.title">
      <n-form v-if="auditModal.status === 'rejected'">
        <n-form-item label="拒绝原因">
          <n-input
            v-model:value="auditModal.reason"
            type="textarea"
            placeholder="请输入拒绝原因"
            :autosize="{ minRows: 2, maxRows: 4 }"
          />
        </n-form-item>
      </n-form>
      <template v-else>
        <p>确定要通过该作品的审核吗？</p>
      </template>
      <template #action>
        <n-space justify="end">
          <n-button @click="auditModal.visible = false">取消</n-button>
          <n-button :type="auditModal.status === 'approved' ? 'primary' : 'error'" :loading="auditModal.loading" @click="handleAuditConfirm">
            确定
          </n-button>
        </n-space>
      </template>
    </n-modal>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, h, onMounted, computed } from 'vue';
import {
  NCard,
  NForm,
  NFormItem,
  NGrid,
  NGi,
  NInput,
  NSelect,
  NDatePicker,
  NButton,
  NSpace,
  NIcon,
  NDataTable,
  NModal,
  NRadioGroup,
  NRadioButton,
  NTag,
  NCheckbox,
  NCheckboxGroup,
  NPagination,
  NDescriptions,
  NDescriptionsItem,
  NDivider,
  useMessage,
  type DataTableColumns,
} from 'naive-ui';
import {
  SearchOutline,
  RefreshOutline,
  CheckmarkCircleOutline,
  TrashOutline,
  ListOutline,
  GridOutline,
  EyeOutline,
} from '@vicons/ionicons5';
import { PageHeader } from '@/components/Common';
import type { Work } from '@/types/works';
import { formatDateTime, formatRelativeTime } from '@/utils/format';
import { fetchWorks, auditWork, batchAuditWork, batchRemoveWorks } from '@/api/works';
import { fetchCategories } from '@/api/category';

const message = useMessage();

/** 视图模式 */
const viewMode = ref<'table' | 'grid'>('table');

/** 查询参数 */
const queryParams = reactive({
  keyword: '',
  styleId: null as number | null,
  status: null as string | null,
  dateRange: null as [number, number] | null,
});

/** 风格选项 */
const styleOptions = ref<{ label: string; value: number }[]>([]);

/** 状态选项 */
const statusOptions = [
  { label: '待审核', value: 'pending' },
  { label: '已通过', value: 'approved' },
  { label: '已拒绝', value: 'rejected' },
];

/** 加载状态 */
const loading = ref(false);

/** 选中项 */
const selectedKeys = ref<number[]>([]);

/** 数据列表 */
const dataList = ref<Work[]>([]);

/** 分页 */
const pagination = reactive({
  page: 1,
  pageSize: 12,
  total: 0,
});

const paginationReactive = computed(() => ({
  page: pagination.page,
  pageSize: pagination.pageSize,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  itemCount: pagination.total,
  prefix: ({ itemCount }: { itemCount: number | undefined }) => `共 ${itemCount ?? 0} 条`,
}));

/** 表格列 */
const columns: DataTableColumns<Work> = [
  { type: 'selection' },
  { title: 'ID', key: 'id', width: 60 },
  {
    title: '缩略图',
    key: 'thumbnailUrl',
    width: 80,
    render: (row) => h('img', { src: row.thumbnailUrl, style: { width: '48px', height: '48px', borderRadius: '6px', objectFit: 'cover' } }),
  },
  { title: '提示词', key: 'prompt', ellipsis: { tooltip: true } },
  {
    title: '用户',
    key: 'user',
    width: 100,
    render: (row) => row.user?.nickname || '-',
  },
  {
    title: '风格',
    key: 'style',
    width: 100,
    render: (row) => row.style?.name || '-',
  },
  {
    title: '状态',
    key: 'status',
    width: 90,
    render: (row) => h(NTag, { type: getStatusType(row.status), size: 'small' }, () => getStatusText(row.status)),
  },
  {
    title: '创建时间',
    key: 'createdAt',
    width: 160,
    render: (row) => formatDateTime(row.createdAt),
  },
  {
    title: '操作',
    key: 'actions',
    width: 160,
    fixed: 'right',
    render: (row) =>
      h(NSpace, { size: 'small' }, () => [
        h(NButton, { text: true, type: 'info', onClick: () => handleView(row) }, { icon: () => h(NIcon, null, () => h(EyeOutline)), default: () => '查看' }),
        h(NButton, { text: true, type: 'info', onClick: () => handleAudit(row, 'approved') }, { icon: () => h(NIcon, null, () => h(CheckmarkCircleOutline)), default: () => '通过'}),
        h(NButton, { text: true, type: 'error', onClick: () => handleAudit(row, 'rejected') }, { icon: () => h(NIcon, null, () => h(TrashOutline)), default: () => '拒绝'}),
      ]),
  },
];

/** 详情弹窗 */
const detailModal = reactive({
  visible: false,
  data: null as Work | null,
});

/** 审核弹窗 */
const auditModal = reactive({
  visible: false,
  loading: false,
  title: '',
  status: '' as 'approved' | 'rejected',
  reason: '',
  ids: [] as number[],
});

/** 获取状态类型 */
const getStatusType = (status: string) => {
  const map: Record<string, 'default' | 'success' | 'warning' | 'error'> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'error',
  };
  return map[status] || 'default';
};

/** 获取状态文本 */
const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝',
  };
  return map[status] || status;
};

/** 加载风格选项 */
const loadStyleOptions = async () => {
  try {
    const res = await fetchCategories();
    const styles = res.filter((item: { type: string }) => item.type === 'style');
    styleOptions.value = styles.map((item: { id: number; name: string }) => ({
      label: item.name,
      value: item.id,
    }));
  } catch (error) {
    console.error('加载风格选项失败:', error);
  }
};

/** 加载作品列表 */
const loadWorks = async () => {
  loading.value = true;
  try {
    const params: Record<string, unknown> = {
      page: pagination.page,
      pageSize: pagination.pageSize,
    };

    if (queryParams.keyword) {
      params.keyword = queryParams.keyword;
    }
    if (queryParams.styleId) {
      params.styleId = queryParams.styleId;
    }
    if (queryParams.status) {
      params.status = queryParams.status;
    }
    if (queryParams.dateRange) {
      params.startDate = new Date(queryParams.dateRange[0]).toISOString();
      params.endDate = new Date(queryParams.dateRange[1]).toISOString();
    }

    const res = await fetchWorks(params);
    dataList.value = res.list || [];
    pagination.total = res.total || 0;
  } catch (error) {
    message.error('加载作品列表失败');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

/** 搜索 */
const handleSearch = () => {
  pagination.page = 1;
  loadWorks();
};

/** 重置 */
const handleReset = () => {
  queryParams.keyword = '';
  queryParams.styleId = null;
  queryParams.status = null;
  queryParams.dateRange = null;
  handleSearch();
};

/** 分页变化 */
const onPageChange = (page: number) => {
  pagination.page = page;
  loadWorks();
};

const onPageSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize;
  pagination.page = 1;
  loadWorks();
};

/** 选择变化 */
const handleSelectionChange = (keys: Array<string | number>) => {
  selectedKeys.value = keys.map((k) => Number(k));
};

/** 查看详情 */
const handleView = (row: Work) => {
  detailModal.visible = true;
  detailModal.data = row;
};

/** 审核 */
const handleAudit = (row: Work, status: 'approved' | 'rejected') => {
  auditModal.visible = true;
  auditModal.title = status === 'approved' ? '通过审核' : '拒绝审核';
  auditModal.status = status;
  auditModal.reason = '';
  auditModal.ids = [row.id];
};

/** 批量审核 */
const handleBatchAudit = (status: 'approved' | 'rejected') => {
  if (selectedKeys.value.length === 0) return;
  auditModal.visible = true;
  auditModal.title = status === 'approved' ? `批量通过 (${selectedKeys.value.length}项)` : `批量拒绝 (${selectedKeys.value.length}项)`;
  auditModal.status = status;
  auditModal.reason = '';
  auditModal.ids = [...selectedKeys.value];
};

/** 确认审核 */
const handleAuditConfirm = async () => {
  if (auditModal.status === 'rejected' && !auditModal.reason) {
    message.warning('请输入拒绝原因');
    return;
  }
  auditModal.loading = true;
  try {
    if (auditModal.ids.length === 1 && auditModal.ids[0] !== undefined) {
      // 单个审核
      await auditWork({
        id: auditModal.ids[0],
        status: auditModal.status,
        reason: auditModal.reason || undefined,
      });
    } else {
      // 批量审核
      await batchAuditWork({
        ids: auditModal.ids,
        status: auditModal.status,
        reason: auditModal.reason || undefined,
      });
    }
    message.success('审核完成');
    auditModal.visible = false;
    detailModal.visible = false;
    selectedKeys.value = [];
    await loadWorks();
  } catch (error) {
    message.error('审核失败');
    console.error(error);
  } finally {
    auditModal.loading = false;
  }
};

/** 批量删除 */
const handleBatchDelete = async () => {
  if (selectedKeys.value.length === 0) return;
  try {
    await batchRemoveWorks(selectedKeys.value);
    message.success('删除成功');
    selectedKeys.value = [];
    await loadWorks();
  } catch (error) {
    message.error('删除失败');
    console.error(error);
  }
};

/** 初始化 */
onMounted(() => {
  loadStyleOptions();
  loadWorks();
});
</script>

<style scoped>
.page {
  width: 100%;
}

.search-card {
  margin-bottom: 16px;
  border-radius: 12px;
}

.search-card :deep(.n-card__content) {
  padding: 16px 20px;
}

.search-actions {
  display: flex;
  align-items: flex-end;
}

.content-card {
  border-radius: 12px;
}

.works-grid {
  padding-top: 8px;
}

.work-card {
  position: relative;
  background: var(--color-bg-card, #fff);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
}

.work-card:hover {
  border-color: var(--color-primary, #3b82f6);
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.12);
}

.work-card__checkbox {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 10;
}

.work-card__image {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
}

.work-card__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.work-card:hover .work-card__image img {
  transform: scale(1.05);
}

.work-card__status {
  position: absolute;
  top: 8px;
  right: 8px;
}

.work-card__info {
  padding: 10px 12px 8px;
}

.work-card__prompt {
  font-size: 13px;
  color: var(--color-text, #111827);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.work-card__meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--color-muted, #9ca3af);
  margin-top: 4px;
}

.work-card__actions {
  display: flex;
  justify-content: space-around;
  padding: 8px 12px;
  border-top: 1px solid var(--color-border, #e5e7eb);
  background: var(--color-bg-page, #f5f7f9);
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.work-detail__image {
  margin-bottom: 16px;
  border-radius: 8px;
  overflow: hidden;
}

.work-detail__image img {
  width: 100%;
  max-height: 400px;
  object-fit: contain;
  background: #f5f5f5;
}
</style>
