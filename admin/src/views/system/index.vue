<template>
  <section class="page">
    <PageHeader title="系统设置" subtitle="管理系统配置、生成参数和操作日志" />

    <n-tabs type="line" animated>
      <!-- 基础配置 -->
      <n-tab-pane name="config" tab="基础配置">
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

            <n-form-item>
              <n-button type="info" :loading="configSaving" @click="handleSaveConfig">
                保存配置
              </n-button>
            </n-form-item>
          </n-form>
        </n-card>
      </n-tab-pane>

      <!-- 模型管理 -->
      <n-tab-pane name="model" tab="模型管理">
        <n-card class="config-card" :bordered="false">
          <template #header>
            <n-space justify="space-between" align="center">
              <span>AI 模型配置</span>
              <n-button type="info" size="small" @click="handleAddModel">
                <template #icon><n-icon><AddOutline /></n-icon></template>
                添加模型
              </n-button>
            </n-space>
          </template>

          <n-data-table
            :columns="modelColumns"
            :data="modelList"
            :loading="modelLoading"
            striped
          />
        </n-card>
      </n-tab-pane>

      <!-- 生成参数 -->
      <n-tab-pane name="generate" tab="生成参数">
        <n-grid :x-gap="16" :y-gap="16" cols="1 m:2">
          <!-- 图片比例配置 -->
          <n-gi>
            <n-card class="config-card" :bordered="false">
              <template #header>
                <n-space justify="space-between" align="center">
                  <span>图片比例选项</span>
                  <n-button type="info" size="small" @click="handleAddRatio">
                    <template #icon><n-icon><AddOutline /></n-icon></template>
                    添加
                  </n-button>
                </n-space>
              </template>

              <n-data-table
                :columns="ratioColumns"
                :data="ratioList"
                :max-height="400"
                striped
              />
            </n-card>
          </n-gi>

          <!-- 生成数量配置 -->
          <n-gi>
            <n-card class="config-card" :bordered="false">
              <template #header>
                <n-space justify="space-between" align="center">
                  <span>生成数量选项</span>
                  <n-button type="info" size="small" @click="handleAddCount">
                    <template #icon><n-icon><AddOutline /></n-icon></template>
                    添加
                  </n-button>
                </n-space>
              </template>

              <n-data-table
                :columns="countColumns"
                :data="countList"
                :max-height="400"
                striped
              />
            </n-card>
          </n-gi>
        </n-grid>

        <!-- 默认配置 -->
        <n-card class="config-card" :bordered="false" style="margin-top: 16px">
          <template #header>默认生成配置</template>
          <n-form label-placement="left" label-width="140">
            <n-grid :x-gap="24" cols="1 m:2">
              <n-gi>
                <n-form-item label="默认模型">
                  <n-select
                    v-model:value="generateConfig.defaultModel"
                    :options="modelSelectOptions"
                    style="width: 100%"
                  />
                </n-form-item>
              </n-gi>
              <n-gi>
                <n-form-item label="默认比例">
                  <n-select
                    v-model:value="generateConfig.defaultRatio"
                    :options="ratioSelectOptions"
                    style="width: 100%"
                  />
                </n-form-item>
              </n-gi>
              <n-gi>
                <n-form-item label="默认数量">
                  <n-select
                    v-model:value="generateConfig.defaultCount"
                    :options="countSelectOptions"
                    style="width: 100%"
                  />
                </n-form-item>
              </n-gi>
              <n-gi>
                <n-form-item label="最大尺寸">
                  <n-input-number v-model:value="generateConfig.maxSize" :min="512" :max="4096" :step="64" style="width: 100%">
                    <template #suffix>px</template>
                  </n-input-number>
                </n-form-item>
              </n-gi>
            </n-grid>
            <n-form-item>
              <n-button type="info" :loading="generateSaving" @click="handleSaveGenerate">
                保存配置
              </n-button>
            </n-form-item>
          </n-form>
        </n-card>
      </n-tab-pane>

      <!-- 操作日志 -->
      <n-tab-pane name="log" tab="操作日志">
        <n-card class="log-card" :bordered="false">
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
            <n-button type="info" @click="handleSearchLog">搜索</n-button>
          </n-space>

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

    <!-- 模型编辑弹窗 -->
    <n-modal
      v-model:show="modelModal.visible"
      preset="card"
      :title="modelModal.isEdit ? '编辑模型' : '添加模型'"
      style="width: 500px"
      :mask-closable="false"
    >
      <n-form
        ref="modelFormRef"
        :model="modelForm"
        :rules="modelRules"
        label-placement="left"
        label-width="100"
      >
        <n-form-item label="模型名称" path="name">
          <n-input v-model:value="modelForm.name" placeholder="如：SDXL、Flux" />
        </n-form-item>
        <n-form-item label="模型编码" path="code">
          <n-input v-model:value="modelForm.code" placeholder="小写字母，如：sdxl" :disabled="modelModal.isEdit" />
        </n-form-item>
        <n-form-item label="图标">
          <n-input v-model:value="modelForm.icon" placeholder="emoji 或图标 URL" />
        </n-form-item>
        <n-form-item label="积分价格" path="price">
          <n-input-number v-model:value="modelForm.price" :min="0" style="width: 100%">
            <template #suffix>积分/次</template>
          </n-input-number>
        </n-form-item>
        <n-form-item label="生成速度">
          <n-select v-model:value="modelForm.speed" :options="speedOptions" />
        </n-form-item>
        <n-form-item label="生成质量">
          <n-rate v-model:value="modelForm.quality" :count="5" />
        </n-form-item>
        <n-form-item label="描述">
          <n-input v-model:value="modelForm.description" type="textarea" placeholder="模型描述" />
        </n-form-item>
        <n-form-item label="排序">
          <n-input-number v-model:value="modelForm.sort" :min="0" style="width: 100%" />
        </n-form-item>
        <n-form-item label="状态">
          <n-switch v-model:value="modelForm.status" :checked-value="1" :unchecked-value="0">
            <template #checked>启用</template>
            <template #unchecked>禁用</template>
          </n-switch>
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="modelModal.visible = false">取消</n-button>
          <n-button type="info" :loading="modelModal.loading" @click="handleSaveModel">确定</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 比例编辑弹窗 -->
    <n-modal
      v-model:show="ratioModal.visible"
      preset="card"
      :title="ratioModal.isEdit ? '编辑比例' : '添加比例'"
      style="width: 400px"
      :mask-closable="false"
    >
      <n-form
        ref="ratioFormRef"
        :model="ratioForm"
        :rules="ratioRules"
        label-placement="left"
        label-width="80"
      >
        <n-form-item label="名称" path="label">
          <n-input v-model:value="ratioForm.label" placeholder="如：1:1 正方形" />
        </n-form-item>
        <n-form-item label="宽度比" path="width">
          <n-input-number v-model:value="ratioForm.width" :min="1" :max="16" style="width: 100%" />
        </n-form-item>
        <n-form-item label="高度比" path="height">
          <n-input-number v-model:value="ratioForm.height" :min="1" :max="16" style="width: 100%" />
        </n-form-item>
        <n-form-item label="排序">
          <n-input-number v-model:value="ratioForm.sort" :min="0" style="width: 100%" />
        </n-form-item>
        <n-form-item label="状态">
          <n-switch v-model:value="ratioForm.status" :checked-value="1" :unchecked-value="0">
            <template #checked>启用</template>
            <template #unchecked>禁用</template>
          </n-switch>
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="ratioModal.visible = false">取消</n-button>
          <n-button type="info" :loading="ratioModal.loading" @click="handleSaveRatio">确定</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 数量编辑弹窗 -->
    <n-modal
      v-model:show="countModal.visible"
      preset="card"
      :title="countModal.isEdit ? '编辑数量' : '添加数量'"
      style="width: 400px"
      :mask-closable="false"
    >
      <n-form
        ref="countFormRef"
        :model="countForm"
        :rules="countRules"
        label-placement="left"
        label-width="80"
      >
        <n-form-item label="数量" path="value">
          <n-input-number v-model:value="countForm.value" :min="1" :max="8" style="width: 100%" />
        </n-form-item>
        <n-form-item label="名称" path="label">
          <n-input v-model:value="countForm.label" placeholder="如：1张、4张" />
        </n-form-item>
        <n-form-item label="积分倍率">
          <n-input-number v-model:value="countForm.multiplier" :min="1" :precision="1" style="width: 100%">
            <template #suffix>倍</template>
          </n-input-number>
        </n-form-item>
        <n-form-item label="排序">
          <n-input-number v-model:value="countForm.sort" :min="0" style="width: 100%" />
        </n-form-item>
        <n-form-item label="状态">
          <n-switch v-model:value="countForm.status" :checked-value="1" :unchecked-value="0">
            <template #checked>启用</template>
            <template #unchecked>禁用</template>
          </n-switch>
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="countModal.visible = false">取消</n-button>
          <n-button type="info" :loading="countModal.loading" @click="handleSaveCount">确定</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 删除确认 -->
    <ConfirmModal
      v-model:visible="deleteConfirm.visible"
      title="确认删除"
      :content="deleteConfirm.content"
      type="error"
      confirm-text="确定删除"
      :loading="deleteConfirm.loading"
      @confirm="handleDeleteConfirm"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, h, computed } from 'vue';
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
  NIcon,
  NGrid,
  NGi,
  NModal,
  NRate,
  useMessage,
  type DataTableColumns,
  type FormInst,
} from 'naive-ui';
import { AddOutline, CreateOutline, TrashOutline } from '@vicons/ionicons5';
import { PageHeader, ConfirmModal } from '@/components/Common';
import { formatDateTime } from '@/utils/format';

