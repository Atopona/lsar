import { style } from "@vanilla-extract/css";
import { vars } from "fluent-solid/lib/themes";

export const content = style({
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center",
  gap: vars.spacingHorizontalM,
});
