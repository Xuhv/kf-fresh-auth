import { assert } from "jsr:@std/assert";

const api1 = "http://localhost:8000";
const api2 = "http://localhost:8000/user";
const api3 = "http://localhost:8000/admin";

const { alice, bob } = await fetch("http://localhost:8000/tokens").then((r) => r.json())

Deno.test("annonymous", async () => {
    const response1 = await fetch(api1);
    assert(response1.status === 200);

    const response2 = await fetch(api2);
    assert(response2.status === 401);

    const response3 = await fetch(api3);
    assert(response3.status === 401);

    await response1.body?.cancel();
    await response2.body?.cancel();
    await response3.body?.cancel();
});

Deno.test("alice", async () => {
    const headers = new Headers();
    headers.set("Authorization", "Bearer " + alice);

    const response1 = await fetch(api1, { headers });
    assert(response1.status === 200);

    const response2 = await fetch(api2, { headers });
    assert(response2.status === 200);

    const response3 = await fetch(api3, { headers });
    assert(response3.status === 200);

    await response1.body?.cancel();
    await response2.body?.cancel();
    await response3.body?.cancel();
});

Deno.test("bob", async () => {
    const headers = new Headers();
    headers.set("Authorization", "Bearer " + bob);

    const response1 = await fetch(api1, { headers });
    assert(response1.status === 200);

    const response2 = await fetch(api2, { headers });
    assert(response2.status === 200);

    const response3 = await fetch(api3, { headers });
    assert(response3.status === 403);

    await response1.body?.cancel();
    await response2.body?.cancel();
    await response3.body?.cancel();
});
