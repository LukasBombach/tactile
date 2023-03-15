import chalk from "chalk";

import type { Node, NodePath } from "@babel/traverse";

export function logOutput(path: NodePath<Node>, color: "green" | "red" | "blue") {
  const start = path.node.loc?.start.line;
  const code = preprendLineNumbers(String(path), start);

  console.log(chalk[color](code));
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
