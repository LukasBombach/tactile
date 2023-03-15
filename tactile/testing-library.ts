import type { ReactElement } from "react";

export const screen = document.body;

export function render(ui: ReactElement) {
  console.log(ui);

  debugger;
}
