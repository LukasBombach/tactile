import { rollup } from "rollup";

export async function bundle(input: string): Promise<string> {
  const bundle = await rollup({ input });
  const { output } = await bundle.generate({ dir: "dist/app", file: "bundle.js", format: "es" });
  await bundle.close();
  return output[0].code;
}
