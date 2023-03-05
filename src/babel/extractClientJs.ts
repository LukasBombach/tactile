import * as t from "@babel/types";
import { logOutput } from "./debug";

import type { Visitor, Node, NodePath } from "@babel/traverse";

const EXTRACT_CLIENT_JS = "EXTRACT_CLIENT_JS";

export default function babelPlugin(): { name: string; visitor: Visitor } {
  return {
    name: "extract client js plugin",
    visitor: {
      Program: {
        enter(path) {
          markEventHandlers(path);
          markEscapeHatches(path);

          path.traverse({
            Standardized: path => {
              if (shouldExtract(path)) {
                logOutput(path, "green");
                path.skip();
              }
              if (!shouldExtract(path)) {
                logOutput(path, "red");
                path.skip();
                path.remove();
              }
            },
          });
        },
      },
    },
  };
}

function markEscapeHatches(path: NodePath<Node>) {
  path.traverse({
    IfStatement: path => {
      if (checksIfCodeIsExecutedInABrowser(path)) {
        markAndFollowDependedOnCode(path);
      }
    },
  });
}

/**
 * Matches JSX Attributes that begin with on[A-Z] and have an expression
 * container as attribute
 *
 * fi. `onClick={() => console.log("")}`
 *     `onHover={myHandler}`
 */
function markEventHandlers(path: NodePath<Node>) {
  path.traverse({
    JSXAttribute: path => {
      const name = path.get("name");
      const value = path.get("value");

      if (name.isJSXIdentifier() && name.node.name.match(/^(?!on[A-Z]).+/)) return;
      if (name.isJSXNamespacedName() && name.node.name.name.match(/^(?!on[A-Z]).+/)) return;
      if (!value.isJSXExpressionContainer()) return;

      const expression = value.get("expression");
      if (expression.isJSXEmptyExpression()) return;

      markAndFollowDependedOnCode(expression);
    },
  });
}

/**
 * Matches if-statements testing for a browser environment
 *
 * eg. `if (typeof window !== "undefined") {}`
 *
 * todo think of and match other ways to tests code is executed in a browser
 */
function checksIfCodeIsExecutedInABrowser(path: NodePath<t.IfStatement>) {
  const test = path.get("test");
  if (test.isBinaryExpression()) {
    const comparison = [test.get("left"), test.get("right")];
    const unqueal = comparesUnequality(test);
    const win = comparison.some(isTypeofWindow);
    const undef = comparison.some(isStrUndefined);
    return unqueal && win && undef;
  }
}

function markAndFollowDependedOnCode(path: NodePath<Node>) {
  markForExtraction(path);
  markDependedOnCode(path);
}

function markForExtraction(path: NodePath<Node>) {
  path.setData(EXTRACT_CLIENT_JS, true);
}

function shouldExtract(path: NodePath<Node>): boolean {
  return path.getData(EXTRACT_CLIENT_JS);
}

/**
 * Cheks if a comparion uses one of the operators `!=` or `!==`
 */
const comparesUnequality = (path: NodePath<t.BinaryExpression>) => ["!=", "!=="].includes(path.node.operator);

/**
 * Checks if code matches `typeof window`
 * todo check for possible reassignments of the window object
 */
const isTypeofWindow = (path: NodePath<Node>): boolean =>
  path.isUnaryExpression({ operator: "typeof" }) && path.get("argument").isIdentifier({ name: "window" });

/**
 * Check is code matches the string `"undefined"`
 * todo resolve identifiers
 */
const isStrUndefined = (path: NodePath<Node>): boolean => path.isStringLiteral({ value: "undefined" });

export function markDependedOnCode(path: NodePath<Node>) {
  path.traverse({
    Identifier: identifier => {
      markIdentifier(identifier);
    },
    CallExpression: call => {
      markForExtraction(call);

      call.get("arguments").forEach(argument => {
        if (argument.isJSXElement()) {
          markJsx(argument.get("openingElement").get("name"));
        } else if (argument.isIdentifier()) {
          markIdentifier(argument);
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
    markForExtraction(statement);
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
  markForExtraction(statement);
}

// function getReferencedStatements(path: NodePath<Node>): NodePath<Statement>[] {
//   const statements: NodePath<Statement>[] = [];
//
//   if (path.isIdentifier()) {
//     (() => {
//       const name = path.node.name;
//       const binding = path.scope.getBinding(name);
//       if (!binding) return;
//       const statement = binding.path.getStatementParent();
//       if (statement === null) return;
//       if (statements.includes(statement)) return;
//       statements.push(statement);
//     })();
//   }
//
//   path.traverse({
//     Identifier: identifier => {
//       const name = identifier.node.name;
//       const binding = path.scope.getBinding(name);
//       if (!binding) return;
//       const statement = binding.path.getStatementParent();
//       if (statement === null) return;
//       if (statement === path) return;
//       if (statements.includes(statement)) return;
//       statements.push(statement);
//     },
//   });
//
//   const recursivelyFoundStatements = statements
//     .flatMap(statement => getReferencedStatements(statement))
//     .filter(s => s !== path && !statements.includes(s));
//
//   return [...statements, ...recursivelyFoundStatements].sort((a, b) => {
//     if (typeof a.node.start !== "number" || typeof b.node.start !== "number") {
//       throw new Error("missing start in statement");
//     }
//     return a.node.start < b.node.start ? -1 : 1;
//   });
// }
