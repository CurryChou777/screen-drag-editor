<template lang="pug">
.dv-ruler
  ruler-wrapper(
    :show="guideLinesVisible"
    :marginLeft="marginLeft" 
    :width="widthH" 
    :lines="horLineArr" 
    v-bind="propsToRulerWrapper" 
    @lineChange="handleLineChange") 
  ruler-wrapper(
    :show="guideLinesVisible"
    :marginTop="marginTop" 
    :width="widthV" 
    :lines="verLineArr" 
    v-bind="propsToRulerWrapper" 
    :vertical="true" 
    @lineChange="handleLineChange")
  .corner.text-center(@click="toggleGuideLines")
    icon(:name="guideLinesVisible ? 'show': 'hide'")

</template>
<script>
import RulerWrapper from "./RulerWrapper";
import { mapState, mapGetters } from "vuex";
import icon from "../icon";
export default {
  props: [
    "dragLineEnd",
    "dragLineStart",
    "thick",
    "widthV",
    "widthH",
    "scale",
    "start",
    "horLineArr",
    "verLineArr",
    "marginLeft",
    "marginTop",
    "handleLine"
  ],

  methods: {
    toggleGuideLines() {
      this.$commit("guideLines.toggle");
    },
    handleLineChange({ lines, vertical, c }) {
      const { horLineArr, verLineArr, handleLine } = this;
      const i = vertical
        ? {
            h: horLineArr,
            v: lines
          }
        : {
            h: lines,
            v: verLineArr
          };
      handleLine(i, c);
    }
  },
  components: { RulerWrapper, icon },
  computed: {
    ...mapGetters(["themeConfig"]),
    ...mapState(["guideLinesVisible"]),
    propsToRulerWrapper() {
      const { rulerTickColor, rulerBgColor, rulerFontColor } = this.themeConfig;
      return {
        height: this.thick,
        start: this.start,
        show: this.show,
        scale: this.scale,
        canvasConfigs: {
          bgColor: rulerBgColor,
          // 刻度线的颜色
          fgColor: rulerTickColor,
          fontColor: rulerFontColor,
          ratio: window.devicePixelRatio || 1
        }
      };
    }
  }
};
</script>

<style lang="scss" scoped>
.dv-ruler {
  position: absolute;
  /* width: 100%; */
  /* height: 100%; */
  /* overflow: hidden; */
  z-index: 2;
}
.corner {
  top: 0;
  border-right: 1px solid #3a4659;
  border-bottom: 1px solid #3a4659;
  width: 20px;
  height: 20px;
  font-size: 14px;
  cursor: pointer;
  position: absolute;
  z-index: 999;
  align-items: center;
  justify-content: center;
  display: flex;
  color: #bcc9d4;
  background: #0e1013;
}
</style>
