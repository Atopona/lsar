import { invoke } from "@tauri-apps/api/core";

export const parseHuya = async (roomID: number, url: string) => {
  const result = await invoke<ParsedResult>("parse_huya", {
    roomId: roomID || null,
    url: url,
  });
  return result;
};
