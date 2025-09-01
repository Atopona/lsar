import { lazy, onMount } from "solid-js";
import { AlleyButton, AlleyFlex, AlleyTooltip } from "./lazy";
import { showMainWindow } from "./command";
import History from "./components/history";
import Search from "./components/search";
import Settings from "./components/settings";
import Result from "./components/result";
import "./App.scss";
import About from "./components/about";
import { AiFillSetting } from "solid-icons/ai";
import { useDarkMode } from "./hooks/useDarkMode";
import { useConfigContext } from "./contexts/ConfigContext";
import { useSettingsContext } from "./contexts/SettingsContext";

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

      <AlleyFlex
        class={
          import.meta.env.TAURI_PLATFORM !== "macos" ? "not-macos" : undefined
        }
      >
        <History />

        <AlleyFlex id="right" direction="vertical">
          <Search />

          <Result />

          <About />
        </AlleyFlex>

        <AlleyTooltip text="设置" placement="top" delay={1000}>
          <AlleyButton
            id="settings-button"
            icon={<AiFillSetting />}
            type="plain"
            shape="circle"
            onClick={onClickSettingsButton}
          />
        </AlleyTooltip>

        <Settings />
      </AlleyFlex>
    </>
  );
};

export default App;
