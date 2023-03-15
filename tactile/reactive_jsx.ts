import type { ReactElement, ReactNode } from "react";

export function renderServerHtml(element: ReactElement | null): string {
  if (element === null) {
    return "";
  }

  if (isJSXElementConstructor(element)) {
    return renderServerHtml(element.type(element.props));
  }

  return `<${element.type}>${renderChildrenToServerHtml(element.props.children)}</${element.type}>`;
}

function renderChildrenToServerHtml(children: ReactNode | undefined): string {
  if (Array.isArray(children)) return children.map(child => renderChildrenToServerHtml(child)).join("");
  if (typeof children === "string") return children;
  if (typeof children === "number") return children.toString();
  if (typeof children === "boolean") return children.toString();
  if (typeof children === "undefined") return "";
  return renderServerHtml(children);
}

function isJSXElementConstructor(
  element: ReactElement
): element is ReactElement<any, (props: any) => ReactElement<any, any> | null> {
  return typeof element.type === "function";
}
