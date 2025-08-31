import { style } from "@vanilla-extract/css";
import { themeContract, vars } from "fluent-solid/lib/themes";

export const item = style({
  width: "90%",
  height: "fit-content",

  selectors: {
    "&:hover": {
      cursor: "default",
    },

    "&:not(:last-of-type)": {
      marginBottom: vars.spacingVerticalM,
    },
  },
});

export const header = style({
  flexShrink: 1,
});

export const description = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
});

export const descriptionPart1 = style({
  display: "flex",
  alignItems: "center",
  gap: vars.spacingHorizontalXS,
});

export const anchor = style({
  color: themeContract.colorNeutralForeground3,
});

export const category = style({
  color: themeContract.colorNeutralForeground4,
});

export const button = style({
  selectors: {
    "&:hover": {
      cursor: "default",
    },
  },
});

export const deleteButton = style({
  color: themeContract.colorStatusDangerForeground2,

  selectors: {
    "&:hover": {
      cursor: "default",
      color: themeContract.colorStatusDangerForeground3,
    },

    "&:hover:active": {
      color: themeContract.colorStatusDangerForeground1,
    },
  },
});
