/**
 * 模板库页面
 */
import { formatNumber } from '../../utils/index';
import { generationApi, templateApi, categoryApi } from '../../services/api';

const app = getApp();

Page({
  data: {
    // 分类
    currentCategory: 'all',
    categories: [{ label: '全部', value: 'all', icon: '✨' }],
    styleMap: {},
    
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
    this.loadCategories().finally(() => {
      this.loadTemplates();
    });
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

    const params = {
      page: this.data.page,
      pageSize: this.data.pageSize,
      keyword: this.data.searchKeyword || undefined,
    };

    if (this.data.currentCategory !== 'all') {
      const styleId = this.data.styleMap[this.data.currentCategory];
      if (styleId) {
        params.styleId = styleId;
      }
    }

    return templateApi
      .getList(params)
      .then((res) => {
        const list = Array.isArray(res) ? res : res.list || [];
        const templates = list.map(item => ({
          ...item,
          likesText: formatNumber(item.likes || 0),
          sharesText: formatNumber(item.shares || 0)
        }));

        this.setData({
          templates,
          loading: false,
          noMore: list.length < this.data.pageSize
        });
      })
      .catch(() => {
        this.setData({ templates: [], loading: false });
      });
  },

  /**
   * 加载更多模板
   */
  loadMoreTemplates() {
    const nextPage = this.data.page + 1;
    this.setData({ loading: true, page: nextPage });

    const params = {
      page: nextPage,
      pageSize: this.data.pageSize,
      keyword: this.data.searchKeyword || undefined,
    };

    if (this.data.currentCategory !== 'all') {
      const styleId = this.data.styleMap[this.data.currentCategory];
      if (styleId) {
        params.styleId = styleId;
      }
    }

    templateApi
      .getList(params)
      .then((res) => {
        const list = Array.isArray(res) ? res : res.list || [];
        const appended = list.map(item => ({
          ...item,
          likesText: formatNumber(item.likes || 0),
          sharesText: formatNumber(item.shares || 0)
        }));

        this.setData({
          templates: [...this.data.templates, ...appended],
          loading: false,
          noMore: list.length < this.data.pageSize
        });
      })
      .catch(() => {
        this.setData({ loading: false });
      });
  },

  /**
   * 搜索
   */
  onSearch(e) {
    const keyword = e.detail.value;
    this.setData({ searchKeyword: keyword, page: 1, noMore: false });
    
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
    this.setData({ searchKeyword: '', page: 1, noMore: false });
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
    if (!app.checkNeedLogin()) return;

    app.showLoading('准备生成...');
    generationApi
      .getConfig()
      .then((config) => {
        const defaultStyleId = template.styleId || config.defaults?.styleId || config.styles?.[0]?.id;
        const defaultModelId = template.modelId || config.defaults?.modelId || config.models?.[0]?.id;
        if (!defaultStyleId || !defaultModelId) {
          throw new Error('未配置默认风格或模型');
        }

        const params = {
          prompt: template.prompt,
          styleId: defaultStyleId,
          modelId: defaultModelId,
        };

        wx.navigateTo({
          url: `/pages/generating/generating?params=${encodeURIComponent(JSON.stringify(params))}`,
        });
      })
      .catch((error) => {
        app.showError(error.message || '获取配置失败');
      })
      .finally(() => {
        app.hideLoading();
      });
  },

  /**
   * 加载分类（风格）
   */
  loadCategories() {
    return categoryApi
      .getStyles()
      .then((styles) => {
        const categories = [{ label: '全部', value: 'all', icon: '✨' }];
        const styleMap = {};

        (styles || []).forEach((style) => {
          categories.push({
            label: style.name,
            value: style.code,
            icon: style.icon || '✨',
          });
          styleMap[style.code] = style.id;
        });

        this.setData({ categories, styleMap });
      })
      .catch(() => {});
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
