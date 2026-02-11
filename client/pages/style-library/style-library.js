/**
 * 风格库页面
 */
import { categoryApi } from '../../services/api';

const GRADIENTS = [
  'linear-gradient(135deg, #DC2626, #F87171)',
  'linear-gradient(135deg, #EA580C, #FB923C)',
  'linear-gradient(135deg, #059669, #34D399)',
  'linear-gradient(135deg, #0D9488, #5EEAD4)',
  'linear-gradient(135deg, #7C3AED, #A78BFA)',
  'linear-gradient(135deg, #8B5CF6, #C4B5FD)',
  'linear-gradient(135deg, #DB2777, #F472B6)',
  'linear-gradient(135deg, #EC4899, #F9A8D4)',
  'linear-gradient(135deg, #0891B2, #22D3EE)',
  'linear-gradient(135deg, #0284C7, #38BDF8)',
  'linear-gradient(135deg, #6B7280, #9CA3AF)',
  'linear-gradient(135deg, #4B5563, #9CA3AF)',
];
const app = getApp();

Page({
  data: {
    // 分类标签
    tabs: [
      { id: 'all', name: '全部', icon: '✨', active: true },
      { id: 'guofeng', name: '国风', icon: '🏯', active: false },
      { id: 'realistic', name: '写实', icon: '📷', active: false },
      { id: 'anime', name: '动漫', icon: '🎨', active: false },
      { id: 'illustration', name: '插画', icon: '✏️', active: false },
      { id: 'cyberpunk', name: '赛博', icon: '🌃', active: false },
      { id: 'minimal', name: '极简', icon: '⬜', active: false }
    ],
    
    // 风格列表
    styles: [],
    allStyles: []
  },

  onLoad() {
    this.loadStyles();
  },

  /**
   * 加载风格列表
   */
  loadStyles() {
    const fallbackStyles = [
      { id: 1, name: '山水水墨', desc: '国风山水意境', icon: '🏔️', gradient: 'linear-gradient(135deg, #DC2626, #F87171)', category: 'guofeng', count: 128 },
      { id: 2, name: '工笔花鸟', desc: '细腻传统画风', icon: '🦜', gradient: 'linear-gradient(135deg, #EA580C, #FB923C)', category: 'guofeng', count: 86 },
      { id: 3, name: '现代写实', desc: '真实光影效果', icon: '📷', gradient: 'linear-gradient(135deg, #059669, #34D399)', category: 'realistic', count: 256 },
      { id: 4, name: '人像写真', desc: '精细人像质感', icon: '👤', gradient: 'linear-gradient(135deg, #0D9488, #5EEAD4)', category: 'realistic', count: 192 },
      { id: 5, name: '日系动漫', desc: '清新角色风格', icon: '🎌', gradient: 'linear-gradient(135deg, #7C3AED, #A78BFA)', category: 'anime', count: 312 },
      { id: 6, name: '二次元', desc: '经典动漫画风', icon: '🎨', gradient: 'linear-gradient(135deg, #8B5CF6, #C4B5FD)', category: 'anime', count: 428 },
      { id: 7, name: '扁平插画', desc: '清晰简洁线条', icon: '✏️', gradient: 'linear-gradient(135deg, #DB2777, #F472B6)', category: 'illustration', count: 156 },
      { id: 8, name: '水彩插画', desc: '柔和水彩质感', icon: '🎨', gradient: 'linear-gradient(135deg, #EC4899, #F9A8D4)', category: 'illustration', count: 98 },
      { id: 9, name: '赛博朋克', desc: '霓虹科幻风格', icon: '🌃', gradient: 'linear-gradient(135deg, #0891B2, #22D3EE)', category: 'cyberpunk', count: 186 },
      { id: 10, name: '未来科技', desc: '高科技视觉', icon: '🤖', gradient: 'linear-gradient(135deg, #0284C7, #38BDF8)', category: 'cyberpunk', count: 142 },
      { id: 11, name: '极简线条', desc: '简约设计风', icon: '⬜', gradient: 'linear-gradient(135deg, #6B7280, #9CA3AF)', category: 'minimal', count: 78 },
      { id: 12, name: '几何抽象', desc: '现代艺术感', icon: '🔷', gradient: 'linear-gradient(135deg, #4B5563, #9CA3AF)', category: 'minimal', count: 64 }
    ];

    return categoryApi
      .getStyles()
      .then((styles) => {
        const mapped = (styles || []).map((item, index) => ({
          id: item.id,
          name: item.name,
          desc: item.description || '',
          icon: item.icon || '✨',
          gradient: GRADIENTS[index % GRADIENTS.length],
          category: item.code || 'all',
          cover: item.cover || '',
        }));
        this.setData({ allStyles: mapped, styles: mapped });
      })
      .catch(() => {
        this.setData({ allStyles: fallbackStyles, styles: fallbackStyles });
      });
  },

  /**
   * 切换分类
   */
  onSwitchTab(e) {
    const id = e.currentTarget.dataset.id;
    
    const tabs = this.data.tabs.map(item => ({
      ...item,
      active: item.id === id
    }));
    
    this.setData({ tabs });
    this.filterStyles(id);
  },

  /**
   * 筛选风格
   */
  filterStyles(category) {
    const allStyles = this.data.allStyles || [];
    if (category === 'all') {
      this.setData({ styles: allStyles });
      return;
    }
    const filtered = allStyles.filter(item => item.category === category);
    this.setData({ styles: filtered });
  },

  /**
   * 选择风格
   */
  selectStyle(e) {
    const id = e.currentTarget.dataset.id;
    const style = this.data.styles.find(s => s.id === id);
    
    if (!style) return;
    
    wx.showActionSheet({
      itemList: ['使用此风格', '查看示例'],
      success: (res) => {
        if (res.tapIndex === 0) {
          // 返回首页并设置风格
          wx.switchTab({
            url: '/pages/home/home',
            success: () => {
              // 通过全局数据传递
              app.globalData.selectedStyle = {
                id: style.id,
                name: style.name
              };
            }
          });
        } else {
          // 查看示例
          wx.showToast({ title: '示例功能开发中', icon: 'none' });
        }
      }
    });
  }
});
