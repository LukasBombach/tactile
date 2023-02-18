import { rollup } from "rollup";
import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import deepmerge from "deepmerge";
import ClientJsPlugin from "./babel/extractClientJs";

import type { RollupOptions, OutputOptions } from "rollup";

export async function bundle(entryFile: string, outputDir: string): Promise<void> {
  await createBundle({ input: entryFile }, { dir: outputDir });
}

export async function createBundle(inputOptions: RollupOptions, outputOptions: OutputOptions): Promise<void> {
  const input = deepmerge(
    {
      plugins: [
        resolve({
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        }),
        babel({
          babelHelpers: "bundled",
          extensions: [".js", ".jsx", ".ts", ".tsx"],
          presets: ["@babel/env", "@babel/preset-typescript", ["@babel/preset-react", { runtime: "automatic" }]],
        }),
      ],
      external: ["react", "react/jsx-runtime"],
    },
    inputOptions
  );

  const output: OutputOptions = deepmerge({ format: "cjs" }, outputOptions);

  const bundle = await rollup(input);
  await bundle.write(output);
  await bundle.close();
}
