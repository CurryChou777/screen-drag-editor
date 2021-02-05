<template lang="pug">
canvas.canvas-ruler(
  ref="canvas" 
  @click="handleClick" 
  @mouseenter="handleEnter" 
  @mousemove="handleMove" 
  @mouseleave="handleLeave" 
  @mousedown="handleDown")
</template>
<script>
import drawCanvasRuler from "./drawCanvasRuler";
export default {
  props: [
    "width",
    "height",
    "vertical",
    "show",
    "scale",
    "start",
    "canvasConfigs"
  ],
  mounted() {
    this.$canvas = this.$refs.canvas;
    this.canvasContext = this.$canvas.getContext("2d");
    this.updateCanvasContext();
    this.drawRuler();
  },
  watch: {
    scale: {
      handler() {
        this.updateCanvasContext();
        this.drawRuler();
      }
    }
  },
  methods: {
    getValueByOffset(e) {
      return Math.round(this.start + (e.offsetX - 40) / this.scale);
    },
    handleClick(e) {
      this.$emit("addLine", this.getValueByOffset(e));
    },
    handleEnter(e) {
      this.$emit("indicatorShow", this.getValueByOffset(e));
    },
    handleMove(e) {
      this.$emit("indicatorMove", this.getValueByOffset(e));
    },
    handleLeave() {
      this.$emit("indicatorHide");
    },
    handleDown(e) {
      e.stopPropagation();
    },
    updateCanvasContext() {
      this.$canvas.width = this.width * this.canvasConfigs.ratio;
      this.$canvas.style.width = this.width + "px";
      this.$canvas.height = this.height * this.canvasConfigs.ratio;
      this.$canvas.style.height = this.height + "px";
      var ctx = this.$canvas.getContext("2d");
      ctx.font = "12px Microsoft YaHei, PingFangSC-Regular, Arial, sans-serif";
      ctx.lineWidth = 1;
      ctx.fillStyle = "#5F6367";
      ctx.strokeStyle = this.canvasConfigs.fgColor;
      ctx.textBaseline = "middle";
      this.canvasContext = ctx;
    },
    drawRuler() {
      drawCanvasRuler(this.canvasContext, this.start, {
        scale: this.scale,
        width: this.width,
        height: this.height,
        canvasConfigs: this.canvasConfigs
      });
    }
  }
};
</script>
