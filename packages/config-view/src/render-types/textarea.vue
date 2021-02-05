<template lang="pug">
el-input(
  type="textarea"
  :value="value"
  size="mini"
  rows="8"
  @input="val => $emit('input', val)")    
</template>
<script>
export default {
  props: ['value'],
};
</script>
