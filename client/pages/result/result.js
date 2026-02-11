/**
 * 生成结果页
 */
import { taskApi, worksApi } from '../../services/api';

const app = getApp();

Page({
  data: {
    // 生成参数
    params: {},

    taskId: null,
    worksId: null,
    
    // 图片列表
    images: [],
    mainImage: '',
    currentIndex: 0,
    
    // 文案
    copyText: {
      title: '',
      summary: '',
      tags: []
    }
  },

  onLoad(options) {
    if (options.taskId) {
      this.setData({ taskId: options.taskId });
    }
    if (options.worksId) {
      this.setData({ worksId: Number(options.worksId) });
    }
    if (options.params) {
      try {
        const params = JSON.parse(decodeURIComponent(options.params));
        this.setData({ params });
      } catch (e) {
        console.error('解析参数失败:', e);
      }
    }

    this.loadResultData();
  },

  /**
   * 加载结果数据
   */
  async loadResultData() {
    try {
      const worksId = this.data.worksId;
      if (worksId) {
        const works = await worksApi.getDetail(worksId);
        const imageUrl = works.imageUrl || works.thumbnailUrl;
        this.setData({
          params: {
            prompt: works.prompt,
            negativePrompt: works.negativePrompt,
            styleId: works.styleId,
            modelId: works.modelId,
            params: works.params || undefined,
          },
          images: imageUrl ? [imageUrl] : [],
          mainImage: imageUrl || '',
          currentIndex: 0,
          copyText: {
            title: works.prompt || '生成结果',
            summary: works.negativePrompt || '',
            tags: [works.style?.name, works.model?.name].filter(Boolean).map((tag) => `#${tag}`),
          },
        });
        return;
      }

      const taskId = this.data.taskId;
      if (taskId) {
        const status = await taskApi.getStatus(taskId);
        if (status.status !== 'completed') {
          app.showError('任务未完成，请稍后查看');
          return;
        }
        const imageUrl = status.result?.imageUrl || status.result?.thumbnailUrl || '';
        this.setData({
          images: imageUrl ? [imageUrl] : [],
          mainImage: imageUrl,
          currentIndex: 0,
          copyText: {
            title: this.data.params.topic || '生成结果',
            summary: '',
            tags: [],
          },
        });
      }
    } catch (error) {
      console.error('加载结果失败:', error);
      app.showError(error.message || '加载结果失败');
    }
  },

  /**
   * 选择图片
   */
  selectImage(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      currentIndex: index,
      mainImage: this.data.images[index]
    });
  },

  /**
   * 预览图片
   */
  previewImage(e) {
    const index = e.currentTarget.dataset.index || 0;
    wx.previewImage({
      urls: this.data.images,
      current: this.data.images[index]
    });
  },

  /**
   * 复制文本
   */
  copyText(e) {
    const { type, value } = e.currentTarget.dataset;
    let text = '';
    
    switch (type) {
      case 'title':
        text = this.data.copyText.title;
        break;
      case 'summary':
        text = this.data.copyText.summary;
        break;
      case 'tag':
        text = value;
        break;
    }
    
    if (text) {
      wx.setClipboardData({
        data: text,
        success: () => {
          app.showSuccess('已复制');
        }
      });
    }
  },

  /**
   * 一键复制全部文案
   */
  copyAllText() {
    const { title, summary, tags } = this.data.copyText;
    const text = `${title}\n\n${summary}\n\n${tags.join(' ')}`;
    
    wx.setClipboardData({
      data: text,
      success: () => {
        app.showSuccess('已复制全部文案');
      }
    });
  },

  /**
   * 下载图片
   */
  downloadImage() {
    app.showLoading('保存中...');
    
    wx.downloadFile({
      url: this.data.mainImage,
      success: (res) => {
        if (res.statusCode === 200) {
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: () => {
              app.hideLoading();
              app.showSuccess('已保存到相册');
            },
            fail: (err) => {
              app.hideLoading();
              if (err.errMsg.includes('auth deny')) {
                wx.showModal({
                  title: '提示',
                  content: '需要您授权保存图片到相册',
                  success: (res) => {
                    if (res.confirm) {
                      wx.openSetting();
                    }
                  }
                });
              } else {
                app.showError('保存失败');
              }
            }
          });
        } else {
          app.hideLoading();
          app.showError('下载失败');
        }
      },
      fail: () => {
        app.hideLoading();
        app.showError('下载失败');
      }
    });
  },

  /**
   * 再次生成
   */
  regenerate() {
    wx.showModal({
      title: '再次生成',
      content: '将使用相同参数重新生成，是否继续？',
      success: (res) => {
        if (res.confirm) {
          wx.redirectTo({
            url: `/pages/generating/generating?params=${encodeURIComponent(JSON.stringify(this.data.params))}`
          });
        }
      }
    });
  },

  /**
   * 高清生成
   */
  hdGenerate() {
    if (!app.checkNeedLogin()) return;
    
    wx.showModal({
      title: '高清生成',
      content: '将消耗额外额度生成高清版本，是否继续？',
      success: (res) => {
        if (res.confirm) {
          const params = this.buildHdParams();
          wx.redirectTo({
            url: `/pages/generating/generating?params=${encodeURIComponent(JSON.stringify(params))}`,
          });
        }
      }
    });
  },

  /**
   * 生成高清参数
   */
  buildHdParams() {
    const baseParams = this.data.params || {};
    const extra = baseParams.params || {};
    const ratio = extra.ratio;
    const baseWidth = extra.width || 1024;
    const baseHeight = extra.height || 1024;
    const { width, height } = this.getHdSize(ratio, baseWidth, baseHeight);

    return {
      ...baseParams,
      params: {
        ...extra,
        width,
        height,
        count: 1,
      },
    };
  },

  /**
   * 计算高清尺寸
   */
  getHdSize(ratio, width, height) {
    const ratioMap = {
      '1:1': { width: 1536, height: 1536 },
      '3:4': { width: 1536, height: 2048 },
      '4:3': { width: 2048, height: 1536 },
      '9:16': { width: 1152, height: 2048 },
    };

    if (ratio && ratioMap[ratio]) {
      return ratioMap[ratio];
    }

    const maxSize = 2048;
    const scale = Math.min(maxSize / width, maxSize / height, 1.5);
    return {
      width: Math.round(width * scale),
      height: Math.round(height * scale),
    };
  },

  /**
   * 分享
   */
  onShareAppMessage() {
    return {
      title: this.data.copyText.title || '我用 AI 生成了一张图片',
      imageUrl: this.data.mainImage,
      path: '/pages/home/home'
    };
  }
});
