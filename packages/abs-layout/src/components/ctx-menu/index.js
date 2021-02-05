import Vue from 'vue';
import ContextMenu from './index.vue';

const MenuConstructor = Vue.extend(ContextMenu);

class CtxMenu {
  open(menuData = [], e, targetData) {
    if (!this.instance) {
      const instance = new MenuConstructor({
        data: {
          menuData,
        },
      });
      instance.vm = instance.$mount();
      document.body.appendChild(instance.vm.$el);
      this.instance = instance;
    }
    this.instance.vm.menuData = menuData;
    this.instance.vm.show(e, targetData);
  }

  close() {
    this.instance.vm.close();
  }
}

export default new CtxMenu();
