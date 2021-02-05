<template lang="pug">
  code-editor(v-bind="$attrs" :withFooterBtns="true" @change="val => $emit('input', val)" @confirm="val => $emit('input', val)")
</template>

<script>
import CodeEditor from "../components/code-editor.vue";
export default {
  components: { CodeEditor }
};
</script>
