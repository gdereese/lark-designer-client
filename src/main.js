import { createApp } from "vue";
import vueDebounce from "vue-debounce";

import App from "./App.vue";

createApp(App).use(vueDebounce).mount("#app");
