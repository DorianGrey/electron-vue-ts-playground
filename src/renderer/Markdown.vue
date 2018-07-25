<template>
  <div>
    <h1>Hello you!</h1>
    <textarea></textarea>
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

@Component
export default class Markdown extends Vue {
  editor: CodeMirror.EditorFromTextArea;

  mounted() {
    const element = this.$el.querySelector<HTMLTextAreaElement>("textarea");
    if (element) {
      this.editor = CodeMirror.fromTextArea(element, {
        mode: "markdown",
        lineNumbers: true,
        theme: "darcula"
      });
    }
  }
}
</script>

<style lang="scss">
.CodeMirror {
  max-width: 1024px;
}
</style>
