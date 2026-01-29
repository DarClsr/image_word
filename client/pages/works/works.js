/**
 * 我的作品页面
 */
import { worksApi } from '../../services/api';
import { formatRelativeTime } from '../../utils/index';

const app = getApp();

Page({
  data: {
    items: [],
    loading: false,
    noMore: false,
    page: 1,
    pageSize: 10,
    total: 0,
  },

  onLoad() {
    this.loadWorks();
  },

  onShow() {
    // 检查是否需要刷新
    if (app.globalData.needRefreshWorks) {
      app.globalData.needRefreshWorks = false;
      this.setData({ page: 1, noMore: false });
      this.loadWorks();
    }
  },

  onReachBottom() {
    if (!this.data.loading && !this.data.noMore) {
      this.loadMoreWorks();
    }
  },

  onPullDownRefresh() {
    this.setData({ page: 1, noMore: false });
    this.loadWorks().finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 加载作品列表
   */
  async loadWorks() {
    if (!app.globalData.isLoggedIn) {
      this.setData({ items: [], loading: false });
      return;
    }

    this.setData({ loading: true });
    
    try {
      const res = await worksApi.getMyWorks({
        page: 1,
        pageSize: this.data.pageSize,
      });
      
      const items = (res.list || []).map(item => ({
        ...item,
        timeText: formatRelativeTime(new Date(item.createdAt).getTime()),
      }));
      
      this.setData({
        items,
        page: 1,
        total: res.total || 0,
        noMore: items.length >= (res.total || 0),
        loading: false,
      });
    } catch (error) {
      console.error('加载作品失败:', error);
      app.showError(error.message || '加载失败');
      this.setData({ loading: false });
    }
  },

  /**
   * 加载更多
   */
  async loadMoreWorks() {
    if (!app.globalData.isLoggedIn) return;

    const nextPage = this.data.page + 1;
    this.setData({ loading: true });
    
    try {
      const res = await worksApi.getMyWorks({
        page: nextPage,
        pageSize: this.data.pageSize,
      });
      
      const newItems = (res.list || []).map(item => ({
        ...item,
        timeText: formatRelativeTime(new Date(item.createdAt).getTime()),
      }));
      
      const allItems = [...this.data.items, ...newItems];
      
      this.setData({
        items: allItems,
        page: nextPage,
        noMore: allItems.length >= (res.total || 0),
        loading: false,
      });
    } catch (error) {
      console.error('加载更多失败:', error);
      this.setData({ loading: false });
    }
  },

  /**
   * 查看作品
   */
  viewWork(e) {
    const id = e.currentTarget.dataset.id;
    const work = this.data.items.find(w => w.id === id);
    
    if (!work) return;
    
    wx.previewImage({
      urls: [work.imageUrl],
      current: work.imageUrl
    });
  },

  /**
   * 分享作品
   */
  shareWork(e) {
    const id = e.currentTarget.dataset.id;
    // 可以跳转到作品详情页进行分享
    app.showError('分享功能开发中');
  },

  /**
   * 删除作品
   */
  deleteWork(e) {
    const id = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '删除作品',
      content: '确定要删除这个作品吗？删除后无法恢复',
      confirmColor: '#EF4444',
      success: async (res) => {
        if (res.confirm) {
          try {
            await worksApi.delete(id);
            const items = this.data.items.filter(w => w.id !== id);
            this.setData({ items, total: this.data.total - 1 });
            app.showSuccess('已删除');
          } catch (error) {
            console.error('删除失败:', error);
            app.showError(error.message || '删除失败');
          }
        }
      }
    });
  },

  /**
   * 去生成
   */
  goHome() {
    wx.switchTab({ url: '/pages/home/home' });
  },

  /**
   * 分享
   */
  onShareAppMessage() {
    return {
      title: '我的 AI 创作作品',
      path: '/pages/home/home'
    };
  }
});
