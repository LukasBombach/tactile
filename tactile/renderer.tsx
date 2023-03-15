import React from "react";
import { renderToString } from "react-dom/server";

export async function ssr(input: string): Promise<string> {
  const App = await import(`../${input}`);
  return "<!DOCTYPE html>" + renderToString(<App.default />);
}
