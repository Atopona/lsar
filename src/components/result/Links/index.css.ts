import { style } from "@vanilla-extract/css";
import { vars } from "fluent-solid/lib/themes";

export const item = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",

  selectors: {
    "&:not(:last-of-type)": {
      marginBottom: vars.spacingVerticalSNudge,
    },
  },
});

export const itemLinkContainer = style({
  flex: "0 0 87.5%",
  maxWidth: "87.5%",
  alignItems: "center",
  justifyContent: "start",
  overflow: "hidden",
  whiteSpace: "nowrap",
});

export const itemLink = style({
  textOverflow: "ellipsis",
  maxWidth: "100%",
});

export const itemLinkActions = style({
  flex: "0 0 12.5%",
  maxWidth: "12.5%",
  alignItems: "center",
  justifyContent: "end",
});

export const itemLinkActionButton = style({
  width: "24px",
  height: "24px",
  padding: "1px",
});
