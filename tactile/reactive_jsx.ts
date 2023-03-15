import type { ReactElement, JSXElementConstructor } from "react";

export async function renderServerHtml(element: ReactElement): Promise<string> {
  if (isJSXElementConstructor(element)) {
    console.log(element.type(element.props));
  }
  return "";
}

function isJSXElementConstructor(
  element: ReactElement
): element is ReactElement<any, (props: any) => ReactElement<any, any> | null> {
  return typeof element.type === "function";
}
