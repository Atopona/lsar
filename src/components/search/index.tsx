import { createSignal, For, Show } from "solid-js";

import { TiFlash } from "solid-icons/ti";

import { LazyButton, LazyInput, LazyBadge, LazySpinner } from "~/lazy";

import { platforms } from "~/parser";

import { useParsedResultContext } from "~/contexts/ParsedResultContext";
import { useParsingContext } from "~/contexts/ParsingContext";

import * as styles from "./index.css";

const Search = () => {
  const { setParsedResult } = useParsedResultContext();
  const { isHistoryItemParsing, isSearchParsing, onParse } =
    useParsingContext();

  const [input, setInput] = createSignal<string>();
  const [currentPlatform, setCurrentPlatform] = createSignal<Platform | null>(
    null,
  );

  const resetParseResult = () => setParsedResult();
  const resetInput = () => setInput("");

  const selectPlatform = (value: Platform) => {
    if (currentPlatform() === value) {
      // 点击已选中的平台，清空选中
      setCurrentPlatform(null);
      resetInput();
      return;
    }

    if (currentPlatform()) resetInput();

    setCurrentPlatform(value);
    resetParseResult();
  };

  const handleInput = (v: string) => {
    setInput(v);
  };

  const handleParse = async () => {
    const value = input()?.trim();
    if (!value) return;

    onParse(currentPlatform()!, value);
  };

  const handleEnterDown = (e: KeyboardEvent) => {
    if (input()?.trim() && e.key === "Enter") handleParse();
  };

  return (
    <>
      <div class={styles.badges}>
        <For each={Object.keys(platforms) as Platform[]}>
          {(key) => {
            const item = platforms[key];

            return (
              <LazyBadge
                shape="rounded"
                color={currentPlatform() === key ? "brand" : "informative"}
                appearance={currentPlatform() === key ? "filled" : "tint"}
                onClick={() => selectPlatform(key)}
                icon={
                  <img
                    src={item.logo}
                    alt={item.label}
                    height={12}
                    width={12}
                  />
                }
              >
                {item.label}
              </LazyBadge>
            );
          }}
        </For>
      </div>

      <LazyInput
        appearance="underline"
        placeholder="输入房间号或直播间链接"
        value={input()}
        onInput={handleInput}
        onKeyDown={handleEnterDown}
        disabled={
          isHistoryItemParsing() || isSearchParsing() || !currentPlatform()
        }
        contentAfter={
          <LazyButton
            icon={
              <Show
                when={!isSearchParsing()}
                fallback={<LazySpinner size="extra-tiny" />}
              >
                <TiFlash />
              </Show>
            }
            isLoading={isSearchParsing()}
            disabled={isHistoryItemParsing() || !currentPlatform() || !input()}
            onClick={handleParse}
            appearance="transparent"
          />
        }
      />
    </>
  );
};

export default Search;
