Page({
  data: {
    agreed: false
  },

  toggleAgreement() {
    this.setData({ agreed: !this.data.agreed });
  },

  checkAgreement() {
    if (!this.data.agreed) {
      wx.showToast({ title: "请先同意用户协议", icon: "none" });
      return false;
    }
    return true;
  },

  onGetPhoneNumber(e) {
    if (!this.checkAgreement()) return;
    
    if (e.detail.errMsg === "getPhoneNumber:ok") {
      const { code } = e.detail;
      // TODO: 发送 code 到后端换取手机号
      this.doLogin({ type: "phone", code });
    } else {
      wx.showToast({ title: "获取手机号失败", icon: "none" });
    }
  },

  onWechatLogin() {
    if (!this.checkAgreement()) return;
    
    wx.getUserProfile({
      desc: "用于完善用户资料",
      success: (res) => {
        const userInfo = res.userInfo;
        wx.login({
          success: (loginRes) => {
            if (loginRes.code) {
              this.doLogin({ 
                type: "wechat", 
                code: loginRes.code,
                userInfo 
              });
            }
          }
        });
      },
      fail: () => {
        // 用户拒绝授权，使用静默登录
        wx.login({
          success: (loginRes) => {
            if (loginRes.code) {
              this.doLogin({ type: "wechat", code: loginRes.code });
            }
          }
        });
      }
    });
  },

  doLogin(params) {
    wx.showLoading({ title: "登录中..." });
    
    // TODO: 调用后端登录接口
    // 模拟登录成功
    setTimeout(() => {
      wx.hideLoading();
      
      // 保存登录状态
      wx.setStorageSync("token", "mock_token_" + Date.now());
      wx.setStorageSync("userInfo", {
        id: "10001",
        nickName: params.userInfo?.nickName || "用户",
        avatarUrl: params.userInfo?.avatarUrl || ""
      });
      
      wx.showToast({ title: "登录成功", icon: "success" });
      
      // 返回上一页
      setTimeout(() => {
        wx.navigateBack();
      }, 1000);
    }, 1000);
  },

  onGuestMode() {
    wx.showModal({
      title: "游客模式",
      content: "游客模式下部分功能受限，是否继续？",
      success: (res) => {
        if (res.confirm) {
          wx.navigateBack();
        }
      }
    });
  },

  showUserAgreement() {
    wx.showModal({
      title: "用户协议",
      content: "用户协议内容...",
      showCancel: false
    });
  },

  showPrivacyPolicy() {
    wx.showModal({
      title: "隐私政策",
      content: "隐私政策内容...",
      showCancel: false
    });
  }
});
