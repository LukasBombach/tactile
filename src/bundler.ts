import { writeFile } from "node:fs/promises";
import { rollup } from "rollup";
import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";

export async function bundle(input: string, dist: string): Promise<void> {
  const bundle = await rollup({
    input,
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
  });
  const { output } = await bundle.generate({ format: "cjs" });
  await bundle.close();
  await writeFile(dist, output[0].code, "utf8");
}
