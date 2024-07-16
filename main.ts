import { App, MiddlewareFn, staticFiles } from "fresh";
import { defineHandler } from "./src/handlers.ts";
import { signToken, verifyToken } from "./src/jwt.ts";
import { mightFail } from "jsr:@might/fail";
import { getAuthInfo, createAuthMiddleware } from "./src/state.ts";

const authMiddleware = createAuthMiddleware<string, string>(async (ctx) => {
  const accessToken = ctx.req.headers.get("Authorization")?.slice(7);
  if (!accessToken) return undefined;

  const { error, result } = await mightFail(verifyToken(accessToken))
  return error ? undefined : { id: result.payload.sub!, policies: result.payload.policies as string[] };
});

export const app = new App();
app.use(staticFiles());
app.use(authMiddleware as MiddlewareFn<unknown>);

app.get("/tokens", async () => {
  return new Response(JSON.stringify({
    alice: await signToken({ sub: "Alice", policies: ["admin", "user"] }),
    bob: await signToken({ sub: "Bob", policies: ["user"] }),
  }))
})

app.get("/", defineHandler(() => {
  return new Response("Hello world!")
}) as MiddlewareFn<unknown>);

app.get("/user", defineHandler((ctx) => {
  return new Response(`Here is ${getAuthInfo(ctx)?.id}.`)
}, ["user"]) as MiddlewareFn<unknown>);

app.get("/admin", defineHandler(() => new Response("Hello admin!"), ["admin"]) as MiddlewareFn<unknown>);

if (import.meta.main) {
  await app.listen();
}
