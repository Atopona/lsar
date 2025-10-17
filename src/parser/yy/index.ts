import { parseYY } from "~/commands/parser";

import LiveStreamParser from "../base";
import { parseRoomID } from "../utils";

class YYParser extends LiveStreamParser {
  constructor(roomID: number) {
    super(roomID, "https://www.yy.com/");
  }

  async parse(): Promise<ParsedResult | Error> {
    try {
      const result = await parseYY(this.roomID);
      return result;
    } catch (error) {
      return error instanceof Error ? error : new Error(String(error));
    }
  }
}

export default function createYYParser(
  input: string | number,
): YYParser | Error {
  const roomID = parseRoomID(input);
  if (roomID instanceof Error) {
    return roomID;
  }

  return new YYParser(roomID);
}
