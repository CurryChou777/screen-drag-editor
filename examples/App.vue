<template>
  <div id="app" class="w-100 h-100">
    <button @click="addCard('text')" :draggable="true" @dragend="onDragEnd($event, 'text')">Text</button>
    <button @click="addCard('button')">Button</button>
    <div class="editor-container">
      <screen-editor
        :screen="screen"
        @curCardChange="onCardChange"
        @update="onUpdate"
        pathToView="view"
        ref="editor"
      />
    </div>

    <div class="config-panel" style>
      <div v-show="!curCard">
        <span>页面</span>
        <div>{{screen.page}}</div>
      </div>
      <div v-if="curCard">
        <div>{{curCard.type}}</div>
        <config-view
          :configs="componentMap[curCard.type]"
          :option="curCard.option.data"
          @update="onUpdate"
        ></config-view>
      </div>
    </div>
  </div>
</template>

<script>
import ScreenEditor from "../packages/abs-layout/src/index";
import ConfigView from "../packages/config-view/src/index";

export default {
  name: "App",
  components: {
    ScreenEditor,
    ConfigView
  },
  data() {
    return {
      componentMap: {
        text: [
          {
            name: "data",
            configs: [
              { type: "textInput", field: "content", name: "内容" },
              { type: "numInput", field: "value", name: "值" }
            ]
          }
        ],
        button: [{ type: "textInput", field: "content", name: "内容" }],
        group: []
      },
      screen: {
        page: {
          background: {
            color: "#fff",
            imgUrl: ""
          },
          size: { w: 1920, h: 1080 }
        },
        cards: []
      },
      curCard: null
    };
  },
  mounted() {
    this.editor = this.$refs.editor;
    this.editor.registerComponents({
      text: {
        component: {
          props: ["option"],
          render(h) {
            return h(
              "div",
              { style: { color: "#000" } },
              this.option.data.content
            );
          },
          methods: {
            resize() {
              console.log("resize");
            }
          }
        },
        name: "文本",
        view: { w: 400, h: 300 },
        option: {
          style: { fontSize: 14 },
          data: { content: "i am a text", value: 1 }
        }
      },
      button: {
        component: {
          props: ["option"],
          render(h) {
            return h(
              "button",
              { style: { display: "block", width: "100%", height: "100%" } },
              "button"
            );
          }
        },
        name: "按钮",
        view: { w: 380, h: 250 },
        option: { content: "button" }
      }
    });
  },

  methods: {
    onUpdate() {
      // console.log(change);
    },
    onCardChange(card) {
      this.curCard = card;
    },
    onDragEnd(e, type) {
      if (e.dataTransfer.dropEffect === "move") {
        // this.addCard(type, this.getCoordFromEvent(e));
        this.editor.addCard(type, e);
      }
    },
    addCard(type) {
      this.editor.addCard(type);
      setTimeout(() => {
        this.editor.updateCurCard({ "option.data.content": "2333" });
        // this.editor.updateScreen({ "page.background.color": "red" });
      }, 3000);
    }
  }
};
</script>

<style scoped>
.w-100 {
  width: 100%;
}
.h-100 {
  height: 100%;
}
#app {
  overflow: hidden;
}
.config-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 300px;
  margin-top: 50px;
  background-color: #191c21;
}
.editor-container {
  width: 1600px;
  height: 800px;
  margin-left: 70px;
  margin-top: 0px;
}
</style>
