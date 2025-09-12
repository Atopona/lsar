import { style } from "@vanilla-extract/css";

export const titlebar = style({
  height: "28px", // 与 macOS 标题栏高度一致
  width: "100%",
  backgroundColor: "transparent",
  top: 0,
  left: 0,
  zIndex: 9999,
  position: "fixed",
});
