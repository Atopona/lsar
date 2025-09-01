import { createResource } from "solid-js";

import { getVersion } from "@tauri-apps/api/app";

import { open } from "~/command";

import { LazyLabel, LazyButton, LazyFlex } from "~/lazy";

import * as style from "./About.css";

const About = () => {
  const [version] = createResource(getVersion);

  return (
    <LazyFlex class={style.about} justify="around">
      <LazyFlex align="center">
        <LazyLabel class={style.label}>反馈</LazyLabel>

        <LazyButton
          class={style.aboutButton}
          appearance="transparent"
          size="small"
          onClick={() => open("https://github.com/alley-rs/lsar")}
        >
          Github
        </LazyButton>

        <LazyButton
          class={style.aboutButton}
          appearance="transparent"
          size="small"
          onClick={() => open("https://www.52pojie.cn/thread-1959221-1-1.html")}
        >
          吾爱破解
        </LazyButton>
      </LazyFlex>

      <LazyFlex align="center">
        <LazyLabel class={style.label}>版本号</LazyLabel>

        <LazyButton
          class={style.aboutButton}
          appearance="transparent"
          size="small"
          onClick={() =>
            open("https://github.com/alley-rs/lsar/releases/latest")
          }
        >
          {version()}
        </LazyButton>
      </LazyFlex>
    </LazyFlex>
  );
};

export default About;
