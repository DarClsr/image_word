<template>
  <section class="page">
    <PageHeader title="数据面板" subtitle="系统核心数据概览与趋势分析">
      <n-button @click="handleRefresh" :loading="loading">
        <template #icon>
          <n-icon><RefreshOutline /></n-icon>
        </template>
        刷新数据
      </n-button>
    </PageHeader>

    <!-- 统计卡片 -->
    <n-grid :x-gap="16" :y-gap="16" cols="1 s:2 m:4" responsive="screen" class="stat-cards">
      <n-gi v-for="stat in statCards" :key="stat.title">
        <n-card class="stat-card" :class="`stat-card--${stat.type}`">
          <div class="stat-card__content">
            <div class="stat-card__info">
              <span class="stat-card__title">{{ stat.title }}</span>
              <span class="stat-card__value">{{ stat.value }}</span>
              <div v-if="stat.change" class="stat-card__change" :class="{ 'is-up': stat.changeUp }">
                <n-icon :size="14">
                  <TrendingUpOutline v-if="stat.changeUp" />
                  <TrendingDownOutline v-else />
                </n-icon>
                <span>{{ stat.change }}</span>
                <span class="stat-card__period">较昨日</span>
              </div>
            </div>
            <div class="stat-card__icon">
              <n-icon :size="28">
                <component :is="stat.icon" />
              </n-icon>
            </div>
          </div>
        </n-card>
      </n-gi>
    </n-grid>

    <!-- 图表区域 -->
    <!-- 生成趋势 - 独占一行 -->
    <n-card title="生成趋势" class="chart-card chart-section">
      <template #header-extra>
        <n-radio-group v-model:value="trendRange" size="small" @update:value="loadTrend">
          <n-radio-button value="7d">近7天</n-radio-button>
          <n-radio-button value="30d">近30天</n-radio-button>
        </n-radio-group>
      </template>
      <LineChart
        :x-data="trendChartData.xAxis"
        :series="trendChartData.series"
        :height="300"
      />
    </n-card>

    <!-- 风格分布 + 模型调用统计 - 同一行 -->
    <n-grid :x-gap="16" :y-gap="16" cols="2" class="chart-section">
      <n-gi>
        <n-card title="风格分布" class="chart-card chart-card--centered">
          <PieChart :data="styleDistData" :height="300" />
        </n-card>
      </n-gi>
      <n-gi>
        <n-card title="模型调用统计" class="chart-card chart-card--centered">
          <BarChart
            :x-data="modelStatData.xAxis"
            :series="modelStatData.series"
            :height="300"
          />
        </n-card>
      </n-gi>
    </n-grid>

    <!-- 最新作品 - 独占一行 -->
    <n-card title="最新作品" class="chart-card chart-section">
      <n-empty v-if="recentWorks.length === 0" description="暂无作品" />
      <n-list v-else hoverable clickable>
        <n-list-item v-for="item in recentWorks" :key="item.id">
          <template #prefix>
            <n-avatar :src="item.thumbnail || defaultAvatar" :size="48" style="border-radius: 8px" />
          </template>
          <n-thing :title="item.prompt" :description="item.style">
            <template #header-extra>
              <n-text depth="3" style="font-size: 12px">{{ item.time }}</n-text>
            </template>
          </n-thing>
        </n-list-item>
      </n-list>
    </n-card>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  NGrid,
  NGi,
  NCard,
  NButton,
  NIcon,
  NRadioGroup,
  NRadioButton,
  NList,
  NListItem,
  NThing,
  NAvatar,
  NText,
  NEmpty,
  useMessage,
} from 'naive-ui';
import {
  RefreshOutline,
  TrendingUpOutline,
  TrendingDownOutline,
  ImagesOutline,
  PeopleOutline,
  CheckmarkCircleOutline,
  TimeOutline,
} from '@vicons/ionicons5';
import { PageHeader } from '@/components/Common';
import { LineChart, PieChart, BarChart } from '@/components/Charts';
import {
  fetchDashboardOverview,
  fetchDashboardTrend,
  fetchDashboardStyleDist,
  fetchDashboardModelStat,
  fetchRecentWorks,
} from '@/api/dashboard';
import type { DashboardOverview, DashboardTrend, RecentWork, StyleDistItem, DashboardModelStat } from '@/types/dashboard';

