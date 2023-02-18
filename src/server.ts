import Koa from "koa";
import { bundle } from "./bundler";
import { ssr } from "./renderer";

const server = new Koa();

server.use(async ctx => {
  try {
    await bundle("app/index.tsx", "dist/app");
    ctx.body = await ssr("dist/app/index.js");
  } catch (error) {
    console.error(error);
    ctx.body = String(error);
  }
});

server.listen(3000);

console.log("server started at http://localhost:3000", "\n");
