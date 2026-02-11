<template>
  <section class="page">
    <PageHeader title="分类管理" subtitle="管理风格分类和模型分类">
      <n-space>
        <n-button @click="openSortModal">
          <template #icon>
            <n-icon><ReorderFourOutline /></n-icon>
          </template>
          排序管理
        </n-button>
        <n-button type="primary" @click="handleCreate">
          <template #icon>
            <n-icon><AddOutline /></n-icon>
          </template>
          新增分类
        </n-button>
      </n-space>
    </PageHeader>

    <!-- 搜索栏 -->
    <n-card class="search-card" :bordered="false">
      <n-form :model="queryParams" label-placement="left" :show-feedback="false">
        <n-grid :x-gap="16" :y-gap="16" cols="2 s:3 m:4">
          <n-gi>
            <n-form-item label="分类名称">
              <n-input v-model:value="queryParams.name" placeholder="请输入分类名称" clearable />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="分类类型">
              <n-select
                v-model:value="queryParams.type"
                :options="typeOptions"
                placeholder="全部类型"
                clearable
              />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="状态">
              <n-select
                v-model:value="queryParams.status"
                :options="statusOptions"
                placeholder="全部状态"
                clearable
              />
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

    <!-- 表格 -->
    <n-card class="table-card" :bordered="false">
      <n-data-table
        :columns="columns"
        :data="dataList"
        :loading="loading"
        :pagination="paginationReactive"
        :row-key="(row: Category) => row.id"
        striped
        @update:page="onPageChange"
        @update:page-size="onPageSizeChange"
      />
      </n-card>

    <!-- 新增/编辑弹窗 -->
    <n-modal
      v-model:show="modal.visible"
      preset="card"
      :title="modal.title"
      style="width: 520px"
      :mask-closable="false"
    >
      <n-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-placement="left"
        label-width="80"
        require-mark-placement="right-hanging"
      >
        <n-form-item label="分类名称" path="name">
          <n-input v-model:value="formData.name" placeholder="请输入分类名称" />
        </n-form-item>
        <n-form-item label="分类编码" path="code">
          <n-input v-model:value="formData.code" placeholder="小写字母、数字、下划线" :disabled="modal.isEdit" />
        </n-form-item>
        <n-form-item label="分类类型" path="type">
          <n-radio-group v-model:value="formData.type" :disabled="modal.isEdit">
            <n-radio value="style">风格分类</n-radio>
            <n-radio value="model">模型分类</n-radio>
          </n-radio-group>
        </n-form-item>
        <n-form-item label="图标">
          <n-input v-model:value="formData.icon" placeholder="图标名称或 URL" />
        </n-form-item>
        <n-form-item label="封面图">
          <n-input v-model:value="formData.cover" placeholder="封面图 URL" />
        </n-form-item>
        <n-form-item label="描述">
          <n-input
            v-model:value="formData.description"
            type="textarea"
            placeholder="分类描述（选填）"
            :autosize="{ minRows: 2, maxRows: 4 }"
          />
        </n-form-item>
        <n-form-item label="排序">
          <n-input-number v-model:value="formData.sort" :min="0" style="width: 100%" />
          </n-form-item>
        <n-form-item label="状态">
          <n-switch v-model:value="formData.status" :checked-value="1" :unchecked-value="0">
            <template #checked>启用</template>
            <template #unchecked>禁用</template>
          </n-switch>
          </n-form-item>
        </n-form>
        <template #footer>
          <n-space justify="end">
          <n-button @click="modal.visible = false">取消</n-button>
          <n-button type="primary" :loading="modal.loading" @click="handleSubmit">
            确定
          </n-button>
          </n-space>
        </template>
    </n-modal>

    <!-- 删除确认 -->
    <ConfirmModal
      v-model:visible="deleteConfirm.visible"
      title="删除分类"
      :content="`确定要删除分类「${deleteConfirm.name}」吗？删除后无法恢复。`"
      type="error"
      confirm-text="确定删除"
      :loading="deleteConfirm.loading"
      @confirm="handleDeleteConfirm"
    />

    <!-- 排序管理 -->
    <n-modal v-model:show="sortModal.visible" preset="card" title="分类排序" style="width: 520px">
      <n-space vertical size="large">
        <n-form label-placement="left" :show-feedback="false">
          <n-form-item label="分类类型">
            <n-select v-model:value="sortModal.type" :options="typeOptions" @update:value="handleSortTypeChange" />
          </n-form-item>
        </n-form>
        <div class="sort-hint">拖拽调整顺序，保存后生效</div>
        <div class="sort-list">
          <div
            v-for="(item, index) in sortList"
            :key="item.id"
            class="sort-item"
            draggable="true"
            @dragstart="onSortDragStart(index)"
            @dragover.prevent
            @drop="onSortDrop(index)"
          >
            <span class="drag-handle">☰</span>
            <span class="sort-name">{{ item.name }}</span>
            <span class="sort-code">{{ item.code }}</span>
          </div>
          <div v-if="sortList.length === 0" class="sort-empty">暂无分类</div>
        </div>
      </n-space>
      <template #footer>
        <n-space justify="end">
          <n-button @click="sortModal.visible = false">取消</n-button>
          <n-button type="primary" :loading="sortModal.loading" @click="handleSortSave">保存</n-button>
        </n-space>
      </template>
    </n-modal>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, h, onMounted } from 'vue';
