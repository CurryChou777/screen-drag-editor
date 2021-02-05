<script>
import render from "./render";
import { kebabToCamel } from "@/utils";

const ctxRequire = require.context("./render-types", false, /\.vue$/);

ctxRequire.keys().forEach(filePath => {
  render.addType(
    kebabToCamel(filePath.slice(2, -4)),
    ctxRequire(filePath).default
  );
});

export default {
  name: "ConfigView",
  props: {
    option: Object,
    configs: Array
  },
  methods: {
    onUpdate(change) {
      this.$emit("update", change);
    }
  },
  render(h) {
    return render(h, this.configs, this.option, this.onUpdate);
  }
};
</script>

<style lang="scss" scoped>
.configs-wp > .collapse-bar {
  margin-top: 0;
}
.configs-wp > .flex-row {
  padding-left: 25px;
  padding-right: 12px;
  margin: 10px 0;
}
.flex-row {
  display: flex;
  align-items: center;
  justify-content: space-between;

  &.one {
    justify-content: center;
  }

  &.right {
    justify-content: flex-end;
  }
}
.configs-wp {
  color: #fff;
  font-size: 12px;
  .line.code:only-child {
    padding-left: 0;
    margin-top: 0;
  }
}
</style>
<style lang="scss">
.collapse-body .flex-row {
  &.line {
    label + .el-input,
    label + .el-select,
    label + .el-radio-group {
      width: 130px;
    }
  }

  .icon-help-info {
    font-size: 13px;
    margin-left: 6px;
  }
}
.line {
  margin-top: 10px;

  &:first-child {
    margin-top: 0;
  }

  &.wrapped {
    border: 1px solid #dcdfe6;
    padding: 0 15px;
  }

  & > label {
    word-break: keep-all;
    margin-right: 21px;
    white-space: nowrap;
  }
}
</style>
