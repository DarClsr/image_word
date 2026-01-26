/**
 * 首页 - 功能入口
 */
const app = getApp();

Page({
  data: {
    isLoggedIn: false,
    recentWorks: [],
  },

  onLoad() {
    this.checkLoginStatus();
  },

  onShow() {
    this.checkLoginStatus();
    this.loadRecentWorks();
  },

  /**
   * 检查登录状态
   */
  checkLoginStatus() {
    const isLoggedIn = app.globalData.isLoggedIn;
    this.setData({ isLoggedIn });
  },

  /**
   * 加载最近作品
   */
  async loadRecentWorks() {
    if (!app.globalData.isLoggedIn) return;
    
    try {
      // TODO: 调用 API 获取最近作品
      // const res = await worksApi.getMyWorks({ pageSize: 6 });
      // this.setData({ recentWorks: res.list || [] });
    } catch (error) {
      console.error('加载作品失败:', error);
    }
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
