import { Show } from "solid-js";

import { AiFillChrome } from "solid-icons/ai";

import { open } from "~/command";

import { platforms } from "~/parser";
import {
  LazyButton,
  LazyCard,
  LazyCardHeader,
  LazyLabel,
  LazyText,
  LazyTooltip,
} from "~/lazy";

import { useParsedResultContext } from "~/contexts/ParsedResultContext";

import Links from "./Links";

import * as styles from "./index.css";

const Result = () => {
  const { parsedResult } = useParsedResultContext();

  return (
    <LazyCard class={styles.root} appearance="filled">
      <LazyCardHeader
        header={
          <LazyText weight="semibold" size={500}>
            {parsedResult()?.title}
          </LazyText>
        }
        description={
          <Show when={parsedResult()?.title}>
            <div class={styles.headerDescription}>
              <div class={styles.headerDescriptionItem}>
                <LazyLabel weight="semibold" size="small">
                  分类
                </LazyLabel>
                <span>{parsedResult()?.category ?? "无"}</span>
              </div>

              <div class={styles.headerDescriptionItem}>
                <LazyLabel weight="semibold" size="small">
                  主播
                </LazyLabel>
                <span>{parsedResult()?.anchor}</span>
              </div>
            </div>
          </Show>
        }
        action={
          <Show when={parsedResult()?.title}>
            <LazyTooltip
              content="在浏览器中打开此直播间"
              relationship="label"
              positioning="before"
            >
              <LazyButton
                icon={<AiFillChrome />}
                shape="circular"
                size="small"
                appearance="subtle"
                onClick={() =>
                  open(
                    platforms[parsedResult()!.platform].roomBaseURL +
                      parsedResult()!.roomID,
                  )
                }
              />
            </LazyTooltip>
          </Show>
        }
      />

      <Show when={parsedResult()}>
        <Links {...parsedResult()!} />
      </Show>
    </LazyCard>
  );
};

export default Result;
