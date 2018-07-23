declare module "*.vue" {
  import Vue, {ComponentOptions} from "vue";
  let __vue__: ComponentOptions<Vue>;
  export default __vue__;
}