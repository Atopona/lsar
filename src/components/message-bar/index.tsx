import type { ParentProps } from "solid-js";
import { AiFillInfoCircle } from "solid-icons/ai";

import * as styles from "./index.css";

const MessageBar = (props: ParentProps) => {
  return (
    <div class={styles.root}>
      <div class={styles.icon}>
        <AiFillInfoCircle />
      </div>
      <div class={styles.body}>{props.children}</div>
    </div>
  );
};

export default MessageBar;
