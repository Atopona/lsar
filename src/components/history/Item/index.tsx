import { createSignal, Show } from "solid-js";
import { AiFillApi, AiFillChrome, AiFillDelete } from "solid-icons/ai";

import { Caption1, useToast } from "fluent-solid";

import { deleteHistoryByID, open } from "~/command";
import {
  LazyButton,
  LazyCard,
  LazyCardHeader,
  LazySpinner,
  LazyText,
  LazyTooltip,
} from "~/lazy";

import { parse, platforms } from "~/parser";

import { useParsedResultContext } from "~/contexts/ParsedResultContext";
import { useConfigContext } from "~/contexts/ConfigContext";
import { useSettingsContext } from "~/contexts/SettingsContext";

import * as styles from "./index.css";

interface HistoryItemProps extends HistoryItem {
  onDelete: () => void;
  disableParseButton?: boolean;
  startParsing: () => void;
  endParsing: () => void;
}

const BUTTON_ICON_FONT_SIZE = "16px";

const HistoryItem = (props: HistoryItemProps) => {
  const toast = useToast();
  const { config } = useConfigContext();
  const { setParsedResult } = useParsedResultContext();
  const { setShowSettings: setShowBilibiliCookieEditor } = useSettingsContext();

  const [parsing, setParsing] = createSignal(false);

  const onDelete = async () => {
    await deleteHistoryByID(props.id);
    props.onDelete();
  };

  const onParse = async () => {
    props.startParsing();
    setParsing(true);
    setParsedResult(); // 清空解析结果

    const result = await parse(
      props.platform,
      props.room_id,
      config()!,
      setShowBilibiliCookieEditor,
    );

    if (result instanceof Error) {
      toast.error(result.message, { position: "bottom-right" });
    } else {
      setParsedResult(result);
    }

    setParsing(false);
    props.endParsing();
  };

  return (
    <LazyCard size="small" class={styles.item} onClick={() => {}}>
      <LazyCardHeader
        class={styles.header}
        header={
          <div class={styles.headerHeader}>
            <LazyText weight="semibold">{props.last_title}</LazyText>

            <Caption1 class={styles.category} italic>
              {props.category}
            </Caption1>
          </div>
        }
      />

      <div class={styles.description}>
        <div class={styles.descriptionPart1}>
          <img
            width={12}
            height={12}
            src={platforms[props.platform].logo}
            alt={platforms[props.platform].label}
          />
          <Caption1 class={styles.anchor}>{props.anchor}</Caption1>
        </div>

        <div class={styles.actions}>
          <LazyTooltip
            content="解析本直播间"
            relationship="label"
            positioning="below"
            withArrow
          >
            <LazyButton
              class={styles.button}
              icon={
                <Show
                  when={!parsing()}
                  fallback={<LazySpinner size="extra-tiny" />}
                >
                  <AiFillApi font-size={BUTTON_ICON_FONT_SIZE} />
                </Show>
              }
              appearance="transparent"
              shape="circular"
              isLoading={parsing()}
              onClick={onParse}
              size="small"
              disabled={props.disableParseButton}
            />
          </LazyTooltip>

          <LazyTooltip
            content="在浏览器中打开此直播间"
            relationship="label"
            positioning="below"
            withArrow
          >
            <LazyButton
              class={styles.button}
              icon={<AiFillChrome font-size={BUTTON_ICON_FONT_SIZE} />}
              appearance="transparent"
              shape="circular"
              size="small"
              onClick={() =>
                open(platforms[props.platform].roomBaseURL + props.room_id)
              }
            />
          </LazyTooltip>

          <LazyTooltip
            content="删除本条历史记录"
            relationship="label"
            positioning="below"
            withArrow
          >
            <LazyButton
              classList={{
                [styles.button]: true,
                [styles.deleteButton]: true,
              }}
              onClick={onDelete}
              icon={<AiFillDelete font-size={BUTTON_ICON_FONT_SIZE} />}
              appearance="transparent"
              shape="circular"
              size="small"
            />
          </LazyTooltip>
        </div>
      </div>
    </LazyCard>
  );
};

export default HistoryItem;
