<template>
  <div class="ad-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">广告管理</h2>
      <n-space>
        <n-date-picker
          v-model:value="dateRange"
          type="daterange"
          clearable
          @update:value="handleDateChange"
        />
        <n-button @click="refreshData">
          <template #icon>
            <n-icon><RefreshOutline /></n-icon>
          </template>
          刷新
        </n-button>
      </n-space>
    </div>

    <!-- 统计卡片 -->
    <n-grid :cols="5" :x-gap="16" :y-gap="16" class="stats-cards">
      <n-grid-item>
        <n-card>
          <n-statistic label="总观看次数" :value="stats.overview?.totalViews || 0">
            <template #prefix>
              <n-icon :component="EyeOutline" />
            </template>
          </n-statistic>
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card>
          <n-statistic label="完成观看" :value="stats.overview?.completedViews || 0">
            <template #prefix>
              <n-icon :component="CheckmarkCircleOutline" />
            </template>
          </n-statistic>
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card>
          <n-statistic label="完成率" :value="stats.overview?.completionRate || '0%'">
            <template #prefix>
              <n-icon :component="TrendingUpOutline" />
            </template>
          </n-statistic>
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card>
          <n-statistic label="发放奖励" :value="stats.overview?.rewardedCount || 0">
            <template #prefix>
              <n-icon :component="GiftOutline" />
            </template>
          </n-statistic>
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card>
          <n-statistic label="总发放额度" :value="stats.overview?.totalRewardQuota || 0">
            <template #prefix>
              <n-icon :component="CashOutline" />
            </template>
          </n-statistic>
        </n-card>
      </n-grid-item>
    </n-grid>

    <!-- 今日数据 -->
    <n-card title="今日数据" class="today-stats">
      <n-grid :cols="3" :x-gap="16">
        <n-grid-item>
          <n-statistic label="今日观看" :value="stats.today?.viewCount || 0" />
        </n-grid-item>
        <n-grid-item>
          <n-statistic label="今日奖励" :value="stats.today?.rewardCount || 0" />
        </n-grid-item>
        <n-grid-item>
          <n-statistic label="今日发放额度" :value="stats.today?.totalRewardQuota || 0" />
        </n-grid-item>
      </n-grid>
    </n-card>

    <!-- 数据图表 -->
    <n-card title="趋势统计" class="chart-card">
      <div ref="chartRef" class="chart-container"></div>
    </n-card>

    <!-- 标签页 -->
    <n-card class="data-table-card">
      <n-tabs v-model:value="activeTab" type="line">
        <n-tab-pane name="records" tab="观看记录">
          <n-data-table
            :columns="recordColumns"
            :data="recordList"
            :loading="recordLoading"
            :pagination="recordPagination"
            @update:page="handleRecordPageChange"
            @update:page-size="handleRecordPageSizeChange"
          />
        </n-tab-pane>
        <n-tab-pane name="rank" tab="用户排行">
          <n-data-table
            :columns="rankColumns"
            :data="rankList"
            :loading="rankLoading"
            :pagination="rankPagination"
            @update:page="handleRankPageChange"
            @update:page-size="handleRankPageSizeChange"
          />
        </n-tab-pane>
      </n-tabs>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, h, nextTick } from 'vue';
import { useMessage } from 'naive-ui';
import {
  RefreshOutline,
  EyeOutline,
  CheckmarkCircleOutline,
  TrendingUpOutline,
  GiftOutline,
  CashOutline,
} from '@vicons/ionicons5';
import * as echarts from 'echarts';
import { fetchAdStats, fetchAdList, fetchAdUserRank } from '@/api/ad';
import type { AdViewRecord, AdUserRank, AdDailyStats } from '@/api/ad';
import type { DataTableColumns } from 'naive-ui';

const message = useMessage();

// 日期范围
const dateRange = ref<[number, number] | null>(null);

