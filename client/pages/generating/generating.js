/**
 * 生成中页面
 */
const app = getApp();

Page({
  data: {
    progress: 0,
    statusText: '准备中...',
    progressHint: '正在初始化生成任务',
    params: {},
    taskId: null
  },

  onLoad(options) {
    // 解析生成参数
    if (options.params) {
      try {
        const params = JSON.parse(decodeURIComponent(options.params));
        this.setData({ params });
      } catch (e) {
        console.error('解析参数失败:', e);
      }
    }
    
    // 开始生成
    this.startGenerating();
  },

  onUnload() {
    this.stopPolling();
  },

  /**
   * 开始生成
   */
  startGenerating() {
    // TODO: 调用真实 API 创建生成任务
    // const res = await worksApi.create(this.data.params);
    // this.setData({ taskId: res.taskId });
    // this.startPolling();
    
    // 模拟生成过程
    this.simulateGenerating();
  },

  /**
   * 模拟生成过程
   */
  simulateGenerating() {
    const stages = [
      { progress: 10, status: '排队中...', hint: '当前排队位置：第 1 位' },
      { progress: 25, status: '生成中...', hint: '正在分析提示词' },
      { progress: 45, status: '生成中...', hint: '正在生成图像基础结构' },
      { progress: 65, status: '生成中...', hint: '正在添加细节和纹理' },
      { progress: 85, status: '优化中...', hint: '正在优化图像质量' },
      { progress: 95, status: '即将完成...', hint: '正在保存生成结果' },
      { progress: 100, status: '已完成', hint: '生成成功，正在跳转...' }
    ];
    
    let currentStage = 0;
    
    this.timer = setInterval(() => {
      if (currentStage >= stages.length) {
        clearInterval(this.timer);
        this.onGenerateComplete();
        return;
      }
      
      const stage = stages[currentStage];
      this.setData({
        progress: stage.progress,
        statusText: stage.status,
        progressHint: stage.hint
      });
      
      currentStage++;
    }, 800);
  },

  /**
   * 开始轮询任务状态
   */
  startPolling() {
    this.pollTimer = setInterval(async () => {
      try {
        // TODO: 调用真实 API 查询任务状态
        // const status = await taskApi.getStatus(this.data.taskId);
        // this.updateProgress(status);
      } catch (e) {
        console.error('查询状态失败:', e);
      }
    }, 2000);
  },

  /**
   * 停止轮询
   */
  stopPolling() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  },

  /**
   * 生成完成
   */
  onGenerateComplete() {
    this.stopPolling();
    
    // 跳转到结果页
    setTimeout(() => {
      wx.redirectTo({
        url: `/pages/result/result?params=${encodeURIComponent(JSON.stringify(this.data.params))}`
      });
    }, 500);
  },

  /**
   * 后台运行
   */
  goBack() {
    wx.showModal({
      title: '后台运行',
      content: '生成将在后台继续，完成后会通知您',
      showCancel: false,
      success: () => {
        wx.navigateBack();
      }
    });
  },

  /**
   * 取消生成
   */
  cancel() {
    wx.showModal({
      title: '取消生成',
      content: '确定要取消当前生成任务吗？',
      confirmColor: '#EF4444',
      success: (res) => {
        if (res.confirm) {
          this.stopPolling();
          
          // TODO: 调用取消 API
          // await taskApi.cancel(this.data.taskId);
          
          app.showError('已取消生成');
          wx.navigateBack();
        }
      }
    });
  }
});
