# @kf/fresh-auth

Policies-based authentication for Fresh.

## usage

1. create a middleware to add user information to the context

```tsx
const users = [
    { name: "Alice", policies: ["admin", "user"] },
    { name: "Bob", policies: ["user"] },
];

const authMiddleware = auth<string>(async (ctx) => {
    const bearer = ctx.req.headers.get("Authorization")?.slice(7);
    if (!bearer) return undefined;

    // you can get user information from database or jwt
    return createClaimsAgent([["username", bearer], ["policies", users.find((u) => u.name === bearer)?.policies]]);
});
```

2. create a handler with policies

```ts
export const handler = defineHandler((ctx) => new Response(`Hello ${ctx.state.claims?.get("username")}!`), ["user"]);
```
