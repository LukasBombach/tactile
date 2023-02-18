import React from "react";
import { renderToString } from "react-dom/server";

export async function ssr(input: string): Promise<string> {
  const { default: Home } = await import(`../${input}`);
  return renderToString(<Home />);
}
