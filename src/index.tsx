/* @refresh reload */
import { render } from "solid-js/web";
import "./index.css";

import App from "./App";

import { AppContextProvider } from "./contexts/AppContext";

import "fluent-solid/lib/themes/styles/var.css";
import "fluent-solid/lib/themes/styles/theme.css";

if (import.meta.env.MODE === "production") {
  document.addEventListener("contextmenu", (event) => event.preventDefault());
}

render(
  () => (
    <AppContextProvider>
      <App />
    </AppContextProvider>
  ),
  document.getElementById("root") as HTMLElement,
);
