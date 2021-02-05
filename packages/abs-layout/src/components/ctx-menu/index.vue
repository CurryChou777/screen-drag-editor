<template>
  <div
    v-show="visible"
    id="ctx-root"
    class="ctx-menu-container"
    :style="{ left: ctxLeft + 'px', top: ctxTop + 'px' }"
    @click="close"
    v-clickoutside="close"
  >
    <ul role="menu" class="ctx-menu" :style="subMenuPos">
      <menu-item v-for="(submenu, i) in menuData" :key="i" :menu-item="submenu" :locals="locals"></menu-item>
    </ul>
  </div>
</template>

<script>
import MenuItem from "./MenuItem.vue";
import mixin from "./mixin";
import clickoutside from "element-ui/lib/utils/clickoutside";
const boundariesPadding = 5;
const menuOffsetLeft = 10;
const menuOffsetTop = 10;

export default {
  directives: { clickoutside },
  components: { MenuItem },
  mixins: [mixin],
  data() {
    return {
      visible: false,
      ctxLeft: 0,
      ctxTop: 0,
      locals: null,
      rootEl: null,
      subMenuPos: {
        left: "0",
        top: "0",
        right: "auto",
        bottom: "auto"
      }
    };
  },
  mounted() {
    this.rootEl = this.$el;
  },
  methods: {
    setPositionFromEvent(e) {
      this.ctxLeft = e.clientX + menuOffsetLeft;
      this.ctxTop = e.clientY + menuOffsetTop;
      this.$nextTick(this.boundryCheck);
    },

    boundryCheck() {
      // 右边界判断
      // if: 点击位置 + 菜单宽度 + 边界padding > 窗口宽
      // then: ctxLeft = 窗口宽 - 边界padding - 菜单宽度
      const rootMenuWidth = this.rootEl.querySelector("ul").clientWidth;
      const overflowWidth =
        this.ctxLeft +
        rootMenuWidth +
        boundariesPadding +
        menuOffsetLeft -
        window.innerWidth;
      if (overflowWidth > 0) {
        this.ctxLeft -= overflowWidth;
      }
      // TODO: 下边界判断
    },

    show(e, targetData) {
      this.locals = targetData;
      this.setPositionFromEvent(e);
      this.visible = true;
      this.calcSubMenuPos(e, { children: this.menuData });
    },

    close() {
      this.visible = false;
    }
  }
};
</script>

<style lang="scss">
.ctx-menu-container {
  position: fixed;
  z-index: 9000;
  background-color: #f5f5f5;
  box-shadow: 0 5px 11px 0 rgba(0, 0, 0, 0.18), 0 4px 15px 0 rgba(0, 0, 0, 0.15);
  ul.ctx-menu {
    display: none;
    position: absolute;
    z-index: 1000;
    padding: 0;
    margin: 0;
    // top: -1px;
    // left: 100%;
    min-width: 135px;
    font-size: 12px;
    color: #bcc9d4;
    list-style: none;
    background-color: #27343e;
  }
  & > ul.ctx-menu {
    display: block;
    top: 0;
    left: 0;
  }
  li.ctx-item {
    position: relative;
    display: flex;
    padding: 0px 10px 0 10px;
    height: 32px;
    align-items: center;
    font-weight: normal;
    color: #bcc9d4;
    text-align: inherit;
    white-space: nowrap;
    background: none;
    border: 0;
    cursor: default;
    .svg-icon {
      margin-right: 5px;
      font-size: 14px;
    }
    .text {
      flex: 1 1 0;
    }
    .shotcut {
      color: #888c90;
    }
    &:hover {
      color: #2483ff;
      text-decoration: none;
      background-color: #1d262e;
      cursor: pointer;
    }
    &.disabled,
    &.disabled:hover {
      color: #576369;
      cursor: default;
    }
    &.has-child:hover > ul.ctx-menu {
      display: block;
    }
    &.has-child .el-icon-caret-right {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
    }
    &.checked:after {
      position: absolute;
      right: 15px;
      top: 50%;
      transform: translateY(-50%);
      margin-top: 2px;
      content: "\E611";
      display: block;
      font-size: 13px;
      font-family: "element-icons";
    }
  }
}

.open > .ctx-menu {
  display: block;
}

.open > a {
  outline: 0;
}

.ctx-menu-right {
  right: 0;
  left: auto;
}

.ctx-menu-left {
  right: auto;
  left: 0;
}
.pull-right > .ctx-menu {
  right: 0;
  left: auto;
}
</style>
