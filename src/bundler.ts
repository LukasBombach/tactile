import { rollup } from "rollup";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";
import outputManifest from "rollup-plugin-output-manifest";
import copy from "rollup-plugin-copy";

import deepmerge from "deepmerge";
import extractClientJs from "./babel/extractClientJs";
import markInteractiveElements from "./babel/markInteractiveElements";

import type { Plugin, RollupOptions, OutputOptions, OutputAsset, OutputChunk } from "rollup";
import type { PluginItem } from "@babel/core";

export async function bundle(appDir: string, outputDir: string): Promise<void> {
  await Promise.all([createServerBundle(appDir, outputDir), createClientBundle(appDir, outputDir)]);
}

export async function createServerBundle(appDir: string, outputDir: string): Promise<void> {
  await createBundle(appDir, { plugins: [] }, { file: `${outputDir}/index.js`, format: "cjs" }, [
    markInteractiveElements,
  ]);
}
export async function createClientBundle(appDir: string, outputDir: string): Promise<void> {
  await createBundle(
    appDir,
    {
      plugins: [
        copy({ targets: [{ src: `${appDir}/public/*`, dest: `${outputDir}/public` }] }),
        outputManifest({ fileName: "manifest.json" }),
      ],
    },
    { file: `${outputDir}/public/app/index.js`, format: "es" },
    [extractClientJs]
  );
}

export async function createBundle(
  appDir: string,
  inputOptions: RollupOptions,
  outputOptions: OutputOptions,
  babelPlugins?: PluginItem[]
): Promise<void> {
  const input = deepmerge<RollupOptions>(
    {
      input: `${appDir}/index.tsx`,
      plugins: [
        resolve({
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        }),
        commonjs(),
        babel({
          babelHelpers: "bundled",
          skipPreflightCheck: true,
          extensions: [".js", ".jsx", ".ts", ".tsx"],
          presets: [
            [
              "@babel/env",
              {
                targets: "since 2022",
              },
            ],
            "@babel/preset-typescript",
            ["@babel/preset-react", { runtime: "automatic" }],
          ],
          plugins: babelPlugins,
          exclude: "**/node_modules/**/*",
        }),
        removeEmptyOutputs(),
      ],
      external: ["react", "react-dom"],
    },
    inputOptions
  );

  const output: OutputOptions = deepmerge({}, outputOptions);

  const bundle = await rollup(input);
  await bundle.write(output);
  await bundle.close();
}

function removeEmptyOutputs(): Plugin {
  return {
    name: "rm empty outputs",
    generateBundle: (_, bundle) => {
      Object.entries(bundle)
        .filter(([, value]) => isOutputChunk(value) && codeIsEmpty(value))
        .forEach(([key]) => delete bundle[key]);
    },
  };
}

function isOutputChunk(output: OutputAsset | OutputChunk | undefined): output is OutputChunk {
  return !!output && "code" in output;
}

function codeIsEmpty(output: OutputChunk): boolean {
  return output.code.trim().length === 0;
}
