import { For } from "solid-js";
import { AiFillCopy, AiFillPlayCircle } from "solid-icons/ai";

import { writeText } from "@tauri-apps/plugin-clipboard-manager";

import { LazyButton, LazyLink, LazyTooltip } from "~/lazy";

import { insertHistory, play } from "~/command";

import { useHistoryContext } from "~/contexts/HistoryContext";
import { useParsedResultContext } from "~/contexts/ParsedResultContext";

import * as styles from "./index.css";
import { useToast } from "fluent-solid";

const BUTTON_ICON_FONT_SIZE = "16px";

type LinksProps = ParsedResult;

const Links = (props: LinksProps) => {
  const toast = useToast();
  const { setParsedResult } = useParsedResultContext();
  const { refetchHistoryItems } = useHistoryContext();

  const removeLink = (index: number) => {
    setParsedResult((prev) => ({
      ...prev!,
      links: prev!.links.filter((_, idx) => idx !== index),
    }));
  };

  const onPlay = async (index: number) => {
    await play(props.links[index]);

    // 解析出来的链接只能访问一次，访问后即删除
    removeLink(index);

    const historyItem = {
      id: 0,
      platform: props.platform,
      anchor: props.anchor,
      room_id: props.roomID,
      category: props.category,
      last_title: props.title,
      last_play_time: new Date(),
    };

    await insertHistory(historyItem);
    refetchHistoryItems();
  };

  const onCopy = async (link: string) => {
    await writeText(link);
    toast.success("已复制链接到系统剪贴板，可粘贴到其他播放器播放", {
      position: "bottom-right",
    });
  };

  return (
    <div class="parsed-links">
      <For each={props.links}>
        {(link, index) => (
          <LinkItem
            link={link}
            onPlay={() => onPlay(index())}
            onCopy={() => onCopy(link)}
          />
        )}
      </For>
    </div>
  );
};

interface LinkItemProps {
  link: string;
  onPlay: () => void;
  onCopy: () => void;
}

const LinkItem = (props: LinkItemProps) => {
  return (
    <div class={styles.item}>
      <div class={styles.itemLinkContainer}>
        <LazyLink class={styles.itemLink}>{props.link}</LazyLink>
      </div>

      <div class={styles.itemLinkActions}>
        <LazyTooltip
          content="播放此直播流"
          showDelay={1000}
          positioning="below"
          relationship="label"
        >
          <LazyButton
            class={styles.itemLinkActionButton}
            icon={<AiFillPlayCircle font-size={BUTTON_ICON_FONT_SIZE} />}
            shape="circular"
            size="small"
            appearance="subtle"
            onClick={() => props.onPlay()}
          />
        </LazyTooltip>

        <LazyTooltip
          content="复制链接"
          showDelay={1000}
          positioning="below"
          relationship="label"
        >
          <LazyButton
            class={styles.itemLinkActionButton}
            icon={<AiFillCopy font-size={BUTTON_ICON_FONT_SIZE} />}
            shape="circular"
            size="small"
            appearance="subtle"
            onClick={() => props.onCopy()}
          />
        </LazyTooltip>
      </div>
    </div>
  );
};

export default Links;
