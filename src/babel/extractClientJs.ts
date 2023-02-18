import { statement } from "@babel/template";

import type { Statement, Expression } from "@babel/types";
import type { Visitor, Node, NodePath } from "@babel/traverse";

function unique(value: unknown, index: number, self: unknown[]) {
  return self.indexOf(value) === index;
}

export default function babelPlugin(): { name: string; visitor: Visitor } {
  return {
    name: "extract client js plugin",
    visitor: {
      Program: {
        enter(path) {
          const events = getInteractiveComponents(path);

          if (events.length === 0) {
            path.node.body = [statement`export default {};`()];
            return;
          }

          const dependentCode = events
            .flatMap(([, handler]) => getReferencedStatements(handler))
            .filter(unique)
            .map(p => p.node);
          const addEventListeners = events.map(([event, handler], index) => {
            const selector = `'[data-hid="${index}"]'`;
            return statement`document.querySelector(${selector}).addEventListener("${event}", ${handler.toString()});`();
          });

          path.node.body = [...dependentCode, ...addEventListeners];
        },
      },
    },
  };
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

function getInteractiveComponents(path: NodePath<Node>): [event: string, handler: NodePath<Expression>][] {
  const events: [event: string, handler: NodePath<Expression>][] = [];

  path.traverse({
    JSXAttribute: path => {
      const identifier = path.get("name").node.name;
      const name = typeof identifier === "string" ? identifier : identifier.name;
      const eventName = getEventName(name);

      if (!eventName) return;

      const value = path.get("value");

      if (!value.isJSXExpressionContainer()) {
        throw new Error("x");
      }

      const expression = value.get("expression");

      if (expression.isExpression()) {
        events.push([eventName, expression]);
      }
    },
  });

  return events;
}

function getEventName(attrName: string): string | null {
  const match = attrName.match(/^on([A-Z].+)/);
  if (match === null || !match[1]) return null;
  return match[1].charAt(0).toLowerCase() + match[1].slice(1);
}
