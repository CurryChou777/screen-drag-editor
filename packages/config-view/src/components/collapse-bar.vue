<template lang="pug">
div.collapse-bar
  .collapse-header(@click="handleHeaderClick")
    .flex-row
      div
        i.el-icon-arrow-right(:class="{active: !collapsed}" v-if="iconPosition === 'left'")
        slot(name="title") {{title}}
      i.el-icon-arrow-right(:class="{active: !collapsed}" v-if="iconPosition === 'right'")
      el-checkbox(v-if="hasShowSwitcher", :value="show", @input="toggleShow", @click.native="stop")
  el-collapse-transition
    .collapse-body(v-show="!collapsed")
      slot
</template>
<script>
export default {
  data() {
    return {
      collapsed: false
    };
  },
  watch: {
    collapse: {
      immediate: true,
      handler(val) {
        this.collapsed = val;
      }
    }
  },
  methods: {
    toggleShow() {
      this.$emit("toggleShow", !this.show);
      this.collapsed = !this.show;
    },
    handleHeaderClick() {
      this.collapsed = !this.collapsed;
      this.$emit("headerClick", !this.collapsed);
    },
    stop(e) {
      e.stopPropagation();
    }
  },
  props: {
    iconPosition: {
      type: String,
      default: "left"
    },
    keyPathToShow: String,
    title: String,
    collapse: {
      type: Boolean,
      default: false
    },
    hasShowSwitcher: {
      type: Boolean,
      default: false
    },
    show: {
      type: Boolean,
      default: false
    }
  }
};
</script>
<style lang="scss" scoped>
.flex-row {
  justify-content: space-between;
  & > div {
    flex: 1 1 0;
  }
}
.collapse-body .collapse-bar {
  .collapse-header {
    border-bottom-width: 0;
    padding-right: 15px;
    margin-left: -24px;
  }
  .collapse-body {
    padding: 15px 0;
    border-bottom-width: 0;
  }
}
.collapse-body .collapse-bar {
  padding-left: 15px;
}
.collapse-bar {
  .collapse-header {
    padding-left: 8px;
    padding-right: 15px;
    height: 40px;
    line-height: 40px;
    cursor: pointer;
    border-bottom: 1px solid #2c2e33;
    background-color: #1c2026;
  }
  .collapse-body {
    padding: 15px 15px 15px 24px;
    border-bottom: 1px solid #2c2e33;
    background-color: #111417;
  }
  .icon {
    color: #bfbfbf;
    font-size: 18px;
  }
  .el-icon-arrow-right {
    margin-right: 3px;
    transition: all 0.3s;
    &.active {
      transform: rotate(90deg);
    }
  }
}
// .collapse-body .collapse-bar {
//   &:first-child {
//     margin-top: -15px;
//   }
//   &:last-child {
//     margin-top: -15px;
//   }
// }
</style>
