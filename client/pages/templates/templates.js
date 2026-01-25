Page({
  data: {
    currentCategory: "all",
    categories: [
      { label: "全部", value: "all" },
      { label: "国风", value: "guofeng" },
      { label: "写实", value: "realistic" },
      { label: "动漫", value: "anime" },
      { label: "插画", value: "illustration" },
      { label: "赛博", value: "cyberpunk" }
    ],
    templates: [],
    loading: false,
    noMore: false,
    page: 1,
    searchKeyword: ""
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
    this.loadTemplates().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  loadTemplates() {
    this.setData({ loading: true });
    // TODO: 从后台获取数据
    // 模拟数据
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockData = [
          {
            id: "1",
            imageUrl: "",
            prompt: "春日樱花下的少女，国风水墨画风格",
            model: "SDXL",
            style: "国风",
            likes: 1280,
            shares: 356
          },
          {
            id: "2",
            imageUrl: "",
            prompt: "赛博朋克城市夜景，霓虹灯光",
            model: "Flux",
            style: "赛博",
            likes: 892,
            shares: 234
          },
          {
            id: "3",
            imageUrl: "",
            prompt: "可爱猫咪插画，治愈系风格",
            model: "DALL·E",
            style: "插画",
            likes: 2156,
            shares: 678
          },
          {
            id: "4",
            imageUrl: "",
            prompt: "山水画风格的日落场景",
            model: "SDXL",
            style: "国风",
            likes: 756,
            shares: 189
          }
        ];
        this.setData({
          templates: mockData,
          loading: false
        });
        resolve();
      }, 500);
    });
  },

  loadMoreTemplates() {
    const nextPage = this.data.page + 1;
    this.setData({ loading: true, page: nextPage });
    // TODO: 从后台加载更多
    setTimeout(() => {
      // 模拟没有更多数据
      this.setData({ loading: false, noMore: true });
    }, 500);
  },

  onSearch(e) {
    this.setData({ searchKeyword: e.detail.value, page: 1 });
    this.loadTemplates();
  },

  onCategoryChange(e) {
    const value = e.currentTarget.dataset.value;
    this.setData({ currentCategory: value, page: 1 });
    this.loadTemplates();
  },

  onTemplateDetail(e) {
    const id = e.currentTarget.dataset.id;
    const template = this.data.templates.find(t => t.id === id);
    if (template) {
      // 跳转到详情或直接使用该模板
      wx.showActionSheet({
        itemList: ["使用此模板", "查看详情"],
        success: (res) => {
          if (res.tapIndex === 0) {
            // 使用模板，跳转到首页并填充数据
            wx.switchTab({
              url: "/pages/home/home",
              success: () => {
                const homePage = getCurrentPages().find(p => p.route === "pages/home/home");
                if (homePage) {
                  homePage.setData({ topic: template.prompt });
                }
              }
            });
          }
        }
      });
    }
  }
});
