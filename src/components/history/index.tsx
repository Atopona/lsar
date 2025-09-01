import { createSignal, For, lazy, Show } from "solid-js";

import { useHistoryContext } from "~/contexts/HistoryContext";

import HistoryItem from "./Item";

import * as styles from "./index.css";

const LazyEmpty = lazy(() => import("alley-components/lib/components/empty"));

const History = () => {
  const { historyItems, refetchHistoryItems } = useHistoryContext();

  const [parsingIndex, setParsingIndex] = createSignal<number | null>(null);

  return (
    <div
      classList={{
        [styles.history]: true,
        "history-empty": !historyItems()?.length,
      }}
    >
      <Show
        when={historyItems()?.length}
        fallback={<LazyEmpty description="空空如也" />}
      >
        <For each={historyItems()}>
          {(item, index) => (
            <HistoryItem
              {...item}
              onDelete={() => refetchHistoryItems()}
              startParsing={() => setParsingIndex(index())}
              endParsing={() => setParsingIndex(null)}
              disableParseButton={
                parsingIndex() !== null && parsingIndex() !== index()
              }
            />
          )}
        </For>
      </Show>
    </div>
  );
};

export default History;
