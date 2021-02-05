<template lang="pug">
  div.wrapper(:class="{checked}", @click="$emit('input', valueMap[checked ? 'falsy' : 'truely'])")
    span(v-if="text") {{text}}
    icon(v-if="icon" :name="icon" size="14")
</template>
<script>
export default {
  computed: {
    checked() {
      return this.valueMap.truely === this.value;
    }
  },
  props: {
    text: String,
    value: String,
    icon: String,
    valueMap: {
      type: Object,
      default: function() {
        return {
          truely: true,
          falsy: false
        };
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.wrapper {
  border: 1px solid #0b0c0d;
  background-color: #262c33;
  display: inline-block;
  padding: 7px 14px;
  &:hover {
    border: 1px solid #2483ff;
  }
  cursor: pointer;
  &.checked {
    color: #333333;
    border-top: none;
    border-bottom: none;
    background-color: #2483ff;
  }
}
</style>
