<template>
  <section class="page">
    <PageHeader title="分类管理" subtitle="管理风格分类和模型分类">
      <n-button type="primary" @click="handleCreate">
        <template #icon>
          <n-icon><AddOutline /></n-icon>
        </template>
        新增分类
      </n-button>
    </PageHeader>

    <!-- 搜索栏 -->
    <n-card class="search-card" :bordered="false">
      <n-form :model="queryParams" label-placement="left" :show-feedback="false">
        <n-grid :x-gap="16" :y-gap="16" cols="1 s:2 m:4">
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
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, h } from 'vue';
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
import { AddOutline, SearchOutline, RefreshOutline, CreateOutline, TrashOutline } from '@vicons/ionicons5';
import { PageHeader, ConfirmModal } from '@/components/Common';
import type { Category } from '@/types/category';
import { formatDateTime } from '@/utils/format';

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
const dataList = ref<Category[]>([
  { id: 1, name: '国风', code: 'chinese_style', type: 'style', icon: '🎨', description: '中国传统绘画风格', sort: 1, status: 1, createdAt: '2026-01-20T10:00:00Z', updatedAt: '2026-01-20T10:00:00Z' },
  { id: 2, name: '赛博朋克', code: 'cyberpunk', type: 'style', icon: '🤖', description: '未来科技风格', sort: 2, status: 1, createdAt: '2026-01-20T10:00:00Z', updatedAt: '2026-01-20T10:00:00Z' },
  { id: 3, name: '日漫', code: 'anime', type: 'style', icon: '🌸', description: '日本动漫风格', sort: 3, status: 1, createdAt: '2026-01-20T10:00:00Z', updatedAt: '2026-01-20T10:00:00Z' },
  { id: 4, name: '写实', code: 'realistic', type: 'style', icon: '📷', description: '真实照片风格', sort: 4, status: 0, createdAt: '2026-01-20T10:00:00Z', updatedAt: '2026-01-20T10:00:00Z' },
  { id: 5, name: 'SDXL', code: 'sdxl', type: 'model', icon: '⚡', description: 'Stable Diffusion XL', sort: 1, status: 1, createdAt: '2026-01-20T10:00:00Z', updatedAt: '2026-01-20T10:00:00Z' },
  { id: 6, name: 'Flux', code: 'flux', type: 'model', icon: '🔥', description: 'Flux 模型', sort: 2, status: 1, createdAt: '2026-01-20T10:00:00Z', updatedAt: '2026-01-20T10:00:00Z' },
]);

/** 分页 */
const paginationReactive = reactive({
  page: 1,
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  itemCount: 6,
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
          { text: true, type: 'primary', onClick: () => handleEdit(row) },
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

/** 搜索 */
const handleSearch = () => {
  paginationReactive.page = 1;
  // 调用 API
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
};

const onPageSizeChange = (pageSize: number) => {
  paginationReactive.pageSize = pageSize;
  paginationReactive.page = 1;
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
const handleDeleteConfirm = () => {
  deleteConfirm.loading = true;
  setTimeout(() => {
    dataList.value = dataList.value.filter((item) => item.id !== deleteConfirm.id);
    deleteConfirm.visible = false;
    deleteConfirm.loading = false;
    message.success('删除成功');
  }, 500);
};

/** 提交表单 */
const handleSubmit = async () => {
  try {
    await formRef.value?.validate();
    modal.loading = true;

    setTimeout(() => {
      if (modal.isEdit) {
        const index = dataList.value.findIndex((item) => item.id === modal.editId);
        const existing = dataList.value[index];
        if (index > -1 && existing) {
          dataList.value[index] = {
            id: existing.id,
            name: formData.name,
            code: formData.code,
            type: formData.type,
            icon: formData.icon,
            cover: formData.cover,
            description: formData.description,
            parentId: formData.parentId,
            sort: formData.sort,
            status: formData.status,
            createdAt: existing.createdAt,
            updatedAt: new Date().toISOString(),
          };
        }
        message.success('编辑成功');
      } else {
        const newCategory: Category = {
          id: Date.now(),
          name: formData.name,
          code: formData.code,
          type: formData.type,
          icon: formData.icon,
          cover: formData.cover,
          description: formData.description,
          sort: formData.sort,
          status: formData.status,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        dataList.value.unshift(newCategory);
        message.success('新增成功');
      }
      modal.visible = false;
      modal.loading = false;
    }, 500);
  } catch {
    // 验证失败
  }
};

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
</style>