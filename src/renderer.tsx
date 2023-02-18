// import { renderToString } from "react-dom/server";

export async function ssr(input: string): Promise<string> {
  const mod = await import(`../${input}`);
  return String(mod);
}
