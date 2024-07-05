import { FreshContext, MiddlewareFn } from "fresh";
import { ClaimsAgent } from "./claims.ts";

export type AuthState<T = unknown> = { claims?: ClaimsAgent<T> };

/**
 * add information about the user to the context
 */
export function auth<Policy = unknown>(
    resolver: (ctx: FreshContext<AuthState<Policy>>) => Promise<ClaimsAgent<Policy> | undefined>,
): MiddlewareFn<AuthState<Policy>> {
    return async (ctx) => {
        ctx.state.claims = await resolver(ctx);
        return ctx.next();
    };
}
