import { invoke } from "@tauri-apps/api/core";

export const parseDouyin = async (roomID: number) => {
  const result = await invoke<ParsedResult>("parse_douyin", {
    roomId: roomID,
  });
  return result;
};