import {
  NCard,
  NForm,
  NFormItem,
  NGrid,
  NGi,
  NInput,
  NInputNumber,
  NSelect,
  NButton,
  NSpace,
  NIcon,
  NDataTable,
  NModal,
  NRadioGroup,
  NRadio,
  NSwitch,
  NTag,
  useMessage,
  type FormInst,
  type DataTableColumns,
} from 'naive-ui';
import { AddOutline, SearchOutline, RefreshOutline, CreateOutline, TrashOutline, ReorderFourOutline } from '@vicons/ionicons5';
import { PageHeader, ConfirmModal } from '@/components/Common';
import type { Category } from '@/types/category';
import { formatDateTime } from '@/utils/format';
import { fetchCategories, createCategory, updateCategory, removeCategory, updateCategorySort } from '@/api/category';

const message = useMessage();

/** 查询参数 */
const queryParams = reactive({
  name: '',
  type: null as string | null,
  status: null as number | null,
});

/** 类型选项 */
const typeOptions = [
  { label: '风格分类', value: 'style' },
  { label: '模型分类', value: 'model' },
];

/** 状态选项 */
const statusOptions = [
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 },
];

/** 加载状态 */
const loading = ref(false);

/** 数据列表 */
const dataList = ref<Category[]>([]);
const fullList = ref<Category[]>([]);

/** 分页 */
const paginationReactive = reactive({
  page: 1,
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  itemCount: 0,
  prefix: ({ itemCount }: { itemCount: number | undefined }) => `共 ${itemCount ?? 0} 条`,
});

/** 表格列 */
const columns: DataTableColumns<Category> = [
  { title: 'ID', key: 'id', width: 60 },
  { title: '图标', key: 'icon', width: 60, render: (row) => h('span', { style: { fontSize: '20px' } }, row.icon || '-') },
  { title: '名称', key: 'name', width: 120 },
  { title: '编码', key: 'code', width: 140 },
  {
    title: '类型',
    key: 'type',
    width: 100,
    render: (row) => h(NTag, { type: row.type === 'style' ? 'info' : 'success', size: 'small' }, () => row.type === 'style' ? '风格' : '模型'),
  },
  { title: '描述', key: 'description', ellipsis: { tooltip: true } },
  { title: '排序', key: 'sort', width: 60 },
  {
    title: '状态',
    key: 'status',
    width: 80,
    render: (row) => h(NTag, { type: row.status === 1 ? 'success' : 'default', size: 'small' }, () => row.status === 1 ? '启用' : '禁用'),
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
    width: 140,
    fixed: 'right',
    render: (row) =>
      h(NSpace, { size: 'small' }, () => [
        h(
          NButton,
          { text: true, type: 'info', onClick: () => handleEdit(row) },
          { icon: () => h(NIcon, null, () => h(CreateOutline)), default: () => '编辑' }
        ),
        h(
          NButton,
          { text: true, type: 'error', onClick: () => handleDelete(row) },
          { icon: () => h(NIcon, null, () => h(TrashOutline)), default: () => '删除' }
        ),
      ]),
  },
];

