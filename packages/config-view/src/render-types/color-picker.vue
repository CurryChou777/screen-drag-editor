<template lang="pug">
  div(:class="{'flex-row': !allowNull}")
    div(v-if="allowNull")
      el-switch(:value="value === valueWhenNull" @input="val => $emit('input', val ? valueWhenNull : '#fff')")
      span.pl-10 自动取色
    div(v-if="value !== valueWhenNull" :class="`flex-row color-picker-line ` + (allowNull ? `mt-10` : ``)")
      el-input(:value="value" @input="val => $emit('input', val)")
      el-color-picker(:showAlpha="true" :value="value" @input="val => $emit('input', val)")
</template>
<script>
export default {
  props: {
    allowNull: {
      type: Boolean,
      default: false,
    },
    valueWhenNull: {
      default: null,
    },
    value: {},
  },
};
</script>
