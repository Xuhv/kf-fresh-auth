/**
 * Hash and verify passwords with crypto api and SHA-256 algorithm
 * 
 * @module
 */

import { assert } from "jsr:@std/assert@^0.226.0";

export async function hashPassword(password: string): Promise<string> {
    return new TextDecoder().decode(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(password)))
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return await hashPassword(password) === hash;
}

Deno.test("password", async () => {
    const password = "password";
    const hash = await hashPassword(password);
    assert(await verifyPassword(password, hash));
});
