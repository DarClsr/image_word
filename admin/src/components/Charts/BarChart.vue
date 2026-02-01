<template>
  <div ref="chartRef" class="chart-container" :style="{ height: `${height}px` }"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import { useTheme } from '@/composables/useTheme';

/**
 * 柱状图组件
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
    /** 是否水平显示 */
    horizontal?: boolean;
    /** 是否堆叠 */
    stack?: boolean;
    /** 是否显示标签 */
    showLabel?: boolean;
  }>(),
  {
    height: 300,
    unit: '',
    horizontal: false,
    stack: false,
    showLabel: false,
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

  const categoryAxis = {
    type: 'category' as const,
    data: props.xData,
    axisLine: { lineStyle: { color: lineColor } },
    axisTick: { show: false },
    axisLabel: { color: textColor },
  };

  const valueAxis = {
    type: 'value' as const,
    axisLabel: {
      color: textColor,
      formatter: props.unit ? `{value}${props.unit}` : '{value}',
    },
    splitLine: { lineStyle: { color: lineColor, type: 'dashed' as const } },
  };

  return {
    tooltip: {
      trigger: 'axis',
      backgroundColor: isDark.value ? '#1f2937' : '#fff',
      borderColor: isDark.value ? '#374151' : '#e5e7eb',
      textStyle: { color: isDark.value ? '#e5e7eb' : '#374151' },
      axisPointer: { type: 'shadow' },
    },
    legend: {
      show: props.series.length > 1,
      top: 0,
      textStyle: { color: textColor },
    },
    grid: {
      top: props.series.length > 1 ? 40 : 20,
      left: 12,
      right: 20,
      bottom: 12,
      containLabel: true,
    },
    xAxis: props.horizontal ? valueAxis : categoryAxis,
    yAxis: props.horizontal ? categoryAxis : valueAxis,
    series: props.series.map((s, i) => ({
      name: s.name,
      type: 'bar',
      data: s.data,
      stack: props.stack ? 'total' : undefined,
      barWidth: props.series.length === 1 ? '40%' : undefined,
      barMaxWidth: 50,
      itemStyle: {
        color: new echarts.graphic.LinearGradient(
          props.horizontal ? 0 : 0,
          props.horizontal ? 0 : 1,
          props.horizontal ? 1 : 0,
          props.horizontal ? 0 : 0,
          [
            { offset: 0, color: `${s.color || defaultColors[i % defaultColors.length]}` },
            { offset: 1, color: `${s.color || defaultColors[i % defaultColors.length]}99` },
          ]
        ),
        borderRadius: props.horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0],
      },
      label: {
        show: props.showLabel,
        position: props.horizontal ? 'right' : 'top',
        color: textColor,
      },
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
  margin: 0 auto;
}
</style>
