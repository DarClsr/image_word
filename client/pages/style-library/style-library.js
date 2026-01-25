Page({
  data: {
    tabs: [
      { name: "国风", active: true },
      { name: "写实", active: false },
      { name: "动漫", active: false },
      { name: "插画", active: false },
      { name: "赛博", active: false },
      { name: "极简", active: false }
    ],
    styles: [
      { name: "山水水墨", desc: "国风山水意境" },
      { name: "现代写实", desc: "真实光影" },
      { name: "日漫风", desc: "清新角色" },
      { name: "插画风", desc: "清晰线条" }
    ]
  },
  onSwitchTab(e) {
    const name = e.currentTarget.dataset.name;
    const tabs = this.data.tabs.map(item => ({
      ...item,
      active: item.name === name
    }));
    this.setData({ tabs });
  }
});
