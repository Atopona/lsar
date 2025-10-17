import { listen } from "@tauri-apps/api/event";

import { evalResult } from "~/command";
import { parseDouyu } from "~/commands/parser";

import LiveStreamParser from "../base";

import {
  INVALID_INPUT,
  parseRoomID,
  WRONG_SECOND_LEVEL_DOMAIN,
} from "../utils";

class DouyuParser extends LiveStreamParser {
  constructor(roomID: number) {
    super(roomID, "https://www.douyu.com/");
  }

  async parse(): Promise<ParsedResult | Error> {
    const unlisten = await listen<string>("JS-EVAL", async (e) => {
      const result = eval(e.payload);
      await evalResult(result);
    });

    try {
      const result = await parseDouyu(this.roomID);
      return result;
    } catch (e) {
      return Error(String(e));
    } finally {
      unlisten();
    }
  }
}

export default function createDouyuParser(
  input: string | number,
): DouyuParser | Error {
  // 斗鱼beta版在路径中会有一个`/beta`前缀，直接替换掉
  if (typeof input === "string") input = input.toString().replace("/beta", "");

  let roomID = parseRoomID(input);
  // 斗鱼的房间号可能在查询参数 rid 中
  if (roomID instanceof Error) {
    if (roomID === WRONG_SECOND_LEVEL_DOMAIN) return roomID;

    const url = new URL(input as string); // roomID 是 NaN，input 一定是字符串
    const rid = url.searchParams.get("rid");
    if (!rid) return roomID;

    roomID = Number(rid);
    if (Number.isNaN(roomID)) return INVALID_INPUT;
  }

  return new DouyuParser(roomID);
}
