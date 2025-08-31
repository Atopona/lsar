import { For } from "solid-js";
import { LazyBadge } from "~/lazy";
import SettingItem from "../SettingItem";

import * as styles from "./index.css";

interface DarkModeProps {
  mode: Config["dark_mode"];
  onChoice: (mode: Config["dark_mode"]) => void;
}

const modes: Array<{ value: Config["dark_mode"]; label: string }> = [
  { value: "light", label: "亮色" },
  { value: "dark", label: "暗色" },
  { value: "system", label: "跟随系统" },
];

const DarkMode = (props: DarkModeProps) => {
  return (
    <SettingItem label="暗色模式">
      <div class={styles.content}>
        <For each={modes}>
          {(mode) => (
            <LazyBadge
              onClick={() => props.onChoice(mode.value)}
              appearance="filled" // TODO: 其他 appearance 尚未实现，应该使用 outline
              color={props.mode === mode.value ? "brand" : "informative"}
            >
              {mode.label}
            </LazyBadge>
          )}
        </For>
      </div>
    </SettingItem>
  );
};

export default DarkMode;
