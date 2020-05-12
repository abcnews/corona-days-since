import React from "react";
import styles from "./styles.scss";

export default ({ children, embed }) => {
  const cns = [styles.embed];
  if (embed === "right") cns.push(styles.right);
  if (embed === "full") cns.push(styles.full);
  return <aside className={cns.join(" ")}>{children}</aside>;
};
