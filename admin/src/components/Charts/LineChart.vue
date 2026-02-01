<template>
  <div ref="chartRef" class="chart-container" :style="{ height: `${height}px` }"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import { useTheme } from '@/composables/useTheme';

/**
 * 折线图组件
 */
const props = withDefaults(
  defineProps<{
    /** X 轴数据 */
    xData: string[];
    /** 系列数据 */
    series: {
      name: string;
      data: number[];
      color?: string;
    }[];
    /** 图表高度 */
    height?: number;
    /** Y 轴单位 */
    unit?: string;
    /** 是否显示面积 */
    showArea?: boolean;
    /** 是否平滑曲线 */
    smooth?: boolean;
  }>(),
  {
    height: 300,
    unit: '',
    showArea: true,
    smooth: true,
  }
);

const chartRef = ref<HTMLDivElement | null>(null);
let chartInstance: echarts.ECharts | null = null;
const { resolvedTheme } = useTheme();

const isDark = computed(() => resolvedTheme.value === 'dark');

const defaultColors = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const getOption = (): EChartsOption => {
  const textColor = isDark.value ? '#9ca3af' : '#6b7280';
  const lineColor = isDark.value ? '#374151' : '#e5e7eb';

  return {
    tooltip: {
      trigger: 'axis',
      backgroundColor: isDark.value ? '#1f2937' : '#fff',
      borderColor: isDark.value ? '#374151' : '#e5e7eb',
      textStyle: { color: isDark.value ? '#e5e7eb' : '#374151' },
      axisPointer: {
        type: 'cross',
        crossStyle: { color: textColor },
      },
    },
    legend: {
      top: 10,
      textStyle: { color: textColor },
    },
    grid: {
      top: 50,
      left: 12,
      right: 20,
      bottom: 24,
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: props.xData,
      axisLine: { lineStyle: { color: lineColor } },
      axisTick: { show: false },
      axisLabel: { color: textColor },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: textColor,
        formatter: props.unit ? `{value}${props.unit}` : '{value}',
      },
      splitLine: { lineStyle: { color: lineColor, type: 'dashed' } },
    },
    series: props.series.map((s, i) => ({
      name: s.name,
      type: 'line',
      data: s.data,
      smooth: props.smooth,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { width: 2.5, color: s.color || defaultColors[i % defaultColors.length] },
      itemStyle: { color: s.color || defaultColors[i % defaultColors.length] },
      areaStyle: props.showArea
        ? {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: `${s.color || defaultColors[i % defaultColors.length]}40` },
              { offset: 1, color: `${s.color || defaultColors[i % defaultColors.length]}05` },
            ]),
          }
        : undefined,
    })),
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

watch([() => props.xData, () => props.series, isDark], updateChart, { deep: true });
</script>

<style scoped>
.chart-container {
  width: 100%;
}
</style>
