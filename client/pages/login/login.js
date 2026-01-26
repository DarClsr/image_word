/**
 * 登录页面
 */
const app = getApp();

Page({
  data: {
    agreed: false
  },

  /**
   * 切换协议同意状态
   */
  toggleAgreement() {
    this.setData({ agreed: !this.data.agreed });
  },

  /**
   * 检查协议是否同意
   */
  checkAgreement() {
    if (!this.data.agreed) {
      app.showError('请先同意用户协议和隐私政策');
      return false;
    }
    return true;
  },

  /**
   * 手机号登录
   */
  onGetPhoneNumber(e) {
    if (!this.checkAgreement()) return;
    
    if (e.detail.errMsg === 'getPhoneNumber:ok') {
      const { code } = e.detail;
      this.doLogin({ type: 'phone', code });
    } else {
      app.showError('获取手机号失败');
    }
  },

  /**
   * 微信授权登录
   */
  onWechatLogin() {
    if (!this.checkAgreement()) return;
    
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        const userInfo = res.userInfo;
        wx.login({
          success: (loginRes) => {
            if (loginRes.code) {
              this.doLogin({
                type: 'wechat',
                code: loginRes.code,
                userInfo
              });
            }
          },
          fail: () => {
            app.showError('登录失败，请重试');
          }
        });
      },
      fail: () => {
        // 用户拒绝授权，使用静默登录
        wx.login({
          success: (loginRes) => {
            if (loginRes.code) {
              this.doLogin({ type: 'wechat', code: loginRes.code });
            }
          },
          fail: () => {
            app.showError('登录失败，请重试');
          }
        });
      }
    });
  },

  /**
   * 执行登录
   */
  doLogin(params) {
    app.showLoading('登录中...');
    
    // TODO: 调用真实登录 API
    // const res = await authApi.wechatLogin(params);
    
    // 模拟登录成功
    setTimeout(() => {
      app.hideLoading();
      
      // 保存登录状态
      const token = 'mock_token_' + Date.now();
      const userInfo = {
        id: '10001',
        nickName: params.userInfo?.nickName || '微信用户',
        avatarUrl: params.userInfo?.avatarUrl || '',
        memberType: 'free'
      };
      
      app.setLoginStatus({ token, userInfo });
      
      app.showSuccess('登录成功');
      
      // 返回上一页
      setTimeout(() => {
        wx.navigateBack({ fail: () => {
          wx.switchTab({ url: '/pages/home/home' });
        }});
      }, 800);
    }, 1200);
  },

  /**
   * 游客模式
   */
  onGuestMode() {
    wx.showModal({
      title: '游客模式',
      content: '游客模式下部分功能受限，无法保存生成的作品。是否继续？',
      confirmText: '继续体验',
      success: (res) => {
        if (res.confirm) {
          wx.navigateBack({ fail: () => {
            wx.switchTab({ url: '/pages/home/home' });
          }});
        }
      }
    });
  },

  /**
   * 显示用户协议
   */
  showUserAgreement() {
    wx.showModal({
      title: '用户协议',
      content: '欢迎使用图文生成小程序！本协议包含使用条款、知识产权、用户行为规范等内容...',
      showCancel: false,
      confirmText: '我知道了'
    });
  },

  /**
   * 显示隐私政策
   */
  showPrivacyPolicy() {
    wx.showModal({
      title: '隐私政策',
      content: '我们重视您的隐私保护。本政策说明我们如何收集、使用、存储您的个人信息...',
      showCancel: false,
      confirmText: '我知道了'
    });
  }
});
