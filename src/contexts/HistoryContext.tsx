import {
  createContext,
  createResource,
  type ParentProps,
  type Resource,
  useContext,
} from "solid-js";
import { getAllHistory } from "~/command";

interface HistoryContextValue {
  historyItems: Resource<HistoryItem[]>;
  refetchHistoryItems: () => void;
}

const HistoryContext = createContext<HistoryContextValue>();

export const HistoryContextProvider = (props: ParentProps) => {
  const [items, { refetch: refetchHistoryItems }] =
    createResource(getAllHistory);

  return (
    <HistoryContext.Provider
      value={{
        historyItems: items,
        refetchHistoryItems,
      }}
    >
      {props.children}
    </HistoryContext.Provider>
  );
};

export const useHistoryContext = () => {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error("useHistoryContext: cannot find a HistoryContext");
  }
  return context;
};
