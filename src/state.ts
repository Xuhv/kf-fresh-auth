import { FreshContext, MiddlewareFn } from "fresh";

export type AuthInfo<Policy = unknown, Id = unknown> = {
    id: Id;
    policies: Policy[];
}

export type State<Policy = unknown, Id = unknown> = { [key]: AuthInfo<Policy, Id> }

const key = Symbol("KF_AUTH_INFO");

export function setAuthInfo<Info extends AuthInfo>(ctx: FreshContext, info?: Info): void {
    (ctx as FreshContext<{ [key]?: Info }>).state[key] = info;
}

export function getAuthInfo<State extends AuthInfo>(ctx: FreshContext): State | undefined {
    return (ctx as FreshContext<{ [key]?: State }>).state[key];
}

/**
 * add information about the user to the context
 */
export function createAuthMiddleware<Policy = unknown, Id = unknown>(
    resolver: (ctx: FreshContext) => Promise<AuthInfo<Policy, Id> | undefined>,
): MiddlewareFn<State<Policy, Id>> {
    return async (ctx) => {
        setAuthInfo(ctx, await resolver(ctx));
        return ctx.next();
    };
}
