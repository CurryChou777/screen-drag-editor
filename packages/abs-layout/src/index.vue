<template lang="pug">
  .canvas-main(:style="wrapperStyle")
    .canvas-wp(@mousedown="onMousedown" ref="canvasWrapper" @scroll="throttledScroll"  @mousewheel="onMousewheel")
      .screen-shot(@dragover.prevent :style="{height: (screen.page.size.h + 500) + 'px', width: screen.page.size.w + 500 + 'px'}")
        dv-ruler(
          :widthV="screen.page.size.w + 500"
          :widthH="screen.page.size.w + 500"
          :thick="20"
          :horLineArr="guideLines.h"
          :verLineArr="guideLines.v"
          :scale="scale"
          :bgColor="themeConfig.rulerBgColor"
          :fontColor="themeConfig.rulerFontColor"
          :fgColor="themeConfig.rulerTickColor"
          :rulerLineColor="themeConfig.rulerLineColor"
          :start="0"
          :offset="screenOffset"
          :marginLeft="marginLeft"
          :marginTop="marginTop"
          :handleLine="handleLine"
         )
        .canvas-panel()
          screen(:style="{left: screenOffset + 'px', top: screenOffset + 'px'}" :screen="screen" :screenOffset="screenOffset")
      //- svg.canvas-selection(v-if="showSelection")
      //-   polygon(:points="points" fill="none" stroke-width="2" stroke="white")
    .edit-slider(:style="{backgroundColor: themeConfig.bottomBarBgColor, borderTopColor: themeConfig.bottomBarBorderTopColor}")
      el-select.scale-select(:value="floatToPer(scale)" @input="val => setScale(parseInt(val)/100)" size="mini")
        el-option(v-for="(option, i) in scaleOpts" :key="i" :value="option.value" :label="option.label")
      i.el-icon-minus.zoom-out(@click="zoom(-0.01)")
      el-slider.scale-slider(:value="scale" @input="setScale" :min="0.18" :max="2" :step="0.01" :format-tooltip="floatToPer")
      i.el-icon-plus.zoom-in(@click="zoom(0.01)")
    pi-pagemap.pagemap(:options="pagemapOpts")
</template>

<script>
import Screen from "./components/screen";
// import VueDragResize from "./components/vue-drag-resize";
import PiPagemap from "./components/page-map";
import DvRuler from "./components/dv-ruler";
import {
  throttle,
  merge,
  mapKeys,
  cloneDeep,
  debounce,
  get
} from "../../../src/utils";
import Vue from "vue";
import Vuex, { mapState, mapGetters } from "vuex";
import store from "./store";
import { generateCardId } from "../../../src/utils/gen-card";
import getCoordFromEvent from "./mixins/get-coord-from-event";

