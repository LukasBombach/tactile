import type { NodePath } from "@babel/traverse";
import type { Node, JSXOpeningElement } from "@babel/types";

export function unique(value: unknown, index: number, self: unknown[]) {
  return self.indexOf(value) === index;
}

export function nonNullable<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

export function isJSXOpeningElement(node: NodePath<Node>): node is NodePath<JSXOpeningElement> {
  return node.isJSXOpeningElement();
}
