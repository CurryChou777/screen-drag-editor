<template lang="pug">
el-checkbox(
  :value="valueMap.truely === value"
  @input="val => this.$emit('input', valueMap[val ? 'truely' : 'falsy'])")
</template>
<script>
export default {
  props: {
    value: [String, Boolean],
    valueMap: {
      type: Object,
      default() {
        return {
          truely: true,
          falsy: false,
        };
      },
    },
  },
};
</script>
