import * as t from "@babel/types";
import { MARK_FOR_EXTRACTION } from "./mark";

import type { Node, NodePath } from "@babel/traverse";

export function markDependedOnCode(path: NodePath<Node>) {
  path.traverse({
    CallExpression: call => {
      MARK_FOR_EXTRACTION(call, true);

      call.get("arguments").forEach(argument => {
        if (argument.isJSXElement()) {
          markJsx(argument.get("openingElement").get("name"));
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
  if (!binding) return;
  console.log(String(binding.path));
}
