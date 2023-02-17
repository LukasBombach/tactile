import Koa from "koa";
const app = new Koa();

app.use(ctx => {
  ctx.body = "Hello Koa";
});

app.listen(3000);

console.log("server started at http://localhost:3000");