export default {
  name: "AbsLayout",
  props: {
    pathToView: String,
    screen: Object,
    theme: {
      type: String,
      default: "light"
    },
    attachMenus: Array
  },
  mixins: [getCoordFromEvent],
  components: { PiPagemap, DvRuler, Screen },
  store: () => new Vuex.Store(store),
  data() {
    return {
      debouncedUpdateNotify: debounce(
        payload => this.$emit("update", payload),
        300
      ),
      screenOffset: 60,
      // showSelection: false,
      scaleOpts: [
        {
          label: "200%",
          value: "200%"
        },
        {
          label: "150%",
          value: "150%"
        },
        {
          label: "100%",
          value: "100%"
        },
        {
          label: "50%",
          value: "50%"
        }
      ],

      marginLeft: 0,
      marginTop: 0,
      pagemapOpts: {
        viewportSelector: ".canvas-wp",
        styles: {
          "#screen": "rgba(14, 42, 67,0.5)",
          ".mask": "rgba(255,255,255,0.1)"
        },
        back: "#2a2e33",
        interval: 100,
        view: "rgba(0,0,0,0.1)"
      },
      throttledMousemove: this.getThrottledMousemove(),
      throttledScroll: this.getThrottledScroll(),
      throttledMousewheel: this.getThrottledMousewheel()
    };
  },
  computed: {
    ...mapGetters(["zMax", "themeConfig"]),
    ...mapState(["guideLines", "componentMap", "scale", "selectedIdxs"]),
    wrapperStyle() {
      const { bgImg } = this.themeConfig;
      return {
        background: `url(${bgImg}) repeat`
      };
    },
    // 坐标是相对svg canvas-selection的坐标
    pointsArr() {
      const { startPoint, endPoint, basePoint } = this;
      return [
        startPoint,
        [endPoint[0], startPoint[1]],
        endPoint,
        [startPoint[0], endPoint[1]]
      ].map(([x, y]) => [x - basePoint[0], y - basePoint[1]]);
    },
    // 不同于store中的selectionRect
    // 换算成在大屏上的位置 scale = 1 时 因为无法实时计算卡片的clientRect 所以统一按 大屏坐标算
    selectionRect() {
      return this.pointsArr.map(([x, y]) => [
        parseInt(
          (x - this.screenOffset + this.$refs.canvasWrapper.scrollLeft) /
            this.scale
        ),
        parseInt(
          (y - this.screenOffset + this.$refs.canvasWrapper.scrollTop) /
            this.scale
        )
      ]);
    },
    // 坐标是相对svg canvas-selection的坐标
    points() {
      return this.pointsArr.map(coord => coord.join(",")).join(" ");
    }
  },
  created() {
    this.$commit("screenOffset.set", this.screenOffset);
    this.$store.subscribeAction(({ type, payload }) => {
      if (type === "screen.update") {
        this.debouncedUpdateNotify(payload);
      }
    });
  },
  beforeCreate() {
    this.$dispatch = this.$store.dispatch;
    this.$commit = this.$store.commit;
    Vue.mixin({
      beforeCreate: function() {
        if (this.$store) {
          this.$dispatch = this.$store.dispatch;
          this.$commit = this.$store.commit;
        }
      }
    });
  },
  watch: {
    screen: {
      immediate: true,
      handler(val) {
        this.$commit("screen.set", val);
      }
    },

    selectedIdxs(val) {
      this.$emit(
        "curCardChange",
        val.length ? this.$store.state.screen.cards[val[0]] : null
      );
    },
    // todo 直接将用户传进来的值作为state的默认值
    theme: {
      immediate: true,
      handler(val) {
        this.$commit("theme.set", val);
      }
    },
    pathToView: {
      immediate: true,
      handler(val) {
        this.$commit("pathToView.set", val);
      }
    },
    attachMenus: {
      immediate: true,
      deep: true,
      handler(val) {
        this.$commit("attachMenus.set", val);
      }
    }
  },
  methods: {
    getRightCardPlace({ w, h }, positionSpecified) {
      const pageSize = this.$store.state.screen.page.size;
      return {
        x: parseInt(
          positionSpecified ? positionSpecified.x - w / 2 : (pageSize.w - w) / 2
        ),
        y: parseInt(
          positionSpecified ? positionSpecified.y - h / 2 : (pageSize.h - h) / 2
        ),
        z: this.zMax + 1
      };
    },
    addCard(type, dragEndEvent) {
      let newCard = null;
      const { pathToView } = this;
      // view中初始化x y
      if (typeof type === "string") {
        const com = cloneDeep(this.componentMap[type]);
        newCard = {
          id: generateCardId(type),
          type,
          ...com
        };
      } else {
        newCard = cloneDeep(type);
        newCard.id = generateCardId(type);
      }
      const view = get(newCard, pathToView);
      const position = this.getRightCardPlace(
        merge({ w: 400, h: 300 }, view),
        dragEndEvent && this.getCoordFromEvent(dragEndEvent)
      );
      merge(view, position);
      this.$dispatch("cards.add", [newCard]);
      setTimeout(() =>
        this.$commit("cards.select", [
          this.$store.state.screen.cards.length - 1
        ])
      );
    },
    updateCurCard(key, value) {
      let payload = arguments.length === 1 ? key : { [key]: value };
      payload = mapKeys(
        payload,
        (value, key) => `cards.${this.selectedIdxs[0]}.${key}`
      );
      this.updateScreen(payload);
    },
    updateScreen(payload) {
      this.$dispatch("screen.updateExternally", payload);
    },
    registerComponents(componentMap) {
      this.$commit("componentMap.set", componentMap);
    },

    floatToPer(val) {
      return parseInt(val * 100) + "%";
    },
    setScale(val) {
      this.$commit("scale.set", val);
    },
    handleLine(val) {
      this.$commit("guideLines.set", val);
    },
    onMousewheel(e) {
      if (e.ctrlKey) {
        e.preventDefault();
        this.throttledMousewheel(e);
      }
    },
    onMousedown(e) {
      const clientRect = this.$refs.canvasWrapper.getBoundingClientRect();
      this.basePoint = [clientRect.x, clientRect.y];
      this.endPoint = this.startPoint = [e.clientX, e.clientY];
      this.$refs.canvasWrapper.addEventListener(
        "mousemove",
        this.throttledMousemove
      );
      this.$refs.canvasWrapper.addEventListener("mouseup", this.onMouseUp);
    },
    // todo 单独selectionRect.set 放入throttle 避免频繁的矩形相交计算
    getThrottledMousemove() {
      return throttle(e => {
        this.endPoint = [e.clientX, e.clientY];
        this.showSelection = true;
        this.checkIsDrag() && (this.showSelection = true);
        // this.$commit("selectionRect.set", this.selectionRect);
      }, 100);
    },
    checkIsDrag() {
      const deltaX = Math.abs(this.endPoint[0] - this.startPoint[0]);
      const deltaY = Math.abs(this.endPoint[1] - this.startPoint[1]);
      // 区分点击
      return deltaX > 3 || deltaY > 3;
    },
    getThrottledScroll() {
      return throttle(e => {
        const target = e.target;
        this.marginLeft = -target.scrollLeft;
        this.marginTop = -target.scrollTop;
      }, 150);
    },
    getThrottledMousewheel() {
      // step 5%
      return throttle(e => this.zoom(e.wheelDelta / 1200 / 2), 150);
    }
  }
};
</script>
<style lang="scss">
.shotcut-popper {
  box-shadow: 0 0 8px -4px #000;
}
.shotcut-tip-wrapper {
  .flex-row {
    margin: 5px 0;
    font-size: 12px;
    span:first-child {
      color: #bcc9d4;
    }
    span:last-child {
      font-weight: bold;
      margin-left: 20px;
      padding: 3px 5px;
      color: #08a1db;
      background-color: #262b33;
    }
  }
}
</style>
<style lang="scss" scoped>
.canvas-panel {
  & > div {
    position: relative;
    transform-origin: 0 0;
    transition: 0.2s all ease-in-out;
    background-size: cover, contain;
    background-position: center, right bottom;
    background-repeat: no-repeat;
    // html2canvas不支持box-shadow
    // box-shadow: 0 0 30px 0 red;s
    box-shadow: rgba(0, 0, 0, 0.5) 0 0 30px 0;
  }
}

