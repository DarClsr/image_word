<template>
  <section class="page">
    <n-space vertical size="large">
      <n-page-header title="数据面板" subtitle="展示核心指标、趋势与模型分布。" />
      <n-grid :x-gap="16" :y-gap="16" cols="1 s:2 m:4">
        <n-gi>
          <n-card>
            <n-statistic label="今日生成">1,248</n-statistic>
          </n-card>
        </n-gi>
        <n-gi>
          <n-card>
            <n-statistic label="活跃用户">352</n-statistic>
          </n-card>
        </n-gi>
        <n-gi>
          <n-card>
            <n-statistic label="审核通过">98%</n-statistic>
          </n-card>
        </n-gi>
        <n-gi>
          <n-card>
            <n-statistic label="本月成本">¥ 3,240</n-statistic>
          </n-card>
        </n-gi>
      </n-grid>
      <n-grid :x-gap="16" :y-gap="16" cols="1 m:2">
        <n-gi>
          <n-card title="趋势概览">接入接口后展示图表。</n-card>
        </n-gi>
        <n-gi>
          <n-card title="风格分布">接入接口后展示占比。</n-card>
        </n-gi>
      </n-grid>
    </n-space>
  </section>
</template>

<script setup lang="ts">
import { NCard, NGi, NGrid, NPageHeader, NSpace, NStatistic } from 'naive-ui';
</script>

<style scoped>
.page {
  width: 100%;
}
</style>
