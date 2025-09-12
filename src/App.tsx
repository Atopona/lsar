import { lazy, onMount } from "solid-js";
import { LazyButton, LazyTooltip } from "./lazy";
import { showMainWindow } from "./command";
import History from "./components/history";
import Search from "./components/search";
import Settings from "./components/settings";
import Result from "./components/result";
import About from "./components/about";
import { AiFillSetting } from "solid-icons/ai";
import { useDarkMode } from "./hooks/useDarkMode";
import { useConfigContext } from "./contexts/ConfigContext";
import { useSettingsContext } from "./contexts/SettingsContext";

import * as styles from "./App.css";

const TitleBar =
  import.meta.env.TAURI_ENV_PLATFORM === "darwin"
    ? lazy(() => import("~/components/title-bar"))
    : null;

const App = () => {
  const { config } = useConfigContext();
  const { setShowSettings } = useSettingsContext();

  onMount(() => {
    showMainWindow();
  });

  useDarkMode(config);

  const onClickSettingsButton = () => setShowSettings(true);

  return (
    <>
      {TitleBar && <TitleBar />}

      <div
        classList={{
          [styles.container]: true,
          [styles.isMacos]: import.meta.env.TAURI_ENV_PLATFORM === "darwin",
        }}
      >
        <History />

        <div class={styles.rightContainer}>
          <Search />

          <Result />

          <About />
        </div>

        <LazyTooltip content="设置" positioning="above" relationship="label">
          <LazyButton
            class={styles.settingsButton}
            icon={<AiFillSetting />}
            appearance="transparent"
            shape="circular"
            onClick={onClickSettingsButton}
          />
        </LazyTooltip>

        <Settings />
      </div>
    </>
  );
};

export default App;
