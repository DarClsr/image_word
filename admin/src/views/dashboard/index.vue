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
    <n-grid :x-gap="16" :y-gap="16" cols="1 s:2 m:4" class="stat-cards">
      <n-gi v-for="stat in statCards" :key="stat.title">
        <n-card class="stat-card" :class="`stat-card--${stat.type}`">
          <div class="stat-card__content">
            <div class="stat-card__info">
              <span class="stat-card__title">{{ stat.title }}</span>
              <span class="stat-card__value">{{ stat.value }}</span>
              <div class="stat-card__change" :class="{ 'is-up': stat.changeUp }">
                <n-icon :size="14">
                  <TrendingUpOutline v-if="stat.changeUp" />
                  <TrendingDownOutline v-else />
                </n-icon>
                <span>{{ stat.change }}</span>
                <span class="stat-card__period">较昨日</span>
              </div>
            </div>
            <div class="stat-card__icon">
              <n-icon :size="32">
                <component :is="stat.icon" />
              </n-icon>
            </div>
          </div>
        </n-card>
      </n-gi>
    </n-grid>

    <!-- 图表区域 -->
    <n-grid :x-gap="16" :y-gap="16" cols="1 l:2" class="chart-section">
      <n-gi>
        <n-card title="生成趋势" class="chart-card">
          <template #header-extra>
            <n-radio-group v-model:value="trendRange" size="small">
              <n-radio-button value="7">近7天</n-radio-button>
              <n-radio-button value="30">近30天</n-radio-button>
            </n-radio-group>
          </template>
          <LineChart
            :x-data="trendData.xAxis"
            :series="trendData.series"
            :height="280"
          />
        </n-card>
      </n-gi>
      <n-gi>
        <n-card title="风格分布" class="chart-card">
          <PieChart :data="styleDistData" :height="280" />
        </n-card>
      </n-gi>
    </n-grid>

    <n-grid :x-gap="16" :y-gap="16" cols="1 l:2" class="chart-section">
      <n-gi>
        <n-card title="模型调用统计" class="chart-card">
          <BarChart
            :x-data="modelStatData.xAxis"
            :series="modelStatData.series"
            :height="260"
          />
        </n-card>
      </n-gi>
      <n-gi>
        <n-card title="最新作品" class="chart-card">
          <n-list hoverable clickable>
            <n-list-item v-for="item in recentWorks" :key="item.id">
              <template #prefix>
                <n-avatar :src="item.thumbnail" :size="48" style="border-radius: 8px" />
              </template>
              <n-thing :title="item.prompt" :description="item.style">
                <template #header-extra>
                  <n-text depth="3" style="font-size: 12px">{{ item.time }}</n-text>
                </template>
              </n-thing>
            </n-list-item>
          </n-list>
        </n-card>
      </n-gi>
    </n-grid>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
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
} from 'naive-ui';
import {
  RefreshOutline,
  TrendingUpOutline,
  TrendingDownOutline,
  ImagesOutline,
  PeopleOutline,
  CheckmarkCircleOutline,
  WalletOutline,
} from '@vicons/ionicons5';
import { PageHeader } from '@/components/Common';
import { LineChart, PieChart, BarChart } from '@/components/Charts';

const loading = ref(false);
const trendRange = ref('7');

/** 统计卡片数据 */
const statCards = reactive([
  {
    title: '今日生成',
    value: '1,248',
    change: '+12.5%',
    changeUp: true,
    icon: ImagesOutline,
    type: 'primary',
  },
  {
    title: '活跃用户',
    value: '352',
    change: '+8.3%',
    changeUp: true,
    icon: PeopleOutline,
    type: 'success',
  },
  {
    title: '审核通过率',
    value: '98.2%',
    change: '+2.1%',
    changeUp: true,
    icon: CheckmarkCircleOutline,
    type: 'warning',
  },
  {
    title: '本月收入',
    value: '¥12,680',
    change: '-3.2%',
    changeUp: false,
    icon: WalletOutline,
    type: 'info',
  },
]);

/** 趋势图数据 */
const trendData = computed(() => {
  const days = parseInt(trendRange.value);
  const xAxis = Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    return `${d.getMonth() + 1}/${d.getDate()}`;
  });

  return {
    xAxis,
    series: [
      {
        name: '生成次数',
        data: Array.from({ length: days }, () => Math.floor(Math.random() * 500 + 800)),
        color: '#3b82f6',
      },
      {
        name: '审核通过',
        data: Array.from({ length: days }, () => Math.floor(Math.random() * 450 + 750)),
        color: '#22c55e',
      },
    ],
  };
});

/** 风格分布数据 */
const styleDistData = reactive([
  { name: '国风', value: 320, color: '#ef4444' },
  { name: '赛博朋克', value: 280, color: '#3b82f6' },
  { name: '日漫', value: 250, color: '#f59e0b' },
  { name: '写实', value: 180, color: '#22c55e' },
  { name: '插画', value: 150, color: '#8b5cf6' },
  { name: '其他', value: 120, color: '#6b7280' },
]);

/** 模型统计数据 */
const modelStatData = reactive({
  xAxis: ['SDXL', 'Flux', 'DALL·E', 'Midjourney', 'Stable Diffusion'],
  series: [
    {
      name: '调用次数',
      data: [1200, 980, 750, 620, 480],
    },
  ],
});

/** 最新作品 */
const recentWorks = reactive([
  {
    id: 1,
    prompt: '春日樱花下的少女，粉色和服...',
    style: '日漫风格',
    thumbnail: 'https://picsum.photos/seed/1/100/100',
    time: '2分钟前',
  },
  {
    id: 2,
    prompt: '赛博朋克城市夜景，霓虹灯光...',
    style: '赛博朋克',
    thumbnail: 'https://picsum.photos/seed/2/100/100',
    time: '5分钟前',
  },
  {
    id: 3,
    prompt: '山水画风格的现代都市...',
    style: '国风',
    thumbnail: 'https://picsum.photos/seed/3/100/100',
    time: '12分钟前',
  },
  {
    id: 4,
    prompt: '写实风格人像照片，自然光线...',
    style: '写实',
    thumbnail: 'https://picsum.photos/seed/4/100/100',
    time: '18分钟前',
  },
]);

const handleRefresh = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
  }, 1000);
};

onMounted(() => {
  // 加载真实数据
});
</script>

<style scoped>
.page {
  width: 100%;
}

.stat-cards {
  margin-bottom: 16px;
}

.stat-card {
  border-radius: 12px;
  overflow: hidden;
}

.stat-card__content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stat-card__info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-card__title {
  font-size: 13px;
  color: var(--color-muted, #6b7280);
}

.stat-card__value {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text, #111827);
  line-height: 1.2;
}

.stat-card__change {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #ef4444;
}

.stat-card__change.is-up {
  color: #22c55e;
}

.stat-card__period {
  color: var(--color-muted, #9ca3af);
  margin-left: 4px;
}

.stat-card__icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.stat-card--primary .stat-card__icon {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}

.stat-card--success .stat-card__icon {
  background: linear-gradient(135deg, #22c55e, #16a34a);
}

.stat-card--warning .stat-card__icon {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.stat-card--info .stat-card__icon {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

.chart-section {
  margin-bottom: 16px;
}

.chart-card {
  border-radius: 12px;
}

.chart-card :deep(.n-card__content) {
  padding-top: 8px;
}
</style>
