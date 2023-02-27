import { bundle } from "./bundler";

bundle("app", "dist/app").then(() => {
  console.log("✅", "done", "\n");
});
