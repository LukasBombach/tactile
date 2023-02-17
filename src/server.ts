import Koa from "koa";
const server = new Koa();

server.use(ctx => {
  ctx.body = "Hello Koa";
});

server.listen(3000);

console.log("server started at http://localhost:3000", "\n");
