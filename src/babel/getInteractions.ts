import type { Expression } from "@babel/types";
import type { Node, NodePath } from "@babel/traverse";

export function getInteractions(path: NodePath<Node>): [event: string, handler: NodePath<Expression>][] {
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
