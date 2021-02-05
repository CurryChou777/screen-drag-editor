<template lang="pug">
.ruler-wrapper(
  :style="{transform: vertical ? `rotate(90deg) translateX(${marginTop}px)` : `translateX(${marginLeft}px)`}"
  :class="vertical?'v-container':'h-container'")
  canvas-ruler(
    :vertical="vertical"
    :scale="scale"
    :width="width"
    :height="height"
    :start="start"
    :canvasConfigs="canvasConfigs"
    @addLine="handleNewLine"
    @indicatorShow="handleIndicatorShow"
    @indicatorMove="handleIndicatorMove"
    @indicatorHide="handleIndicatorHide"
    )
  .lines-wrapper
    ruler-line(
      v-for="(line, i) in lines"
      :key="i"
      :color="themeConfig.rulerLineColor"
      :show="show"
      :index="i"
      :scale="scale"
      :value="line"
      :start="start"
      :vertical="vertical"
      @change="handleLineChange"
      @remove="handleLineRemove"
      @mouseDown="handleLineDown"
      @release="handleLineRelease")
  .indicator(:style="indicatorStyle" v-if="showIndicator")
    span.value {{value}}
</template>
<script>
import RulerLine from "./RulerLine";
import CanvasRuler from "./CanvasRuler";
import { mapGetters } from "vuex";
export default {
  data() {
    return {
      value: 0,
      showIndicator: false,
      isDraggingLine: false
    };
  },
  props: [
    "vertical",
    "scale",
    "width",
    "height",
    "start",
    "lines",
    "show",
    "canvasConfigs",
    "marginTop",
    "marginLeft"
  ],
  computed: {
    ...mapGetters(["themeConfig"]),
    indicatorStyle() {
      const { value, start, scale } = this;
      return {
        left: (value - start) * scale + 40 + "px",
        [this.vertical ? "borderTopColor" : "borderLeftColor"]: this.themeConfig
          .rulerLineColor
      };
    }
  },
  components: { RulerLine, CanvasRuler },
  methods: {
    handleNewLine(line) {
      this.$emit("lineChange", {
        lines: [...this.lines, line],
        vertical: this.vertical,
        c: true
      });
    },
    handleLineDown() {
      this.isDraggingLine = true;
    },
    handleIndicatorShow(value) {
      if (!this.isDraggingLine) {
        this.showIndicator = true;
        this.value = value;
      }
    },
    handleIndicatorMove(value) {
      if (this.showIndicator) {
        this.value = value;
      }
    },
    handleIndicatorHide() {
      this.showIndicator = false;
    },
    handleLineChange({ line, index }) {
      const lines = [...this.lines];
      lines[index] = line;
      this.$emit("lineChange", { lines, vertical: this.vertical });
    },
    handleLineRemove(lineIndex) {
      const lines = this.lines;
      lines.splice(lineIndex, 1);
      this.$emit("lineChange", { lines, vertical: this.vertical });
    },
    handleLineRelease({ line, index }) {
      // 拖出去了 就删了
      if (line < this.start) {
        this.handleLineRemove(index);
      }
      this.isDraggingLine = false;
    }
  }
};
</script>
<style lang="scss">
.ruler-wrapper {
  position: absolute;
  height: 20px;
  .value {
    width: max-content;
    position: absolute;
    background: rgba(64, 116, 180, 0.7);
    color: #fff;
    border-radius: 1px;
    padding: 2px 4px;
  }
  .indicator {
    position: absolute;
    pointer-events: none;
  }
  .ruler-line {
    position: absolute;
    .line-action {
      width: max-content;
      position: absolute;
    }
  }
}
.h-container {
  margin-left: 20px;
  cursor: ew-resize;
  .ruler-line {
    height: 100vh;
    top: 0;
    padding-left: 5px;
    border-left-width: 1px;
    border-left-style: solid;
  }
  .indicator {
    border-left-style: dashed;
    border-left-width: 1px;
    top: 0;
    height: 100vw;
    .value {
      left: 10px;
    }
  }
}
.v-container {
  transform-origin: 0 100% 0;
  cursor: ns-resize;
  .lines-wrapper {
    transform: rotate(-90deg);
    transform-origin: 0 100% 0;
  }
  .ruler-line {
    width: 100vw;
    left: 3px;
    border-top-width: 1px;
    border-top-style: solid;
    .line-action {
      transform: rotate(90deg);
      top: 10px;
      left: -5px;
    }
  }
  .indicator {
    border-bottom-style: dashed;
    border-bottom-width: 1px;
    width: 100vw;
    bottom: 1px;
    transform: rotate(-90deg);
    transform-origin: 1px 100% 0;
    .value {
      transform-origin: 0 0;
      transform: rotate(90deg);
      top: 10px;
      left: 18px;
    }
  }
}
</style>