// 统计数据
const stats = reactive({
  overview: null as any,
  today: null as any,
  dailyStats: [] as AdDailyStats[],
});

// 当前标签页
const activeTab = ref('records');

// 图表
const chartRef = ref<HTMLElement>();
let chartInstance: echarts.ECharts | null = null;

// 观看记录
const recordLoading = ref(false);
const recordList = ref<AdViewRecord[]>([]);
const recordPagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
});

// 用户排行
const rankLoading = ref(false);
const rankList = ref<AdUserRank[]>([]);
const rankPagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
});

// 观看记录列
const recordColumns: DataTableColumns<AdViewRecord> = [
  { title: 'ID', key: 'id', width: 80 },
  {
    title: '用户',
    key: 'user',
    render(row) {
      return h('div', { class: 'user-info' }, [
        h('img', {
          src: row.user?.avatar || '/default-avatar.png',
          class: 'user-avatar',
        }),
        h('span', row.user?.nickname || `用户${row.userId}`),
      ]);
    },
  },
  { title: '广告类型', key: 'adType', width: 100 },
  { title: '提供商', key: 'provider', width: 100 },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render(row) {
      const statusMap: Record<string, { text: string; type: string }> = {
        started: { text: '开始', type: 'warning' },
        completed: { text: '完成', type: 'success' },
        failed: { text: '失败', type: 'error' },
      };
      const status = statusMap[row.status] || { text: row.status, type: 'default' };
      return h(
        'n-tag',
        { type: status.type as any, size: 'small' },
        { default: () => status.text }
      );
    },
  },
  { title: '奖励额度', key: 'rewardQuota', width: 100 },
  {
    title: '已奖励',
    key: 'rewarded',
    width: 100,
    render(row) {
      return h(
        'n-tag',
        { type: row.rewarded ? 'success' : 'default', size: 'small' },
        { default: () => (row.rewarded ? '是' : '否') }
      );
    },
  },
  {
    title: '观看时间',
    key: 'createdAt',
    width: 180,
    render(row) {
      return new Date(row.createdAt).toLocaleString();
    },
  },
];

// 用户排行列
const rankColumns: DataTableColumns<AdUserRank> = [
  {
    title: '排名',
    key: 'rank',
    width: 80,
    render(_, index) {
      const rank = (rankPagination.page - 1) * rankPagination.pageSize + index + 1;
      return h(
        'span',
        { class: rank <= 3 ? 'rank-top' : '' },
        rank
      );
    },
  },
  {
    title: '用户',
    key: 'user',
    render(row) {
      return h('div', { class: 'user-info' }, [
        h('img', {
          src: row.user?.avatar || '/default-avatar.png',
          class: 'user-avatar',
        }),
        h('span', row.user?.nickname || `用户${row.userId}`),
      ]);
    },
  },
  { title: '观看次数', key: 'viewCount', sorter: true },
  { title: '获得奖励次数', key: 'rewardCount', sorter: true },
  { title: '总获得额度', key: 'totalRewardQuota', sorter: true },
];

/** 加载统计数据 */
const loadStats = async () => {
  try {
    const params: any = {};
    if (dateRange.value) {
      params.startDate = new Date(dateRange.value[0]).toISOString().split('T')[0];
      params.endDate = new Date(dateRange.value[1]).toISOString().split('T')[0];
    }
    const res = await fetchAdStats(params);
    stats.overview = res.overview;
    stats.today = res.today;
    stats.dailyStats = res.dailyStats;
    initChart();
  } catch (error) {
    message.error('加载统计数据失败');
    console.error(error);
  }
};

