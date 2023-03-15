import { renderServerHtml } from "./reactive_jsx";

import type { ReactElement } from "react";

/**
 * Auto cleanup
 */
if (typeof afterEach === "function") {
  afterEach(() => {
    document.head.innerHTML = "";
    document.body.innerHTML = "";
  });
}

export function render(ui: ReactElement) {
  const container = document.createElement("div");
  container.innerHTML = renderServerHtml(ui);

  document.body.append(container);

  return { container };
}
