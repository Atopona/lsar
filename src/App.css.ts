import { style } from "@vanilla-extract/css";

export const container = style({
  display: "flex",
  position: "relative",
});

export const rightContainer = style({
  flex: 2,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
});

export const settingsButton = style({
  position: "absolute",
  right: 10,
  top: 12,
});

export const isMacos = style({
  marginTop: "28px",
});
