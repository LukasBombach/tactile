import * as t from "@babel/types";
import { getInteractions } from "./getInteractions";

import type { Visitor } from "@babel/traverse";

export default function babelPlugin(): { name: string; visitor: Visitor } {
  return {
    name: "mark interactive elements plugin",
    visitor: {
      Program: {
        enter(path) {
          getInteractions(path).forEach(([el], index) => {
            const dataTactileId = t.jsxAttribute(t.jsxIdentifier("data-tactile-id"), t.stringLiteral(String(index)));
            el.pushContainer("attributes", dataTactileId);
          });
        },
      },
    },
  };
}
