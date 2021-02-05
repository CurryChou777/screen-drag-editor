<template lang="pug">
el-input(
  :type="suffix === '%' ? 'number' : 'text'"
  size="small"
  v-model="val"
  @blur="onBlur"
)
  template(slot="append" v-if="suffix") {{suffix}}
</template>
<script>
import { unescapeSpecialChar, escapeSpecialChar } from "@/utils";
export default {
  data() {
    return {
      val: null
    };
  },
  props: {
    value: [String, Number],
    suffix: {
      type: String,
      default: ""
    },
    min: {
      type: Number,
      default: -Infinity
    },
    max: {
      type: Number,
      default: Infinity
    },
    unescape: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    value: {
      immediate: true,
      handler(val) {
        // 处理下后缀 和 escape char
        const reg = new RegExp(`${this.suffix}$`);
        let value = `${val}`.replace(reg, "");
        this.unescape && (value = escapeSpecialChar(value));
        this.val = value;
      }
    }
  },
  methods: {
    onBlur() {
      let value = this.val;
      if (this.suffix === "%") {
        // 说明是数字
        value = Math.max(Math.min(value, this.max), this.min);
      }
      value += this.suffix;
      if (this.unescape) {
        value = unescapeSpecialChar(value);
      }
      this.$emit("input", value);
    }
  }
};
</script>
