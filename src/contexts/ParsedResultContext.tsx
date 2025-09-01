import {
  type Accessor,
  createContext,
  createSignal,
  type ParentProps,
  type Setter,
  useContext,
} from "solid-js";

interface ParsedResultContextValue {
  parsedResult: Accessor<ParsedResult | undefined>;
  setParsedResult: Setter<ParsedResult | undefined>;
}

const ParsedResultContext = createContext<ParsedResultContextValue>();

export const ParsedResultContextProvider = (props: ParentProps) => {
  const [parsedResult, setParsedResult] = createSignal<ParsedResult>();

  return (
    <ParsedResultContext.Provider value={{ parsedResult, setParsedResult }}>
      {props.children}
    </ParsedResultContext.Provider>
  );
};

export const useParsedResultContext = () => {
  const context = useContext(ParsedResultContext);
  if (!context) {
    throw new Error(
      "useParsedResultContext: cannot find a ParsedResultContext",
    );
  }
  return context;
};
