import { Portal, Show } from "solid-js/web";

import { AiOutlineClose } from "solid-icons/ai";

import { LazyButton, LazyText } from "~/lazy";

import type { DrawerProps } from "./Drawer.types";

import * as styles from "./Drawer.css";

export const Drawer = (props: DrawerProps) => {
  return (
    <Show when={props.open}>
      <Portal>
        <div class={styles.drawerOverlay} />

        <div class={styles.drawer}>
          <header class={styles.drawerHeader}>
            <div class={styles.drawerHeaderTitle}>
              <LazyText as="h2" class={styles.drawerHeaderTitleHeading}>
                {props.title}
              </LazyText>

              <Show when={props.onClose}>
                <div class={styles.drawerHeaderAction}>
                  <LazyButton
                    icon={<AiOutlineClose />}
                    appearance="subtle"
                    onClick={props.onClose}
                  />
                </div>
              </Show>
            </div>
          </header>

          <div class={styles.drawerBody}>{props.children}</div>
        </div>
      </Portal>
    </Show>
  );
};