const message = useMessage();

// ==================== 基础配置 ====================
const configForm = reactive({
  siteName: '图文生成管理系统',
  logo: '',
  freeQuotaDaily: 5,
  basicQuotaDaily: 30,
  proQuotaDaily: 100,
  autoAudit: false,
  sensitiveFilter: true,
});

const configSaving = ref(false);

const handleSaveConfig = () => {
  configSaving.value = true;
  setTimeout(() => {
    configSaving.value = false;
    message.success('配置保存成功');
  }, 500);
};

// ==================== 模型管理 ====================
interface ModelConfig {
  id: number;
  name: string;
  code: string;
  icon: string;
  price: number;
  speed: string;
  quality: number;
  description: string;
  sort: number;
  status: 0 | 1;
}

const modelLoading = ref(false);
const modelList = ref<ModelConfig[]>([
  { id: 1, name: 'SDXL', code: 'sdxl', icon: '⚡', price: 1, speed: 'fast', quality: 4, description: '稳定高效，性价比之选', sort: 1, status: 1 },
  { id: 2, name: 'Flux', code: 'flux', icon: '🎭', price: 2, speed: 'medium', quality: 5, description: '风格细腻，艺术感强', sort: 2, status: 1 },
  { id: 3, name: 'DALL·E', code: 'dalle', icon: '🤖', price: 3, speed: 'medium', quality: 4, description: '理解力强，通用表现', sort: 3, status: 1 },
  { id: 4, name: 'Midjourney', code: 'mj', icon: '🎨', price: 5, speed: 'slow', quality: 5, description: '顶级画质，创意无限', sort: 4, status: 0 },
]);

