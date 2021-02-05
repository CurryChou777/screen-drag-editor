<template lang="pug">
vue-drag-resize(
    v-show="!card.hide"
    :sticky="guideLinesVisible"
    :xLines="guideLines.h"
    :yLines="guideLines.v"
    :isDraggable="!card.locked"
    :isResizable="!card.locked"
    :isActive="isActive"
    :preventActiveBehavior="true"
    @click.native.stop="()=>{}"
    @dblclick.native.stop="onDblClick"
    @mousedown.native="onCardMouseDown"
    @resizeStart="onResizeStart"
    @resizing="onResizing",
    @resizestop="onResizeStop"
    @mouseover.native="hoverOn"
    @mouseout.native="hoverOut"
    @dragging="updateCoord"
    @dragstop="onDragStop"
    :w="view.w * groupScale[0]", :h="view.h * groupScale[1]", :x="view.x * groupScale[0]", :y="view.y * groupScale[1]", :z="view.z",
    :zoom="1/scale"
    :style="style"
    :id="card.id"
    :class="{hovered: hoveredIdx === index, selected: selectedIdxs.includes(index), 'in-selection': cardsInSelection.includes(index)}"
  )
    div.card.w-100.h-100
      //- 暂时注释成组功能
      //- template(v-if="card.isGroup")
      //-   card(
      //-     v-for="(childCard, i) in sortByZ(card.children)"
      //-     :key="i"
      //-     :card="childCard"
      //-     :index="`${index}.children.${card.index}`"
      //-     :inGroup="true"
      //-     :groupView="card.cardStyle.view"
      //-     :groupScale="[selfScale[0]*groupScale[0], selfScale[1]*groupScale[1]]"
      //-     @childViewChanged="onChildViewChanged")
      component(:is="component" v-bind="card" ref="component")
      .mask(@contextmenu.prevent.stop="ctxMenu.open(contextMenuData, $event)" :class="{locked: card.locked}" :style="{color: themeConfig.navigatorLineColor, backgroundColor: isActive ?  themeConfig.maskBgColor : 'transparent'}")
    .navigator-line(v-show="isActive")
      .navigator-line-left(:style="{ width: (view.x + (inGroup ? groupView.x : 0) + screenOffset / scale) + 'px', borderTopColor: themeConfig.navigatorLineColor}")
      .navigator-line-top(:style="{ height: (view.y + (inGroup ? groupView.y : 0) + screenOffset / scale) + 'px', borderLeftColor: themeConfig.navigatorLineColor}")
      .navigator-line-account(
        :style="{fontSize: parseInt(12/scale) + 'px', left: parseInt(-6/scale) + 'px', top: parseInt(-6/scale) + 'px'}") {{view.x+ (inGroup ? groupView.x : 0)}}, {{view.y+ (inGroup ? groupView.y : 0)}}
