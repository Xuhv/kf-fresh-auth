import { App, MiddlewareFn, staticFiles } from "fresh";
import { auth } from "./src/middleware.ts";
import { defineHandler } from "./src/handlers.ts";
import { createClaimsAgent } from "./src/claims.ts";

const users = [
  { name: "Alice", policies: ["admin", "user"] },
  { name: "Bob", policies: ["user"] },
];

// deno-lint-ignore require-await
const authMiddleware = auth<string>(async (ctx) => {
  const bearer = ctx.req.headers.get("Authorization")?.slice(7);
  if (!bearer) return undefined;

  return createClaimsAgent([["username", bearer], ["policies", users.find((u) => u.name === bearer)?.policies]]);
});

export const app = new App();
app.use(staticFiles());
app.use(authMiddleware as MiddlewareFn<unknown>);

app.get("/", defineHandler(() => new Response("Hello world!")) as MiddlewareFn<unknown>);

app.get(
  "/user",
  defineHandler((ctx) => new Response(`Hello ${ctx.state.claims?.get("username")}!`), ["user"]) as MiddlewareFn<
    unknown
  >,
);

app.get("/admin", defineHandler(() => new Response("Hello admin!"), ["admin"]) as MiddlewareFn<unknown>);

if (import.meta.main) {
  await app.listen();
}
