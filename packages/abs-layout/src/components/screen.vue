<template lang="pug">
div.wrapper#screen(:style="pageStyle" @click="unSelect" @contextmenu.prevent="ctxMenu.open(contextMenuData, $event)")
  template(v-for="(card, i) in screen.cards")
    //- bare-card(v-if="card.locked" :index="i" :card="card" :key="card.id")
    card(
    :key="card.id"
    :index="i"
    :card="card"
    :inGroup="false"
    :groupScale="[1,1]")
</template>
<script>
import { mapState } from "vuex";
import Card from "./card";
import CtxMenu from "./ctx-menu";
import getCoordFromEvent from "../mixins/get-coord-from-event";
// import '@/style/screen.scss';
export default {
  components: { Card },
  props: ["screen"],
  data() {
    return {
      ctxMenu: CtxMenu,
      keyPressed: false
    };
  },
  mixins: [getCoordFromEvent],
  computed: {
    ...mapState(["scale", "selectedIdxs", "cardsToBePaste", "guideLines"]),
    contextMenuData() {
      return [
        {
          text: "粘贴",
          onclick: (a, e) =>
            this.$dispatch("cards.paste", this.getCoordFromEvent(e)),
          show: this.cardsToBePaste.length,
          icon: "copy",
          shotcut: "Ctrl+V"
        }
        // {
        //   text: '撤销',
        //   onclick: this.$dispatch('undo'),
        //   icon: 'delete',
        //   shotcut: 'Ctrl+Z',
        // },
      ];
    },
    pageStyle() {
      const { size, background } = this.screen.page;
      let style = {
        backgroundColor: background.color,
        width: size.w + "px",
        height: size.h + "px",
        transform: `scale(${this.scale})`
      };
      if (background.imgUrl) {
        style.backgroundImage = `url(${background.imgUrl})`;
        style.backgroundPosition = "center cener";
        style.backgroundSize = "cover";
      }
      return style;
    }
  },
  mounted() {
    this.addShotcutsHandler();
  },
  beforeDestroy() {
    this.removeShotcutsHandler();
  },
  // watch: {
  //   // 有增删变量时需要重新初始化变量
  //   "screen.page.data.vars": {
  //     deep: true,
  //     handler() {
  //       this.$commit("globalVars.init");
  //     }
  //   }
  // },
  methods: {
    removeShotcutsHandler() {
      document.removeEventListener("keyup", this.onKeyup, false);
      document.removeEventListener("keydown", this.onKeydown, false);
    },
    // 快捷键移动
    async onKeydown(e) {
      // or document.hasFocus() ?
      if (["TEXTAREA", "INPUT"].includes(e.srcElement.nodeName)) {
        return;
      }
      const len = this.selectedIdxs.length;
      const { keyCode } = e;
      if (e.ctrlKey) {
        const actionMap = {
          67: () => this.$dispatch("cards.copy"),
          76: () => this.$dispatch("cards.lock"),
          72: () => this.$dispatch("cards.hide"),
          86: () => this.$dispatch("cards.paste")
          // 38: () => this.$commit("componentsPanel.toggle"),
          // 39: () => this.$commit("configPanel.toggle"),
          // 37: () => this.$commit("layersPanel.toggle")
        };
        if (keyCode in actionMap && !this.keyPressed) {
          e.preventDefault();
          actionMap[keyCode]();
          this.keyPressed = true;
        }
      } else if ([46, 8].includes(keyCode) && len) {
        this.$dispatch("cards.delete");
      } else {
        const codeMap = {
          38: "up",
          40: "down",
          39: "right",
          37: "left"
        };
        keyCode in codeMap &&
          len &&
          this.$dispatch(`cards.move`, codeMap[keyCode]);
      }
    },
    onKeyup() {
      this.keyPressed = false;
    },
    addShotcutsHandler() {
      document.addEventListener("keyup", this.onKeyup, false);
      document.addEventListener("keydown", this.onKeydown, false);
    },
    unSelect() {
      // 在画布空白处点击 取消选中
      this.$commit("cards.select", []);
    }
  }
};
</script>

<style lang="scss" scoped>
.lock-mask {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 99999;
  background: #000;
  opacity: 0.3;
}
</style>