</template>
<script>
import VueDragResize from "./vue-drag-resize";
import { mapState, mapGetters } from "vuex";
import CtxMenu from "./ctx-menu";
import {
  chainKeyPath,
  traverseTree,
  reverse,
  sortBy,
  get
} from "../../../../src/utils";
export default {
  name: "Card",
  components: { VueDragResize },
  props: [
    "card",
    "index",
    "inTabs",
    "inGroup",
    "isActiveTab",
    "inSlider",
    "groupView",
    "groupScale"
  ],
  data() {
    return {
      ctxMenu: CtxMenu,
      component: {
        render() {}
      },
      baseSize: { w: 0, h: 0 },
      selfScale: [1, 1]
    };
  },
  mounted() {
    if (this.card.type !== "group") {
      try {
        this.component = this.componentMap[this.card.type].component;
      } catch (err) {
        throw new Error(`组件${this.card.type}未注册`);
      }
    }
  },
  methods: {
    hoverOn() {
      this.$commit("cards.hover", this.index);
    },
    hoverOut() {
      this.$commit("cards.hover", -1);
    },
    // onChildViewChanged() {
    //   //得到新的view (加上oldView 才是准确的新的view)
    //   // 之后再调整 子元素的view (xy)
    //   const childCards = this.card.children;
    //   const relativeView = getGroupView(childCards);
    //   const { w, h, x, y, z } = relativeView;
    //   const path = `cards.${this.index}.cardStyle.view`;
    //   const view = {
    //     w,
    //     h,
    //     x: x + this.view.x,
    //     y: y + this.view.y,
    //     z
    //   };
    //   childCards.forEach((card, i) => {
    //     const { x: oldX, y: oldY } = card.cardStyle.view;
    //     this.rw(
    //       { x: oldX - x, y: oldY - y },
    //       `cards.${this.index}.children.${i}.cardStyle.view`
    //     );
    //   });
    //   this.rw(view, path);
    // },
    sortByZ(cards) {
      // 按z从大到小排序 同时保留index
      return reverse(
        sortBy(
          cards.map((card, index) => ({ ...card, index })),
          card => card.cardStyle.view.z
        )
      );
    },
    // unGroup() {
    //   const cards = this.$store.state.screen.cards;
    //   pullAt(cards, this.index);
    //   const { x, y } = this.card.cardStyle.view;
    //   this.rw(
    //     "cards",
    //     cards.concat(
    //       this.card.children.map(card => {
    //         const { x: oldX, y: oldY } = card.cardStyle.view;
    //         return merge({}, card, {
    //           cardStyle: { view: { x: oldX + x, y: oldY + y } }
    //         });
    //       })
    //     )
    //   );
    //   this.$commit("cards.select", []);
    // },
    group(groupType) {
      this.$dispatch("cards.group", groupType);
    },
    onDblClick() {
      if (this.inGroup) {
        // 选中
        this.select();
      }
    },
    select(e) {
      const { selectedIdxs, index } = this;
      if (selectedIdxs.includes(index)) {
        return;
      }
      this.$commit(
        "cards.select",
        e && e.ctrlKey
          ? selectedIdxs.concat(index) || selectedIdxs
          : [this.index]
      );
    },
    onCardMouseDown(e) {
      // this.select();
      if (this.inGroup) {
        // 让它冒泡 使父元素可以拖动
        if (this.isActive) {
          e.stopPropagation();
        }
      } else {
        e.stopPropagation();
        // 如果是右键 并已选中的卡片数大于2
        if (e.which === 3 && this.selectedIdxs.length > 1) {
          return;
        } else {
          // 双击child card也会
          this.select(e);
        }
      }
    },
    onDragStop() {
      if (this.inGroup) {
        this.$emit("childViewChanged");
      }
    },
    updateCoord(rect) {
      this.$dispatch("cards.drag", { rect, index: this.index });
    },
    onResizeStart() {
      this.baseSize = { w: this.view.w, h: this.view.h };
    },
    onResizing({ width: w, height: h }) {
      const path = chainKeyPath(`cards.${this.index}`, this.pathToView);
      this.$dispatch("screen.update", {
        [`${path}.w`]: w,
        [`${path}.h`]: h
      });
      if (this.card.isGroup) {
        this.selfScale = [w / this.baseSize.w, h / this.baseSize.h];
      }
      if (this.$refs.component && this.$refs.component.resize) {
        this.$refs.component.resize({ w, h });
      }
    },
    onResizeStop() {
      if (this.card.isGroup) {
        const scale = [
          this.groupScale[0] * this.selfScale[0],
          this.groupScale[1] * this.selfScale[1]
        ];
        // 遍历下面所有child card 将它们的xywh 都*scale
        // todo 多层遍历
        traverseTree(
          this.card,
          (childCard, level, keyPath) => {
            if (level > 0) {
              const path = chainKeyPath(keyPath, this.pathToView);
              const { w, h, x, y, z } = get(childCard, this.pathToView);
              this.$dispatch("screen.update", {
                [path]: {
                  w: Math.round(w * scale[0]),
                  h: Math.round(h * scale[1]),
                  x: Math.round(x * scale[0]),
                  y: Math.round(y * scale[1]),
                  z
                }
              });
            }
          },
          "children",
          0,
          `cards.${this.index}`
        );
        this.selfScale = [1, 1];
      }
      if (this.inGroup) {
        this.$emit("childViewChanged");
      }
    },
    setZ(dest) {
      this.$dispatch('layer.move', dest);
    }
  },
  computed: {
    ...mapState([
      "screenOffset",
      "componentMap",
      "scale",
      "guideLinesVisible",
      "hoveredIdx",
      "guideLines",
      "selectedIdxs",
      "cardsToBePaste",
      "cardsInSelection",
      "pathToView",
      "attachMenus"
    ]),
    customMenus() {
      return this.attachMenus.map(o => {
        return {
          text: o.text,
          // onclick: () => this.menuEmit(o),
          onclick: () => o.click(this.card)
        }
      })
    },
    contextMenuData() {
      return [
        // {
        //   text: "重命名",
        //   onclick: this.rename,
        //   icon: "edit",
        //   show: this.selectedIdxs.length === 1
        // },
        ...this.customMenus,
        {
          text: "复制",
          onclick: () => this.$dispatch("cards.copy"),
          icon: "copy",
          shotcut: "Ctrl+C"
        },
        {
          text: "粘贴",
          onclick: () => this.$dispatch("cards.paste"),
          icon: "copy",
          shotcut: "Ctrl+V",
          show: this.cardsToBePaste.length
        },
        {
          text: "删除",
          onclick: () => this.$dispatch("cards.delete"),
          icon: "delete",
          shotcut: "Delete"
        },
        {
          text: "锁定",
          onclick: () => this.$dispatch("cards.lock"),
          icon: "lock",
          show: !this.card.locked,
          shotcut: "Ctrl+L"
        },
        {
          text: "解锁",
          onclick: () => this.$dispatch("cards.unlock"),
          show: this.card.locked,
          icon: "unlock"
        },
        {
          text: "隐藏",
          onclick: () => this.$dispatch("cards.hide"),
          icon: "hide",
          shotcut: "Ctrl+H"
        },
        {
          text: "成组",
          onclick: () => this.group("normal"),
          icon: "folder",
          show: this.selectedIdxs.length > 1
        },
        {
          text: "取消成组",
          onclick: this.unGroup,
          icon: "unfolder",
          show: this.selectedIdxs.length === 1 && this.card.isGroup
        },
        {
          text: "排列",
          onclick: () => {},
          icon: "layers",
          children: [
            {
              text: "置于顶层",
              icon: "top",
              onclick: () => this.setZ("TOP")
            },
            {
              text: "置于底层",
              icon: "bottom",
              onclick: () => this.setZ("BOTTOM")
            },
            {
              text: "上移一层",
              icon: "up",
              onclick: () => this.setZ("UP")
            },
            {
              text: "下移一层",
              icon: "down",
              onclick: () => this.setZ("DOWN")
            }
          ]
        }
      ];
    },
    isActive() {
      return this.selectedIdxs.includes(this.index);
    },
    ...mapGetters(["cardsInSelection", "themeConfig"]),
    view() {
      return get(this.card, this.pathToView);
    },
    style() {
      const { w, h, x, y, z } = this.view;
      const { isGroup, parentId } = this.card;
      return {
        // ...this.cardStyle,
        // 在轮播或在弹框或tab内 就不能绝对定位了
        position: this.inSlider
          ? isGroup
            ? "relative"
            : "static"
          : "absolute",
        width: parentId ? "100%" : w + "px",
        height: parentId ? "100%" : h + "px",
        left: this.inSlider || this.inTabs ? "auto" : parentId ? 0 : x + "px",
        top: this.inSlider || this.inTabs ? "auto" : parentId ? 0 : y + "px",
        zIndex: z
      };
    }
  }
};
</script>
<style lang="scss" scoped>
.w-100 {
  width: 100%;
}
.h-100 {
  height: 100%;
}
.navigator-line {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  box-sizing: content-box;
  .navigator-line-left {
    position: absolute;
    border-top-style: dashed;
    border-top-width: 1px;
    /* border-top: 1px dashed #05ddff; */
    height: 0;
    top: 0;
    transform: translateX(-100%);
  }
  .navigator-line-top {
    position: absolute;
    border-left-style: dashed;
    border-left-width: 1px;
    /* border-left: 1px dashed #05ddff; */
    width: 0;
    left: 0;
    transform: translateY(-100%);
  }
  .navigator-line-account {
    position: absolute;
    transform: translate(-100%, -100%);
    color: #05ddff;
    text-shadow: 1px 1px 1px #222;
    white-space: nowrap;
  }
}
.mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
  cursor: move;
  &.locked {
    cursor: default;
  }
}
.vdr {
  &.hovered,
  &.in-selection,
  &.selected {
    .mask {
      border: 1px solid currentColor;
    }
  }
  &.selected {
    .mask {
      /* background: rgba(0, 231, 255, 0.07); */
    }
  }
}
.card {
  border-radius: inherit;
  &:focus,
  .mask:focus {
    outline: none;
  }
}
</style>
