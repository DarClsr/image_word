Page({
  data: {
    items: []
  },
  goHome() {
    wx.switchTab({ url: "/pages/home/home" });
  }
});
