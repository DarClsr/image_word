import { z } from 'zod';

export const DashboardMetricSchema = z.object({
  label: z.string(),
  value: z.number(),
  unit: z.string().optional(),
  delta: z.number().optional(),
});

export const DashboardOverviewSchema = z.object({
  metrics: z.array(DashboardMetricSchema),
});

export type DashboardOverview = z.infer<typeof DashboardOverviewSchema>;

export const DashboardTrendPointSchema = z.object({
  date: z.string(),
  value: z.number(),
});

export const DashboardTrendSchema = z.object({
  range: z.string(),
  series: z.array(
    z.object({
      name: z.string(),
      data: z.array(DashboardTrendPointSchema),
    })
  ),
});

export type DashboardTrend = z.infer<typeof DashboardTrendSchema>;

export const DashboardStyleDistSchema = z.object({
  items: z.array(
    z.object({
      name: z.string(),
      value: z.number(),
    })
  ),
});

export type DashboardStyleDist = z.infer<typeof DashboardStyleDistSchema>;

export const DashboardModelStatSchema = z.object({
  items: z.array(
    z.object({
      name: z.string(),
      value: z.number(),
    })
  ),
});

export type DashboardModelStat = z.infer<typeof DashboardModelStatSchema>;
