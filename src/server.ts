import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import Koa from "koa";
import { render } from "./renderer";

const server = new Koa();

server.use(async ctx => {
  try {
    const filePath = resolve("app/home.tsx");
    const contents = await readFile(filePath, { encoding: "utf8" });
    const result = await render(contents);
    ctx.body = result;
  } catch (error) {
    ctx.body = String(error);
  }
});

server.listen(3000);

console.log("server started at http://localhost:3000", "\n");
