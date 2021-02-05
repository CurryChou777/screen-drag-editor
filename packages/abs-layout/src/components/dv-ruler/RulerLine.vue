<template lang="pug">
.ruler-line(@mousedown.stop="handleDown" @dblclick="handleRemove" :style="style" v-if="show && (offset > 0)"  title="双击删除参考线")
  .line-action
    span.line-value  {{value}}
</template>
<script>
export default {
  props: ["vertical", "start", "scale", "value", "show", "index", "color"],
  computed: {
    offset() {
      return (this.value - this.start) * this.scale + 40;
    },
    style() {
      return this.vertical
        ? { top: this.offset + "px", borderTopColor: this.color }
        : { left: this.offset + "px", borderLeftColor: this.color };
    }
  },
  methods: {
    handleDown(e) {
      const that = this;
      e.stopImmediatePropagation();
      const round = Math.round;
      const { vertical, index, value, scale } = this;
      const start = vertical ? e.clientY : e.clientX;
      this.$emit("mouseDown");
      const onMouseMove = e => {
        const pos = vertical ? e.clientY : e.clientX;
        this.$emit("change", {
          line: round(value + (pos - start) / scale),
          index
        });
      };
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", function onMouseUp(e) {
        var pos = vertical ? e.clientY : e.clientX;
        that.$emit("release", {
          line: round(value + (pos - start) / scale),
          index
        });
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      });
    },
    handleRemove() {
      this.$emit("remove", this.index);
    }
  }
};
</script>
<style lang="scss" scoped>
.ruler-line {
  position: absolute;
  &:hover {
    .line-action {
      display: block;
    }
  }
  .line-action {
    position: absolute;
    display: none;
    // display: flex;
    // justify-content: center;
    // align-items: center;
    // user-select: none;
    color: #fff;
    padding: 2px 4px;
    border-radius: 1px;
    box-shadow: 0 0 5px -3px #000;
    background: rgba(64, 116, 180, 0.7);
  }
}
</style>
