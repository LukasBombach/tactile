import { isJSXOpeningElement } from "./util";

import type { Expression, JSXOpeningElement } from "@babel/types";
import type { Node, NodePath } from "@babel/traverse";

type Interactions = [event: string, handler: NodePath<Expression>][];
type InteractionsByElement = [element: NodePath<JSXOpeningElement>, interactions: Interactions][];

export function getInteractions(path: NodePath<Node>): InteractionsByElement {
  const interactions: Interactions = [];

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
        interactions.push([eventName, expression]);
      }
    },
  });

  return groupByElement(interactions);
}

/**
 * todo the nested arrays will be a pain to work with
 * todo the code (specifically the naming) is terrible
 */
function groupByElement(interactions: Interactions): InteractionsByElement {
  const elements: InteractionsByElement = [];

  interactions.forEach(([event, handler]) => {
    const openingEl = handler.findParent(p => isJSXOpeningElement(p));

    if (!openingEl || !isJSXOpeningElement(openingEl)) {
      throw new Error("not gonna happen");
    }

    const record = elements.find(([el]) => openingEl === el);

    if (record) {
      const [, recordInteractions] = record;
      recordInteractions.push([event, handler]);
    } else {
      elements.push([openingEl, [[event, handler]]]);
    }
  });

  return elements;
}

function getEventName(attrName: string): string | null {
  const match = attrName.match(/^on([A-Z].+)/);
  if (match === null || !match[1]) return null;
  return match[1].charAt(0).toLowerCase() + match[1].slice(1);
}
