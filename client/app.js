/**
 * 图文生成小程序 - 全局应用
 */
import { authApi } from './services/api';

App({
  /**
   * 全局数据
   */
  globalData: {
    /** 用户信息 */
    userInfo: null,
    /** 登录状态 */
    isLoggedIn: false,
    /** Token */
    token: null,
    /** Refresh Token */
    refreshToken: null,
    /** 系统信息 */
    systemInfo: null,
    /** 状态栏高度 */
    statusBarHeight: 0,
    /** 导航栏高度 */
    navBarHeight: 44,
    /** 屏幕宽度 */
    screenWidth: 375,
    /** 屏幕高度 */
    screenHeight: 667,
  },

  /**
   * 小程序启动时执行
   */
  onLaunch() {
    // 初始化系统信息
    this.initSystemInfo();
    // 恢复登录状态
    this.restoreLoginStatus();
    // 检查更新
    this.checkUpdate();
  },

  /**
   * 初始化系统信息
   */
  initSystemInfo() {
    try {
      const systemInfo = wx.getSystemInfoSync();
      this.globalData.systemInfo = systemInfo;
      this.globalData.statusBarHeight = systemInfo.statusBarHeight || 20;
      this.globalData.screenWidth = systemInfo.screenWidth || 375;
      this.globalData.screenHeight = systemInfo.screenHeight || 667;
      
      // 计算导航栏高度（胶囊按钮位置）
      const menuButton = wx.getMenuButtonBoundingClientRect();
      if (menuButton) {
        this.globalData.navBarHeight = (menuButton.top - systemInfo.statusBarHeight) * 2 + menuButton.height;
      }
    } catch (e) {
      console.error('获取系统信息失败:', e);
    }
  },

  /**
   * 恢复登录状态（从本地存储）
   */
  restoreLoginStatus() {
    const token = wx.getStorageSync('token');
    const refreshToken = wx.getStorageSync('refreshToken');
    const userInfo = wx.getStorageSync('userInfo');
    
    if (token) {
      this.globalData.token = token;
      this.globalData.refreshToken = refreshToken || null;
      this.globalData.isLoggedIn = true;
      this.globalData.userInfo = userInfo || null;
      
      // 尝试刷新用户信息
      this.refreshUserProfile();
    } else {
      this.globalData.token = null;
      this.globalData.refreshToken = null;
      this.globalData.isLoggedIn = false;
      this.globalData.userInfo = null;
    }
  },

  /**
   * 刷新用户信息
   */
  async refreshUserProfile() {
    if (!this.globalData.isLoggedIn) return;
    
    try {
      const profile = await authApi.getProfile();
      this.globalData.userInfo = {
        ...this.globalData.userInfo,
        ...profile,
      };
      wx.setStorageSync('userInfo', this.globalData.userInfo);
    } catch (error) {
      console.error('刷新用户信息失败:', error);
      // 如果获取失败可能是 token 过期，尝试刷新 token
      if (error.code === 401 || error.code === 2001) {
        await this.refreshAccessToken();
      }
    }
  },

  /**
   * 刷新 Access Token
   */
  async refreshAccessToken() {
    const refreshToken = this.globalData.refreshToken;
    if (!refreshToken) {
      this.clearLoginStatus();
      return false;
    }
    
    try {
      const res = await authApi.refreshToken(refreshToken);
      this.setLoginStatus({
        token: res.accessToken,
        refreshToken: res.refreshToken,
        userInfo: res.user,
      });
      return true;
    } catch (error) {
      console.error('刷新 Token 失败:', error);
      this.clearLoginStatus();
      return false;
    }
  },

  /**
   * 设置登录状态
   * @param {Object} params - 登录参数
   * @param {string} params.token - 登录 Token
   * @param {string} params.refreshToken - 刷新 Token
   * @param {Object} params.userInfo - 用户信息
   */
  setLoginStatus({ token, refreshToken, userInfo }) {
    this.globalData.token = token;
    this.globalData.refreshToken = refreshToken || null;
    this.globalData.isLoggedIn = true;
    this.globalData.userInfo = userInfo;
    
    wx.setStorageSync('token', token);
    if (refreshToken) {
      wx.setStorageSync('refreshToken', refreshToken);
    }
    wx.setStorageSync('userInfo', userInfo);
  },

  /**
   * 清除登录状态
   */
  clearLoginStatus() {
    this.globalData.token = null;
    this.globalData.refreshToken = null;
    this.globalData.isLoggedIn = false;
    this.globalData.userInfo = null;
    
    wx.removeStorageSync('token');
    wx.removeStorageSync('refreshToken');
    wx.removeStorageSync('userInfo');
  },

  /**
   * 检查是否需要登录
   * @param {boolean} showTip - 是否显示提示
   * @returns {boolean} 是否已登录
   */
  checkNeedLogin(showTip = true) {
    if (!this.globalData.isLoggedIn) {
      if (showTip) {
        wx.showModal({
          title: '提示',
          content: '请先登录后再进行操作',
          confirmText: '去登录',
          success: (res) => {
            if (res.confirm) {
              wx.navigateTo({ url: '/pages/login/login' });
            }
          }
        });
      }
      return false;
    }
    return true;
  },

  /**
   * 检查小程序更新
   */
  checkUpdate() {
    if (!wx.canIUse('getUpdateManager')) return;
    
    const updateManager = wx.getUpdateManager();
    
    updateManager.onCheckForUpdate((res) => {
      if (res.hasUpdate) {
        console.log('发现新版本');
      }
    });
    
    updateManager.onUpdateReady(() => {
      wx.showModal({
        title: '更新提示',
        content: '新版本已准备好，是否重启应用？',
        success: (res) => {
          if (res.confirm) {
            updateManager.applyUpdate();
          }
        }
      });
    });
    
    updateManager.onUpdateFailed(() => {
      console.error('新版本下载失败');
    });
  },

  /**
   * 显示成功提示
   * @param {string} title - 提示内容
   * @param {number} duration - 显示时长（毫秒）
   */
  showSuccess(title, duration = 1500) {
    wx.showToast({
      title,
      icon: 'success',
      duration
    });
  },

  /**
   * 显示错误提示
   * @param {string} title - 提示内容
   * @param {number} duration - 显示时长（毫秒）
   */
  showError(title, duration = 2000) {
    wx.showToast({
      title,
      icon: 'none',
      duration
    });
  },

  /**
   * 显示加载中
   * @param {string} title - 提示内容
   */
  showLoading(title = '加载中...') {
    wx.showLoading({
      title,
      mask: true
    });
  },

  /**
   * 隐藏加载中
   */
  hideLoading() {
    wx.hideLoading();
  }
});
