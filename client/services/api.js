/**
 * API 接口定义
 */
import request from './request';

/**
 * 认证相关接口
 */
export const authApi = {
  /**
   * 微信登录
   * @param {Object} params - 登录参数
   * @param {string} params.code - 微信登录 code
   * @param {Object} [params.userInfo] - 用户信息
   */
  wechatLogin(params) {
    return request.post('/auth/wechat-login', params, { showLoading: true, loadingText: '登录中...' });
  },

  /**
   * 刷新 Token
   * @param {string} refreshToken - 刷新令牌
   */
  refreshToken(refreshToken) {
    return request.post('/auth/refresh', { refreshToken });
  },

  /**
   * 获取用户信息
   */
  getProfile() {
    return request.get('/auth/profile');
  },

  /**
   * 更新用户信息
   * @param {Object} data - 用户信息
   */
  updateProfile(data) {
    return request.put('/auth/profile', data);
  }
};

/**
 * 分类相关接口
 */
export const categoryApi = {
  /**
   * 获取风格列表
   */
  getStyles() {
    return request.get('/category/styles');
  },

  /**
   * 获取模型列表
   */
  getModels() {
    return request.get('/category/models');
  }
};

/**
 * 作品相关接口
 */
export const worksApi = {
  /**
   * 创建生成任务
   * @param {Object} params - 生成参数
   * @param {string} params.prompt - 提示词
   * @param {number} params.styleId - 风格ID
   * @param {number} params.modelId - 模型ID
   * @param {Object} [params.params] - 生成参数
   */
  create(params) {
    return request.post('/works', params, { showLoading: true, loadingText: '提交中...' });
  },

  /**
   * 获取我的作品列表
   * @param {Object} params - 查询参数
   * @param {number} [params.page=1] - 页码
   * @param {number} [params.pageSize=20] - 每页数量
   */
  getMyWorks(params = {}) {
    return request.get('/works', { page: 1, pageSize: 20, ...params });
  },

  /**
   * 获取作品详情
   * @param {number} id - 作品ID
   */
  getDetail(id) {
    return request.get(`/works/${id}`);
  },

  /**
   * 删除作品
   * @param {number} id - 作品ID
   */
  delete(id) {
    return request.delete(`/works/${id}`, {}, { showLoading: true });
  },

  /**
   * 获取公开作品广场
   * @param {Object} params - 查询参数
   */
  getPublicWorks(params = {}) {
    return request.get('/works/public', { page: 1, pageSize: 20, ...params });
  }
};

/**
 * 任务相关接口
 */
export const taskApi = {
  /**
   * 查询任务状态
   * @param {string} taskId - 任务ID
   */
  getStatus(taskId) {
    return request.get(`/task/${taskId}`);
  },

  /**
   * 取消任务
   * @param {string} taskId - 任务ID
   */
  cancel(taskId) {
    return request.delete(`/task/${taskId}`);
  }
};

/**
 * 模板相关接口
 */
export const templateApi = {
  /**
   * 获取模板列表
   * @param {Object} params - 查询参数
   * @param {string} [params.category] - 分类
   * @param {string} [params.keyword] - 搜索关键词
   * @param {number} [params.page=1] - 页码
   * @param {number} [params.pageSize=20] - 每页数量
   */
  getList(params = {}) {
    return request.get('/templates', { page: 1, pageSize: 20, ...params });
  },

  /**
   * 获取模板详情
   * @param {string} id - 模板ID
   */
  getDetail(id) {
    return request.get(`/templates/${id}`);
  }
};

/**
 * 用户相关接口
 */
export const userApi = {
  /**
   * 获取用户统计数据
   */
  getStats() {
    return request.get('/user/stats');
  },

  /**
   * 获取用户额度信息
   */
  getQuota() {
    return request.get('/user/quota');
  }
};

/**
 * 生成配置接口
 */
export const generationApi = {
  /**
   * 获取生成配置（风格、模型、比例、数量）
   */
  getConfig() {
    return request.get('/client/generation/config');
  }
};

/**
 * AI 提示词接口
 */
export const promptApi = {
  /**
   * AI 扩展提示词
   * @param {Object} params - 参数
   * @param {string} params.text - 原始文本
   * @param {string} [params.style] - 风格名称
   */
  expand(params) {
    return request.post('/client/prompt/expand', params, { 
      showLoading: true, 
      loadingText: 'AI 扩写中...' 
    });
  },

  /**
   * 优化提示词
   * @param {Object} params - 参数
   * @param {string} params.prompt - 原始提示词
   * @param {string} [params.style] - 风格名称
   */
  optimize(params) {
    return request.post('/client/prompt/optimize', params);
  }
};

/**
 * 图文生成接口 - AI 直接生成带文字的图片
 */
export const imageTextApi = {
  /**
   * AI 生成图文
   * @param {Object} params - 参数
   * @param {string} params.topic - 主题
   * @param {string} params.template - 模板类型：quote/tips/list/story/knowledge/poster/card
   * @param {string} [params.style] - 风格：xiaohongshu/minimal/gradient/magazine/retro/cute
   * @param {string} [params.ratio] - 比例：1:1/3:4/4:3/9:16
   * @param {string} [params.model] - AI 模型：ideogram/flux/jimeng
   */
  generate(params) {
    return request.post('/client/image-text/generate', params, {
      showLoading: true,
      loadingText: 'AI 生成中...',
      timeout: 60000, // 图片生成可能需要较长时间
    });
  },

  /**
   * 获取模板列表
   */
  getTemplates() {
    return request.get('/client/image-text/templates');
  },

  /**
   * 获取风格列表
   */
  getStyles() {
    return request.get('/client/image-text/styles');
  },

  /**
   * 获取可用的 AI 模型
   */
  getModels() {
    return request.get('/client/image-text/models');
  }
};

export default {
  auth: authApi,
  category: categoryApi,
  works: worksApi,
  task: taskApi,
  template: templateApi,
  user: userApi,
  generation: generationApi,
  prompt: promptApi,
  imageText: imageTextApi
};
