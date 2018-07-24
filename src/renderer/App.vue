<template>
  <div class="app">
    <header>
      <h2>Hello {{text}}!</h2>
    </header>
    <main>
      <router-view />
    </main>
    <footer>
      Test footer
    </footer>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import * as os from "os";
import * as path from "path";

@Component
export default class App extends Vue {
  text = path.basename(os.homedir());
}
</script>

<style lang="scss">
@import "../styles/variables";

header {
  grid-area: header;
  padding: 0 1rem;
  height: $header-height;
  line-height: 50px;

  > h2 {
    margin: 0;
  }
}

main {
  grid-area: content;
  padding: 1rem;
}

footer {
  grid-area: footer;
  padding: 1rem;
}

header,
footer {
  color: $header-footer-font-color;
  background-color: $header-footer-bg-color;
}

.app {
  display: grid;
  grid-template-rows: auto 1fr auto;
  /* stylelint-disable */
  grid-template-areas:
    "header"
    "content"
    "footer";
  /* stylelint-enable */
  min-height: 100%;
  flex: 1 0 100%;
}
</style>
