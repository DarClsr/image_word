/**
 * 我的页面
 */
import { userApi } from '../../services/api';
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

    console.log('userInfo', userInfo);
    console.log('isLoggedIn', isLoggedIn);
    this.setData({
      isLoggedIn,
      userInfo: {
        id: userInfo.id || '',
        nickName: userInfo.nickname || '用户',
        avatar: userInfo.avatar || '',
        memberType: userInfo.memberType || 'free'
      }
    });

    console.log('this.data.userInfo', this.data.userInfo);
  },

  /**
   * 加载用户数据
   */
  loadUserData() {
    return userApi
      .getStats()
      .then((stats) => {
        this.setData({
          stats: {
            works: stats.works || 0,
            likes: stats.likes || 0,
            shares: 0,
            points: 0,
            remainQuota: stats.remainQuota || 0,
          },
          hasUnread: false,
        });
      })
      .catch(() => {
        app.showError('加载用户数据失败');
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
