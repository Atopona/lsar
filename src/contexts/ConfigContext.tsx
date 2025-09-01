import {
  createContext,
  createResource,
  type ParentProps,
  type Resource,
  useContext,
} from "solid-js";
import { readConfigFile } from "~/command";

interface ConfigContextValue {
  config: Resource<Config>;
  refetchConfig: () => void;
}

const ConfigContext = createContext<ConfigContextValue>();

export const ConfigContextProvider = (props: ParentProps) => {
  const [config, { refetch: refetchConfig }] = createResource(readConfigFile);

  return (
    <ConfigContext.Provider
      value={{
        config,
        refetchConfig,
      }}
    >
      {props.children}
    </ConfigContext.Provider>
  );
};

export const useConfigContext = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error("useConfigContext: cannot find a ConfigContext");
  }
  return context;
};
