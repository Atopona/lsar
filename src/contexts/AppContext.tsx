import type { ParentProps } from "solid-js";

import { ToastProvider, TooltipProvider } from "fluent-solid";

import { ConfigContextProvider } from "./ConfigContext";
import { SettingsContextProvider } from "./SettingsContext";
import { HistoryContextProvider } from "./HistoryContext";
import { ParsedResultContextProvider } from "./ParsedResultContext";
import { ParsingContextProvider } from "./ParsingContext";

export const AppContextProvider = (props: ParentProps) => {
  return (
    <ToastProvider>
      <TooltipProvider>
        <ConfigContextProvider>
          <SettingsContextProvider>
            <HistoryContextProvider>
              <ParsedResultContextProvider>
                <ParsingContextProvider>
                  {props.children}
                </ParsingContextProvider>
              </ParsedResultContextProvider>
            </HistoryContextProvider>
          </SettingsContextProvider>
        </ConfigContextProvider>
      </TooltipProvider>
    </ToastProvider>
  );
};
