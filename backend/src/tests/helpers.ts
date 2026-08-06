import { request } from "chai-http";
import prisma from "../../prisma/adapter.js";
import app from "../app.js";

let seq = 0;

function unique(prefix: string): string {
    seq += 1;
    return `${prefix}_${Date.now()}_${seq}`;
}

export interface TestUser {
    id: number;
    username: string;
    email: string;
    password: string;
    accessToken: string;
    refreshCookie: string | undefined;
}

const createdUserIds: number[] = [];

export async function registerRaw(payload: {
    username: string;
    email: string;
    password: string;
}) {
    const res = await request.execute(app).post("/api/auth/register").send(payload);

    if (res.status === 201) {
        createdUserIds.push(res.body.user.id);
    }

    return res;
}

export async function registerTestUser(prefix: string): Promise<TestUser> {
    const username = unique(`${prefix}user`);
    const email = `${unique(`${prefix}mail`)}@example.com`;
    const password = "Str0ngPassw0rd!";

    const res = await registerRaw({ username, email, password });

    if (res.status !== 201) {
        throw new Error(
            `registerTestUser failed with ${res.status}: ${JSON.stringify(res.body)}`
        );
    }

    return {
        id: res.body.user.id,
        username,
        email,
        password,
        accessToken: res.body.access_token,
        refreshCookie: res.headers["set-cookie"]?.[0],
    };
}

export async function cleanupCreatedUsers(): Promise<void> {
    for (const id of createdUserIds) {
        await prisma.refreshToken.deleteMany({ where: { userId: id } }).catch(() => {});
        await prisma.note.deleteMany({ where: { userId: id } }).catch(() => {});
        await prisma.user.delete({ where: { id } }).catch(() => {});
    }
    createdUserIds.length = 0;
}
