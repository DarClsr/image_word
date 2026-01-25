Page({
  data: {
    progress: 10,
    statusText: "排队中，预计 30 秒"
  },
  onLoad() {
    this.timer = setInterval(() => {
      let progress = this.data.progress + 10;
      let statusText = progress < 100 ? "生成中，请稍候" : "已完成，正在跳转";
      if (progress >= 100) {
        progress = 100;
        clearInterval(this.timer);
        setTimeout(() => {
          wx.redirectTo({ url: "/pages/result/result" });
        }, 500);
      }
      this.setData({ progress, statusText });
    }, 500);
  },
  onUnload() {
    if (this.timer) clearInterval(this.timer);
  },
  goBack() {
    wx.navigateBack();
  },
  cancel() {
    wx.showToast({ title: "已取消", icon: "none" });
    wx.navigateBack();
  }
});
