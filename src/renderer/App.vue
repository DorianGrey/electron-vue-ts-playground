<template>
  <div class="app">
    <main>
      <router-view />
    </main>
    <footer>
      <h2>Hello {{text}}!</h2>
    </footer>
  </div>
</template>

<script lang="ts">
import { ipcRenderer } from "electron";
import Vue from "vue";
import Component from "vue-class-component";
import * as os from "os";
import * as path from "path";
import { NavEvent } from "../common/events";
import { EventEmitter } from "electron";

@Component
export default class App extends Vue {
  text = path.basename(os.homedir());

  mounted() {
    ipcRenderer.on("nav", (sender: EventEmitter, where: NavEvent) => {
      this.$router.push(where);
    });
  }
}
</script>

<style lang="scss">
@import "../styles/variables";

main {
  grid-area: content;
  padding: 1rem;
}

footer {
  grid-area: footer;
  padding: 1rem;

  > h2 {
    margin: 0;
  }
}

header,
footer {
  color: $header-footer-font-color;
  background-color: $header-footer-bg-color;
}

.app {
  display: grid;
  grid-template-rows: 1fr auto;
  /* stylelint-disable */
  grid-template-areas:
    "content"
    "footer";
  /* stylelint-enable */
  min-height: 100%;
  flex: 1 0 100%;
}
</style>
