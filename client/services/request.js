/**
 * HTTP 请求封装
 */
import config from './config';

/**
 * 请求类
 */
class Request {
  constructor() {
    this.baseUrl = config.baseUrl;
    this.timeout = config.timeout;
  }

  /**
   * 获取请求头
   * @returns {Object} 请求头对象
   */
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    const token = wx.getStorageSync('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  /**
   * 处理响应
   * @param {Object} response - 响应对象
   * @returns {Object} 处理后的数据
   */
  handleResponse(response) {
    const { statusCode, data } = response;
    
    if (statusCode >= 200 && statusCode < 300) {
      // 业务状态码判断
      if (data.code === 0 || data.code === 200) {
        console.log('data', data.data !== undefined ? data.data : data);
        return Promise.resolve(data.data !== undefined ? data.data : data);
      } else {
        return Promise.reject({
          code: data.code,
          message: data.message || '请求失败'
        });
      }
    }
    
    // HTTP 错误处理
    if (statusCode === 401) {
      // Token 过期，清除登录状态
      const app = getApp();
      app.clearLoginStatus();
      
      wx.showModal({
        title: '提示',
        content: '登录已过期，请重新登录',
        showCancel: false,
        success: () => {
          wx.navigateTo({ url: '/pages/login/login' });
        }
      });
      
      return Promise.reject({
        code: 401,
        message: '登录已过期'
      });
    }
    
    if (statusCode === 403) {
      return Promise.reject({
        code: 403,
        message: '没有操作权限'
      });
    }
    
    if (statusCode === 404) {
      return Promise.reject({
        code: 404,
        message: '请求的资源不存在'
      });
    }
    
    if (statusCode >= 500) {
      return Promise.reject({
        code: statusCode,
        message: '服务器繁忙，请稍后再试'
      });
    }
    
    return Promise.reject({
      code: statusCode,
      message: data?.message || '请求失败'
    });
  }

  /**
   * 处理错误
   * @param {Object} error - 错误对象
   * @returns {Promise} 拒绝的 Promise
   */
  handleError(error) {
    console.error('请求错误:', error);
    
    if (error.errMsg?.includes('timeout')) {
      return Promise.reject({
        code: -1,
        message: '请求超时，请检查网络'
      });
    }
    
    if (error.errMsg?.includes('fail')) {
      return Promise.reject({
        code: -1,
        message: '网络异常，请检查网络连接'
      });
    }
    
    return Promise.reject({
      code: error.code || -1,
      message: error.message || '请求失败'
    });
  }

  /**
   * 发送请求
   * @param {Object} options - 请求选项
   * @returns {Promise} 请求 Promise
   */
  request(options) {
    const { url, method = 'GET', data, header = {}, showLoading = false, loadingText = '加载中...' } = options;
    
    const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;
    
    if (showLoading) {
      wx.showLoading({ title: loadingText, mask: true });
    }
    
    return new Promise((resolve, reject) => {
      wx.request({
        url: fullUrl,
        method,
        data,
        header: {
          ...this.getHeaders(),
          ...header
        },
        timeout: this.timeout,
        success: (response) => {
          console.log('response', response);
          this.handleResponse(response)
            .then(resolve)
            .catch(reject);
        },
        fail: (error) => {
          this.handleError(error).catch(reject);
        },
        complete: () => {
          if (showLoading) {
            wx.hideLoading();
          }
        }
      });
    });
  }

  /**
   * GET 请求
   * @param {string} url - 请求地址
   * @param {Object} params - 查询参数
   * @param {Object} options - 其他选项
   * @returns {Promise} 请求 Promise
   */
  get(url, params = {}, options = {}) {
    // 拼接查询参数
    const queryString = Object.keys(params)
      .filter(key => params[key] !== undefined && params[key] !== null)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');
    
    const fullUrl = queryString ? `${url}?${queryString}` : url;
    
    return this.request({
      url: fullUrl,
      method: 'GET',
      ...options
    });
  }

  /**
   * POST 请求
   * @param {string} url - 请求地址
   * @param {Object} data - 请求数据
   * @param {Object} options - 其他选项
   * @returns {Promise} 请求 Promise
   */
  post(url, data = {}, options = {}) {
    return this.request({
      url,
      method: 'POST',
      data,
      ...options
    });
  }

  /**
   * PUT 请求
   * @param {string} url - 请求地址
   * @param {Object} data - 请求数据
   * @param {Object} options - 其他选项
   * @returns {Promise} 请求 Promise
   */
  put(url, data = {}, options = {}) {
    return this.request({
      url,
      method: 'PUT',
      data,
      ...options
    });
  }

  /**
   * DELETE 请求
   * @param {string} url - 请求地址
   * @param {Object} data - 请求数据
   * @param {Object} options - 其他选项
   * @returns {Promise} 请求 Promise
   */
  delete(url, data = {}, options = {}) {
    return this.request({
      url,
      method: 'DELETE',
      data,
      ...options
    });
  }

  /**
   * 上传文件
   * @param {string} url - 上传地址
   * @param {string} filePath - 文件路径
   * @param {Object} options - 其他选项
   * @returns {Promise} 上传 Promise
   */
  upload(url, filePath, options = {}) {
    const { name = 'file', formData = {}, showLoading = true } = options;
    const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;
    
    if (showLoading) {
      wx.showLoading({ title: '上传中...', mask: true });
    }
    
    return new Promise((resolve, reject) => {
      wx.uploadFile({
        url: fullUrl,
        filePath,
        name,
        formData,
        header: this.getHeaders(),
        success: (response) => {
          try {
            const data = JSON.parse(response.data);
            if (data.code === 0 || data.code === 200) {
              resolve(data.data !== undefined ? data.data : data);
            } else {
              reject({
                code: data.code,
                message: data.message || '上传失败'
              });
            }
          } catch (e) {
            reject({
              code: -1,
              message: '解析响应失败'
            });
          }
        },
        fail: (error) => {
          this.handleError(error).catch(reject);
        },
        complete: () => {
          if (showLoading) {
            wx.hideLoading();
          }
        }
      });
    });
  }
}

// 导出单例
export const request = new Request();
export default request;
