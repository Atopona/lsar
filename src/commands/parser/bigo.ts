import { invoke } from "@tauri-apps/api/core";

export const parseBigo = async (roomId: number) => {
  const result = await invoke<ParsedResult>("parse_bigo", {
    roomId,
  });
  return result;
};