/** 加载观看记录 */
const loadRecords = async () => {
  recordLoading.value = true;
  try {
    const params: any = {
      page: recordPagination.page,
      pageSize: recordPagination.pageSize,
    };
    if (dateRange.value) {
      params.startDate = new Date(dateRange.value[0]).toISOString().split('T')[0];
      params.endDate = new Date(dateRange.value[1]).toISOString().split('T')[0];
    }
    const res = await fetchAdList(params);
    recordList.value = res.list || [];
    recordPagination.total = res.total || 0;
  } catch (error) {
    message.error('加载观看记录失败');
    console.error(error);
  } finally {
    recordLoading.value = false;
  }
};

/** 加载用户排行 */
const loadRank = async () => {
  rankLoading.value = true;
  try {
    const params: any = {
      page: rankPagination.page,
      pageSize: rankPagination.pageSize,
    };
    if (dateRange.value) {
      params.startDate = new Date(dateRange.value[0]).toISOString().split('T')[0];
      params.endDate = new Date(dateRange.value[1]).toISOString().split('T')[0];
    }
    const res = await fetchAdUserRank(params);
    rankList.value = res.list || [];
    rankPagination.total = res.total || 0;
  } catch (error) {
    message.error('加载用户排行失败');
    console.error(error);
  } finally {
    rankLoading.value = false;
  }
};

/** 初始化图表 */
const initChart = () => {
  if (!chartRef.value) return;
  
  nextTick(() => {
    if (chartInstance) {
      chartInstance.dispose();
    }
    
    chartInstance = echarts.init(chartRef.value!);
    
    const dates = stats.dailyStats.map(s => s.date);
    const viewCounts = stats.dailyStats.map(s => s.viewCount);
    const rewardCounts = stats.dailyStats.map(s => s.rewardCount);
    const rewardQuotas = stats.dailyStats.map(s => s.totalRewardQuota);
    
    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
      },
      legend: {
        data: ['观看次数', '奖励次数', '发放额度'],
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: dates,
      },
      yAxis: [
        {
          type: 'value',
          name: '次数',
          position: 'left',
        },
        {
          type: 'value',
          name: '额度',
          position: 'right',
        },
      ],
      series: [
        {
          name: '观看次数',
          type: 'line',
          data: viewCounts,
          smooth: true,
          itemStyle: { color: '#1890ff' },
        },
        {
          name: '奖励次数',
          type: 'line',
          data: rewardCounts,
          smooth: true,
          itemStyle: { color: '#52c41a' },
        },
        {
          name: '发放额度',
          type: 'line',
          yAxisIndex: 1,
          data: rewardQuotas,
          smooth: true,
          itemStyle: { color: '#faad14' },
        },
      ],
    };
    
    chartInstance.setOption(option);
  });
};

/** 日期变化 */
const handleDateChange = () => {
  loadStats();
  loadRecords();
  loadRank();
};

/** 刷新数据 */
const refreshData = () => {
  loadStats();
  loadRecords();
  loadRank();
};

/** 观看记录分页 */
const handleRecordPageChange = (page: number) => {
  recordPagination.page = page;
  loadRecords();
};

const handleRecordPageSizeChange = (pageSize: number) => {
  recordPagination.pageSize = pageSize;
  recordPagination.page = 1;
  loadRecords();
};

/** 用户排行走分页 */
const handleRankPageChange = (page: number) => {
  rankPagination.page = page;
  loadRank();
};

const handleRankPageSizeChange = (pageSize: number) => {
  rankPagination.pageSize = pageSize;
  rankPagination.page = 1;
  loadRank();
};

onMounted(() => {
  loadStats();
  loadRecords();
  loadRank();
  
  window.addEventListener('resize', () => {
    chartInstance?.resize();
  });
});
</script>

<style scoped lang="scss">
.ad-management {
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 500;
}

.stats-cards {
  margin-bottom: 24px;
}

.today-stats {
  margin-bottom: 24px;
}

.chart-card {
  margin-bottom: 24px;
}

.chart-container {
  height: 300px;
}

.data-table-card {
  min-height: 500px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.rank-top {
  color: #f5222d;
  font-weight: bold;
  font-size: 16px;
}
</style>
