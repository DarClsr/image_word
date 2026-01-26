<template>
  <div ref="chartRef" class="chart-container" :style="{ height: `${height}px` }"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import { useTheme } from '@/composables/useTheme';

/**
 * 饼图组件
 */
const props = withDefaults(
  defineProps<{
    /** 数据 */
    data: { name: string; value: number; color?: string }[];
    /** 图表高度 */
    height?: number;
    /** 是否为环形图 */
    donut?: boolean;
    /** 是否显示图例 */
    showLegend?: boolean;
    /** 显示标签 */
    showLabel?: boolean;
  }>(),
  {
    height: 300,
    donut: true,
    showLegend: true,
    showLabel: false,
  }
);

const chartRef = ref<HTMLDivElement | null>(null);
let chartInstance: echarts.ECharts | null = null;
const { resolvedTheme } = useTheme();

const isDark = computed(() => resolvedTheme.value === 'dark');

const defaultColors = [
  '#3b82f6',
  '#22c55e',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#f97316',
];

const getOption = (): EChartsOption => {
  const textColor = isDark.value ? '#9ca3af' : '#6b7280';

  return {
    tooltip: {
      trigger: 'item',
      backgroundColor: isDark.value ? '#1f2937' : '#fff',
      borderColor: isDark.value ? '#374151' : '#e5e7eb',
      textStyle: { color: isDark.value ? '#e5e7eb' : '#374151' },
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      show: props.showLegend,
      orient: 'vertical',
      right: 20,
      top: 'center',
      textStyle: { color: textColor },
      itemWidth: 12,
      itemHeight: 12,
      itemGap: 12,
    },
    series: [
      {
        type: 'pie',
        radius: props.donut ? ['45%', '70%'] : '70%',
        center: props.showLegend ? ['35%', '50%'] : ['50%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: props.donut ? 6 : 0,
          borderColor: isDark.value ? '#111827' : '#fff',
          borderWidth: 2,
        },
        label: {
          show: props.showLabel,
          color: textColor,
          formatter: '{b}: {d}%',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.15)',
          },
        },
        data: props.data.map((item, i) => ({
          name: item.name,
          value: item.value,
          itemStyle: { color: item.color || defaultColors[i % defaultColors.length] },
        })),
      },
    ],
  };
};

const initChart = () => {
  if (!chartRef.value) return;
  chartInstance = echarts.init(chartRef.value, isDark.value ? 'dark' : undefined);
  chartInstance.setOption(getOption());
};

const updateChart = () => {
  if (chartInstance) {
    chartInstance.dispose();
  }
  initChart();
};

const handleResize = () => {
  chartInstance?.resize();
};

onMounted(() => {
  initChart();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  chartInstance?.dispose();
});

watch([() => props.data, isDark], updateChart, { deep: true });
</script>

<style scoped>
.chart-container {
  width: 100%;
}
</style>
