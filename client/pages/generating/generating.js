/**
 * 生成中页面
 */
import { worksApi, taskApi } from '../../services/api';

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
  async startGenerating() {
    try {
      const res = await worksApi.create(this.data.params);
      this.setData({ taskId: res.taskId });
      this.startPolling();
    } catch (error) {
      console.error('创建任务失败:', error);
      app.showError(error.message || '提交失败');
      wx.navigateBack();
    }
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
        const status = await taskApi.getStatus(this.data.taskId);
        this.updateProgress(status);
      } catch (e) {
        console.error('查询状态失败:', e);
      }
    }, 2000);
  },

  updateProgress(status) {
    if (!status) return;

    if (status.status === 'pending') {
      const positionText = status.queuePosition ? `当前排队位置：第 ${status.queuePosition} 位` : '正在排队';
      this.setData({
        progress: 15,
        statusText: '排队中...',
        progressHint: positionText
      });
      return;
    }

    if (status.status === 'processing') {
      this.setData({
        progress: 60,
        statusText: '生成中...',
        progressHint: '正在生成图像'
      });
      return;
    }

    if (status.status === 'completed') {
      this.setData({
        progress: 100,
        statusText: '已完成',
        progressHint: '生成成功，正在跳转...'
      });
      this.onGenerateComplete(status);
      return;
    }

    if (status.status === 'failed') {
      this.stopPolling();
      app.showError(status.errorMsg || '生成失败');
      wx.navigateBack();
    }
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
  onGenerateComplete(status) {
    this.stopPolling();
    app.globalData.needRefreshWorks = true;
    const taskId = status?.taskId || this.data.taskId;
    const worksId = status?.worksId;

    setTimeout(() => {
      const query = worksId ? `taskId=${taskId}&worksId=${worksId}` : `taskId=${taskId}`;
      wx.redirectTo({
        url: `/pages/result/result?${query}`
      });
    }, 300);
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
          
          taskApi
            .cancel(this.data.taskId)
            .catch(() => {})
            .finally(() => {
              app.showError('已取消生成');
              wx.navigateBack();
            });
        }
      }
    });
  }
});
