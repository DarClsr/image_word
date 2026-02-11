<template>
  <section class="page">
    <PageHeader title="用户管理" subtitle="查看和管理系统用户">
      <n-button :loading="exporting" @click="handleExport">
        <template #icon>
          <n-icon><DownloadOutline /></n-icon>
        </template>
        导出用户
      </n-button>
    </PageHeader>

    <!-- 搜索栏 -->
    <n-card class="search-card" :bordered="false">
      <n-form :model="queryParams" label-placement="left" :show-feedback="false">
        <n-grid :x-gap="16" :y-gap="16" cols="2 s:3 m:4 l:5">
          <n-gi>
            <n-form-item label="关键词">
              <n-input v-model:value="queryParams.keyword" placeholder="昵称/手机号" clearable />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="会员类型">
              <n-select v-model:value="queryParams.memberType" :options="memberOptions" placeholder="全部会员" clearable />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="状态">
              <n-select v-model:value="queryParams.status" :options="statusOptions" placeholder="全部状态" clearable />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="注册时间">
              <n-date-picker v-model:value="queryParams.dateRange" type="daterange" clearable style="width: 100%" />
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
        :row-key="(row: User) => row.id"
        striped
        @update:page="onPageChange"
        @update:page-size="onPageSizeChange"
      />
    </n-card>

    <!-- 用户详情 -->
    <n-drawer v-model:show="detailDrawer.visible" :width="480">
      <n-drawer-content :title="`用户详情 - ${detailDrawer.data?.nickname || ''}`" closable>
        <div v-if="detailDrawer.data" class="user-detail">
          <div class="user-detail__header">
            <n-avatar :src="detailDrawer.data.avatar" :size="72" round />
            <div class="user-detail__info">
              <h3>{{ detailDrawer.data.nickname }}</h3>
              <n-space :size="8">
                <n-tag :type="getMemberType(detailDrawer.data.memberType)" size="small">
                  {{ getMemberText(detailDrawer.data.memberType) }}
                </n-tag>
                <n-tag :type="detailDrawer.data.status === 1 ? 'success' : 'error'" size="small">
                  {{ detailDrawer.data.status === 1 ? '正常' : '已封禁' }}
                </n-tag>
              </n-space>
            </div>
          </div>

          <n-divider />

          <n-descriptions :column="1" label-placement="left">
            <n-descriptions-item label="用户 ID">{{ detailDrawer.data.id }}</n-descriptions-item>
            <n-descriptions-item label="手机号">{{ maskPhone(detailDrawer.data.phone) }}</n-descriptions-item>
            <n-descriptions-item label="性别">{{ getGenderText(detailDrawer.data.gender) }}</n-descriptions-item>
            <n-descriptions-item label="会员到期">{{ detailDrawer.data.memberExpireAt ? formatDate(detailDrawer.data.memberExpireAt) : '-' }}</n-descriptions-item>
          </n-descriptions>

          <n-divider title-placement="left">额度信息</n-divider>

          <div class="quota-info">
            <div class="quota-info__item">
              <span class="quota-info__label">总额度</span>
              <span class="quota-info__value">{{ detailDrawer.data.totalQuota }}</span>
            </div>
            <div class="quota-info__item">
              <span class="quota-info__label">已使用</span>
              <span class="quota-info__value">{{ detailDrawer.data.usedQuota }}</span>
            </div>
            <div class="quota-info__item">
              <span class="quota-info__label">剩余</span>
              <span class="quota-info__value text-primary">{{ detailDrawer.data.totalQuota - detailDrawer.data.usedQuota }}</span>
            </div>
          </div>

          <n-progress
            type="line"
            :percentage="Math.round((detailDrawer.data.usedQuota / detailDrawer.data.totalQuota) * 100)"
            :show-indicator="false"
            style="margin-top: 8px"
          />

          <n-divider title-placement="left">统计信息</n-divider>

          <n-descriptions :column="2" label-placement="left">
            <n-descriptions-item label="作品数">{{ detailDrawer.data.worksCount }}</n-descriptions-item>
            <n-descriptions-item label="生成次数">{{ detailDrawer.data.totalGenerate }}</n-descriptions-item>
            <n-descriptions-item label="最后登录">{{ formatDateTime(detailDrawer.data.lastLoginAt) }}</n-descriptions-item>
            <n-descriptions-item label="注册时间">{{ formatDateTime(detailDrawer.data.createdAt) }}</n-descriptions-item>
          </n-descriptions>
        </div>

        <template #footer>
          <n-space>
            <n-button @click="handleAdjustQuota(detailDrawer.data!)">调整额度</n-button>
            <n-button @click="handleAdjustMember(detailDrawer.data!)">调整会员</n-button>
            <n-button
              :type="detailDrawer.data?.status === 1 ? 'error' : 'success'"
              @click="handleToggleStatus(detailDrawer.data!)"
            >
              {{ detailDrawer.data?.status === 1 ? '封禁用户' : '解除封禁' }}
            </n-button>
          </n-space>
        </template>
      </n-drawer-content>
    </n-drawer>

    <!-- 调整额度弹窗 -->
    <n-modal v-model:show="quotaModal.visible" preset="card" title="调整额度" style="width: 400px">
      <n-form :model="quotaModal" label-placement="left" label-width="80">
        <n-form-item label="当前额度">
          <span>{{ quotaModal.currentQuota }}</span>
        </n-form-item>
        <n-form-item label="调整数量">
          <n-input-number v-model:value="quotaModal.amount" style="width: 100%" placeholder="正数增加，负数减少" />
        </n-form-item>
        <n-form-item label="调整原因">
          <n-input v-model:value="quotaModal.reason" placeholder="请输入调整原因" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="quotaModal.visible = false">取消</n-button>
          <n-button type="primary" :loading="quotaModal.loading" @click="handleQuotaConfirm">确定</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 调整会员弹窗 -->
    <n-modal v-model:show="memberModal.visible" preset="card" title="调整会员" style="width: 400px">
      <n-form :model="memberModal" label-placement="left" label-width="80">
        <n-form-item label="会员类型">
          <n-select v-model:value="memberModal.memberType" :options="memberOptions" />
        </n-form-item>
        <n-form-item label="到期时间">
          <n-date-picker v-model:value="memberModal.expireAt" type="date" style="width: 100%" clearable />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="memberModal.visible = false">取消</n-button>
          <n-button type="primary" :loading="memberModal.loading" @click="handleMemberConfirm">确定</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 封禁确认 -->
    <ConfirmModal
      v-model:visible="banConfirm.visible"
      :title="banConfirm.title"
      :content="banConfirm.content"
      :type="banConfirm.type"
      :loading="banConfirm.loading"
      @confirm="handleBanConfirm"
    />
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
  NInputNumber,
  NSelect,
  NDatePicker,
  NButton,
  NSpace,
  NIcon,
  NDataTable,
  NDrawer,
  NDrawerContent,
  NModal,
  NTag,
  NAvatar,
  NDivider,
  NDescriptions,
  NDescriptionsItem,
  NProgress,
  useMessage,
  type DataTableColumns,
} from 'naive-ui';
import { SearchOutline, RefreshOutline, DownloadOutline, EyeOutline } from '@vicons/ionicons5';
import { PageHeader, ConfirmModal } from '@/components/Common';
import type { User } from '@/types/user';
import { formatDateTime, formatDate, maskPhone } from '@/utils/format';
import { fetchUsers, updateUserQuota, banUser, unbanUser, updateUserMember } from '@/api/user';

