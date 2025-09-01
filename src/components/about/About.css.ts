import { style } from "@vanilla-extract/css";
import { themeContract, vars } from "fluent-solid/lib/themes";

export const about = style({
  position: "fixed",
  bottom: "4px",
  width: "400px",
});

export const label = style({
  fontWeight: vars.fontWeightBold,
});

export const aboutButton = style({
  minWidth: "48px !important",

  selectors: {
    "&:not(:hover)": {
      color: `${themeContract.colorNeutralForeground4} !important`,
    },
  },
});
