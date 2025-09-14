import { invoke } from "@tauri-apps/api/core";

export const parseDouyu = async (roomID: number) => {
  const result = await invoke<ParsedResult>("parse_douyu", {
    roomId: roomID,
  });
  return result;
};
