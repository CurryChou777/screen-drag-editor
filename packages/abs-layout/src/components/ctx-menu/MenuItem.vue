<template>
  <li
    v-show="'show' in menuItem ? menuItem.show : true"
    :class="{
      'ctx-item': true,
      'has-child': hasChild(menuItem),
      checked: menuItem.checked,
      disabled: menuItem.disabled,
    }"
    @click="onMenuClick(menuItem, $event)"
    @mouseover="calcSubMenuPos($event, menuItem)"
  >
    <!-- <icon :name="menuItem.icon" v-if="menuItem.icon"></icon> -->
    <span class="text">{{ menuItem.text }}</span>
    <span class="shotcut" v-if="menuItem.shotcut">{{ menuItem.shotcut }}</span>
    <i v-if="hasChild(menuItem)" class="el-icon-caret-right" />
    <ul v-if="hasChild(menuItem)" class="ctx-menu" :style="subMenuPos">
      <menu-item
        v-for="(submenu, i) in menuItem.children"
        :key="i"
        :menu-item="submenu"
        :locals="locals"
      >
        <!-- <icon :name="submenu.icon" v-if="submenu.icon"></icon> -->
        <span>{{ submenu.text }}</span>
      </menu-item>
    </ul>
  </li>
</template>
<script>
import mixin from "./mixin";

export default {
  name: "MenuItem",
  mixins: [mixin],
  props: ["menuItem", "locals"],
  data() {
    return {
      subMenuPos: {
        left: "100%",
        top: "-1px",
        right: "auto",
        bottom: "auto"
      }
    };
  },
  methods: {
    hasChild(menuItem) {
      return menuItem.children && menuItem.children.length;
    },
    onMenuClick(menuItem, $event) {
      if (!menuItem.disabled && menuItem.onclick) {
        menuItem.onclick(this.locals, $event);
      }
    }
  }
};
</script>
