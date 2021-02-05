<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :width="width"
    :height="height"
    viewBox="0 0 1706 1024"
    :aria-labelledby="name"
    role="presentation"
  >
    <title :id="name" lang="en">{{name}} icon</title>
    <g :fill="color">
      <component :is="component" />
    </g>
  </svg>
</template>

<script>
export default {
  data() {
    return {
      component: () => import(`./icons/${this.name}`)
    };
  },
  watch: {
    name(val) {
      this.component = () => import(`./icons/${val}`);
    }
  },
  props: {
    name: {
      type: String,
      default: ""
    },
    width: {
      type: [Number, String],
      default: "1em"
    },
    height: {
      type: [Number, String],
      default: "1em"
    },
    color: {
      type: String,
      default: "currentColor"
    }
  }
};
</script>

<style scoped>
svg {
  display: inline-block;
  vertical-align: baseline;
  margin-bottom: -2px; /* yes, I'm that particular about formatting */
}
</style>