const speedOptions = [
  { label: '快速', value: 'fast' },
  { label: '中等', value: 'medium' },
  { label: '较慢', value: 'slow' },
];

const modelColumns: DataTableColumns<ModelConfig> = [
  { title: '图标', key: 'icon', width: 60, render: (row) => h('span', { style: { fontSize: '20px' } }, row.icon) },
  { title: '名称', key: 'name', width: 120 },
  { title: '编码', key: 'code', width: 100 },
  { title: '积分价格', key: 'price', width: 100, render: (row) => `${row.price} 积分/次` },
  {
    title: '速度',
    key: 'speed',
    width: 80,
    render: (row) => {
      const map: Record<string, { text: string; type: 'success' | 'warning' | 'error' }> = {
        fast: { text: '快速', type: 'success' },
        medium: { text: '中等', type: 'warning' },
        slow: { text: '较慢', type: 'error' },
      };
      const item = map[row.speed] || { text: row.speed, type: 'default' as const };
      return h(NTag, { type: item.type, size: 'small' }, () => item.text);
    },
  },
  { title: '质量', key: 'quality', width: 120, render: (row) => h(NRate, { value: row.quality, readonly: true, size: 'small' }) },
  { title: '描述', key: 'description', ellipsis: { tooltip: true } },
  { title: '排序', key: 'sort', width: 60 },
  {
    title: '状态',
    key: 'status',
    width: 80,
    render: (row) => h(NTag, { type: row.status === 1 ? 'success' : 'default', size: 'small' }, () => row.status === 1 ? '启用' : '禁用'),
  },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    fixed: 'right',
    render: (row) =>
      h(NSpace, { size: 'small' }, () => [
        h(NButton, { text: true, type: 'info', onClick: () => handleEditModel(row) }, { icon: () => h(NIcon, null, () => h(CreateOutline)), default: () => '编辑' }),
        h(NButton, { text: true, type: 'error', onClick: () => handleDeleteModel(row) }, { icon: () => h(NIcon, null, () => h(TrashOutline)), default: () => '删除' }),
      ]),
  },
];

