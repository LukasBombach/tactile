import { rollup } from "rollup";
import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";

export async function bundle(input: string): Promise<string> {
  const bundle = await rollup({
    input,
    plugins: [
      resolve(),
      babel({
        babelHelpers: "bundled",
        extensions: [".js", ".jsx", ".ts", ".tsx"],
        presets: [
          "@babel/env",
          ["@babel/preset-typescript", { allExtensions: true, isTSX: true }],
          "@babel/preset-react",
        ],
      }),
    ],
  });
  const { output } = await bundle.generate({});
  await bundle.close();
  return output[0].code;
}
