// POST /api/login
// POST /api/logout
// POST /api/register


// Check both register and login with valid users
// Check both register and login with invalid users
// logout ensures removal of cookie for the user
// Ensure registeration is denied for duplicate username / emails
// Ensure input field constraints are enforced as per zod
// Ensure login rejects invalid input
// Ensure login enforces input field constraints 
// 


import * as chai from "chai";
import { expect } from "chai";
import { request, default as chaiHttp } from "chai-http";
import app from "../app.js";
import prisma from "../../prisma/adapter.js";
import { registerRaw, registerTestUser, cleanupCreatedUsers, type TestUser } from "./helpers.js";

chai.use(chaiHttp);

describe("Auth API", () => {
    before(async () => {
        if (process.env.NODE_ENV !== "test") {
            throw new Error("Tests must run with NODE_ENV=test");
        }
    });

    after(async () => {
        await cleanupCreatedUsers();
        await prisma.$disconnect();
    });

    describe("POST /api/auth/register", () => {
        const validUser = () => ({
            username: uniqueUsername("reg"),
            email: uniqueEmail("reg"),
            password: "Str0ngPassw0rd!",
        });

        it("should register a new user and return tokens + user object", async () => {
            const payload = validUser();
            const res = await registerRaw(payload);

            expect(res.status).to.equal(201);
            expect(res.body.success).to.be.true;
            expect(res.body.msg).to.equal("User registered successfully");
            expect(res.body.access_token).to.be.a("string");
            expect(res.body.user).to.deep.include({
                username: payload.username,
                email: payload.email,
            });
            expect(res.body.user.id).to.be.a("number");

            expect(res.headers["set-cookie"]).to.exist;
            const cookie = res.headers["set-cookie"]![0];
            expect(cookie).to.include("refreshToken=");
            expect(cookie).to.include("HttpOnly");
            expect(cookie).to.include("SameSite=Strict");
            if (process.env.NODE_ENV === "production") {
                expect(cookie).to.include("Secure");
            }
        });

        it("should return 409 if username already exists", async () => {
            const user = validUser();
            await registerRaw(user);

            const res = await registerRaw({
                ...user,
                email: uniqueEmail("reg"),
            });

            expect(res.status).to.equal(409);
            expect(res.body.msg).to.equal("Invalid Credentials!");
        });

        it("should return 409 if email already exists", async () => {
            const user = validUser();
            await registerRaw(user);

            const res = await registerRaw({
                ...user,
                username: uniqueUsername("reg"),
            });

            expect(res.status).to.equal(409);
            expect(res.body.msg).to.equal("Invalid Credentials!");
        });

        it("should return 400 for missing required fields", async () => {
            const res = await request
                .execute(app)
                .post("/api/auth/register")
                .send({});

            expect(res.status).to.equal(400);
            expect(res.body.success).to.be.false;
            expect(res.body.error.message).to.equal("Validation failed");
            expect(res.body.error.issues).to.be.an("array");
        });

        it("should return 400 for invalid email format", async () => {
            const res = await request
                .execute(app)
                .post("/api/auth/register")
                .send({ ...validUser(), email: "notanemail" });

            expect(res.status).to.equal(400);
            expect(res.body.error.message).to.equal("Validation failed");
        });

        it("should return 400 for username shorter than 3 characters", async () => {
            const res = await request
                .execute(app)
                .post("/api/auth/register")
                .send({ ...validUser(), username: "ab" });

            expect(res.status).to.equal(400);
        });

        it("should return 400 for password shorter than 8 characters", async () => {
            const res = await request
                .execute(app)
                .post("/api/auth/register")
                .send({ ...validUser(), password: "short" });

            expect(res.status).to.equal(400);
        });

        it("should return 400 for password longer than 72 UTF-8 bytes", async () => {
            const res = await request
                .execute(app)
                .post("/api/auth/register")
                .send({ ...validUser(), password: "a".repeat(73) });

            expect(res.status).to.equal(400);
        });
    });

    describe("POST /api/auth/login", () => {
        let testUser: TestUser;

        beforeEach(async () => {
            testUser = await registerTestUser("login");
        });

        it("should login with username and return tokens + user", async () => {
            const res = await request.execute(app).post("/api/auth/login").send({
                identifier: testUser.username,
                password: testUser.password,
            });

            expect(res.status).to.equal(200);
            expect(res.body.msg).to.equal("Logged in successfully");
            expect(res.body.access_token).to.be.a("string");
            expect(res.body.user).to.deep.include({
                username: testUser.username,
                email: testUser.email,
            });
            expect(res.body.user.user_id).to.be.a("number");
            expect(res.headers["set-cookie"]).to.exist;
        });

        it("should login with email", async () => {
            const res = await request.execute(app).post("/api/auth/login").send({
                identifier: testUser.email,
                password: testUser.password,
            });

            expect(res.status).to.equal(200);
            expect(res.body.user.email).to.equal(testUser.email);
        });

        it("should return 401 if user not found (unknown username)", async () => {
            const res = await request.execute(app).post("/api/auth/login").send({
                identifier: "nonexistentuser",
                password: testUser.password,
            });

            expect(res.status).to.equal(401);
            expect(res.body.msg).to.equal("Invalid Credentials!");
        });

        it("should return 401 if user not found (unknown email)", async () => {
            const res = await request.execute(app).post("/api/auth/login").send({
                identifier: "no@user.com",
                password: testUser.password,
            });

            expect(res.status).to.equal(401);
        });

        it("should return 401 for invalid password", async () => {
            const res = await request.execute(app).post("/api/auth/login").send({
                identifier: testUser.username,
                password: "WrongPassw0rd!",
            });

            expect(res.status).to.equal(401);
            expect(res.body.msg).to.equal("Invalid Credentials!");
        });

        it("should return 400 for missing identifier/password", async () => {
            const res = await request.execute(app).post("/api/auth/login").send({});

            expect(res.status).to.equal(400);
            expect(res.body.error.message).to.equal("Validation failed");
        });

        it("should return 400 for password shorter than 8 characters", async () => {
            const res = await request.execute(app).post("/api/auth/login").send({
                identifier: testUser.username,
                password: "short",
            });

            expect(res.status).to.equal(400);
        });
    });

    describe("POST /api/auth/logout", () => {
        it("should return success when logging out without a refresh token", async () => {
            const res = await request.execute(app).post("/api/auth/logout");

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
            expect(res.body.msg).to.equal("Logged out successfully.");
        });

        it("should clear the refresh token cookie when logging out", async () => {
            const user = await registerTestUser("logout");

            const res = await request
                .execute(app)
                .post("/api/auth/logout")
                .set("Cookie", user.refreshCookie!);

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
            expect(res.headers["set-cookie"]).to.exist;
        });
    });
});

function uniqueUsername(prefix: string): string {
    return `u${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function uniqueEmail(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}@example.com`;
}
