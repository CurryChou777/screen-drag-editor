<template lang="pug">
div
  el-switch(
    :value="valueMap.truely === value" 
    @input="val => this.$emit('input', valueMap[val ? 'truely' : 'falsy'])")
  span.pl-10 {{text}}
</template>
<script>
export default {
  props: {
    text: String,
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