const modelModal = reactive({
  visible: false,
  isEdit: false,
  editId: null as number | null,
  loading: false,
});

const modelFormRef = ref<FormInst | null>(null);
const modelForm = reactive({
  name: '',
  code: '',
  icon: '',
  price: 1,
  speed: 'medium',
  quality: 4,
  description: '',
  sort: 0,
  status: 1 as 0 | 1,
});

const modelRules = {
  name: { required: true, message: '请输入模型名称', trigger: 'blur' },
  code: { required: true, message: '请输入模型编码', trigger: 'blur' },
  price: { required: true, type: 'number' as const, message: '请输入积分价格', trigger: 'blur' },
};

const handleAddModel = () => {
  modelModal.visible = true;
  modelModal.isEdit = false;
  modelModal.editId = null;
  Object.assign(modelForm, { name: '', code: '', icon: '', price: 1, speed: 'medium', quality: 4, description: '', sort: 0, status: 1 });
};

const handleEditModel = (row: ModelConfig) => {
  modelModal.visible = true;
  modelModal.isEdit = true;
  modelModal.editId = row.id;
  Object.assign(modelForm, row);
};

const handleDeleteModel = (row: ModelConfig) => {
  deleteConfirm.visible = true;
  deleteConfirm.content = `确定要删除模型「${row.name}」吗？`;
  deleteConfirm.type = 'model';
  deleteConfirm.id = row.id;
};

