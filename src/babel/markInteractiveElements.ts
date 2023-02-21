import { getInteractions } from "./getInteractions";

import type { Statement } from "@babel/types";
import type { Visitor, Node, NodePath } from "@babel/traverse";

export default function babelPlugin(): { name: string; visitor: Visitor } {
  return {
    name: "mark interactive elements plugin",
    visitor: {
      Program: {
        enter(path) {
          const interactions = getInteractions(path);

          const elements = interactions.forEach();
        },
      },
    },
  };
}
