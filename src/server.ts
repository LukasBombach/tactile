import { readFile } from "node:fs/promises";
import Koa from "koa";
import { bundle } from "./bundler";

const server = new Koa();

server.use(async ctx => {
  try {
    await bundle("app/index.tsx", "dist/app/index.js");
    ctx.body = await readFile("dist/app/index.js", "utf-8");
  } catch (error) {
    console.error(error);
    ctx.body = String(error);
  }
});

server.listen(3000);

console.log("server started at http://localhost:3000", "\n");
