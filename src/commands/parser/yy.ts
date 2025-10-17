import { invoke } from "@tauri-apps/api/core";

export const parseYY = async (roomID: number) => {
  const result = await invoke<ParsedResult>("parse_yy", {
    roomId: roomID,
  });
  return result;
};
