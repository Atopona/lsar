/* @refresh reload */
import { render } from "solid-js/web";
import "./index.css";

import App from "./App";

import { AppContextProvider } from "./contexts/AppContext";

import "fluent-solid/lib/themes/styles/var.css";
import "fluent-solid/lib/themes/styles/theme.css";

if (import.meta.env.TAURI_ENV_DEBUG !== "true") {
  document.addEventListener("contextmenu", (event) => event.preventDefault());
}

render(
  () => (
    <AppContextProvider>
      <App />
    </AppContextProvider>
  ),
  document.getElementById("root") as HTMLElement
);
