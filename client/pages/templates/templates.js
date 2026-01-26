/**
 * 模板库页面
 */
import { formatNumber } from '../../utils/index';

const app = getApp();

Page({
  data: {
    // 分类
    currentCategory: 'all',
    categories: [
      { label: '全部', value: 'all', icon: '✨' },
      { label: '国风', value: 'guofeng', icon: '🏯' },
      { label: '写实', value: 'realistic', icon: '📷' },
      { label: '动漫', value: 'anime', icon: '🎨' },
      { label: '插画', value: 'illustration', icon: '✏️' },
      { label: '赛博', value: 'cyberpunk', icon: '🌃' }
    ],
    
    // 模板列表
    templates: [],
    
    // 状态
    loading: false,
    noMore: false,
    page: 1,
    pageSize: 10,
    searchKeyword: ''
  },

  onLoad() {
    this.loadTemplates();
  },

  onReachBottom() {
    if (!this.data.loading && !this.data.noMore) {
      this.loadMoreTemplates();
    }
  },

  onPullDownRefresh() {
    this.setData({ page: 1, noMore: false });
    this.loadTemplates().finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 加载模板列表
   */
  loadTemplates() {
    this.setData({ loading: true });
    
    // TODO: 调用真实 API
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockData = [
          {
            id: '1',
            imageUrl: '',
            prompt: '春日樱花下的少女，国风水墨画风格，唯美意境，细腻光影',
            model: 'SDXL',
            style: '国风',
            likes: 1280,
            shares: 356
          },
          {
            id: '2',
            imageUrl: '',
            prompt: '赛博朋克城市夜景，霓虹灯光，雨后街道，科幻氛围',
            model: 'Flux',
            style: '赛博',
            likes: 892,
            shares: 234
          },
          {
            id: '3',
            imageUrl: '',
            prompt: '可爱猫咪插画，治愈系风格，柔和色彩，温馨场景',
            model: 'DALL·E',
            style: '插画',
            likes: 2156,
            shares: 678
          },
          {
            id: '4',
            imageUrl: '',
            prompt: '山水画风格的日落场景，云雾缭绕，意境深远',
            model: 'SDXL',
            style: '国风',
            likes: 756,
            shares: 189
          },
          {
            id: '5',
            imageUrl: '',
            prompt: '日系动漫风格少女，樱花树下，清新唯美',
            model: 'Flux',
            style: '动漫',
            likes: 3421,
            shares: 892
          }
        ];
        
        // 格式化数字显示
        const templates = mockData.map(item => ({
          ...item,
          likesText: formatNumber(item.likes),
          sharesText: formatNumber(item.shares)
        }));
        
        this.setData({
          templates,
          loading: false
        });
        resolve();
      }, 600);
    });
  },

  /**
   * 加载更多模板
   */
  loadMoreTemplates() {
    const nextPage = this.data.page + 1;
    this.setData({ loading: true, page: nextPage });
    
    // TODO: 调用真实 API
    setTimeout(() => {
      // 模拟没有更多数据
      this.setData({ loading: false, noMore: true });
    }, 500);
  },

  /**
   * 搜索
   */
  onSearch(e) {
    const keyword = e.detail.value;
    this.setData({ searchKeyword: keyword, page: 1 });
    
    // 防抖处理
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.loadTemplates();
    }, 300);
  },

  /**
   * 清除搜索
   */
  clearSearch() {
    this.setData({ searchKeyword: '', page: 1 });
    this.loadTemplates();
  },

  /**
   * 切换分类
   */
  onCategoryChange(e) {
    const value = e.currentTarget.dataset.value;
    if (value === this.data.currentCategory) return;
    
    this.setData({ currentCategory: value, page: 1, noMore: false });
    this.loadTemplates();
  },

  /**
   * 模板详情
   */
  onTemplateDetail(e) {
    const id = e.currentTarget.dataset.id;
    const template = this.data.templates.find(t => t.id === id);
    
    if (!template) return;
    
    wx.showActionSheet({
      itemList: ['使用此模板', '查看详情', '收藏'],
      success: (res) => {
        switch (res.tapIndex) {
          case 0:
            this.useTemplate(template);
            break;
          case 1:
            this.viewDetail(template);
            break;
          case 2:
            this.collectTemplate(template);
            break;
        }
      }
    });
  },

  /**
   * 使用模板
   */
  useTemplate(template) {
    // 跳转到首页并填充数据
    wx.switchTab({
      url: '/pages/home/home',
      success: () => {
        // 通过全局数据传递
        app.globalData.templateData = {
          topic: template.prompt,
          style: template.style,
          model: template.model
        };
        
        // 通知首页更新
        const pages = getCurrentPages();
        const homePage = pages.find(p => p.route === 'pages/home/home');
        if (homePage) {
          homePage.setData({ topic: template.prompt });
        }
      }
    });
  },

  /**
   * 查看详情
   */
  viewDetail(template) {
    // TODO: 跳转详情页
    wx.showToast({ title: '详情页开发中', icon: 'none' });
  },

  /**
   * 收藏模板
   */
  collectTemplate(template) {
    if (!app.checkNeedLogin()) return;
    
    // TODO: 调用收藏 API
    app.showSuccess('收藏成功');
  }
});
