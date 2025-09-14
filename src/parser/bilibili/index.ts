import { parseBilibili } from "~/commands/parser";

import LiveStreamParser from "../base";

class BilibiliParser extends LiveStreamParser {
  cookie: string;
  url: string;
  constructor(cookie: string, roomID = 0, url = "") {
    super(roomID, "");
    this.cookie = cookie;
    this.url = url;
  }

  async parse(): Promise<ParsedResult | Error> {
    try {
      const result = await parseBilibili(this.roomID, this.cookie, this.url);
      return result;
    } catch (e) {
      return Error(String(e));
    }
  }
}

export default function createBilibiliParser(
  input: string | number,
  cookie: string
) {
  let roomID: number | undefined;
  let url: string | undefined;

  if (typeof input === "number") roomID = input;
  else url = input;

  return new BilibiliParser(cookie, roomID, url);
}
