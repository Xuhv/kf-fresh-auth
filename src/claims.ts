/**
 * a key-value pair providing some information about the user
 */
export type Claim = [key: string, value: unknown];

/**
 * It will be used as `ctx.state.claims`.
 * You can use {@link createClaimsAgent} or implement it by yourself.
 */
export type ClaimsAgent<Policy = unknown> = {
    /**
     * all information about the user
     */
    readonly claims: Claim[];
    get<T>(key: string): T | undefined;
    /**
     * used for policy-based authorization
     */
    readonly policies: Policy[];
};

/**
 * default implementation of {@link ClaimsAgent}
 */
export function createClaimsAgent<Policy = unknown>(claims: Claim[]): ClaimsAgent<Policy> {
    function get<T>(key: string) {
        return claims.find(([k]) => k === key)?.[1] as T | undefined;
    }
    const policies = get<Policy[]>("policies") || [];
    return {
        claims,
        get,
        get policies() {
            return policies;
        },
    };
}
