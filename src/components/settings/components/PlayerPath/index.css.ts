import { style } from "@vanilla-extract/css";
import { themeContract, vars } from "fluent-solid/lib/themes";

export const label = style({
  display: "flex",
  alignItems: "center",
  fontWeight: vars.fontWeightSemibold,
});

export const content = style({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
});

export const path = style({
  color: themeContract.colorNeutralForeground3,
});
