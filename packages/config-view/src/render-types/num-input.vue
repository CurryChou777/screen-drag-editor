<template lang="pug">
el-input-number(
  type="number"
  :value="value"
  controlsPosition="right"
  :min="min === undefined ? -Infinity : min"
  :max="max === undefined ? Infinity : max"
  v-bind="$attrs"
  @change="val => $emit('input', val)")
</template>

<script>
export default {
  props: ["value", "min", "max"]
};
</script>
