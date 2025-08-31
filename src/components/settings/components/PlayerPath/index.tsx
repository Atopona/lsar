import { Show } from "solid-js";

import { open } from "@tauri-apps/plugin-dialog";

import { LazyButton, LazyTextCaption1 } from "~/lazy";

import SettingItem from "../SettingItem";

import * as styles from "./index.css";

interface PlayerPathProps {
  path?: string;
  onPathChange: (path: string) => void;
}

const PlayerPath = (props: PlayerPathProps) => {
  const onSelectFile = async () => {
    const file: string | null = await open({
      multiple: false,
      directory: false,
    });
    file && props.onPathChange(file);
  };

  return (
    <SettingItem label="播放器绝对路径">
      <div class={styles.content}>
        <Show when={props.path}>
          <LazyTextCaption1 class={styles.path}>{props.path}</LazyTextCaption1>
        </Show>

        <LazyButton
          size="small"
          onClick={onSelectFile}
          shape="rounded"
          appearance="primary"
        >
          <Show when={!props.path} fallback={"重新选择"}>
            选择文件
          </Show>
        </LazyButton>
      </div>
    </SettingItem>
  );
};

export default PlayerPath;
