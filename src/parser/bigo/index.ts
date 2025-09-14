import { parseBigo } from "~/commands/parser";

import LiveStreamParser from "../base";

import { parseRoomID } from "../utils";

class BigoParser extends LiveStreamParser {
  constructor(roomID: number) {
    super(roomID, "https://www.bigo.tv/cn/");
  }

  async parse(): Promise<ParsedResult | Error> {
    try {
      const result = await parseBigo(this.roomID);
      return result;
    } catch (e) {
      return Error(String(e));
    }
  }
}

export default function createBigoParser(input: string | number) {
  const roomID = parseRoomID(input);
  if (roomID instanceof Error) return roomID;

  return new BigoParser(roomID);
}
