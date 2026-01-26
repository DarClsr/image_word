import { createApp } from 'vue';
import { createDiscreteApi } from 'naive-ui';
import './style.css';
import App from './App.vue';
import { setupRouter } from './router';
import { setupStore } from './store';
import { setMessageHandler } from './api/request';

const app = createApp(App);

// 设置 Pinia 状态管理
setupStore(app);

// 设置路由
setupRouter(app);

// 创建独立的消息 API（用于非组件环境）
const { message } = createDiscreteApi(['message']);

// 注入消息处理器到请求模块
setMessageHandler({
  success: (msg: string) => message.success(msg),
  error: (msg: string) => message.error(msg),
  warning: (msg: string) => message.warning(msg),
});

app.mount('#app');
