export default {
  methods: {
    calcSubMenuPos(e, menu) {
      if (!(menu.children && menu.children.length)) {
        return;
      }
      const subMenuEl = e.target.querySelector('ul');
      if (!subMenuEl) {
        return;
      }
      //  TODO 重新写 判断边界
      this.subMenuPos.left = '100%';
      this.subMenuPos.right = 'auto';
      this.subMenuPos.top = '0';
      this.subMenuPos.bottom = 'auto';
    },
  },
};
