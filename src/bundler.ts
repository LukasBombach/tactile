import { rollup } from "rollup";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";
import outputManifest from "rollup-plugin-output-manifest";
import copy from "rollup-plugin-copy";
import { rimraf } from "rimraf";
import deepmerge from "deepmerge";
import extractClientJs from "./babel/extractClientJs";
import markInteractiveElements from "./babel/markInteractiveElements";

import type { RollupOptions, OutputOptions } from "rollup";
import type { PluginItem } from "@babel/core";

export async function bundle(appDir: string, outputDir: string): Promise<void> {
  await Promise.all([createServerBundle(appDir, outputDir), createClientBundle(appDir, outputDir)]);
}

export async function createServerBundle(appDir: string, outputDir: string): Promise<void> {
  // await rimraf(`${outputDir}/index.js`);
  await createBundle(appDir, { plugins: [] }, { file: `${outputDir}/index.js`, format: "cjs" }, [
    markInteractiveElements,
  ]);
}
export async function createClientBundle(appDir: string, outputDir: string): Promise<void> {
  // await rimraf(`${outputDir}/public`);
  await createBundle(
    appDir,
    {
      plugins: [
        outputManifest({ fileName: "manifest.json" }),
        copy({
          targets: [{ src: `${appDir}/public/*`, dest: `${outputDir}/public` }],
        }),
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
          presets: ["@babel/env", "@babel/preset-typescript", ["@babel/preset-react", { runtime: "automatic" }]],
          plugins: babelPlugins,
          exclude: "**/node_modules/**/*",
        }),
        {
          name: "remove empty",
          generateBundle: (_options, bundle) => {
            Object.keys(bundle).forEach(key => {
              if (Object.hasOwn(bundle, key) && bundle[key]?.code?.trim().length === 0) {
                delete bundle[key];
              }
            });
          },
        },
      ],
      external: ["react"],
    },
    inputOptions
  );

  const output: OutputOptions = deepmerge({}, outputOptions);

  const bundle = await rollup(input);
  await bundle.write(output);
  await bundle.close();
}
