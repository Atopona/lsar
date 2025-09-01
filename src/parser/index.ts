import { error } from "~/command";
import bilibili from "./bilibili";
import douyin from "./douyin";
import bigo from "./bigo";
import douyu from "./douyu";
import huya from "./huya";
import type LiveStreamParser from "./base";
import { getSecondLevelDomain, WRONG_SECOND_LEVEL_DOMAIN } from "./utils";

export const NOT_LIVE = Error("当前直播间未开播");
export const IS_REPLAY = Error("当前直播间正在重播，本程序不解析重播源");

export const platforms = {
  douyu: {
    label: "斗鱼",
    roomBaseURL: "https://www.douyu.com/",
    logo: "https://www.douyu.com/favicon.ico",
    parser: douyu,
  },
  huya: {
    label: "虎牙",
    roomBaseURL: "https://www.huya.com/",
    logo: "https://www.huya.com/favicon.ico",
    parser: huya,
  },
  bilibili: {
    label: "B 站",
    roomBaseURL: "https://live.bilibili.com/",
    logo: "https://www.bilibili.com/favicon.ico",
    parser: bilibili,
  },
  douyin: {
    label: "抖音",
    roomBaseURL: "https://live.douyin.com/",
    logo: "https://p-pc-weboff.byteimg.com/tos-cn-i-9r5gewecjs/favicon.png",
    parser: douyin,
  },
  bigo: {
    label: "Bigo",
    roomBaseURL: "https://www.bigo.tv/cn/",
    logo: "https://s2.loli.net/2025/08/31/DZgyj189JrkAHCs.png",
    parser: bigo,
  },
} as const;

export const handleParsingError = (platform: Platform, e: unknown): Error => {
  const errorMessage = String(e);
  switch (errorMessage) {
    case "http error: Connect":
      return new Error("网络连接异常");
    case "http error: Timeout":
      return new Error("网络连接超时");
    case "http error: Decode":
      return new Error("解码响应失败");
    case "http error: Other":
      return new Error(
        "其他网络错误，请将日志上传到 https://github.com/alley-rs/lsar/issues",
      );
    default:
      error(platform, errorMessage);
      return e as Error;
  }
};

export const parse = async (
  platform: Platform,
  input: string | number,
  config: Config,
  setShowSettings: Setter<boolean>,
) => {
  if (
    typeof input === "string" &&
    getSecondLevelDomain(platforms[platform].roomBaseURL) !==
      getSecondLevelDomain(input)
  ) {
    return new Error(WRONG_SECOND_LEVEL_DOMAIN.message);
  }

  let parser: LiveStreamParser | Error;

  if (platform === "bilibili") {
    if (!config.platform.bilibili.cookie.length) {
      setShowSettings(true);
      return;
    }

    parser = platforms.bilibili.parser(input, config.platform.bilibili.cookie);
  } else {
    parser = platforms[platform!].parser(input);
  }

  if (parser instanceof Error) {
    return parser;
  }

  let result: ParsedResult | Error | null;
  try {
    result = await parser.parse();
  } catch (e) {
    result = handleParsingError(platform, e);
  }

  return result;
};
