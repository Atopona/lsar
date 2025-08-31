import type { JSXElement } from "solid-js";

export interface DrawerProps {
  title?: string;
  open?: boolean;
  children: JSXElement;
  onClose?: () => void;
}
