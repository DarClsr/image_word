Page({
  data: {
    topic: "",
    selectedModel: "SDXL",
    ratioIndex: 0,
    countIndex: 2,
    ratios: [
      { label: "1:1", value: "1:1" },
      { label: "3:4", value: "3:4" },
      { label: "4:3", value: "4:3" },
      { label: "9:16", value: "9:16" },
      { label: "16:9", value: "16:9" }
    ],
    counts: [
      { label: "1张", value: 1 },
      { label: "2张", value: 2 },
      { label: "4张", value: 4 },
      { label: "6张", value: 6 },
      { label: "8张", value: 8 }
    ],
    styles: [
      { name: "国风", selected: true },
      { name: "写实", selected: false },
      { name: "动漫", selected: false },
      { name: "插画", selected: false },
      { name: "赛博", selected: false }
    ],
    models: [
      { name: "SDXL", desc: "稳定、性价比高", price: "¥", speed: "快", quality: "高" },
      { name: "Flux", desc: "风格细腻", price: "¥¥", speed: "中", quality: "高" },
      { name: "DALL·E", desc: "通用表现", price: "¥¥¥", speed: "中", quality: "高" }
    ]
  },
  onTopicInput(e) {
    this.setData({ topic: e.detail.value });
  },
  onSelectStyle(e) {
    const name = e.currentTarget.dataset.name;
    const styles = this.data.styles.map(item => ({
      ...item,
      selected: item.name === name
    }));
    this.setData({ styles });
  },
  onSelectModel(e) {
    const name = e.currentTarget.dataset.name;
    this.setData({ selectedModel: name });
    wx.showToast({ title: `已选择 ${name}`, icon: "none" });
  },
  onRatioChange(e) {
    this.setData({ ratioIndex: e.detail.value });
  },
  onCountChange(e) {
    this.setData({ countIndex: e.detail.value });
  },
  goStyleLibrary() {
    wx.navigateTo({ url: "/pages/style-library/style-library" });
  },
  goGenerating() {
    wx.navigateTo({ url: "/pages/generating/generating" });
  }
});
