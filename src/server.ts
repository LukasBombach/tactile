import Koa from "koa";
import { bundle } from "./bundler";

const server = new Koa();

server.use(async ctx => {
  try {
    ctx.body = await bundle("app/Home.tsx");
  } catch (error) {
    console.error(error);
    ctx.body = String(error);
  }
});

server.listen(3000);

console.log("server started at http://localhost:3000", "\n");
