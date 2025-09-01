import { globalStyle } from "@vanilla-extract/css";
import { vars } from "fluent-solid/lib/themes";

globalStyle(":root", {
  fontFamily: vars.fontFamilyBase,
});

globalStyle("html, body", {
  padding: 0,
  margin: 0,
  overflow: "hidden",
});

globalStyle("#root", {
  height: "100vh",
  width: "100vw",
  overflow: "hidden",
});