const message = useMessage();
const loading = ref(false);
const trendRange = ref<'7d' | '30d'>('7d');
const defaultAvatar = 'https://picsum.photos/100/100?grayscale';

/** 概览数据 */
const overview = ref<DashboardOverview | null>(null);

/** 趋势数据 */
const trendData = ref<DashboardTrend>([]);

/** 风格分布 */
const styleDistData = ref<StyleDistItem[]>([]);

/** 模型统计 */
const modelStatData = ref<DashboardModelStat>({ xAxis: [], series: [] });

/** 最新作品 */
const recentWorks = ref<RecentWork[]>([]);

/** 统计卡片数据 */
const statCards = computed(() => {
  const data = overview.value;
  return [
    {
      title: '今日生成',
      value: data?.todayGeneration?.value ?? 0,
      change: data?.todayGeneration?.change,
      changeUp: data?.todayGeneration?.changeUp ?? true,
      icon: ImagesOutline,
      type: 'primary',
    },
    {
      title: '活跃用户',
      value: data?.activeUsers?.value ?? 0,
      change: data?.activeUsers?.change,
      changeUp: data?.activeUsers?.changeUp ?? true,
      icon: PeopleOutline,
      type: 'success',
    },
    {
      title: '审核通过率',
      value: data?.passRate?.value ?? '0%',
      change: data?.passRate?.change,
      changeUp: data?.passRate?.changeUp ?? true,
      icon: CheckmarkCircleOutline,
      type: 'warning',
    },
    {
      title: '待审核',
      value: data?.pendingAudit?.value ?? 0,
      change: undefined,
      changeUp: false,
      icon: TimeOutline,
      type: 'info',
    },
  ];
});

/** 趋势图表数据 */
const trendChartData = computed(() => {
  if (!trendData.value.length) {
    return { xAxis: [], series: [] };
  }
  return {
    xAxis: trendData.value.map((item) => {
      const d = new Date(item.date);
      return `${d.getMonth() + 1}/${d.getDate()}`;
    }),
    
    series: [
      {
        name: '新增作品',
        data: trendData.value.map((item) => item.works),
        color: '#3b82f6',
      },
      {
        name: '新增用户',
        data: trendData.value.map((item) => item.users),
        color: '#22c55e',
      },
    ],
  };
});

/** 加载概览数据 */
const loadOverview = async () => {
  try {
    overview.value = await fetchDashboardOverview();
  } catch (error) {
    console.error('加载概览数据失败:', error);
  }
};

/** 加载趋势数据 */
const loadTrend = async (range?: '7d' | '30d') => {
  try {
    trendData.value = await fetchDashboardTrend(range || trendRange.value);
  } catch (error) {
    console.error('加载趋势数据失败:', error);
  }
};

/** 加载风格分布 */
const loadStyleDist = async () => {
  try {
    styleDistData.value = await fetchDashboardStyleDist();
  } catch (error) {
    console.error('加载风格分布失败:', error);
  }
};

/** 加载模型统计 */
const loadModelStat = async () => {
  try {
    modelStatData.value = await fetchDashboardModelStat();
  } catch (error) {
    console.error('加载模型统计失败:', error);
  }
};

/** 加载最新作品 */
const loadRecentWorks = async () => {
  try {
    recentWorks.value = await fetchRecentWorks(5);
  } catch (error) {
    console.error('加载最新作品失败:', error);
  }
};

/** 加载所有数据 */
const loadAllData = async () => {
  await Promise.all([
    loadOverview(),
    loadTrend(),
    loadStyleDist(),
    loadModelStat(),
    loadRecentWorks(),
  ]);
};

