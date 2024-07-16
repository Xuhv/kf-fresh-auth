/**
* It is a very very basic implementation, which is not suitable for production use.
 * 
 * @module
 */

import { JWTPayload, SignJWT, jwtVerify, JWTVerifyResult } from "jose";
import { crypto } from "@std/crypto";

const secret = await crypto.subtle.generateKey({ name: "HMAC", hash: "SHA-256" }, true, ["sign", "verify"])

/** It uses a key generated in runtime */
export async function signToken(payload: JWTPayload): Promise<string> {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .sign(secret);
}

/** It uses a key generated in runtime */
export function verifyToken(token: string): Promise<JWTVerifyResult<JWTPayload>> {
    return jwtVerify(token, secret);
}

export type AccessToken = {
    accessToken: string;
    refreshToken: string;
    /** unit: seconds */
    expiresIn: number
};

/**
 * It is a very very basic implementation, which is not suitable for production use.
 */
export async function createAccessToken<Policy = unknown>(
    sub: string, policies: Policy[], expires = { access: 1800, fresh: 3600 * 24 }
): Promise<AccessToken> {
    const accessToken = await signToken({ sub, policies, jti: crypto.randomUUID(), exp: Math.floor(Date.now() / 1000) + expires.access });
    const refreshToken = await signToken({ sub, jti: crypto.randomUUID(), exp: Math.floor(Date.now() / 1000) + expires.fresh });
    return { accessToken, refreshToken, expiresIn: expires.access };
}

