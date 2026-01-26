/**
 * 生成结果页
 */
const app = getApp();

Page({
  data: {
    // 生成参数
    params: {},
    
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
    // 解析参数
    if (options.params) {
      try {
        const params = JSON.parse(decodeURIComponent(options.params));
        this.setData({ params });
      } catch (e) {
        console.error('解析参数失败:', e);
      }
    }
    
    // 加载结果数据
    this.loadResultData();
  },

  /**
   * 加载结果数据
   */
  loadResultData() {
    // TODO: 从后端获取生成结果
    // 模拟数据
    const mockImages = [
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800',
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800',
      'https://images.unsplash.com/photo-1482192505345-5655af888cc4?w=800',
      'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?w=800'
    ];
    
    const topic = this.data.params.topic || '冬日城市夜景海报';
    
    this.setData({
      images: mockImages,
      mainImage: mockImages[0],
      currentIndex: 0,
      copyText: {
        title: topic,
        summary: '霓虹与雪夜交织，展现城市的静谧与温度。细腻的光影勾勒出都市的轮廓，在寂静的冬夜里散发着温暖的气息。',
        tags: ['#冬日', '#城市', '#夜景', '#海报', '#霓虹']
      }
    });
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
      content: '将消耗 2 次额度生成高清版本，是否继续？',
      success: (res) => {
        if (res.confirm) {
          // TODO: 调用高清生成 API
          app.showError('高清生成功能开发中');
        }
      }
    });
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
