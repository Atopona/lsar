/* @refresh reload */
import { render } from "solid-js/web";
import "alley-components/lib/index.css";
import "./index.scss";
import { ToastProvider } from 'fluent-solid/lib/components/toast'
import App from "./App";
import * as buffer from "buffer"; // 浏览器中无 Buffer，需要安装并挂到 window 上

import "fluent-solid/lib/themes/styles/var.css";
import "fluent-solid/lib/themes/styles/theme.css";

if (import.meta.env.MODE === "production") {
  document.addEventListener("contextmenu", (event) => event.preventDefault());
}

if (typeof window.Buffer === "undefined") {
  window.Buffer = buffer.Buffer;
}

render(() => (
  <ToastProvider>
    <App />
  </ToastProvider>
), document.getElementById("root") as HTMLElement);
