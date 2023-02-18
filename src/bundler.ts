import { rollup } from "rollup";
import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import deepmerge from "deepmerge";
import clientJsPlugin from "./babel/extractClientJs";

import type { RollupOptions, OutputOptions } from "rollup";
import type { PluginItem } from "@babel/core";

export async function bundle(entryFile: string, outputDir: string): Promise<void> {
  await Promise.all([createServerBundle(entryFile, outputDir), createClientBundle(entryFile, outputDir)]);
}

export async function createServerBundle(entryFile: string, outputDir: string): Promise<void> {
  await createBundle({ input: entryFile }, { file: `${outputDir}/index_server.js` });
}
export async function createClientBundle(entryFile: string, outputDir: string): Promise<void> {
  await createBundle(
    {
      input: entryFile,
      plugins: [
        {
          name: "source logger",
          transform: (source, id) => {
            console.log("--", id, "--");
            console.log(source);
            return source;
          },
        },
      ],
    },
    { file: `${outputDir}/index_client.js` },
    [clientJsPlugin]
  );
}

export async function createBundle(
  inputOptions: RollupOptions,
  outputOptions: OutputOptions,
  babelPlugins?: PluginItem[]
): Promise<void> {
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
          plugins: babelPlugins,
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
