import { invoke } from "@tauri-apps/api/core";

export const parseBilibili = async (
  roomID: number,
  cookie: string,
  url: string
) => {
  const result = await invoke<ParsedResult>("parse_bilibili", {
    roomId: roomID,
    cookie: cookie,
    url: url || null,
  });
  return result;
};
