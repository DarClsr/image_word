/**
 * API 配置
 */

// 环境配置
const ENV = {
  development: {
    baseUrl: 'http://localhost:3000/api/client',
    wsUrl: 'ws://localhost:3000'
  },
  production: {
    baseUrl: 'https://api.example.com/api/client',
    wsUrl: 'wss://api.example.com'
  }
};

// 当前环境（可根据实际情况切换）
const currentEnv = 'development';
// 导出配置
export const config = {
  ...ENV[currentEnv],
  timeout: 30000,
  retryCount: 3,
  retryDelay: 1000
};

export default config;
