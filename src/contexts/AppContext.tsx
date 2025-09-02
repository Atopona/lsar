import type { ParentProps } from "solid-js";

import { ToastProvider } from "fluent-solid";

import { ConfigContextProvider } from "./ConfigContext";
import { SettingsContextProvider } from "./SettingsContext";
import { HistoryContextProvider } from "./HistoryContext";
import { ParsedResultContextProvider } from "./ParsedResultContext";
import { ParsingContextProvider } from "./ParsingContext";

export const AppContextProvider = (props: ParentProps) => {
  return (
    <ToastProvider>
      <ConfigContextProvider>
        <SettingsContextProvider>
          <HistoryContextProvider>
            <ParsedResultContextProvider>
              <ParsingContextProvider>{props.children}</ParsingContextProvider>
            </ParsedResultContextProvider>
          </HistoryContextProvider>
        </SettingsContextProvider>
      </ConfigContextProvider>
    </ToastProvider>
  );
};
