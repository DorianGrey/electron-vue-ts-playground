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
        <div class="row editor-keys flex-edged">
          <div class="row button-grp">
            <button type="button" @click="boldClick()" title="Bold"><i class="fa fa-bold" aria-hidden="true"></i></button>
            <button type="button" @click="italicClick()" title="Italic"><i class="fa fa-italic" aria-hidden="true"></i></button>
            <button type="button" @click="strikeThroughClick()" title="Strikethrough"><i class="fa fa-strikethrough" aria-hidden="true"></i></button>
          </div>
          <div class="row button-grp">
            <button type="button" @click="unorderedListClick()" title="Unordered list"><i class="fa fa-list" aria-hidden="true"></i></button>
            <button type="button" @click="orderedListClick()" title="Ordered list"><i class="fa fa-list-ol" aria-hidden="true"></i></button>
          </div>
          <div class="row button-grp">
            <button type="button" @click="linkClick()" title="Link"><i class="fa fa-link" aria-hidden="true"></i></button>
            <button type="button" @click="imageClick()" title="Image"><i class="fa fa-file-image-o" aria-hidden="true"></i></button>
            <button type="button" @click="tableClick()" title="Table"><i class="fa fa-table" aria-hidden="true"></i></button>
          </div>


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
        },
        "Ctrl-K": () => {
          this.linkClick();
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
    this.addWrappingMarkup("**", "**");
  }

  italicClick() {
    this.addWrappingMarkup("_", "_");
  }

  strikeThroughClick() {
    this.addWrappingMarkup("~~", "~~");
  }

  unorderedListClick() {
    this.addLineMarkup("* ");
  }

  orderedListClick() {
    this.addLineMarkup("1. ");
  }

  linkClick() {
    this.externalRefClick();
  }

  imageClick() {
    this.externalRefClick("!");
  }

  tableClick() {
    const doc = this.editor.getDoc();
    const cursorStart = doc.getCursor("start");
    const tablePreview = [
      `| Tables        | Are           | Cool  |`,
      `| ------------- |:-------------:| -----:|`,
      `| col 3 is      | right-aligned | $1600 |`,
      `| col 2 is      | centered      |   $12 |`
    ].join("\n");

    doc.replaceRange(tablePreview, cursorStart);
    this.editor.focus();
  }

  private externalRefClick(prefix: string = "") {
    const doc = this.editor.getDoc();
    const selection = doc.getSelection();
    const cursorStart = doc.getCursor("start");
    if (selection && selection.length > 0) {
      if (/^(https?:|mailto:|www\.)/.test(selection)) {
        const targetString = `${prefix}[](${selection})`;
        doc.replaceSelection(targetString);
        doc.setCursor({
          line: cursorStart.line,
          ch: cursorStart.ch + 1 + prefix.length
        });
      } else {
        const targetString = `${prefix}[${selection}]()`;
        doc.replaceSelection(targetString);
        doc.setCursor({
          line: cursorStart.line,
          ch: cursorStart.ch + targetString.length - 1
        });
      }
    } else {
      const newText = `${prefix}[]()`;
      doc.replaceRange(newText, cursorStart);
      doc.setCursor({
        line: cursorStart.line,
        ch: cursorStart.ch + 1 + prefix.length
      });
    }
    this.editor.focus();
  }

  private addLineMarkup(prefix: string) {
    const doc = this.editor.getDoc();
    const cursor = doc.getCursor("start");
    const line = doc.getLine(cursor.line);
    doc.replaceRange(
      `${prefix}${line}`,
      { line: cursor.line, ch: 0 },
      { line: cursor.line, ch: Infinity }
    );
    this.editor.focus();
  }

  private addWrappingMarkup(wrapBefore: string, wrapAfter: string) {
    const doc = this.editor.getDoc();
    const selection = doc.getSelection();
    if (selection && selection.length > 0) {
      doc.replaceSelection(`${wrapBefore}${selection}${wrapAfter}`);
    } else {
      const cursorStart = doc.getCursor("start");
      const newText = `${wrapBefore}${wrapAfter}`;
      doc.replaceRange(newText, cursorStart);
      doc.setCursor({
        line: cursorStart.line,
        ch: cursorStart.ch + wrapBefore.length
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
