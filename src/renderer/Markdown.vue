<template>
  <div>
    <!-- TODO: This requires additional work, incl. some way to move between both.
    <div class="row">
      <a href="#md-editor">To editor</a>
      <a href="#md-rendered-preview">To preview</a>
    </div>
    -->
    <div id="side-by-side" class="row flex-wrap">
      <!-- MD editor block -->
      <div class="column">
        <h3>Insert your markdown here:</h3>
        <textarea id="md-editor"></textarea>
      </div>
      <!-- Preview block -->
      <div class="column">
        <h3>Rendered preview:</h3>
        <div id="md-rendered-preview" v-html="previewText"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
// See https://discuss.codemirror.net/t/having-trouble-with-nodejs-require-and-codemirror-addons/1079/12
// for why this import aims at the lib folder instead of the root one.
import * as CodeMirror from "codemirror/lib/codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/mode/markdown/markdown.js";
import "codemirror/theme/darcula.css";
// Imports for "marked".
import * as marked from "marked";

@Component
export default class Markdown extends Vue {
  editor: CodeMirror.EditorFromTextArea;
  previewText: string | null = null;

  mounted() {
    const element = this.$el.querySelector<HTMLTextAreaElement>("#md-editor");
    if (element) {
      this.editor = CodeMirror.fromTextArea(element, {
        mode: "markdown",
        lineWrapping: true,
        lineNumbers: true,
        theme: "darcula",
        viewportMargin: Infinity // See https://codemirror.net/demo/resize.html -> we want dynamic height.
      });

      this.editor.on("changes", () => {
        // TODO: We should got with some kind of "debounce" or "throttle" here to avoid too may re-renders on typing.
        this.previewText = marked(this.editor.getValue(), {
          gfm: true,
          pedantic: false,
          smartLists: true,
          tables: true,
          xhtml: false,
          smartypants: false
        });
      });
    }
  }
}
</script>

<style lang="scss">
@import "../styles/variables";

#side-by-side {
  > .column {
    flex: 1 0 50%;
    min-width: 768px;
    max-width: 100vw;
    padding: 0 1rem;
  }
}

#md-rendered-preview {
  color: $darcula-color;
  background-color: $darcula-bg-color;
  min-height: 300px;
  padding: 0.5rem 1rem;
}

#md-rendered-preview,
.CodeMirror {
  height: auto;
}

/* See https://github.com/codemirror/CodeMirror/issues/2835 for that trick */
.CodeMirror-scroll {
  min-height: 300px;
}
</style>
