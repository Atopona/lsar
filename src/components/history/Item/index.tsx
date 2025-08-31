import { createSignal, Show } from "solid-js";
import { AiFillApi, AiFillChrome, AiFillDelete } from "solid-icons/ai";

import { Text } from "fluent-solid/lib/components/text/Text";
import { Caption1 } from "fluent-solid";

import { deleteHistoryByID, open } from "~/command";
import { useAppContext } from "~/context";
import {
  LazyButton,
  LazyCard,
  LazyCardHeader,
  LazySpinner,
  LazyTooltip,
} from "~/lazy";

import { parse, platforms } from "~/parser";

import * as styles from "./index.css";

interface HistoryItemProps extends HistoryItem {
  onDelete: () => void;
  disableParseButton?: boolean;
  startParsing: () => void;
  endParsing: () => void;
}

const BUTTON_ICON_FONT_SIZE = "16px";

const HistoryItem = (props: HistoryItemProps) => {
  const [
    _,
    { setToast },
    { config },
    { setParsedResult },
    { setShowSettings: setShowBilibiliCookieEditor },
  ] = useAppContext();

  const [parsing, setParsing] = createSignal(false);

  const onDelete = async () => {
    await deleteHistoryByID(props.id);
    props.onDelete();
  };

  const onParse = async () => {
    props.startParsing();
    setParsing(true);

    await parse(
      props.platform,
      props.room_id,
      config()!,
      setShowBilibiliCookieEditor,
      setToast,
      setParsedResult,
    );

    setParsing(false);
    props.endParsing();
  };

  return (
    <LazyCard
      size="small"
      class={styles.item}
      orientation="horizontal"
      onClick={() => {}}
    >
      <LazyCardHeader
        class={styles.header}
        header={<Text weight="semibold">{props.last_title}</Text>}
        description={
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

            <Caption1 class={styles.category} italic>
              {props.category}
            </Caption1>
          </div>
        }
        action={
          <div>
            <LazyTooltip
              content="解析本直播间"
              relationship="label"
              positioning="after"
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
              positioning="after"
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
              positioning="after"
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
        }
      />
    </LazyCard>
  );
};

export default HistoryItem;