/** 弹窗状态 */
const modal = reactive({
  visible: false,
  title: '新增分类',
  loading: false,
  isEdit: false,
  editId: null as number | null,
});

/** 表单引用 */
const formRef = ref<FormInst | null>(null);

/** 表单数据 */
const formData = reactive({
  name: '',
  code: '',
  type: 'style' as 'style' | 'model',
  icon: '',
  cover: '',
  description: '',
  parentId:0,
  sort: 0,
  status: 1 as 0 | 1,
});

/** 表单规则 */
const formRules = {
  name: { required: true, message: '请输入分类名称', trigger: 'blur' },
  code: [
    { required: true, message: '请输入分类编码', trigger: 'blur' },
    { pattern: /^[a-z0-9_]+$/, message: '只能包含小写字母、数字和下划线', trigger: 'blur' },
  ],
  type: { required: true, message: '请选择分类类型', trigger: 'change' },
};

/** 删除确认 */
const deleteConfirm = reactive({
  visible: false,
  loading: false,
  id: null as number | null,
  name: '',
});

/** 排序弹窗 */
const sortModal = reactive({
  visible: false,
  loading: false,
  fetching: false,
  type: 'style' as 'style' | 'model',
});

const sortList = ref<Category[]>([]);
const sortSourceList = ref<Category[]>([]);
const sortDragIndex = ref<number | null>(null);

/** 搜索 */
const handleSearch = async () => {
  paginationReactive.page = 1;
  await loadData();
};

/** 重置 */
const handleReset = () => {
  queryParams.name = '';
  queryParams.type = null;
  queryParams.status = null;
  handleSearch();
};

/** 分页变化 */
const onPageChange = (page: number) => {
  paginationReactive.page = page;
  applyPagination();
};

const onPageSizeChange = (pageSize: number) => {
  paginationReactive.pageSize = pageSize;
  paginationReactive.page = 1;
  applyPagination();
};

/** 新增 */
const handleCreate = () => {
  modal.visible = true;
  modal.title = '新增分类';
  modal.isEdit = false;
  modal.editId = null;
  resetForm();
};

/** 编辑 */
const handleEdit = (row: Category) => {
  modal.visible = true;
  modal.title = '编辑分类';
  modal.isEdit = true;
  modal.editId = row.id;
  Object.assign(formData, {
    name: row.name,
    code: row.code,
    type: row.type,
    icon: row.icon || '',
    cover: row.cover || '',
    description: row.description || '',
    parentId: row.parentId,
    sort: row.sort,
    status: row.status,
  });
};

/** 删除 */
const handleDelete = (row: Category) => {
  deleteConfirm.visible = true;
  deleteConfirm.id = row.id;
  deleteConfirm.name = row.name;
};

/** 确认删除 */
const handleDeleteConfirm = async () => {
  if (!deleteConfirm.id) return;
  deleteConfirm.loading = true;
  try {
    await removeCategory(deleteConfirm.id);
    fullList.value = fullList.value.filter((item) => item.id !== deleteConfirm.id);
    applyPagination();
    message.success('删除成功');
  } finally {
    deleteConfirm.visible = false;
    deleteConfirm.loading = false;
  }
};

