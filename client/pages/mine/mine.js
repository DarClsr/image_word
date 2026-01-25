const app = getApp();

Page({
  data: {
    isLoggedIn: false,
    userInfo: {
      id: "",
      nickName: "",
      avatarUrl: ""
    },
    stats: {
      works: 0,
      likes: 0,
      shares: 0,
      points: 0
    }
  },

  onLoad() {
    this.checkLoginStatus();
  },

  onShow() {
    this.checkLoginStatus();
  },

  checkLoginStatus() {
    // TODO: 从本地存储或全局状态检查登录状态
    const token = wx.getStorageSync("token");
    if (token) {
      this.setData({ isLoggedIn: true });
      this.loadUserInfo();
      this.loadStats();
    } else {
      this.setData({ isLoggedIn: false });
    }
  },

  loadUserInfo() {
    // TODO: 从后台获取用户信息
    const userInfo = wx.getStorageSync("userInfo") || {};
    this.setData({
      userInfo: {
        id: userInfo.id || "10001",
        nickName: userInfo.nickName || "用户",
        avatarUrl: userInfo.avatarUrl || ""
      }
    });
  },

  loadStats() {
    // TODO: 从后台获取统计数据
    this.setData({
      stats: {
        works: 12,
        likes: 256,
        shares: 45,
        points: 1000
      }
    });
  },

  goLogin() {
    wx.navigateTo({ url: "/pages/login/login" });
  },

  goEditProfile() {
    wx.showToast({ title: "编辑资料", icon: "none" });
  },

  goWorks() {
    if (!this.data.isLoggedIn) {
      this.goLogin();
      return;
    }
    wx.navigateTo({ url: "/pages/works/works" });
  },

  goFavorites() {
    if (!this.data.isLoggedIn) {
      this.goLogin();
      return;
    }
    wx.showToast({ title: "收藏功能开发中", icon: "none" });
  },

  goDrafts() {
    if (!this.data.isLoggedIn) {
      this.goLogin();
      return;
    }
    wx.showToast({ title: "草稿箱", icon: "none" });
  },

  onLogout() {
    wx.showModal({
      title: "提示",
      content: "确定要退出登录吗？",
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync("token");
          wx.removeStorageSync("userInfo");
          this.setData({
            isLoggedIn: false,
            userInfo: { id: "", nickName: "", avatarUrl: "" },
            stats: { works: 0, likes: 0, shares: 0, points: 0 }
          });
          wx.showToast({ title: "已退出登录", icon: "success" });
        }
      }
    });
  }
});
