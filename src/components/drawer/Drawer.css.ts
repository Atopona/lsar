import { style } from "@vanilla-extract/css";
import { themeContract, vars } from "fluent-solid/lib/themes";

export const drawer = style({
  position: "fixed",
  top: 0,
  right: 0,
  width: "480px",
  height: "100%",
  padding: `${vars.spacingVerticalM} ${vars.spacingHorizontalM}`,
  zIndex: vars.zIndexModal,
  boxSizing: "border-box",
  borderLeft: `${vars.strokeWidthThin} solid ${themeContract.colorTransparentStroke}`,
  overflow: "hidden",
  backgroundColor: themeContract.colorNeutralBackground1,
});

export const drawerOverlay = style({
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: themeContract.colorBackgroundOverlay,
  zIndex: `calc(${vars.zIndexModal} - 1)`,
});

export const drawerHeader = style({
  width: "100%",
  maxWidth: "100%",
  padding: `${vars.spacingVerticalXXL} ${vars.spacingHorizontalXXL}`,
  gap: vars.spacingHorizontalS,
  alignSelf: "stretch",
  display: "flex",
  flexDirection: "column",
  boxSizing: "border-box",
  position: "relative",
});

export const drawerHeaderTitle = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  columnGap: vars.spacingHorizontalS,
});

export const drawerHeaderTitleHeading = style({
  fontSize: vars.fontSizeBase500,
  fontWeight: vars.fontWeightSemibold,
  lineHeight: vars.lineHeightBase500,
  margin: 0,
});

export const drawerHeaderAction = style({
  marginRight: `calc(${vars.spacingHorizontalS} * -1)`,
  gridRow: "1 / 1",
  gridColumnStart: 3,
  placeSelf: "start end",
});

export const drawerBody = style({
  padding: `0 ${vars.spacingHorizontalXXL}`,
  flex: "1 1 0%",
  alignSelf: "stretch",
  position: "relative",
  overflow: "auto",
});
