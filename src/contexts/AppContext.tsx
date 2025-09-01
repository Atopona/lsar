import type { ParentProps } from "solid-js";

import { ToastProvider } from "fluent-solid";

import { ConfigContextProvider } from "./ConfigContext";
import { SettingsContextProvider } from "./SettingsContext";
import { HistoryContextProvider } from "./HistoryContext";
import { ParsedResultContextProvider } from "./ParsedResultContext";

export const AppContextProvider = (props: ParentProps) => {
  return (
    <ToastProvider>
      <ConfigContextProvider>
        <SettingsContextProvider>
          <HistoryContextProvider>
            <ParsedResultContextProvider>
              {props.children}
            </ParsedResultContextProvider>
          </HistoryContextProvider>
        </SettingsContextProvider>
      </ConfigContextProvider>
    </ToastProvider>
  );
};
