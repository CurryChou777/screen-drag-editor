<template>
  <canvas class="pi-pagemap" :style="sizeStyles"></canvas>
</template>
<style>
.pi-pagemap {
  position: fixed;
  top: 0;
  right: 0;
  width: 200px;
  height: 100%;
  z-index: 100;
}
</style>
<script>
import { sizeMixin } from './sizeMixin';
import pagemap from './pagemap';

export default {
  name: 'PiPagemap',
  mixins: [sizeMixin],
  props: {
    width: {
      type: [String, Number],
      default: '160px',
    },
    options: {
      type: Object,
      default() {
        return {};
      },
    },
  },

  mounted() {
    const viewportSelector = this.options.viewportSelector;
    const viewport = viewportSelector ? document.querySelector(viewportSelector) : null;
    pagemap(this.$el, { ...this.options, viewport });
  },
};
</script>
