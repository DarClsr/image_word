<template>
  <div ref="chartRef" class="chart-container" :style="{ height: `${height}px` }"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import { useTheme } from '@/composables/useTheme';

/**
 * 折线图组件 - 优化配色版
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
  const lineColor = isDark.value ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0';
  const tooltipBg = isDark.value ? '#1e293b' : '#ffffff';
  const tooltipBorder = isDark.value ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0';

  return {
    color: colors,
    tooltip: {
      trigger: 'axis',
      backgroundColor: tooltipBg,
      borderColor: tooltipBorder,
      borderWidth: 1,
      padding: [12, 16],
      textStyle: {
        color: isDark.value ? '#f1f5f9' : '#0f172a',
        fontSize: 13,
      },
      axisPointer: {
        type: 'line',
        lineStyle: {
          color: isDark.value ? 'rgba(129, 140, 248, 0.5)' : 'rgba(79, 70, 229, 0.3)',
          width: 2,
          type: 'dashed',
        },
        crossStyle: {
          color: textColor,
        },
      },
      extraCssText: isDark.value
        ? 'box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.3); border-radius: 10px;'
        : 'box-shadow: 0 10px 15px -3px rgba(15, 23, 42, 0.1), 0 4px 6px -4px rgba(15, 23, 42, 0.1); border-radius: 10px;',
    },
    legend: {
      top: 0,
      right: 0,
      icon: 'circle',
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 20,
      textStyle: {
        color: textColor,
        fontSize: 12,
      },
    },
    grid: {
      top: 50,
      left: 0,
      right: 20,
      bottom: 0,
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: props.xData,
      axisLine: {
        show: true,
        lineStyle: {
          color: lineColor,
        },
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        color: textColor,
        fontSize: 12,
        margin: 12,
      },
      boundaryGap: false,
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        color: textColor,
        fontSize: 12,
        formatter: props.unit ? `{value}${props.unit}` : '{value}',
      },
      splitLine: {
        lineStyle: {
          color: lineColor,
          type: 'dashed',
        },
      },
    },
    series: props.series.map((s, i) => {
      const color = s.color || colors[i % colors.length];
      return {
        name: s.name,
        type: 'line',
        data: s.data,
        smooth: props.smooth,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          width: 3,
          color: color,
          shadowColor: color + (isDark.value ? '40' : '30'),
          shadowBlur: 10,
          shadowOffsetY: 4,
        },
        itemStyle: {
          color: color,
          borderWidth: 2,
          borderColor: isDark.value ? '#1e293b' : '#ffffff',
        },
        emphasis: {
          scale: 1.5,
          itemStyle: {
            borderWidth: 3,
            shadowBlur: 15,
            shadowColor: color,
          },
        },
        areaStyle: props.showArea
          ? {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: color + (isDark.value ? '35' : '25'),
                },
                {
                  offset: 1,
                  color: color + '00',
                },
              ]),
            }
          : undefined,
      };
    }),
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
  () => [props.xData, props.series, props.showArea, props.smooth],
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