const message = useMessage();

/** 查询参数 */
const queryParams = reactive({
  keyword: '',
  memberType: null as string | null,
  status: null as number | null,
  dateRange: null as [number, number] | null,
});

/** 会员选项 */
const memberOptions = [
  { label: '免费用户', value: 'free' },
  { label: '基础会员', value: 'basic' },
  { label: '专业会员', value: 'pro' },
];

/** 状态选项 */
const statusOptions = [
  { label: '正常', value: 1 },
  { label: '已封禁', value: 0 },
];

/** 加载状态 */
const loading = ref(false);
const exporting = ref(false);

/** 数据列表 */
const dataList = ref<User[]>([]);

/** 分页 */
const pagination = reactive({
  page: 1,
  pageSize: 10,
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
const columns: DataTableColumns<User> = [
  { title: 'ID', key: 'id', width: 60 },
  {
    title: '用户信息',
    key: 'info',
    width: 180,
    render: (row) =>
      h('div', { style: { display: 'flex', alignItems: 'center', gap: '10px' } }, [
        h(NAvatar, { src: row.avatar, size: 36, round: true }),
        h('div', null, [
          h('div', { style: { fontWeight: 500 } }, row.nickname),
          h('div', { style: { fontSize: '12px', color: '#9ca3af' } }, maskPhone(row.phone)),
        ]),
      ]),
  },
  {
    title: '会员',
    key: 'memberType',
    width: 100,
    render: (row) => h(NTag, { type: getMemberType(row.memberType), size: 'small' }, () => getMemberText(row.memberType)),
  },
  {
    title: '额度',
    key: 'quota',
    width: 100,
    render: (row) => `${row.usedQuota} / ${row.totalQuota}`,
  },
  { title: '作品数', key: 'worksCount', width: 80 },
  {
    title: '状态',
    key: 'status',
    width: 80,
    render: (row) => h(NTag, { type: row.status === 1 ? 'success' : 'error', size: 'small' }, () => row.status === 1 ? '正常' : '封禁'),
  },
  {
    title: '最后登录',
    key: 'lastLoginAt',
    width: 160,
    render: (row) => formatDateTime(row.lastLoginAt),
  },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    fixed: 'right',
    render: (row) =>
      h(NSpace, { size: 'small' }, () => [
        h(NButton, { text: true, type: 'info', onClick: () => handleView(row) }, { icon: () => h(NIcon, null, () => h(EyeOutline)), default: () => '详情' }),
      ]),
  },
];

/** 详情抽屉 */
const detailDrawer = reactive({
  visible: false,
  data: null as User | null,
});

/** 额度调整弹窗 */
const quotaModal = reactive({
  visible: false,
  loading: false,
  userId: null as number | null,
  currentQuota: 0,
  amount: 0,
  reason: '',
});

/** 会员调整弹窗 */
const memberModal = reactive({
  visible: false,
  loading: false,
  userId: null as number | null,
  memberType: 'free' as 'free' | 'basic' | 'pro',
  expireAt: null as number | null,
});

/** 封禁确认 */
const banConfirm = reactive({
  visible: false,
  loading: false,
  title: '',
  content: '',
  type: 'warning' as 'warning' | 'error',
  userId: null as number | null,
  action: '' as 'ban' | 'unban',
});

/** 获取会员类型 */
const getMemberType = (type: string) => {
  const map: Record<string, 'default' | 'info' | 'success'> = {
    free: 'default',
    basic: 'info',
    pro: 'success',
  };
  return map[type] || 'default';
};

/** 获取会员文本 */
const getMemberText = (type: string) => {
  const map: Record<string, string> = {
    free: '免费',
    basic: '基础',
    pro: '专业',
  };
  return map[type] || type;
};

/** 获取性别文本 */
const getGenderText = (gender: number) => {
  const map: Record<number, string> = { 0: '未知', 1: '男', 2: '女' };
  return map[gender] || '未知';
};

/** 加载用户列表 */
const loadData = async () => {
  loading.value = true;
  try {
    const params: Record<string, unknown> = {
      page: pagination.page,
      pageSize: pagination.pageSize,
    };

    if (queryParams.keyword) {
      params.keyword = queryParams.keyword;
    }
    if (queryParams.memberType) {
      params.memberType = queryParams.memberType;
    }
    if (queryParams.status !== null) {
      params.status = queryParams.status;
    }
    if (queryParams.dateRange) {
      params.startDate = new Date(queryParams.dateRange[0]).toISOString();
      params.endDate = new Date(queryParams.dateRange[1]).toISOString();
    }

    const data = await fetchUsers(params);
    dataList.value = data.list || [];
    pagination.total = data.total || 0;
  } catch (error) {
    message.error('加载用户列表失败');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

/** 搜索 */
const handleSearch = () => {
  pagination.page = 1;
  loadData();
};

/** 重置 */
const handleReset = () => {
  queryParams.keyword = '';
  queryParams.memberType = null;
  queryParams.status = null;
  queryParams.dateRange = null;
  handleSearch();
};

/** 分页变化 */
const onPageChange = (page: number) => {
  pagination.page = page;
  loadData();
};

const onPageSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize;
  pagination.page = 1;
  loadData();
};

/** 查看详情 */
const handleView = (row: User) => {
  detailDrawer.visible = true;
  detailDrawer.data = row;
};

/** 调整额度 */
const handleAdjustQuota = (user: User) => {
  quotaModal.visible = true;
  quotaModal.userId = user.id;
  quotaModal.currentQuota = user.totalQuota;
  quotaModal.amount = 0;
  quotaModal.reason = '';
};

/** 确认调整额度 */
const handleQuotaConfirm = async () => {
  if (quotaModal.amount === 0) {
    message.warning('请输入调整数量');
    return;
  }
  if (!quotaModal.reason) {
    message.warning('请输入调整原因');
    return;
  }
  if (!quotaModal.userId) return;

  quotaModal.loading = true;
  try {
    await updateUserQuota(quotaModal.userId, {
      amount: quotaModal.amount,
      reason: quotaModal.reason,
    });

    // 更新本地数据
    const user = dataList.value.find((u) => u.id === quotaModal.userId);
    if (user) {
      user.totalQuota += quotaModal.amount;
      if (detailDrawer.data?.id === user.id) {
        detailDrawer.data.totalQuota = user.totalQuota;
      }
    }

    quotaModal.visible = false;
    message.success('额度调整成功');
  } catch (error) {
    message.error('额度调整失败');
    console.error(error);
  } finally {
    quotaModal.loading = false;
  }
};

/** 调整会员 */
const handleAdjustMember = (user: User) => {
  memberModal.visible = true;
  memberModal.userId = user.id;
  memberModal.memberType = user.memberType;
  memberModal.expireAt = user.memberExpireAt ? new Date(user.memberExpireAt).getTime() : null;
};

/** 确认调整会员 */
const handleMemberConfirm = async () => {
  if (!memberModal.userId) return;

  memberModal.loading = true;
  try {
    await updateUserMember(memberModal.userId, {
      memberType: memberModal.memberType,
      expireAt: memberModal.expireAt ? new Date(memberModal.expireAt).toISOString() : undefined,
    });

    // 更新本地数据
    const user = dataList.value.find((u) => u.id === memberModal.userId);
    if (user) {
      user.memberType = memberModal.memberType;
      user.memberExpireAt = memberModal.expireAt ? new Date(memberModal.expireAt).toISOString() : undefined;
      if (detailDrawer.data?.id === user.id) {
        detailDrawer.data.memberType = user.memberType;
        detailDrawer.data.memberExpireAt = user.memberExpireAt;
      }
    }

    memberModal.visible = false;
    message.success('会员调整成功');
  } catch (error) {
    message.error('会员调整失败');
    console.error(error);
  } finally {
    memberModal.loading = false;
  }
};

/** 封禁/解封 */
const handleToggleStatus = (user: User) => {
  const isBan = user.status === 1;
  banConfirm.visible = true;
  banConfirm.userId = user.id;
  banConfirm.action = isBan ? 'ban' : 'unban';
  banConfirm.title = isBan ? '封禁用户' : '解除封禁';
  banConfirm.content = isBan
    ? `确定要封禁用户「${user.nickname}」吗？封禁后该用户将无法登录系统。`
    : `确定要解除用户「${user.nickname}」的封禁吗？`;
  banConfirm.type = isBan ? 'error' : 'warning';
};

/** 确认封禁/解封 */
const handleBanConfirm = async () => {
  if (!banConfirm.userId) return;

  banConfirm.loading = true;
  try {
    if (banConfirm.action === 'ban') {
      await banUser(banConfirm.userId, '管理员手动封禁');
    } else {
      await unbanUser(banConfirm.userId);
    }

    // 更新本地数据
    const user = dataList.value.find((u) => u.id === banConfirm.userId);
    if (user) {
      user.status = banConfirm.action === 'ban' ? 0 : 1;
      if (detailDrawer.data?.id === user.id) {
        detailDrawer.data.status = user.status;
      }
    }

    banConfirm.visible = false;
    message.success(banConfirm.action === 'ban' ? '用户已封禁' : '已解除封禁');
  } catch (error) {
    message.error(banConfirm.action === 'ban' ? '封禁失败' : '解封失败');
    console.error(error);
  } finally {
    banConfirm.loading = false;
  }
};

/** 导出 */
const handleExport = () => {
  if (exporting.value) return;
  exporting.value = true;

  const params: Record<string, unknown> = {};
  if (queryParams.keyword) params.keyword = queryParams.keyword;
  if (queryParams.memberType) params.memberType = queryParams.memberType;
  if (queryParams.status !== null) params.status = queryParams.status;
  if (queryParams.dateRange) {
    params.startDate = new Date(queryParams.dateRange[0]).toISOString();
    params.endDate = new Date(queryParams.dateRange[1]).toISOString();
  }

  fetchAllUsers(params)
    .then((users) => {
      if (!users.length) {
        message.warning('暂无可导出的用户数据');
        return;
      }
      const csv = buildUserCsv(users);
      const fileName = `users_${new Date().toISOString().slice(0, 10)}.csv`;
      downloadCsv(csv, fileName);
      message.success('导出成功');
    })
    .catch(() => {
      message.error('导出失败');
    })
    .finally(() => {
      exporting.value = false;
    });
};

const fetchAllUsers = async (params: Record<string, unknown>) => {
  const pageSize = 100;
  let page = 1;
  let total = 0;
  const all: User[] = [];

  do {
    const data = await fetchUsers({ ...params, page, pageSize });
    const list = data.list || [];
    total = data.total || 0;
    all.push(...list);
    page += 1;
  } while (all.length < total);

  return all;
};

const buildUserCsv = (users: User[]) => {
  const header = [
    'ID',
    '昵称',
    '手机号',
    '会员类型',
    '状态',
    '总额度',
    '已用额度',
    '作品数',
    '最后登录',
    '注册时间',
  ];

  const rows = users.map((user) => [
    user.id,
    user.nickname || '',
    user.phone || '',
    getMemberText(user.memberType),
    user.status === 1 ? '正常' : '封禁',
    user.totalQuota ?? 0,
    user.usedQuota ?? 0,
    user.worksCount ?? 0,
    formatDateTime(user.lastLoginAt),
    formatDateTime(user.createdAt),
  ]);

  return [header, ...rows]
    .map((row) => row.map((value) => escapeCsv(value)).join(','))
    .join('\n');
};

const escapeCsv = (value: unknown) => {
  const text = value === null || value === undefined ? '' : String(value);
  if (/[,"\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
};

const downloadCsv = (content: string, fileName: string) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/** 初始化 */
onMounted(() => {
  loadData();
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

.table-card {
  border-radius: 12px;
}

.user-detail__header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
}

.user-detail__info h3 {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
}

.quota-info {
  display: flex;
  gap: 24px;
}

.quota-info__item {
  display: flex;
  flex-direction: column;
}

.quota-info__label {
  font-size: 12px;
  color: var(--color-muted, #9ca3af);
}

.quota-info__value {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text, #111827);
}

.quota-info__value.text-primary {
  color: var(--color-primary, #3b82f6);
}
</style>