const handleSaveModel = async () => {
  try {
    await modelFormRef.value?.validate();
    modelModal.loading = true;

    setTimeout(() => {
      if (modelModal.isEdit) {
        const index = modelList.value.findIndex((item) => item.id === modelModal.editId);
        const existing = modelList.value[index];
        if (index > -1 && existing) {
          modelList.value[index] = {
            id: existing.id,
            name: modelForm.name,
            code: modelForm.code,
            icon: modelForm.icon,
            price: modelForm.price,
            speed: modelForm.speed,
            quality: modelForm.quality,
            description: modelForm.description,
            sort: modelForm.sort,
            status: modelForm.status,
          };
        }
        message.success('编辑成功');
      } else {
        const newModel: ModelConfig = {
          id: Date.now(),
          name: modelForm.name,
          code: modelForm.code,
          icon: modelForm.icon,
          price: modelForm.price,
          speed: modelForm.speed,
          quality: modelForm.quality,
          description: modelForm.description,
          sort: modelForm.sort,
          status: modelForm.status,
        };
        modelList.value.push(newModel);
        message.success('添加成功');
      }
      modelModal.visible = false;
      modelModal.loading = false;
    }, 500);
  } catch {
    modelModal.loading = false;
  }
};

// ==================== 图片比例配置 ====================
interface RatioConfig {
  id: number;
  label: string;
  width: number;
  height: number;
  sort: number;
  status: 0 | 1;
}

const ratioList = ref<RatioConfig[]>([
  { id: 1, label: '1:1 正方形', width: 1, height: 1, sort: 1, status: 1 },
  { id: 2, label: '4:3 横版', width: 4, height: 3, sort: 2, status: 1 },
  { id: 3, label: '3:4 竖版', width: 3, height: 4, sort: 3, status: 1 },
  { id: 4, label: '16:9 宽屏', width: 16, height: 9, sort: 4, status: 1 },
  { id: 5, label: '9:16 手机竖屏', width: 9, height: 16, sort: 5, status: 1 },
  { id: 6, label: '2:3 海报', width: 2, height: 3, sort: 6, status: 0 },
]);

const ratioColumns: DataTableColumns<RatioConfig> = [
  { title: '名称', key: 'label' },
  { title: '比例', key: 'ratio', render: (row) => `${row.width}:${row.height}` },
  { title: '排序', key: 'sort', width: 60 },
  {
    title: '状态',
    key: 'status',
    width: 80,
    render: (row) => h(NTag, { type: row.status === 1 ? 'success' : 'default', size: 'small' }, () => row.status === 1 ? '启用' : '禁用'),
  },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    render: (row) =>
      h(NSpace, { size: 'small' }, () => [
        h(NButton, { text: true, type: 'info', size: 'small', onClick: () => handleEditRatio(row) }, { default: () => '编辑' }),
        h(NButton, { text: true, type: 'error', size: 'small', onClick: () => handleDeleteRatio(row) }, { default: () => '删除' }),
      ]),
  },
];

const ratioModal = reactive({
  visible: false,
  isEdit: false,
  editId: null as number | null,
  loading: false,
});

const ratioFormRef = ref<FormInst | null>(null);
const ratioForm = reactive({
  label: '',
  width: 1,
  height: 1,
  sort: 0,
  status: 1 as 0 | 1,
});

const ratioRules = {
  label: { required: true, message: '请输入名称', trigger: 'blur' },
  width: { required: true, type: 'number' as const, message: '请输入宽度比', trigger: 'blur' },
  height: { required: true, type: 'number' as const, message: '请输入高度比', trigger: 'blur' },
};

const handleAddRatio = () => {
  ratioModal.visible = true;
  ratioModal.isEdit = false;
  ratioModal.editId = null;
  Object.assign(ratioForm, { label: '', width: 1, height: 1, sort: 0, status: 1 });
};

const handleEditRatio = (row: RatioConfig) => {
  ratioModal.visible = true;
  ratioModal.isEdit = true;
  ratioModal.editId = row.id;
  Object.assign(ratioForm, row);
};

const handleDeleteRatio = (row: RatioConfig) => {
  deleteConfirm.visible = true;
  deleteConfirm.content = `确定要删除比例「${row.label}」吗？`;
  deleteConfirm.type = 'ratio';
  deleteConfirm.id = row.id;
};

