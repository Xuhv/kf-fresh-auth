import { HandlerByMethod, HandlerFn } from "fresh";
import { AuthState } from "./middleware.ts";

/**
 * wrap a handler with authoization logic
 * @param handler
 * @param policies if policies are provided, the handler will only be called if the user has at least one of the policies
 * @returns
 */
export function defineHandler<
    Policy = unknown,
    Data = unknown,
    State extends AuthState<Policy> = AuthState<Policy>,
>(handler: HandlerFn<Data, State>, policies?: Policy[]): HandlerFn<Data, State> {
    return (ctx) => {
        if (!policies) return handler(ctx);
        if (!ctx.state.claims?.policies) return new Response("Unauthorized", { status: 401 });
        if (!policies.some(x => ctx.state.claims?.policies.includes(x))) return new Response("Forbidden", { status: 403 });
        return handler(ctx);
    };
}

/**
 * wrap a handler with authoization logic
 * @param handlers
 * @param policies if policies are provided, the handler will only be called if the user has at least one of the policies
 * @returns
 */
export function defineHandlerByMethod<
    Policy = unknown,
    Data = unknown,
    State extends AuthState<Policy> = AuthState<Policy>,
>(
    handlers: HandlerByMethod<Data, State>,
    policies?: Policy[],
): HandlerByMethod<Data, State> {
    const o = {} as HandlerByMethod<Data, State>;
    for (const [method, handler] of Object.entries(handlers)) {
        o[method as keyof typeof o] = defineHandler(handler, policies);
    }

    return o;
}
