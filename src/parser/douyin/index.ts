import { parseDouyin } from "~/commands/parser";

import LiveStreamParser from "../base";

import { parseRoomID } from "../utils";

class DouyinParser extends LiveStreamParser {
  constructor(roomID: number) {
    super(roomID, "https://live.douyin.com/");
  }

  async parse(): Promise<ParsedResult | Error> {
    try {
      const result = await parseDouyin(this.roomID);
      return result;
    } catch (e) {
      return Error(String(e));
    }
  }
}

export default function createDouyinParser(input: string | number) {
  const roomID = parseRoomID(input);
  if (roomID instanceof Error) return roomID;

  return new DouyinParser(roomID);
}
