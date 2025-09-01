import { style } from "@vanilla-extract/css";
import { themeContract, vars } from "fluent-solid/lib/themes";

export const root = style({ width: "460px", height: "460px" });

export const headerDescription = style({
  marginTop: vars.spacingVerticalSNudge,
  display: "flex",
  alignItems: "center",
  gap: vars.spacingHorizontalXL,
  color: themeContract.colorNeutralForeground4,
  fontSize: vars.fontSizeBase200,
});

export const headerDescriptionItem = style({
  display: "flex",
  alignItems: "center",
  gap: vars.spacingHorizontalXS,
  color: themeContract.colorNeutralForeground4,
});