/** 刷新数据 */
const handleRefresh = async () => {
  loading.value = true;
  try {
    await loadAllData();
    message.success('数据已刷新');
  } catch {
    message.error('刷新失败，请重试');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadAllData();
});
</script>

<style scoped>
.page {
  width: 100%;
}

.stat-cards {
  margin-bottom: 20px;
}

/* 确保卡片高度一致 */
.stat-cards :deep(.n-grid-item) {
  display: flex;
}

.stat-cards :deep(.n-gi) {
  display: flex;
}

/* 统计卡片 */
.stat-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-radius: 14px;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-soft);
}

.stat-card :deep(.n-card__content) {
  flex: 1;
  display: flex;
  align-items: center;
}

.stat-card__content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.stat-card__info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-height: 90px;
}

.stat-card__title {
  font-size: 13px;
  color: var(--color-muted);
  font-weight: 500;
}

.stat-card__value {
  font-size: 30px;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.2;
  letter-spacing: -0.5px;
}

.stat-card__change {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
  color: #ef4444;
}

.stat-card__change.is-up {
  color: #22c55e;
}

.stat-card__period {
  color: var(--color-muted);
  margin-left: 4px;
  font-weight: 400;
}

.stat-card__icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.stat-card--primary .stat-card__icon {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.35);
}

.stat-card--success .stat-card__icon {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  box-shadow: 0 4px 14px rgba(34, 197, 94, 0.35);
}

.stat-card--warning .stat-card__icon {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  box-shadow: 0 4px 14px rgba(245, 158, 11, 0.35);
}

.stat-card--info .stat-card__icon {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  box-shadow: 0 4px 14px rgba(139, 92, 246, 0.35);
}

/* 图表区域 */
.chart-section {
  margin-bottom: 20px;
}

.chart-card {
  border-radius: 14px;
  transition: box-shadow 0.2s ease;
}

.chart-card:hover {
  box-shadow: var(--shadow-soft);
}

.chart-card :deep(.n-card-header) {
  padding-bottom: 12px;
}

.chart-card :deep(.n-card-header__main) {
  font-weight: 600;
  font-size: 15px;
}

.chart-card :deep(.n-card__content) {
  padding-top: 12px;
  padding-bottom: 16px;
}

/* 图表居中 */
.chart-card--centered {
  height: 100%;
}

.chart-card--centered :deep(.n-card__content) {
  display: flex;
  justify-content: center;
  align-items: center;
}

.chart-card--centered :deep(.chart-container) {
  max-width: 100%;
}

/* 确保同行卡片高度一致 */
.chart-section :deep(.n-gi) {
  display: flex;
}

.chart-section :deep(.n-grid-item) {
  display: flex;
}

/* 列表项优化 */
.chart-card :deep(.n-list-item) {
  border-radius: 10px;
  margin-bottom: 6px;
  transition: background-color 0.15s ease;
}

.chart-card :deep(.n-list-item:last-child) {
  margin-bottom: 0;
}

.chart-card :deep(.n-thing-header__title) {
  font-weight: 500;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.chart-card :deep(.n-thing__description) {
  color: var(--color-primary);
  font-weight: 500;
  font-size: 12px;
}

/* 暗黑模式优化 */
:global(html[data-theme='dark']) .stat-card--primary .stat-card__icon {
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.25);
}

:global(html[data-theme='dark']) .stat-card--success .stat-card__icon {
  box-shadow: 0 4px 14px rgba(34, 197, 94, 0.25);
}

:global(html[data-theme='dark']) .stat-card--warning .stat-card__icon {
  box-shadow: 0 4px 14px rgba(245, 158, 11, 0.25);
}

:global(html[data-theme='dark']) .stat-card--info .stat-card__icon {
  box-shadow: 0 4px 14px rgba(139, 92, 246, 0.25);
}
</style>
