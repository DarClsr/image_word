/**
 * 图文生成页面 - AI 直接生成带文字的图片
 */
import { imageTextApi } from '../../services/api';

const app = getApp();

Page({
  data: {
    // 输入
    topic: '',
    
    // 模板选项
    templates: [],
    selectedTemplate: 'quote',
    
    // 风格选项
    styles: [],
    selectedStyle: 'xiaohongshu',
    
    // AI 模型
    models: [],
    selectedModel: 'ideogram',
    
    // 图片比例
    ratios: [
      { id: '1:1', name: '方形', icon: '⬜' },
      { id: '3:4', name: '竖版', icon: '📱' },
      { id: '4:3', name: '横版', icon: '🖼️' },
      { id: '9:16', name: '全屏', icon: '📲' },
    ],
    selectedRatio: '3:4',
    
    // 生成结果
    result: null,
    
    // 状态
    loading: false,
  },

  onLoad(options) {
    this.loadOptions();
    
    // 从首页传入的模板参数
    if (options.template) {
      this.setData({ selectedTemplate: options.template });
    }
  },

  /**
   * 加载选项配置
   */
  async loadOptions() {
    try {
      const [templates, styles, models] = await Promise.all([
        imageTextApi.getTemplates(),
        imageTextApi.getStyles(),
        imageTextApi.getModels(),
      ]);
      
      this.setData({
        templates: templates || [],
        styles: styles || [],
        models: models || [],
      });
    } catch (error) {
      console.error('加载配置失败:', error);
      // 使用默认配置
      this.setDefaultOptions();
    }
  },

  /**
   * 设置默认选项
   */
  setDefaultOptions() {
    this.setData({
      templates: [
        { id: 'quote', name: '金句语录', icon: '💬' },
        { id: 'tips', name: '技巧干货', icon: '💡' },
        { id: 'list', name: '清单合集', icon: '📝' },
        { id: 'story', name: '故事感悟', icon: '📖' },
        { id: 'knowledge', name: '知识科普', icon: '🎓' },
      ],
      styles: [
        { id: 'xiaohongshu', name: '小红书' },
        { id: 'minimal', name: '极简' },
        { id: 'gradient', name: '渐变' },
        { id: 'magazine', name: '杂志' },
        { id: 'cute', name: '可爱' },
      ],
      models: [
        { id: 'ideogram', name: 'Ideogram', textQuality: 5 },
        { id: 'flux', name: 'Flux', textQuality: 4 },
      ],
    });
  },

  /**
   * 输入主题
   */
  onTopicInput(e) {
    this.setData({ topic: e.detail.value });
  },

  /**
   * 选择模板
   */
  onSelectTemplate(e) {
    this.setData({ selectedTemplate: e.currentTarget.dataset.id });
  },

  /**
   * 选择风格
   */
  onSelectStyle(e) {
    this.setData({ selectedStyle: e.currentTarget.dataset.id });
  },

  /**
   * 选择模型
   */
  onSelectModel(e) {
    this.setData({ selectedModel: e.currentTarget.dataset.id });
  },

  /**
   * 选择比例
   */
  onSelectRatio(e) {
    this.setData({ selectedRatio: e.currentTarget.dataset.id });
  },

  /**
   * 生成图文
   */
  async onGenerate() {
    const { topic, selectedTemplate, selectedStyle, selectedRatio, selectedModel } = this.data;
    
    if (!topic.trim()) {
      app.showError('请输入主题');
      return;
    }

    // 检查登录
    if (!app.checkNeedLogin()) {
      return;
    }

    this.setData({ loading: true, result: null });

    try {
      const result = await imageTextApi.generate({
        topic,
        template: selectedTemplate,
        style: selectedStyle,
        ratio: selectedRatio,
        model: selectedModel,
      });

      this.setData({ result, loading: false });
      app.showSuccess('生成成功');
    } catch (error) {
      console.error('生成失败:', error);
      app.showError(error.message || '生成失败，请重试');
      this.setData({ loading: false });
    }
  },

  /**
   * 预览图片
   */
  onPreviewImage() {
    if (!this.data.result?.imageUrl) return;
    
    wx.previewImage({
      urls: [this.data.result.imageUrl],
      current: this.data.result.imageUrl,
    });
  },

  /**
   * 保存图片
   */
  async onSave() {
    const { result } = this.data;
    if (!result?.imageUrl) {
      app.showError('请先生成图片');
      return;
    }

    try {
      app.showLoading('保存中...');
      
      // 下载图片
      const downloadRes = await new Promise((resolve, reject) => {
        wx.downloadFile({
          url: result.imageUrl,
          success: resolve,
          fail: reject,
        });
      });

      // 保存到相册
      await wx.saveImageToPhotosAlbum({
        filePath: downloadRes.tempFilePath,
      });

      app.hideLoading();
      app.showSuccess('已保存到相册');
    } catch (error) {
      app.hideLoading();
      
      if (error.errMsg?.includes('auth deny')) {
        wx.showModal({
          title: '提示',
          content: '需要授权保存图片到相册',
          confirmText: '去授权',
          success: (res) => {
            if (res.confirm) {
              wx.openSetting();
            }
          },
        });
      } else {
        app.showError('保存失败');
      }
    }
  },

  /**
   * 重新生成
   */
  onRegenerate() {
    this.onGenerate();
  },

  /**
   * 分享
   */
  onShareAppMessage() {
    return {
      title: this.data.result?.content?.title || '我用 AI 生成了一张图文',
      imageUrl: this.data.result?.imageUrl,
      path: '/pages/image-text/image-text',
    };
  },
});
