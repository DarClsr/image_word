/**
 * 我的页面
 */
const app = getApp();

Page({
  data: {
    isLoggedIn: false,
    userInfo: {
      id: '',
      nickName: '',
      avatarUrl: '',
      memberType: 'free' // free | basic | pro
    },
    stats: {
      works: 0,
      likes: 0,
      shares: 0,
      points: 0,
      remainQuota: 0
    },
    hasUnread: false
  },

  onLoad() {
    this.checkLoginStatus();
  },

  onShow() {
    this.checkLoginStatus();
    if (this.data.isLoggedIn) {
      this.loadUserData();
    }
  },

  /**
   * 检查登录状态
   */
  checkLoginStatus() {
    const isLoggedIn = app.globalData.isLoggedIn;
    const userInfo = app.globalData.userInfo || {};
    
    this.setData({
      isLoggedIn,
      userInfo: {
        id: userInfo.id || '',
        nickName: userInfo.nickName || '用户',
        avatarUrl: userInfo.avatarUrl || '',
        memberType: userInfo.memberType || 'free'
      }
    });
  },

  /**
   * 加载用户数据
   */
  loadUserData() {
    // TODO: 从后端获取用户统计数据
    this.setData({
      stats: {
        works: 12,
        likes: 256,
        shares: 45,
        points: 1000,
        remainQuota: 8
      },
      hasUnread: true
    });
  },

  /**
   * 跳转登录
   */
  goLogin() {
    wx.navigateTo({ url: '/pages/login/login' });
  },

  /**
   * 编辑资料
   */
  goEditProfile() {
    // TODO: 跳转编辑资料页
    wx.showToast({ title: '编辑资料开发中', icon: 'none' });
  },

  /**
   * 充值
   */
  goRecharge() {
    // TODO: 跳转充值页
    wx.showToast({ title: '充值功能开发中', icon: 'none' });
  },

  /**
   * 我的作品
   */
  goWorks() {
    if (!app.checkNeedLogin()) return;
    wx.navigateTo({ url: '/pages/works/works' });
  },

  /**
   * 我的收藏
   */
  goFavorites() {
    if (!app.checkNeedLogin()) return;
    wx.showToast({ title: '收藏功能开发中', icon: 'none' });
  },

  /**
   * 我的草稿
   */
  goDrafts() {
    if (!app.checkNeedLogin()) return;
    wx.showToast({ title: '草稿箱开发中', icon: 'none' });
  },

  /**
   * 我的积分
   */
  goPoints() {
    if (!app.checkNeedLogin()) return;
    wx.showToast({ title: '积分中心开发中', icon: 'none' });
  },

  /**
   * 消息通知
   */
  goNotification() {
    if (!app.checkNeedLogin()) return;
    this.setData({ hasUnread: false });
    wx.showToast({ title: '消息中心开发中', icon: 'none' });
  },

  /**
   * 设置
   */
  goSettings() {
    wx.showToast({ title: '设置页开发中', icon: 'none' });
  },

  /**
   * 帮助与反馈
   */
  goHelp() {
    wx.showToast({ title: '帮助中心开发中', icon: 'none' });
  },

  /**
   * 关于我们
   */
  goAbout() {
    wx.showToast({ title: '关于我们开发中', icon: 'none' });
  },

  /**
   * 退出登录
   */
  onLogout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      confirmColor: '#EF4444',
      success: (res) => {
        if (res.confirm) {
          app.clearLoginStatus();
          
          this.setData({
            isLoggedIn: false,
            userInfo: { id: '', nickName: '', avatarUrl: '', memberType: 'free' },
            stats: { works: 0, likes: 0, shares: 0, points: 0, remainQuota: 0 }
          });
          
          app.showSuccess('已退出登录');
        }
      }
    });
  }
});
