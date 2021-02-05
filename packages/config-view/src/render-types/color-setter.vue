<template lang="pug">
  div.w-100
    .flex-row.line
      label 颜色类型
      el-select(:value="type", placeholder="请选择", size="small", @input="onTypeChange")
        el-option(label="纯色", value="pure")
        el-option(label="渐变", value="gradient")
    .flex-row.line(v-if="type === 'pure'")
      el-input(size="small", :value="color", @input="val => (color = val)")
      el-color-picker(v-model="color", size="small", :showAlpha="true")
    template(v-if="type === 'gradient'")
      .flex-row.line
        label 起始颜色
        .flex-row
          el-color-picker(:value="color.start", @input="val => setColor('start', val)" size="small", :showAlpha="true")
      .flex-row.line
        label 终止颜色
        .flex-row
          el-color-picker(:value="color.end", @input="val => setColor('end', val)", size="small", :showAlpha="true")
      .flex-row.line
        label 渐变方向
        el-input-number(size="small", :value="color.angle", type="number", controls-position="right", @change="val => setColor('angle', val)", :min="0", :max="360")
</template>
<script>
// 支持纯色 和 渐变色
// 配置 === 使用
// 统一转换
//   {
//     type: 'gradient',
//     start: '#fff',
//     end: '#000',
//     angle: 0
//   }

//  -> echarts gradient
//  color: {
//   type: 'linear',
//   x: 0,
//   y: 0,
//   x2: 0,
//   y2: 1,
//   colorStops: [{
//       offset: 0, color: 'red' // 0% 处的颜色
//   }, {
//       offset: 1, color: 'blue' // 100% 处的颜色
//   }],
// }

// linear-gradient(70deg, black, white)
import { angle2Coord } from '@/utils';
export default {
  props: {
    value: [Object, String],
    scene: {
      type: String,
      default: 'echarts',
    },
  },
  methods: {
    setColor(prop, val) {
      this.color = { ...this.color, [prop]: val };
    },
    getGradientColor({ angle, start, end }) {
      if (this.scene === 'echarts') {
        const [x, y, x2, y2] = angle2Coord(angle);
        return {
          angle,
          type: 'linear',
          x,
          y,
          x2,
          y2,
          colorStops: [
            {
              offset: 0,
              color: start,
            },
            {
              offset: 1,
              color: end,
            },
          ],
        };
      } else {
        return `linear-gradient(${angle + 90}deg, ${start}, ${end})`;
      }
    },
    onTypeChange(val) {
      if (val === 'pure') {
        this.$emit('input', this.color.start);
      } else {
        this.$emit(
          'input',
          this.getGradientColor({ angle: 90, start: this.color, end: '#fff' })
        );
      }
    },
  },
  computed: {
    type() {
      if (
        typeof this.value === 'object' ||
        (typeof this.value === 'string' && this.value.includes('gradient'))
      ) {
        return 'gradient';
      }
      return 'pure';
    },
    color: {
      get() {
        if (this.type === 'pure') {
          return this.value;
        } else {
          if (typeof this.value === 'string') {
            // linear-gradient(70deg, black, white)
            // linear-gradient(180deg, rgba(230, 4, 4, 1),  #000)
            // 后一个正则的含义： 匹配括号外的逗号
            const matched = this.value
              .match(/^linear-gradient\((.+)\)$/)[1]
              .split(/,(?=(?:(?!\)).)*\(|[^()]*$)/);
            return {
              start: matched[1].trim(),
              end: matched[2].trim(),
              angle: parseFloat(matched[0]) - 90,
            };
          } else {
            const { angle } = this.value;
            return {
              start: this.value.colorStops[0].color,
              end: this.value.colorStops[1].color,
              angle: angle,
            };
          }
        }
      },
      set(val) {
        if (this.type === 'gradient') {
          this.$emit('input', this.getGradientColor(val));
        } else {
          this.$emit('input', val);
        }
      },
    },
  },
};
</script>
<style lang="scss" scoped>
.color-value {
  width: 135px;
  /deep/ .el-input__inner {
    padding: 0 6px;
  }
}
.el-input + .el-color-picker {
  /deep/ .el-color-picker__trigger {
    border-left-width: 0;
  }
}
</style>
