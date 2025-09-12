import { globalStyle } from "@vanilla-extract/css";
import {
  darkTheme,
  lightTheme,
  themeContract,
  vars,
} from "fluent-solid/lib/themes";

globalStyle(":root", {
  fontFamily: vars.fontFamilyBase,
  color: themeContract.colorNeutralForeground1,
  backgroundColor: themeContract.colorNeutralBackground1,
});

globalStyle('[data-theme="dark"]', {
  vars: darkTheme,
});
globalStyle('[data-theme="light"]', {
  vars: lightTheme,
});

globalStyle("::-webkit-scrollbar", {
  width: "8px",
  height: "8px",
});

globalStyle("::-webkit-scrollbar-track", {
  backgroundColor: themeContract.colorTransparentBackground,
});

globalStyle("::-webkit-scrollbar-thumb", {
  borderRadius: "4px",
  backgroundColor: themeContract.colorNeutralStencil2Alpha,
});

globalStyle("::-webkit-scrollbar-thumb:hover", {
  backgroundColor: themeContract.colorNeutralStencil1Alpha,
});

globalStyle("html, body", {
  padding: 0,
  margin: 0,
  overflow: "hidden",
});

globalStyle("#root", {
  paddingTop: "28px", // 与 macOS 标题栏高度一致
  height: "100vh",
  width: "100vw",
  overflow: "hidden",
});
