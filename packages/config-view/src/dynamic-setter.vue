<template>
  <CollapseBar class="line" :collapse="!configItem.expand">
    <span slot="title">
      <span>{{ configItem.name }}</span>
      <i class="el-icon-plus fr mt-15 mr-10" @click.stop="addItem" />
    </span>
    <div v-if="isEditing">
      <div class="name-input-wp">
        <el-input-number
          ref="name-input"
          v-model.trim="curName"
          @keyup.enter.native="confirmAdd(curName)"
          v-if="configItem.props.name.type === 'numInput'"
          :placeholder="configItem.props.name.placeholder"
          @input="validateName(curName)"
          :class="{ 'is-error': isError }"
        />
        <el-input
          v-else
          ref="name-input"
          v-model="curName"
          @keyup.enter.native="confirmAdd(curName)"
          :placeholder="configItem.props.name.placeholder"
          @input="validateName(curName)"
          :class="{ 'is-error': isError }"
        />
        <div class="btn-wp mt-10">
          <el-button size="mini" @click="isEditing = false">取消</el-button>
          <el-button size="mini" type="primary" @click="confirmAdd(curName)">确定</el-button>
        </div>
      </div>
    </div>
    <CollapseBar class="line" v-for="(item, i) in value" :key="i" :collapse="true">
      <span slot="title">
        <span>{{ type === 'array' ? item[configItem.props.name.mapToField] : i }}</span>
        <i class="el-icon-delete fr mt-15" @click.stop="delItem(i)" />
        <i
          class="el-icon-edit fr mt-15 mr-10"
          v-if="configItem.props.name.editable"
          @click.stop="dialogRename(item, i)"
        />
      </span>
      <config-view
        class="config-view-wp"
        :area="keyPath + '.' + i"
        :configs="configItem.props.configs"
      ></config-view>
    </CollapseBar>
    <pi-dialog ref="dialog-rename" title="重命名" :append-to-body="true">
      <el-input v-model="name" autocomplete="off" />
    </pi-dialog>
  </CollapseBar>
</template>
<script>
import CollapseBar from "./components/collapse-bar.vue";
import { cloneDeep, find, omit } from "@/utils";
export default {
  components: {
    CollapseBar,
    ConfigView: () => import("./index")
  },
  props: ["configItem", "keyPath", "value", "type"],
  data() {
    return {
      name: "",
      isEditing: false,
      curName: "",
      isError: false,
      errorTip: ""
    };
  },
  methods: {
    dialogRename(item, i) {
      this.name =
        this.type === "array" ? item[this.configItem.props.name.mapToField] : i;
      this.$refs["dialog-rename"].dialog().confirm(close => {
        this.validateName(this.name);
        // item[this.configItem.props.name.mapToField] = this.name;
        if (this.type === "array") {
          this.rw(
            this.keyPath +
              "." +
              i +
              "." +
              this.configItem.props.name.mapToField,
            this.name
          );
        }

        close();
      });
    },
    validateName(val) {
      // 非空和重复校验
      if (val) {
        const exist = find(this.value, {
          [this.configItem.props.name.mapToField]: val
        });
        if (exist) {
          this.isError = true;
          this.errorTip = "名称不能重复";
        } else {
          this.isError = false;
        }
      }
    },
    addItem(e) {
      // 是否有类型选项
      const itemType = this.configItem.props.itemType;
      if (itemType) {
        const { options } = itemType;
        const menuData = options.map(({ name, value }) => ({
          text: name,
          onclick: () => {
            this.curType = value;
            this.enterNameEditing();
          }
        }));
        this.$ctxMenu.open(menuData, e);
      } else {
        this.enterNameEditing();
      }
    },
    enterNameEditing() {
      this.isEditing = true;
      this.curName = "";
      this.$nextTick(() => {
        this.$refs["name-input"].focus();
      });
    },
    confirmAdd(val) {
      if (!val) {
        this.isError = true;
        this.errorTip = "名称不能为空";
      }
      if (this.isError) {
        // return this.$refs['name-input'].focus();
      }
      const { defaultValue, name } = this.configItem.props;
      const defaultValue_ = cloneDeep(defaultValue);
      // 对defalutValue处理一下 值为函数的执行结果 比如id需要动态生成
      for (let key in defaultValue_) {
        if (typeof defaultValue_[key] === "function") {
          defaultValue_[key] = defaultValue_[key]();
        }
      }
      const itemType = this.configItem.props.itemType;
      if (this.type === "array") {
        this.rw(this.keyPath + "." + this.value.length, {
          ...defaultValue_,
          [name.mapToField]: val,
          ...(itemType ? { [itemType.mapToField]: this.curType } : {})
        });
      } else {
        this.rw(this.keyPath + "." + val, {
          ...defaultValue_,
          ...(itemType ? { [itemType.mapToField]: this.curType } : {})
        });
      }
      this.isEditing = false;
    },
    delItem(i) {
      if (this.type === "array") {
        // 数组
        let value = this.value;
        value.splice(i, 1);
        this.rw(this.keyPath, value);
      } else {
        // 对象
        this.rw(this.keyPath, omit(this.value, [i]));
      }
    }
  }
};
</script>
<style lang="scss">
// 位于dynamicsetter中的config-view
.el-tab-pane .config-view-wp {
  margin-left: -25px;
  & > .flex-row.line {
    padding-right: 0px;
  }
  & > .collapse-bar.line {
    padding-left: 40px;
  }
}
</style>
<style lang="scss" scoped>
.is-error {
  /deep/ .el-input__inner {
    border-color: red;
  }
}
.name-input-wp {
  margin-left: -10px;
  margin-bottom: 10px;
}
.error-tip {
  color: red;
  margin-top: 10px;
  margin-bottom: 10px;
}
.btn-wp {
  display: flex;
  justify-content: flex-end;
}
</style>
