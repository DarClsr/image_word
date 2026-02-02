<template>
  <div ref="chartRef" class="chart-container" :style="{ height: `${height}px` }"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import { useTheme } from '@/composables/useTheme';

/**
 * 饼图组件 - 优化配色版
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

// 优化的配色方案 - 现代渐变色系
const defaultColors = [
  '#4F46E5', // 靛蓝
  '#10B981', // 翠绿
  '#F59E0B', // 琥珀
  '#EF4444', // 玫瑰
  '#8B5CF6', // 紫罗兰
  '#EC4899', // 粉红
  '#06B6D4', // 青色
  '#F97316', // 橙色
];

// 暗色模式下的配色（更亮一些）
const darkColors = [
  '#818CF8', // 亮靛蓝
  '#34D399', // 亮翠绿
  '#FBBF24', // 亮琥珀
  '#F87171', // 亮玫瑰
  '#A78BFA', // 亮紫罗兰
  '#F472B6', // 亮粉红
  '#22D3EE', // 亮青色
  '#FB923C', // 亮橙色
];

const getColors = () => (isDark.value ? darkColors : defaultColors);

const getOption = (): EChartsOption => {
  const colors = getColors();
  const textColor = isDark.value ? '#94a3b8' : '#64748b';
  const tooltipBg = isDark.value ? '#1e293b' : '#ffffff';
  const tooltipBorder = isDark.value ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0';

  return {
    color: colors,
    tooltip: {
      trigger: 'item',
      backgroundColor: tooltipBg,
      borderColor: tooltipBorder,
      borderWidth: 1,
      padding: [12, 16],
      textStyle: {
        color: isDark.value ? '#f1f5f9' : '#0f172a',
        fontSize: 13,
      },
      formatter: (params: any) => {
        const percent = params.percent;
        const value = params.value;
        const name = params.name;
        return `
          <div style="font-weight: 600; margin-bottom: 4px;">${name}</div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${params.color};"></span>
            <span>${value} (${percent}%)</span>
          </div>
        `;
      },
      extraCssText: isDark.value
        ? 'box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.3); border-radius: 10px;'
        : 'box-shadow: 0 10px 15px -3px rgba(15, 23, 42, 0.1), 0 4px 6px -4px rgba(15, 23, 42, 0.1); border-radius: 10px;',
    },
    legend: {
      show: props.showLegend,
      orient: 'horizontal',
      bottom: 0,
      left: 'center',
      icon: 'circle',
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 16,
      textStyle: {
        color: textColor,
        fontSize: 12,
      },
    },
    series: [
      {
        type: 'pie',
        radius: props.donut ? ['45%', '70%'] : '65%',
        center: ['50%', props.showLegend ? '42%' : '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: props.donut ? 8 : 0,
          borderColor: isDark.value ? '#1e293b' : '#ffffff',
          borderWidth: 2,
        },
        label: {
          show: props.showLabel,
          color: textColor,
          fontSize: 12,
          formatter: '{b}: {d}%',
        },
        labelLine: {
          show: props.showLabel,
          lineStyle: {
            color: isDark.value ? 'rgba(255, 255, 255, 0.2)' : '#e2e8f0',
          },
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
          },
          itemStyle: {
            shadowBlur: 20,
            shadowOffsetX: 0,
            shadowColor: isDark.value ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.2)',
          },
          scale: true,
          scaleSize: 10,
        },
        data: props.data.map((item, index) => ({
          ...item,
          itemStyle: item.color
            ? {
                color: item.color,
                borderRadius: props.donut ? 8 : 0,
                borderColor: isDark.value ? '#1e293b' : '#ffffff',
                borderWidth: 2,
              }
            : undefined,
        })),
      },
    ],
  };
};

const initChart = () => {
  if (!chartRef.value) return;

  chartInstance = echarts.init(chartRef.value);
  chartInstance.setOption(getOption());
};

const updateChart = () => {
  if (!chartInstance) return;
  chartInstance.setOption(getOption(), true);
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
  chartInstance = null;
});

watch(
  () => [props.data, props.donut, props.showLegend, props.showLabel],
  () => {
    updateChart();
  },
  { deep: true }
);

watch(isDark, () => {
  updateChart();
});
</script>

<style scoped>
.chart-container {
  width: 100%;
}
</style>
