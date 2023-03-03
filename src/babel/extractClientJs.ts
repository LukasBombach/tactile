import chalk from "chalk";
import { statement } from "@babel/template";
import { getInteractions } from "./getInteractions";
import { getWindowCode } from "./getWindowCode";
import { markDependedOnCode } from "./markDependedOnCode";
import { MARK_FOR_EXTRACTION, shouldExtract } from "./mark";
import { logOutput } from "./debug";
import { unique } from "./util";

import type { Statement } from "@babel/types";
import type { Visitor, Node, NodePath } from "@babel/traverse";

export default function babelPlugin(): { name: string; visitor: Visitor } {
  return {
    name: "extract client js plugin",
    visitor: {
      Program: {
        enter(path) {
          console.log();
          markEventHandlers(path);

          const ifStatements = getWindowCode(path);

          // console.log(ifStatements.map(String));
          ifStatements.forEach(path => markDependedOnCode(path));

          path.traverse({
            Standardized: path => {
              if (shouldExtract(path)) {
                logOutput(path, true);
                path.skip();
              }
              if (!shouldExtract(path)) {
                logOutput(path, false);
                path.skip();
                path.remove();
              }
            },
          });

          // const interactions = getInteractions(path);

          // if (interactions.length === 0) {
          //   path.node.body = [statement`export {};`()];
          //   return;
          // }

          // const dependentCode = interactions
          //   .flatMap(([, interaction]) => interaction)
          //   .flatMap(([, handler]) => getReferencedStatements(handler))
          //   .filter(unique)
          //   .map(p => p.node);

          // const addEventListeners = interactions.flatMap(([, interactions], index) => {
          //   return interactions.map(([event, handler]) => {
          //     const selector = `'[data-tactile-id="${index}"]'`;
          //     return statement`document.querySelector(${selector}).addEventListener("${event}", ${handler.toString()});`();
          //   });
          // });

          // path.node.body = [...dependentCode, ...addEventListeners];
        },
      },
    },
  };
}

function markEventHandlers(path: NodePath<Node>) {
  path.traverse({
    JSXAttribute: path => {
      const identifier = path.get("name").node.name;
      const name = typeof identifier === "string" ? identifier : identifier.name;

      if (!name.match(/^on([A-Z].+)/)) return;

      const value = path.get("value");

      if (!value.isJSXExpressionContainer()) {
        throw new Error("x");
      }

      const expression = value.get("expression");
      console.log("expression", String(expression));

      if (expression.isExpression()) {
        MARK_FOR_EXTRACTION(expression);
        markDependedOnCode(expression);
      }
    },
  });
}

function getReferencedStatements(path: NodePath<Node>): NodePath<Statement>[] {
  const statements: NodePath<Statement>[] = [];

  if (path.isIdentifier()) {
    (() => {
      const name = path.node.name;
      const binding = path.scope.getBinding(name);
      if (!binding) return;
      const statement = binding.path.getStatementParent();
      if (statement === null) return;
      if (statements.includes(statement)) return;
      statements.push(statement);
    })();
  }

  path.traverse({
    Identifier: identifier => {
      const name = identifier.node.name;
      const binding = path.scope.getBinding(name);
      if (!binding) return;
      const statement = binding.path.getStatementParent();
      if (statement === null) return;
      if (statement === path) return;
      if (statements.includes(statement)) return;
      statements.push(statement);
    },
  });

  const recursivelyFoundStatements = statements
    .flatMap(statement => getReferencedStatements(statement))
    .filter(s => s !== path && !statements.includes(s));

  return [...statements, ...recursivelyFoundStatements].sort((a, b) => {
    if (typeof a.node.start !== "number" || typeof b.node.start !== "number") {
      throw new Error("missing start in statement");
    }
    return a.node.start < b.node.start ? -1 : 1;
  });
}
