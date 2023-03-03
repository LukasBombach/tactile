import * as t from "@babel/types";
import { MARK_FOR_EXTRACTION } from "./mark";

import type { Node, NodePath } from "@babel/traverse";

export function getWindowCode(path: NodePath<Node>): NodePath<t.IfStatement>[] {
  const ifStatements: NodePath<t.IfStatement>[] = [];
  path.traverse({
    IfStatement: path => {
      if (checksIfWindowExists(path.get("test"))) {
        MARK_FOR_EXTRACTION(path, true);
        ifStatements.push(path);
      }
    },
  });
  return ifStatements;
}

function checksIfWindowExists(test: NodePath<t.Expression>) {
  if (test.isBinaryExpression()) {
    const comparison = [test.get("left"), test.get("right")];
    const unqueal = comparesUnequality(test);
    const win = comparison.some(isTypeofWindow);
    const undef = comparison.some(isStrUndefined);
    return unqueal && win && undef;
  }
}

const comparesUnequality = (path: NodePath<t.BinaryExpression>) => ["!=", "!=="].includes(path.node.operator);

// todo possible reassignments of window
const isTypeofWindow = (path: NodePath<Node>): boolean =>
  path.isUnaryExpression({ operator: "typeof" }) && path.get("argument").isIdentifier({ name: "window" });

//todo resolve identifiers
const isStrUndefined = (path: NodePath<Node>): boolean => path.isStringLiteral({ value: "undefined" });
