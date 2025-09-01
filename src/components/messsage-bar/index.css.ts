import { style } from "@vanilla-extract/css";
import { vars, themeContract } from "fluent-solid/lib/themes";

export const root = style({
  display: "flex",
  paddingLeft: vars.spacingHorizontalM,
  border: `${vars.strokeWidthThin} solid ${themeContract.colorNeutralStroke1}`,
  borderRadius: vars.borderRadiusMedium,
  paddingTop: vars.spacingVerticalMNudge,
  paddingBottom: vars.spacingVerticalMNudge,
  whiteSpace: "normal",
  alignItems: "center",
  minHeight: "48px",
  boxSizing: "border-box",
  backgroundColor: themeContract.colorNeutralBackground3,
});

export const icon = style({
  fontSize: vars.fontSizeBase500,
  marginRight: vars.spacingHorizontalS,
  color: themeContract.colorNeutralForeground3,
  display: "flex",
  alignItems: "center",
});

export const body = style({
  fontFamily: vars.fontFamilyBase,
  fontSize: vars.fontSizeBase300,
  fontWeight: vars.fontWeightRegular,
  lineHeight: vars.lineHeightBase300,
  paddingRight: vars.spacingHorizontalM,
});
