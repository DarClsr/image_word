/**
 * 首页 - 生成入口
 */
const app = getApp();

Page({
  data: {
    // 主题输入
    topic: '',
    
    // 风格列表
    styles: [
      { id: 1, name: '国风', icon: '🏯', gradient: 'linear-gradient(135deg, #DC2626, #F87171)', selected: true },
      { id: 2, name: '写实', icon: '📷', gradient: 'linear-gradient(135deg, #059669, #34D399)', selected: false },
      { id: 3, name: '动漫', icon: '🎨', gradient: 'linear-gradient(135deg, #7C3AED, #A78BFA)', selected: false },
      { id: 4, name: '插画', icon: '✏️', gradient: 'linear-gradient(135deg, #DB2777, #F472B6)', selected: false },
      { id: 5, name: '赛博', icon: '🌃', gradient: 'linear-gradient(135deg, #0891B2, #22D3EE)', selected: false }
    ],
    
    // 模型列表
    models: [
      { id: 1, name: 'SDXL', desc: '稳定高效，性价比之选', price: '¥', speed: '快', quality: '高', badge: '推荐' },
      { id: 2, name: 'Flux', desc: '风格细腻，艺术感强', price: '¥¥', speed: '中', quality: '极高', badge: '' },
      { id: 3, name: 'DALL·E', desc: '理解力强，通用表现', price: '¥¥¥', speed: '中', quality: '高', badge: '' }
    ],
    selectedModel: 1,
    
    // 高级设置
    showAdvanced: false,
    ratioIndex: 0,
    countIndex: 2,
    ratios: [
      { label: '1:1 方形', value: '1:1' },
      { label: '3:4 竖版', value: '3:4' },
      { label: '4:3 横版', value: '4:3' },
      { label: '9:16 手机屏', value: '9:16' },
      { label: '16:9 宽屏', value: '16:9' }
    ],
    counts: [
      { label: '1 张', value: 1 },
      { label: '2 张', value: 2 },
      { label: '4 张', value: 4 },
      { label: '6 张', value: 6 },
      { label: '8 张', value: 8 }
    ],
    
    // 状态
    generating: false,
    isLoggedIn: false,
    remainQuota: 0
  },

  onLoad() {
    this.checkLoginStatus();
  },

  onShow() {
    this.checkLoginStatus();
  },

  /**
   * 检查登录状态
   */
  checkLoginStatus() {
    const isLoggedIn = app.globalData.isLoggedIn;
    this.setData({
      isLoggedIn,
      remainQuota: isLoggedIn ? 10 : 0 // TODO: 从后端获取
    });
  },

  /**
   * 主题输入
   */
  onTopicInput(e) {
    this.setData({ topic: e.detail.value });
  },

  /**
   * AI 扩写
   */
  onAiExpand() {
    if (!this.data.topic) {
      app.showError('请先输入主题');
      return;
    }
    
    app.showLoading('AI 扩写中...');
    
    // TODO: 调用 AI 扩写接口
    setTimeout(() => {
      app.hideLoading();
      const expanded = this.data.topic + '，唯美光影，细节丰富，高清画质，艺术感';
      this.setData({ topic: expanded });
      app.showSuccess('扩写成功');
    }, 1000);
  },

  /**
   * 选择风格
   */
  onSelectStyle(e) {
    const id = e.currentTarget.dataset.id;
    const styles = this.data.styles.map(item => ({
      ...item,
      selected: item.id === id
    }));
    this.setData({ styles });
  },

  /**
   * 选择模型
   */
  onSelectModel(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({ selectedModel: id });
    
    const model = this.data.models.find(m => m.id === id);
    if (model) {
      wx.showToast({ title: `已选择 ${model.name}`, icon: 'none', duration: 1000 });
    }
  },

  /**
   * 切换高级设置
   */
  toggleAdvanced() {
    this.setData({ showAdvanced: !this.data.showAdvanced });
  },

  /**
   * 选择比例
   */
  onRatioChange(e) {
    this.setData({ ratioIndex: Number(e.detail.value) });
  },

  /**
   * 选择数量
   */
  onCountChange(e) {
    this.setData({ countIndex: Number(e.detail.value) });
  },

  /**
   * 前往风格库
   */
  goStyleLibrary() {
    wx.navigateTo({ url: '/pages/style-library/style-library' });
  },

  /**
   * 开始生成
   */
  goGenerating() {
    // 验证输入
    if (!this.data.topic.trim()) {
      app.showError('请输入主题');
      return;
    }
    
    // 检查登录
    if (!app.checkNeedLogin()) {
      return;
    }
    
    // 获取选中的风格
    const selectedStyle = this.data.styles.find(s => s.selected);
    const selectedModel = this.data.models.find(m => m.id === this.data.selectedModel);
    
    // 构建生成参数
    const params = {
      topic: this.data.topic,
      styleId: selectedStyle?.id,
      styleName: selectedStyle?.name,
      modelId: selectedModel?.id,
      modelName: selectedModel?.name,
      ratio: this.data.ratios[this.data.ratioIndex].value,
      count: this.data.counts[this.data.countIndex].value
    };
    
    // 跳转到生成页面
    wx.navigateTo({
      url: `/pages/generating/generating?params=${encodeURIComponent(JSON.stringify(params))}`
    });
  }
});
