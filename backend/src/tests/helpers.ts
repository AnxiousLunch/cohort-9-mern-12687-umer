import { request } from "chai-http";
import { Response } from "superagent";
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

export interface RegisterPayload {
    username: string;
    email: string;
    password: string;
}

export interface RegisterResponse {
    user: {
        id: number;
        username: string;
        email: string;
    };
    access_token: string;
}

const createdUserIds: number[] = [];

export async function registerRaw(payload: RegisterPayload): Promise<Response> {
    const res = await request.execute(app)
        .post("/api/auth/register")
        .send(payload);

    if (res.status === 201) {
        const body = res.body as RegisterResponse;
        createdUserIds.push(body.user.id);
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

    const body = res.body as RegisterResponse;
    return {
        id: body.user.id,
        username,
        email,
        password,
        accessToken: body.access_token,
        refreshCookie: res.headers["set-cookie"]?.[0],
    };
}

export async function cleanupCreatedUsers(): Promise<void> {
    for (const id of createdUserIds) {
        await prisma.refreshToken.deleteMany({ where: { userId: id } });
        await prisma.note.deleteMany({ where: { userId: id } });
        await prisma.user.delete({ where: { id } });
    }
    createdUserIds.length = 0;
}