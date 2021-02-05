# screen-editor

### what's it?

大屏编辑器：组件可在画布中拖拽、缩放、添加、删除、复制、粘贴、成组

### Usage

先注册好组件，之后在需要响应调用 addCard 往画布中添加组件，通过 updateSceen 方法更新大屏。通过监听 screenUpdate 事件，监听每一次大屏的更新，可以在事件处理函数中，将大屏改动增量发送到后端，也可将当前大屏配置全量发送到后端。

```vue
<template>
  <div>
    <button @click="addCard('text')">
      文本组件
    </button>
    <div class="editor-container">
      <screen-editor
        :screen="screen"
        @curCardChange="onCardChange"
        @update="onUpdate"
        ref="editor"
      />
    </div>
  </div>
</template>

<script>
import { ScreenEditor } from 'ScreenDragEditor';
import Text from './my-text-component';

export default {
  name: 'App',
  components: {
    ScreenEditor,
    Text,
  },
  data() {
    return {
      componentMap: {
        text: [{ type: 'textInput', field: 'content', name: '内容' }],
        group: [],
      },
      // screen的基本结构
      screen: {
        page: {
          background: {
            color: 'rgba(14, 42, 67, 1)',
            imgUrl: '',
          },
          size: { w: 1920, h: 1080 },
        },
        cards: [],
      },
      curCard: null,
    };
  },
  mounted() {
    this.editor = this.$refs.editor;
    this.editor.registerComponents({
      text: {
        component: Text,
        name: '文本',
        view: { w: 400, h: 300 },
        option: {
          content: 'i am a text',
        },
      },
    });
  },

  methods: {
    // 切换卡片
    onCardChange(card) {
      this.curCard = card;
    },
    // 往画布中添加一个文本组件
    addCard(type) {
      this.editor.addCard(type);
    },
    // 大屏有更新
    onUpdate(change) {
      // 将改动保存到后端 or whatever
      saveScreen(change);
    },
  },
};
</script>
```

### Features

- [x] 组件移动缩放 (无需先点击选中
- [x] 组件添加删除 (支持通过拖入缩略图添加
- [x] 选中和取消选中
- [x] 大屏配置变化时通知父组件
- [x] 锁定
- [x] 成组

### Props

| name   | default | description         | supported |
| ------ | ------- | ------------------- | --------- |
| screen | -       | 大屏配置            | √         |
| theme  | dark    | 主题 有 dark、light |
| pathToView  | -    | 生成card配置时，w、h属性的路径 |

### Events

| name | params | description | supported |
| ---- | ---- | ------ | ------ | √ |
| curCardChange | curCard 当前选中的卡片，为 null 时表示未选中任何卡片 | 选中的卡片变化时触发 | √ |
| update| patchObject | 大屏配置变化时触发（用户在画布编辑时触发，通过 updateScreen、updateCurCard 方法导致的大屏变化不会触发该事件） | √ |

### Methods

| name               | params        | description      | supported |
| ------------------ | ------------- | ---------------- | --------- |
| registerComponents | componentMap  | 注册组件         | √         |
| addCard            | type 组件类型 | 往画布中添加组件 | √         |
| updateScreen       | patchObject   | 更新大屏配置     | √         |
| updateCurCard      | patchObject   | 更新当前选中卡片 | √         |

### FAQ

### Known Issues

- 标尺超出了容器外
- 右键菜单项缺少对应图标
- 组件被附加`$dispatch`、`$commit` 方法