.canvas-main {
  position: relative;
  height: 100%;
  user-select: none;
  .canvas-wp {
    overflow: auto;
    width: 100%;
    height: 100%;
    &::-webkit-scrollbar {
      display: none;
    }
  }
}
.edit-slider {
  height: 30px;
  width: 100%;
  padding-right: 20px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  position: absolute;
  right: 0;
  bottom: 0;
  user-select: none;
  z-index: 99;
  color: #bcc9d4;
  border-top-style: solid;
  border-top-width: 1px;
  .shotcut,
  .lock-status {
    cursor: pointer;
    font-size: 16px;
    margin-right: 15px;
  }
  .scale-select {
    width: 80px;
    margin-right: 10px;
    /deep/ .el-input__inner {
      height: 24px;
      line-height: 24px;
    }
    /deep/ .el-select__caret {
      font-size: 12px;
    }
  }
  .scale-slider {
    width: 130px;
    margin: 0 15px;
    /deep/ .el-slider__runway {
      margin: 0;
    }
  }
  .zoom-in,
  .zoom-out {
    font-size: 12px;
  }
  .zoom-in {
    cursor: zoom-in;
  }
  .zoom-out {
    cursor: zoom-out;
  }
}
.pagemap {
  position: absolute;
  bottom: 35px;
  top: auto;
  right: 5px;
}

.canvas-selection {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  polygon {
    stroke-width: 1;
    stroke-dasharray: 3, 3;
  }
}
</style>
