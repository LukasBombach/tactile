import chalk from "chalk";

import type { Node, NodePath } from "@babel/traverse";

const EXTRACT = "`EXTRACT_CLIENT_JS.extract`";

export function MARK_FOR_EXTRACTION(path: NodePath<Node>, log = false) {
  path.setData(EXTRACT, true);

  // if (log) {
  //   console.log(chalk.yellow(`${path.node.loc?.start.line} | ${path}`));
  // }
}

export function shouldExtract(path: NodePath<Node>): boolean {
  return path.getData(EXTRACT);
}
