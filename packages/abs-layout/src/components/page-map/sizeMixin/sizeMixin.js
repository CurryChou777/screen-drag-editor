import processSize from './utils/processSize';

export default {
  props: {
    width: {
      type: [String, Number],
    },
    height: {
      type: [String, Number],
    },
  },

  computed: {
    sizeStyles() {
      return {
        width: processSize(this.width),
        height: processSize(this.height),
      };
    },
  },
};
