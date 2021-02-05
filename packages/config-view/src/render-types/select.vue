<template lang="pug">
el-select(
  :value="value"
  size="small"
  v-bind="$attrs"
  :collapseTags="true"
  @input="val => this.$emit('input', val)")
  el-option(v-for="(option, i) in opts" :key="i" :label="option.name" :value="option.value")
    span.fl {{option.name}}
    span.fr.pl-10(:title="option.description" style="color: rgb(132, 146, 166)") {{option.description}}
  template(slot="append" v-if="suffix") {{suffix}}

</template>
<script>
import { isFunction, map } from 'lodash-es';
export default {
  props: {
    value: [String, Number],
    options: [Array, Function],
    suffix: String,
    isFontFamily: Boolean,
  },
  computed: {
    opts() {
      let opts = isFunction(this.options)
        ? this.options(this.rw)
        : this.options;
      if (this.isFontFamily) {
        const basicFonts = [
          { name: '微软雅黑', value: '微软雅黑' },
          { name: '宋体', value: '宋体' },
          { name: '黑体', value: 'SimHei' },
          { name: '隶书', value: 'LiSu' },
          { name: '幼园', value: 'YouYuan' },
          { name: 'tahoma', value: 'tahoma' },
        ];
        opts = (this.$store.state.resourceFont || [])
          .map(item => ({ name: item.name, value: 'font' + item.id }))
          .concat(basicFonts);
      }

      return map(opts, item =>
        typeof item === 'string' ? { name: item, value: item } : item
      );
    },
  },
};
</script>
