import chalk from "chalk";
import { bundle } from "./bundler";

const start = performance.now();
process.stdout.write("compiling... ");

bundle("app", "dist/app").then(() => {
  const stop = performance.now();
  const inSeconds = (stop - start) / 1000;
  const rounded = Number(inSeconds).toFixed(3);
  process.stdout.write(`done ${chalk.dim(`${rounded}ms`)}\n`);
});
