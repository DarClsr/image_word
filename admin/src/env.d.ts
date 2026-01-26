/// <reference types="vite/client" />

/**
 * 环境变量类型声明
 */
interface ImportMetaEnv {
  /** 应用名称 */
  readonly VITE_APP_NAME: string;
  /** 应用简称 */
  readonly VITE_APP_SHORT_NAME: string;
  /** API 基础路径 */
  readonly VITE_API_BASE: string;
  /** 应用版本 */
  readonly VITE_APP_VERSION: string;
  /** 开发服务器端口 */
  readonly VITE_DEV_PORT?: string;
  /** 调试模式 */
  readonly VITE_DEBUG?: string;
  /** 是否使用 Mock 数据 */
  readonly VITE_USE_MOCK?: string;
  /** 静态资源路径 */
  readonly VITE_PUBLIC_PATH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<object, object, unknown>;
  export default component;
}
