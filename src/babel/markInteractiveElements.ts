import { getInteractions } from "./getInteractions";
import { unique, nonNullable, isJSXOpeningElement } from "./util";

import type { Visitor } from "@babel/traverse";

export default function babelPlugin(): { name: string; visitor: Visitor } {
  return {
    name: "mark interactive elements plugin",
    visitor: {
      Program: {
        enter(path) {
          const interactions = getInteractions(path);

          const elements = interactions
            .map(([, handler]) => handler.findParent(p => isJSXOpeningElement(p)))
            .filter(nonNullable)
            .filter(isJSXOpeningElement)
            .filter(unique);
        },
      },
    },
  };
}
