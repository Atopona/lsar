import { parseHuya } from "~/commands/parser";

import LiveStreamParser from "../base";

class HuyaParser extends LiveStreamParser {
  baseURL = "https://m.huya.com/";
  url: string;

  constructor(roomID: number, url = "") {
    super(roomID, "https://m.huya.com/");
    this.url = url;
  }

  async parse(): Promise<ParsedResult | Error> {
    try {
      const result = await parseHuya(this.roomID, this.url);
      return result;
    } catch (error) {
      return error instanceof Error ? error : new Error(String(error));
    }
  }
}

export default function createHuyaParser(
  input: string | number
): HuyaParser | Error {
  let roomID: number | undefined;
  let url: string | undefined;

  if (typeof input === "number") roomID = input;
  else url = input;

  return new HuyaParser(roomID || 0, url);
}
