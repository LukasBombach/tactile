import chalk from "chalk";

import type { Node, NodePath } from "@babel/traverse";

export function logOutput(path: NodePath<Node>, keep: boolean) {
  const start = path.node.loc?.start.line;
  const code = preprendLineNumbers(String(path), start);

  if (keep) {
    console.log(chalk.green(code));
  } else {
    console.log(chalk.red(code));
  }
}

function preprendLineNumbers(code: string, start: number | undefined) {
  return code
    .split("\n")
    .map((line, index) => {
      const lineNum: string = start !== undefined ? String(start + index) : "";
      return `${lineNum.padStart(3, " ")} | ${line}`;
    })
    .join("\n");
}
