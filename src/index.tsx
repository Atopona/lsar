/* @refresh reload */
import { render } from "solid-js/web";
import "alley-components/lib/index.css";
import "./index.scss";

import App from "./App";
import * as buffer from "buffer"; // 浏览器中无 Buffer，需要安装并挂到 window 上

import { AppContextProvider } from "./contexts/AppContext";

import "fluent-solid/lib/themes/styles/var.css";
import "fluent-solid/lib/themes/styles/theme.css";

if (import.meta.env.MODE === "production") {
  document.addEventListener("contextmenu", (event) => event.preventDefault());
}

if (typeof window.Buffer === "undefined") {
  window.Buffer = buffer.Buffer;
}

render(
  () => (
    <AppContextProvider>
      <App />
    </AppContextProvider>
  ),
  document.getElementById("root") as HTMLElement,
);
