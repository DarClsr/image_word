/**
 * 我的作品页面
 */
import { formatRelativeTime } from '../../utils/index';

const app = getApp();

Page({
  data: {
    items: [],
    loading: false,
    noMore: false,
    page: 1,
    pageSize: 10
  },

  onLoad() {
    this.loadWorks();
  },

  onShow() {
    // 检查是否需要刷新
    if (app.globalData.needRefreshWorks) {
      app.globalData.needRefreshWorks = false;
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
  loadWorks() {
    this.setData({ loading: true });
    
    // TODO: 调用真实 API
    return new Promise((resolve) => {
      setTimeout(() => {
        // 模拟数据
        const mockData = [
          {
            id: '1',
            imageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400',
            prompt: '冬日城市夜景，霓虹灯光',
            status: 'approved',
            createdAt: Date.now() - 3600000
          },
          {
            id: '2',
            imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=400',
            prompt: '春日樱花下的少女，国风水墨画风格',
            status: 'pending',
            createdAt: Date.now() - 7200000
          },
          {
            id: '3',
            imageUrl: 'https://images.unsplash.com/photo-1482192505345-5655af888cc4?w=400',
            prompt: '赛博朋克城市，霓虹闪烁',
            status: 'approved',
            createdAt: Date.now() - 86400000
          }
        ];
        
        const items = mockData.map(item => ({
          ...item,
          timeText: formatRelativeTime(item.createdAt)
        }));
        
        this.setData({
          items,
          loading: false
        });
        resolve();
      }, 500);
    });
  },

  /**
   * 加载更多
   */
  loadMoreWorks() {
    const nextPage = this.data.page + 1;
    this.setData({ loading: true, page: nextPage });
    
    // TODO: 调用真实 API
    setTimeout(() => {
      this.setData({ loading: false, noMore: true });
    }, 500);
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
    // TODO: 实现分享功能
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
      success: (res) => {
        if (res.confirm) {
          // TODO: 调用删除 API
          const items = this.data.items.filter(w => w.id !== id);
          this.setData({ items });
          app.showSuccess('已删除');
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
