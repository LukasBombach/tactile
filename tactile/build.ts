import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import chalk from "chalk";
import { bundle } from "./bundler";

const rl = readline.createInterface({ input, output });

function clearConsole() {
  process.stdout.write("\x1Bc\n");
}

function getDuration(start: number, stop: number) {
  return Number((stop - start) / 1000).toFixed(3);
}

async function build() {
  const start = performance.now();
  await bundle("app", "dist/app");
  const stop = performance.now();

  const duration = getDuration(start, stop);
  const msg = `\ndone ${chalk.dim(`${duration}ms`)}\n`;

  const input = await rl.question(msg);

  console.log("input was", JSON.stringify(input));

  if (input === "q") {
    process.exit(0);
  }
}

clearConsole();
build();
