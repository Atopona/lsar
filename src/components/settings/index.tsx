import { createEffect, createSignal, useContext } from "solid-js";

import { getPlayerPaths, writeConfigFile } from "~/command";

import { AppContext } from "~/context";

import { AlleyFlex, LazyButton } from "~/lazy";

import { Drawer } from "../drawer/Drawer";

import DarkMode from "./components/DarkMode";
import PlayerPath from "./components/PlayerPath";
import BiliCookie from "./components/BiliCookie";

import * as styles from "./index.css";

const Settings = () => {
  const [
    _,
    { setToast },
    { config: defaultConfig, refetchConfig },
    ___,
    { showSettings, setShowSettings },
  ] = useContext(AppContext)!;

  const [lsarConfig, setLsarConfig] = createSignal(defaultConfig());

  createEffect(() => setLsarConfig(defaultConfig()));

  createEffect(async () => {
    console.log(lsarConfig());
    if (!defaultConfig() || defaultConfig()?.player.path !== "") return;

    const paths = await getPlayerPaths();
    if (!paths.length) return;

    setLsarConfig(
      (prev) =>
        prev && {
          ...prev,
          player: { path: paths[0], args: [] },
        },
    );

    setToast({
      type: "success",
      message:
        "已自动选择播放器，如果此播放器不是你想使用的播放器，请点击“重新选择”按钮自行选择",
    });
  });

  const close = () => setShowSettings(false);

  const onCancel = () => {
    if (!lsarConfig()?.player.path) {
      // TODO: 关闭程序
    } else {
      // TODO: 关闭设置对话框
    }
    close();
  };

  const onOk = async () => {
    const p = lsarConfig()?.player.path;
    if (!p) return;

    const c = lsarConfig()!; // 到这里时 config 不可能为 undefined
    c.player.path = p;

    await writeConfigFile(c);
    refetchConfig();
    close();
  };

  return (
    <Drawer
      open={showSettings() || !defaultConfig()?.player.path}
      title="设置"
      onClose={onCancel}
    >
      <AlleyFlex direction="vertical" gap={16} style={{ "min-width": "400px" }}>
        <DarkMode
          mode={lsarConfig()?.dark_mode || "system"}
          onChoice={(mode) =>
            setLsarConfig(
              (prev) =>
                prev && {
                  ...prev,
                  dark_mode: mode,
                },
            )
          }
        />

        <PlayerPath
          path={lsarConfig()?.player.path}
          onPathChange={(path) =>
            setLsarConfig(
              (prev) =>
                prev && {
                  ...prev,
                  player: { ...prev.player, path },
                },
            )
          }
        />

        <BiliCookie
          cookie={lsarConfig()?.platform.bilibili.cookie}
          onChange={(cookie) =>
            setLsarConfig(
              (prev) =>
                prev && {
                  ...prev,
                  platform: { ...prev.platform, bilibili: { cookie } },
                },
            )
          }
        />

        <div class={styles.buttons}>
          <LazyButton
            onClick={onCancel}
            disabled={!defaultConfig()?.player.path}
          >
            取消
          </LazyButton>

          <LazyButton
            appearance="primary"
            onClick={onOk}
            disabled={!lsarConfig()?.player.path}
          >
            保存
          </LazyButton>
        </div>
      </AlleyFlex>
    </Drawer>
  );
};

export default Settings;
