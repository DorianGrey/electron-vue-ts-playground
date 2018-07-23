<template>
  <h1>Hello {{text}}!</h1>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";

@Component
export default class App extends Vue {
  text = "World";
}
</script>
