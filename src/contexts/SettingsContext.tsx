import {
  type Accessor,
  createContext,
  createSignal,
  type ParentProps,
  type Setter,
  useContext,
} from "solid-js";

interface SettingsContextValue {
  showSettings: Accessor<boolean>;
  setShowSettings: Setter<boolean>;
}

const SettingsContext = createContext<SettingsContextValue>();

export const SettingsContextProvider = (props: ParentProps) => {
  const [showSettings, setShowSettings] = createSignal(false);

  return (
    <SettingsContext.Provider value={{ showSettings, setShowSettings }}>
      {props.children}
    </SettingsContext.Provider>
  );
};

export const useSettingsContext = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettingsContext: cannot find a SettingsContext");
  }
  return context;
};
