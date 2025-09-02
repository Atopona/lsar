import {
  type Accessor,
  createContext,
  createMemo,
  createSignal,
  type ParentProps,
  type Setter,
  useContext,
} from "solid-js";

import { useToast } from "fluent-solid";

import { isValidNumberOrHttpsUrl } from "~/parser/validators";
import { parse } from "~/parser";
import { useConfigContext } from "./ConfigContext";
import { useSettingsContext } from "./SettingsContext";
import { useParsedResultContext } from "./ParsedResultContext";

interface ParsingContextValue {
  parsingHistoryItemIndex: Accessor<number | null>;
  setParsingHistoryItemIndex: Setter<number | null>;
  parsing: Accessor<boolean>;
  setParsing: Setter<boolean>;
  isHistoryItemParsing: Accessor<boolean>;
  isSearchParsing: Accessor<boolean>;
  onParse: (
    platform: Platform,
    value: string | number,
    index?: number,
  ) => Promise<void>;
}

const ParsingContext = createContext<ParsingContextValue>();

export const ParsingContextProvider = (props: ParentProps) => {
  const toast = useToast();
  const { config } = useConfigContext();
  const { setShowSettings: setShowBilibiliCookieEditor } = useSettingsContext();
  const { setParsedResult } = useParsedResultContext();

  const [parsingHistoryItemIndex, setParsingHistoryItemIndex] = createSignal<
    number | null
  >(null);
  const [parsing, setParsing] = createSignal(false);

  const isHistoryItemParsing = createMemo(() => {
    const index = parsingHistoryItemIndex();
    return parsing() && index !== null && index !== -1;
  });
  const isSearchParsing = createMemo(() => {
    const index = parsingHistoryItemIndex();
    return parsing() && index === -1;
  });

  const onParse = async (
    platform: Platform,
    value: string | number,
    index: number = -1,
  ) => {
    if (!value) return;

    const parsedInput =
      typeof value === "number" ? value : isValidNumberOrHttpsUrl(value);
    if (parsedInput instanceof Error) {
      toast.error(parsedInput.message);
      return;
    }

    setParsedResult(); // 清空解析结果
    setParsingHistoryItemIndex(index);
    setParsing(true);

    const result = await parse(
      platform,
      parsedInput,
      config()!,
      setShowBilibiliCookieEditor,
    );

    if (result instanceof Error) {
      toast.error(result.message, { position: "bottom-right" });
    } else {
      setParsedResult(result);
    }

    setParsing(false);
    setParsingHistoryItemIndex(null);
  };

  return (
    <ParsingContext.Provider
      value={{
        parsingHistoryItemIndex,
        setParsingHistoryItemIndex,
        parsing,
        setParsing,
        isHistoryItemParsing,
        isSearchParsing,
        onParse,
      }}
    >
      {props.children}
    </ParsingContext.Provider>
  );
};

export const useParsingContext = () => {
  const context = useContext(ParsingContext);
  if (!context) {
    throw new Error("useParsingContext: cannot find a ParsingContext");
  }
  return context;
};
