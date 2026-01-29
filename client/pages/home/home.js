/**
 * 首页 - 功能入口
 */
import { worksApi, userApi } from '../../services/api';

const app = getApp();

Page({
  data: {
    isLoggedIn: false,
    userInfo: null,
    recentWorks: [],
    remainQuota: 0,
    loading: false,
  },

  onLoad() {
    this.checkLoginStatus();
  },

  onShow() {
    this.checkLoginStatus();
    if (app.globalData.isLoggedIn) {
      this.loadUserData();
    }
  },

  /**
   * 检查登录状态
   */
  checkLoginStatus() {
    const isLoggedIn = app.globalData.isLoggedIn;
    const userInfo = app.globalData.userInfo;
    this.setData({ isLoggedIn, userInfo });
  },

  /**
   * 加载用户数据（作品 + 额度）
   */
  async loadUserData() {
    if (this.data.loading) return;
    
    this.setData({ loading: true });
    
    try {
      // 并行加载最近作品和额度信息
      const [worksRes, quotaRes] = await Promise.all([
        worksApi.getMyWorks({ page: 1, pageSize: 6 }).catch(() => ({ list: [] })),
        userApi.getQuota().catch(() => ({ remainQuota: 0 })),
      ]);
      
      this.setData({
        recentWorks: worksRes.list || [],
        remainQuota: quotaRes.remainQuota || 0,
      });
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 下拉刷新
   */
  async onPullDownRefresh() {
    await this.loadUserData();
    wx.stopPullDownRefresh();
  },

  /**
   * 进入图文生成页面
   */
  goImageText() {
    wx.navigateTo({ url: '/pages/image-text/image-text' });
  },

  /**
   * 带模板参数进入图文生成
   */
  goImageTextWithTemplate(e) {
    const template = e.currentTarget.dataset.template;
    wx.navigateTo({ url: `/pages/image-text/image-text?template=${template}` });
  },

  /**
   * 图片生成（即将开放）
   */
  showComingSoon() {
    wx.showToast({
      title: '功能即将开放，敬请期待',
      icon: 'none',
      duration: 2000,
    });
  },

  /**
   * 查看我的作品
   */
  goMyWorks() {
    wx.navigateTo({ url: '/pages/works/works' });
  },

  /**
   * 预览作品
   */
  onPreviewWork(e) {
    const url = e.currentTarget.dataset.url;
    if (url) {
      wx.previewImage({
        urls: [url],
        current: url,
      });
    }
  },

  /**
   * 分享
   */
  onShareAppMessage() {
    return {
      title: 'AI 图文生成助手 - 一键生成精美内容',
      path: '/pages/home/home',
    };
  },
});
