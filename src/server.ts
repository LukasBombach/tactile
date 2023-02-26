import Koa from "koa";
import Router from "koa-router";
import mount from "koa-mount";
import serve from "koa-static";
import { bundle } from "./bundler";
import { ssr } from "./renderer";

const server = new Koa();
const router = new Router();

router.get("/", async ctx => {
  try {
    ctx.body = await ssr("dist/app/index.js");
  } catch (error) {
    console.error("\n", error);

    ctx.body = String(error);

    if (error instanceof Error) {
      ctx.body += `\n\n${error.stack}`;
    }
  }
});

server.use(mount("/public", serve("dist/app/public")));

server.use(router.routes());

bundle("app/index.tsx", "dist/app").then(() => {
  server.listen(3000);
  console.log("server started at http://localhost:3000", "\n");
});