/** 提交表单 */
const handleSubmit = async () => {
  try {
    await formRef.value?.validate();
    modal.loading = true;

    if (modal.isEdit && modal.editId) {
      await updateCategory({
        id: modal.editId,
        name: formData.name,
        icon: formData.icon || undefined,
        cover: formData.cover || undefined,
        description: formData.description || undefined,
        parentId: formData.parentId > 0 ? formData.parentId : null,
        sort: formData.sort,
        status: formData.status,
      });
      message.success('编辑成功');
    } else {
      await createCategory({
        name: formData.name,
        code: formData.code,
        type: formData.type,
        icon: formData.icon || undefined,
        cover: formData.cover || undefined,
        description: formData.description || undefined,
        parentId: formData.parentId > 0 ? formData.parentId : undefined,
        sort: formData.sort,
        status: formData.status,
      });
      message.success('新增成功');
    }

    await loadData();
    modal.visible = false;
    modal.loading = false;
  } catch {
    // 验证失败
  }
};

const applyPagination = () => {
  const { page, pageSize } = paginationReactive;
  const start = (page - 1) * pageSize;
  dataList.value = fullList.value.slice(start, start + pageSize);
  paginationReactive.itemCount = fullList.value.length;
};

const buildSortList = () => {
  sortList.value = sortSourceList.value
    .filter((item) => item.type === sortModal.type && !item.parentId)
    .sort((a, b) => a.sort - b.sort || a.id - b.id);
};

const openSortModal = () => {
  sortModal.visible = true;
  sortModal.type = (queryParams.type as 'style' | 'model') || 'style';
  loadSortSource();
};

const handleSortTypeChange = (value: 'style' | 'model') => {
  sortModal.type = value;
  loadSortSource();
};

const loadSortSource = async () => {
  sortModal.fetching = true;
  try {
    sortSourceList.value = await fetchCategories({ type: sortModal.type });
    buildSortList();
  } finally {
    sortModal.fetching = false;
  }
};

const onSortDragStart = (index: number) => {
  sortDragIndex.value = index;
};

const onSortDrop = (index: number) => {
  if (sortDragIndex.value === null || sortDragIndex.value === index) return;
  const list = [...sortList.value];
  const [moved] = list.splice(sortDragIndex.value, 1);
  list.splice(index, 0, moved);
  sortList.value = list;
  sortDragIndex.value = null;
};

const handleSortSave = async () => {
  if (sortList.value.length === 0) {
    sortModal.visible = false;
    return;
  }
  sortModal.loading = true;
  try {
    const items = sortList.value.map((item, index) => ({
      id: item.id,
      sort: index,
    }));
    await updateCategorySort(items);
    message.success('排序已更新');
    sortModal.visible = false;
    await loadData();
  } finally {
    sortModal.loading = false;
  }
};

const loadData = async () => {
  loading.value = true;
  try {
    const list = await fetchCategories({
      type: queryParams.type ?? undefined,
      status: queryParams.status ?? undefined,
      keyword: queryParams.name || undefined,
    });
    fullList.value = list;
    applyPagination();
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadData();
});

/** 重置表单 */
const resetForm = () => {
  formData.name = '';
  formData.code = '';
  formData.type = 'style';
  formData.icon = '';
  formData.cover = '';
  formData.description = '';
  formData.parentId = 0;
  formData.sort = 0;
  formData.status = 1;
};
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

.table-card {
  border-radius: 12px;
}

.sort-hint {
  font-size: 12px;
  color: #6b7280;
}

.sort-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 360px;
  overflow: auto;
  padding: 4px;
  border: 1px dashed #e5e7eb;
  border-radius: 8px;
}

.sort-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: grab;
}

.sort-item:active {
  cursor: grabbing;
}

.drag-handle {
  font-size: 16px;
  color: #9ca3af;
}

.sort-name {
  font-weight: 500;
}

.sort-code {
  margin-left: auto;
  color: #9ca3af;
  font-size: 12px;
}

.sort-empty {
  text-align: center;
  color: #9ca3af;
  padding: 16px 0;
}
</style>
