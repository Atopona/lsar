import { style } from "@vanilla-extract/css";
import { themeContract, vars } from "fluent-solid/lib/themes";

export const root = style({
  width: "460px",
  height: "470px",
  marginTop: vars.spacingVerticalM,
  marginBottom: vars.spacingVerticalM,
  borderRadius: vars.borderRadiusXLarge,
});

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

export const content = style({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
});