const handleSaveRatio = async () => {
  try {
    await ratioFormRef.value?.validate();
    ratioModal.loading = true;

    setTimeout(() => {
      if (ratioModal.isEdit) {
        const index = ratioList.value.findIndex((item) => item.id === ratioModal.editId);
        const existing = ratioList.value[index];
        if (index > -1 && existing) {
          ratioList.value[index] = {
            id: existing.id,
            label: ratioForm.label,
            width: ratioForm.width,
            height: ratioForm.height,
            sort: ratioForm.sort,
            status: ratioForm.status,
          };
        }
        message.success('编辑成功');
      } else {
        const newRatio: RatioConfig = {
          id: Date.now(),
          label: ratioForm.label,
          width: ratioForm.width,
          height: ratioForm.height,
          sort: ratioForm.sort,
          status: ratioForm.status,
        };
        ratioList.value.push(newRatio);
        message.success('添加成功');
      }
      ratioModal.visible = false;
      ratioModal.loading = false;
    }, 500);
  } catch {
    ratioModal.loading = false;
  }
};

// ==================== 生成数量配置 ====================
interface CountConfig {
  id: number;
  value: number;
  label: string;
  multiplier: number;
  sort: number;
  status: 0 | 1;
}

const countList = ref<CountConfig[]>([
  { id: 1, value: 1, label: '1 张', multiplier: 1, sort: 1, status: 1 },
  { id: 2, value: 2, label: '2 张', multiplier: 1.8, sort: 2, status: 1 },
  { id: 3, value: 4, label: '4 张', multiplier: 3.2, sort: 3, status: 1 },
  { id: 4, value: 8, label: '8 张', multiplier: 6, sort: 4, status: 0 },
]);

const countColumns: DataTableColumns<CountConfig> = [
  { title: '数量', key: 'value', width: 60 },
  { title: '名称', key: 'label' },
  { title: '积分倍率', key: 'multiplier', render: (row) => `${row.multiplier} 倍` },
  { title: '排序', key: 'sort', width: 60 },
  {
    title: '状态',
    key: 'status',
    width: 80,
    render: (row) => h(NTag, { type: row.status === 1 ? 'success' : 'default', size: 'small' }, () => row.status === 1 ? '启用' : '禁用'),
  },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    render: (row) =>
      h(NSpace, { size: 'small' }, () => [
        h(NButton, { text: true, type: 'info', size: 'small', onClick: () => handleEditCount(row) }, { default: () => '编辑' }),
        h(NButton, { text: true, type: 'error', size: 'small', onClick: () => handleDeleteCount(row) }, { default: () => '删除' }),
      ]),
  },
];

const countModal = reactive({
  visible: false,
  isEdit: false,
  editId: null as number | null,
  loading: false,
});

const countFormRef = ref<FormInst | null>(null);
const countForm = reactive({
  value: 1,
  label: '',
  multiplier: 1,
  sort: 0,
  status: 1 as 0 | 1,
});

const countRules = {
  value: { required: true, type: 'number' as const, message: '请输入数量', trigger: 'blur' },
  label: { required: true, message: '请输入名称', trigger: 'blur' },
};

const handleAddCount = () => {
  countModal.visible = true;
  countModal.isEdit = false;
  countModal.editId = null;
  Object.assign(countForm, { value: 1, label: '', multiplier: 1, sort: 0, status: 1 });
};

const handleEditCount = (row: CountConfig) => {
  countModal.visible = true;
  countModal.isEdit = true;
  countModal.editId = row.id;
  Object.assign(countForm, row);
};

const handleDeleteCount = (row: CountConfig) => {
  deleteConfirm.visible = true;
  deleteConfirm.content = `确定要删除数量选项「${row.label}」吗？`;
  deleteConfirm.type = 'count';
  deleteConfirm.id = row.id;
};

