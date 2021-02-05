<template lang="pug">
  div.w-100.wrapper
    .w-100.code-editor(:style="{height: editorHeight}" ref="editor")
    icon.icon-fullscreen(v-if="withFullscreenBtn" name="fullscreen" text="全屏模式" @click="fullscreen" :style="{bottom: (withFooterBtns ? 47 : 10) + 'px'}")
    .flex-row.editor-footer(v-if="withFooterBtns")
      span.save-status(:class="{'saved': isSaved}") {{isSaved ? '已保存' : '未保存'}}
      div
        el-button(@click="save" type="primary" size="mini" :disabled="isSaved") 保存
    pi-dialog.code-dialog(ref="dialog" title="" fullscreen append-to-body :show-footer="false" @closed="onClosed")
      .w-100.code-editor(:style="{height: '100%'}" ref="editor-fullscreen")

</template>
<script>
import ace from 'ace-builds';
import 'ace-builds/src-min-noconflict/theme-monokai';
import 'ace-builds/src-min-noconflict/mode-javascript';
import 'ace-builds/src-min-noconflict/mode-json';
import 'ace-builds/src-min-noconflict/mode-css';
import 'ace-builds/src-min-noconflict/ext-language_tools';
import jsWorkerUrl from 'file-loader!ace-builds/src-noconflict/worker-javascript';
import jsonWorkerUrl from 'file-loader!ace-builds/src-noconflict/worker-json';
import cssWorkerUrl from 'file-loader!ace-builds/src-noconflict/worker-css';
ace.config.setModuleUrl('ace/mode/javascript_worker', jsWorkerUrl);
ace.config.setModuleUrl('ace/mode/json_worker', jsonWorkerUrl);
ace.config.setModuleUrl('ace/mode/css_worker', cssWorkerUrl);
ace.config.setModuleUrl(
  'ace/snippets/javascript',
  require('file-loader!ace-builds/src-noconflict/snippets/javascript.js')
);
ace.config.setModuleUrl(
  'ace/snippets/css',
  require('file-loader!ace-builds/src-noconflict/snippets/css.js')
);
ace.config.setModuleUrl(
  'ace/snippets/json',
  require('file-loader!ace-builds/src-noconflict/snippets/json.js')
);
const langTools = ace.require('ace/ext/language_tools');
export default {
  data() {
    return {
      editor: null,
      isEditing: true,
      isSaved: true,
    };
  },
  model: {
    event: 'change',
  },
  props: {
    value: {
      type: String,
      default: '',
    },
    language: {
      type: String,
      default: 'javascript',
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    maxLines: Number,
    showGutter: {
      type: Boolean,
      default: true,
    },
    height: {
      type: [Number, String],
      default: 200,
    },
    withFullscreenBtn: {
      type: Boolean,
      default: false,
    },
    withFooterBtns: {
      type: Boolean,
      default: false,
    },
    // 定制化
    wordComplete: {
      type: Boolean,
      default: false,
    },
  },
  created() {
    this.curVal = this.value;
  },
  mounted() {
    this.initEditor(this.$refs.editor, this.value);
  },
  computed: {
    editorHeight() {
      const h = this.height;
      return typeof h === 'number' ? h + 'px' : h;
    },
  },
  watch: {
    value(val) {
      if (this.editor.getValue() !== val) {
        this.curVal = val;
        this.editor.setValue(val);
        this.editor.clearSelection();
      }
    },
  },
  methods: {
    save() {
      this.$emit('confirm', this.curVal);
      this.isSaved = true;
    },
    initEditor(el) {
      this.editor = ace.edit(el, {
        mode: `ace/mode/${this.language}`,
        theme: 'ace/theme/monokai',
        fontSize: 16,
        tabSize: 2,
        value: this.curVal,
        selectionStyle: 'text',
        maxLines: this.maxLines,
        readOnly: this.readonly,
      });
      this.editor.setOptions({
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true,
        showGutter: this.showGutter,
      });
      this.editor.on('input', () => {
        const value = this.editor.getValue();
        this.curVal = value;
        if (value !== this.value) {
          this.isSaved = false;
          if (!this.withFooterBtns) {
            this.$emit('change', value);
          }
        }
      });
      const getCommand = (type, key, options) => ({
        name: type,
        bindKey: { win: key, mac: key },
        exec: function(editor) {
          langTools.setCompleters([
            {
              getCompletions: function(editor, session, pos, prefix, callback) {
                callback(null, options);
              },
            },
          ]);
          editor.commands.byName.startAutocomplete.exec(editor);
        },
      });
      if (this.wordComplete) {
        // 代码片段提示
        // todo 重复调接口
        this.$dispatch('resourceCodeSnippet.read', { cache: true }).then(() => {
          const snippets = this.$store.state.resourceCodeSnippet;
          this.editor.commands.addCommand(
            getCommand(
              'snippet',
              '#',
              snippets.map(({ name, content }) => ({
                caption: name,
                value: content,
                meta: name,
              }))
            )
          );
        });
        // 变量提示
        const vars = this.$store.state.screen.page.data.vars;
        this.editor.on('change', obj => {
          if (obj.action === 'insert') {
            let char = obj.lines[0];
            if (obj.lines.length === 1 && char === '$') {
              let options = vars.map(({ name, description }) => ({
                caption: '$' + name,
                value: '$' + name,
                meta: description,
              }));
              langTools.setCompleters([
                {
                  getCompletions: function(
                    editor,
                    session,
                    pos,
                    prefix,
                    callback
                  ) {
                    callback(null, options);
                  },
                },
              ]);
            }
          }
        });
      }
    },
    fullscreen() {
      this.$refs.dialog.dialog();
      this.$nextTick(() => {
        this.initEditor(this.$refs['editor-fullscreen']);
        this.editor.setValue(this.curVal);
        this.editor.clearSelection();
      });
    },
    onClosed() {
      this.initEditor(this.$refs.editor);
      this.editor.setValue(this.curVal);
      this.editor.clearSelection();
    },
  },
  beforeDestroy() {
    this.editor.destroy();
  },
};
</script>
<style lang="scss" scoped>
.wrapper {
  position: relative;
  .icon-fullscreen {
    position: absolute;
    color: #fff;
    right: 10px;
    cursor: pointer;
    font-size: 15px;
    z-index: 9999;
  }
}
.code-dialog {
  /deep/ .el-dialog {
    display: flex;
    flex-direction: column;
    /deep/ .el-dialog__body {
      flex: 1 1 0;
    }
  }
}
.code-editor {
  border: 1px solid #282f3a;
  background-color: #0e1013;
  /deep/ .ace_gutter-layer {
    background-color: #1f2329;
  }
}
.editor-footer {
  position: relative;
  height: 37px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #1f2329;
  border: 1px solid #282f3a;
  border-top-width: 0;
  padding: 0 5px;
  .save-status {
    font-size: 12px;
    &::before {
      display: inline-block;
      content: '';
      height: 6px;
      width: 6px;
      vertical-align: 1px;
      margin-right: 6px;
      border-radius: 3px;
      background: #f43;
    }
    &.saved {
      &::before {
        background: #67c23a;
      }
    }
  }
}
</style>
