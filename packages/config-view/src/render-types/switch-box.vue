<template lang="pug">
el-radio-group(
  size="mini"
  :value="value"
  @input="val => $emit('input', val)")
  el-radio-button(v-for="(item, i) in options" :key="i" :label="item.value") {{item.name}}
</template>
<script>
export default {
  props: ['value', 'options'],
};
</script>
