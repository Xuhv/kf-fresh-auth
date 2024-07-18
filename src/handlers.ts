import { HandlerByMethod, HandlerFn, HttpError } from "fresh";
import { AuthInfo, getAuthInfo, State } from "./state.ts";

/**
 * Wrap a handler with authorization logic. If policies are provided, 
 * the handler will only be called if the user has at least one of the policies.
 * 
 * @param isApi if true, it will return 401/403 response, otherwise it will throw a {@link HttpError}
 */
export function defineHandler<
    Policy = unknown,
    Data = unknown,
    S extends State<Policy> = State<Policy>,
>(handler: HandlerFn<Data, S>, policies?: Policy[], isApi?: boolean): HandlerFn<Data, S> {
    return (ctx) => {
        if (!policies) return handler(ctx);
        const info = getAuthInfo<AuthInfo<Policy, unknown>>(ctx);

        if (isApi) {
            if (!info?.policies) return new Response("Unauthorized", { status: 401 });
            if (!policies.some(x => info.policies.includes(x))) return new Response("Forbidden", { status: 403 });
        }
        else {
            if (!info?.policies) throw new HttpError(401);
            if (!policies.some(x => info.policies.includes(x))) throw new HttpError(403);
        }

        return handler(ctx);
    };
}

/**
 * Wrap a handler with authorization logic. If policies are provided, 
 * the handler will only be called if the user has at least one of the policies.
 * 
 * @param isApi if true, it will return 401/403 response, otherwise it will throw a {@link HttpError}
 */
export function defineHandlerByMethod<Policy = unknown, Data = unknown, S extends State<Policy> = State<Policy>>(
    handlers: HandlerByMethod<Data, S>, policies?: Policy[], isApi?: boolean
): HandlerByMethod<Data, S> {
    const o = {} as HandlerByMethod<Data, S>;
    for (const [method, handler] of Object.entries(handlers)) o[method as keyof typeof o] = defineHandler(handler, policies, isApi);

    return o;
}
