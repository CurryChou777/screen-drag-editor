<template lang="pug">
  el-slider(v-bind="$attrs" :range="true" @input="val => $emit('input', val)")
</template>
<script>
export default {};
</script>
