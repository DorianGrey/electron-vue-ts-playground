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
        <div class="row editor-keys">
          <button type="button" @click="boldClick()" class="bold">B</button>
          <button type="button" @click="italicClick()" class="italic">I</button>
        </div>
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
// Might be required to import `codemirror/lib/codemirror` instead.
import * as CodeMirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/mode/markdown/markdown.js";
import "codemirror/theme/darcula.css";
// Imports for "marked".
import * as marked from "marked";
// Reactive stuff
import { fromEvent, Subscription } from "rxjs";
import { debounceTime, map } from "rxjs/operators";

@Component
export default class Markdown extends Vue {
  editor!: CodeMirror.EditorFromTextArea;
  previewText: string | null = null;
  previewSubscription!: Subscription;
  readonly markedOptions = {
    gfm: true,
    pedantic: false,
    smartLists: true,
    tables: true,
    xhtml: false,
    smartypants: false
  };

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

      this.editor.addKeyMap({
        "Ctrl-B": () => {
          this.boldClick();
        },
        "Cmd-B": () => {
          this.boldClick();
        },
        "Ctrl-I": () => {
          this.italicClick();
        }
      });

      const previewObservable = fromEvent(this.editor as any, "changes").pipe(
        debounceTime(200),
        map(() => this.editor.getValue())
      );

      this.previewSubscription = previewObservable.subscribe(newText => {
        this.previewText = marked(newText, this.markedOptions);
      });
    }
  }

  beforeDestroy() {
    this.previewSubscription.unsubscribe();
  }

  boldClick() {
    this.addMarkup("**");
  }

  italicClick() {
    this.addMarkup("_");
  }

  private addMarkup(wrapWith: string) {
    const doc = this.editor.getDoc();
    const selection = doc.getSelection();
    if (selection && selection.length > 0) {
      doc.replaceSelection(`${wrapWith}${selection}${wrapWith}`);
    } else {
      const cursorStart = doc.getCursor("start");
      const newText = `${wrapWith}${wrapWith}`;
      doc.replaceRange(newText, cursorStart);
      doc.setCursor({
        line: cursorStart.line,
        ch: cursorStart.ch + wrapWith.length
      });
    }
    this.editor.focus();
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

.editor-keys {
  padding-bottom: 0.5rem;

  button:not(:last-child) {
    margin-right: 0.25rem;
  }
}
</style>
