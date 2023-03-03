import * as t from "@babel/types";
import { MARK_FOR_EXTRACTION } from "./mark";

import type { Node, NodePath } from "@babel/traverse";

export function markDependedOnCode(path: NodePath<Node>) {
  path.traverse({
    Identifier: identifier => {
      markIdentifier(identifier);
    },
    CallExpression: call => {
      MARK_FOR_EXTRACTION(call, true);

      call.get("arguments").forEach(argument => {
        if (argument.isJSXElement()) {
          markJsx(argument.get("openingElement").get("name"));
        } else if (argument.isIdentifier()) {
          markIdentifier(argument);
        } else {
          console.log("---", String(argument));
        }
      });
    },
  });
}

function markJsx(path: NodePath<t.JSXIdentifier | t.JSXMemberExpression | t.JSXNamespacedName>) {
  if (path.isJSXIdentifier()) {
    const binding = path.scope.getBinding(path.node.name);
    const statement = binding?.path.getStatementParent();
    if (!statement) return;
    MARK_FOR_EXTRACTION(statement, true);
    markDependedOnCode(statement);
  }

  if (path.isJSXMemberExpression()) {
    const obj = path.get("object");
    if (obj.isJSXIdentifier()) markIdentifier(obj.get("name"));
    if (obj.isJSXMemberExpression()) markJsx(obj);
  }

  if (path.isJSXNamespacedName()) markJsx(path.get("name"));
}

function markIdentifier(path: NodePath<t.Identifier>) {
  const binding = path.scope.getBinding(path.node.name);
  const statement = binding?.path.getStatementParent();
  if (!statement) return;
  MARK_FOR_EXTRACTION(statement, true);
}
