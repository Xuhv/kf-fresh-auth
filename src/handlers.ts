import { HandlerByMethod, HandlerFn } from "fresh";
import { AuthInfo, getAuthInfo, State } from "./state.ts";

/**
 * Wrap a handler with authorization logic. If policies are provided, 
 * the handler will only be called if the user has at least one of the policies.
 */
export function defineHandler<
    Policy = unknown,
    Data = unknown,
    S extends State<Policy> = State<Policy>,
>(handler: HandlerFn<Data, S>, policies?: Policy[]): HandlerFn<Data, S> {
    return (ctx) => {
        if (!policies) return handler(ctx);
        const info = getAuthInfo<AuthInfo<Policy, unknown>>(ctx);

        if (!info?.policies) return new Response("Unauthorized", { status: 401 });
        if (!policies.some(x => info.policies.includes(x))) return new Response("Forbidden", { status: 403 });
        return handler(ctx);
    };
}

/**
 * Wrap a handler with authorization logic. If policies are provided, 
 * the handler will only be called if the user has at least one of the policies.
 */
export function defineHandlerByMethod<Policy = unknown, Data = unknown, S extends State<Policy> = State<Policy>>(
    handlers: HandlerByMethod<Data, S>, policies?: Policy[],
): HandlerByMethod<Data, S> {
    const o = {} as HandlerByMethod<Data, S>;
    for (const [method, handler] of Object.entries(handlers)) o[method as keyof typeof o] = defineHandler(handler, policies);

    return o;
}
