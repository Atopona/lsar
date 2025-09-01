import { children, createSignal, For } from "solid-js";
import { AiFillApi } from "solid-icons/ai";

import { LazyButton, LazyInput, LazyBadge } from "~/lazy";

import { parse, platforms } from "~/parser";
import { isValidNumberOrHttpsUrl } from "~/parser/validators";

import { useToast } from "fluent-solid";
import { useConfigContext } from "~/contexts/ConfigContext";
import { useParsedResultContext } from "~/contexts/ParsedResultContext";
import { useSettingsContext } from "~/contexts/SettingsContext";

import * as styles from "./index.css";

const Search = () => {
  const toast = useToast();
  const { config } = useConfigContext();
  const { setParsedResult } = useParsedResultContext();
  const { setShowSettings: setShowBilibiliCookieEditor } = useSettingsContext();

  const [input, setInput] = createSignal<string>();
  const [currentPlatform, setCurrentPlatform] = createSignal<Platform | null>(
    null,
  );

  const [loading, setLoading] = createSignal(false);

  const resetParseResult = () => setParsedResult();
  const resetInput = () => setInput("");

  const selectPlatform = (value: Platform) => {
    if (currentPlatform() === value) {
      // 点击已选中的平台，清空选中
      setCurrentPlatform(null);
      return;
    }

    if (currentPlatform()) resetInput();

    setCurrentPlatform(value);
    resetParseResult();
  };

  const onInput = (v: string) => {
    setInput(v);
  };

  const badges = children(() => (
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
                <img src={item.logo} alt={item.label} height={12} width={12} />
              }
            >
              {item.label}
            </LazyBadge>
          );
        }}
      </For>
    </div>
  ));

  const onParse = async () => {
    const value = input()?.trim();
    if (!value) return;

    const parsedInput = isValidNumberOrHttpsUrl(value);
    if (parsedInput instanceof Error) {
      toast.error(parsedInput.message);
      return;
    }

    setLoading(true);

    const result = await parse(
      currentPlatform()!,
      parsedInput,
      config()!,
      setShowBilibiliCookieEditor,
    );

    if (result instanceof Error) {
      toast.error(result.message, { position: "bottom-right" });
    } else {
      setParsedResult(result);
    }

    setLoading(false);
  };

  return (
    <>
      {badges()}

      <LazyInput
        placeholder="输入房间号或直播间链接"
        onInput={onInput}
        onKeyDown={(e) => {
          if (input()?.trim() && e.key === "Enter") onParse();
        }}
        disabled={!currentPlatform() || loading()}
        contentAfter={
          <LazyButton
            icon={<AiFillApi />}
            isLoading={loading()}
            disabled={!currentPlatform() || !input()}
            onClick={onParse}
            appearance="transparent"
          />
        }
      />
    </>
  );
};

export default Search;