const handleSaveCount = async () => {
  try {
    await countFormRef.value?.validate();
    countModal.loading = true;

    setTimeout(() => {
      if (countModal.isEdit) {
        const index = countList.value.findIndex((item) => item.id === countModal.editId);
        const existing = countList.value[index];
        if (index > -1 && existing) {
          countList.value[index] = {
            id: existing.id,
            value: countForm.value,
            label: countForm.label,
            multiplier: countForm.multiplier,
            sort: countForm.sort,
            status: countForm.status,
          };
        }
        message.success('编辑成功');
      } else {
        const newCount: CountConfig = {
          id: Date.now(),
          value: countForm.value,
          label: countForm.label,
          multiplier: countForm.multiplier,
          sort: countForm.sort,
          status: countForm.status,
        };
        countList.value.push(newCount);
        message.success('添加成功');
      }
      countModal.visible = false;
      countModal.loading = false;
    }, 500);
  } catch {
    countModal.loading = false;
  }
};

// ==================== 默认生成配置 ====================
const generateConfig = reactive({
  defaultModel: 'sdxl',
  defaultRatio: '1:1',
  defaultCount: 1,
  maxSize: 2048,
});

const generateSaving = ref(false);

const modelSelectOptions = computed(() =>
  modelList.value.filter((m) => m.status === 1).map((m) => ({ label: m.name, value: m.code }))
);

const ratioSelectOptions = computed(() =>
  ratioList.value.filter((r) => r.status === 1).map((r) => ({ label: r.label, value: `${r.width}:${r.height}` }))
);

const countSelectOptions = computed(() =>
  countList.value.filter((c) => c.status === 1).map((c) => ({ label: c.label, value: c.value }))
);

const handleSaveGenerate = () => {
  generateSaving.value = true;
  setTimeout(() => {
    generateSaving.value = false;
    message.success('生成配置保存成功');
  }, 500);
};

// ==================== 删除确认 ====================
const deleteConfirm = reactive({
  visible: false,
  loading: false,
  content: '',
  type: '' as 'model' | 'ratio' | 'count',
  id: null as number | null,
});

const handleDeleteConfirm = () => {
  deleteConfirm.loading = true;
  setTimeout(() => {
    if (deleteConfirm.type === 'model') {
      modelList.value = modelList.value.filter((item) => item.id !== deleteConfirm.id);
    } else if (deleteConfirm.type === 'ratio') {
      ratioList.value = ratioList.value.filter((item) => item.id !== deleteConfirm.id);
    } else if (deleteConfirm.type === 'count') {
      countList.value = countList.value.filter((item) => item.id !== deleteConfirm.id);
    }
    deleteConfirm.visible = false;
    deleteConfirm.loading = false;
    message.success('删除成功');
  }, 500);
};

// ==================== 操作日志 ====================
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
  { id: 2, adminName: 'admin', action: 'update', module: 'system', targetId: null, description: '更新模型配置', ip: '192.168.1.100', createdAt: '2026-01-26T08:25:00Z' },
  { id: 3, adminName: 'admin', action: 'audit', module: 'works', targetId: 102, description: '审核通过作品 #102', ip: '192.168.1.100', createdAt: '2026-01-26T08:20:00Z' },
  { id: 4, adminName: 'admin', action: 'ban', module: 'user', targetId: 45, description: '封禁用户 #45', ip: '192.168.1.100', createdAt: '2026-01-26T08:15:00Z' },
  { id: 5, adminName: 'admin', action: 'create', module: 'category', targetId: 12, description: '创建分类「极简风格」', ip: '192.168.1.100', createdAt: '2026-01-26T08:10:00Z' },
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
      const textMap: Record<string, string> = { user: '用户', works: '作品', category: '分类', system: '系统' };
      return textMap[row.module] || row.module;
    },
  },
  { title: '描述', key: 'description', ellipsis: { tooltip: true } },
  { title: 'IP', key: 'ip', width: 130 },
  { title: '时间', key: 'createdAt', width: 160, render: (row) => formatDateTime(row.createdAt) },
];

const handleSearchLog = () => {
  logPagination.page = 1;
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
