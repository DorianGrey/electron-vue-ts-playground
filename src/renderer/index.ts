import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";

import App from "./App.vue";
import NotFound from "./NotFound.vue";

Vue.use(VueRouter);

const routes: RouteConfig[] = [
  {
    path: "/",
    component: App
  },
  {
    path: "*",
    component: NotFound
  }
];

const router = new VueRouter({
  mode: "history",
  routes
});

new Vue({
  // el: "#app",
  components: { App },
  render: h => h("app"),
  router
}).$mount("#app");
