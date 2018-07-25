import "../styles/index.scss";

import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";

import App from "./App.vue";
import Index from "./Index.vue";
import NotFound from "./NotFound.vue";
import TestPage2 from "./TestPage2.vue";

Vue.use(VueRouter);

const routes: RouteConfig[] = [
  {
    path: "/",
    redirect: "/index"
  },
  {
    name: "index",
    path: "/index",
    component: Index
  },
  {
    name: "test-page-2",
    path: "/test-page-2",
    component: TestPage2
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
