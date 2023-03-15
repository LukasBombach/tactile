import { renderServerHtml } from "./reactive_jsx";

import type { ReactElement } from "react";

export const screen = document.body;

export function render(ui: ReactElement) {
  renderServerHtml(ui);
}
