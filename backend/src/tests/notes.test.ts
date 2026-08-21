import * as chai from "chai";
import { expect } from "chai";
import { request, default as chaiHttp } from "chai-http";
import jwt from "jsonwebtoken";
import app from "../app.js";
import prisma from "../../prisma/adapter.js";
import { registerTestUser, cleanupCreatedUsers, type TestUser } from "./helpers.js";

chai.use(chaiHttp);

describe("Notes API", () => {
    let user: TestUser;
    let authHeader: string;

    before(async () => {
        if (process.env.NODE_ENV !== "test") {
            throw new Error("Tests must run with NODE_ENV=test");
        }
        user = await registerTestUser("note");
        authHeader = `Bearer ${user.accessToken}`;
    });

    afterEach(async () => {
        await prisma.note.deleteMany({ where: { userId: user.id } });
    });

    after(async () => {
        try {
        await cleanupCreatedUsers();
    } finally {
        await prisma.$disconnect();
    }
    });

    async function createNote(body: Record<string, unknown> = { title: "Test note", content: "Test content" }) {
        return request
            .execute(app)
            .post("/api/notes")
            .set("Authorization", authHeader)
            .send(body);
    }

    describe("authentication", () => {
        it("should return 401 when no token is provided", async () => {
            const res = await request.execute(app).get("/api/notes");

            expect(res.status).to.equal(401);
            expect(res.body.success).to.be.false;
            expect(res.body.error.message).to.equal("Authentication Required!");
        });

        it("should return 401 for a malformed token", async () => {
            const res = await request
                .execute(app)
                .get("/api/notes")
                .set("Authorization", "Bearer not-a-real-token");

            expect(res.status).to.equal(401);
            expect(res.body.error.message).to.equal("Invalid token.");
        });

        it("should return 401 for a token signed with the wrong secret", async () => {
            const token = jwt.sign(
                { userId: user.id, username: user.username },
                "wrong-secret"
            );

            const res = await request
                .execute(app)
                .get("/api/notes")
                .set("Authorization", `Bearer ${token}`);

            expect(res.status).to.equal(401);
            expect(res.body.error.message).to.equal("Invalid token.");
        });

        it("should return 401 for an expired token", async () => {
            const token = jwt.sign(
                { userId: user.id, username: user.username },
                process.env.ACCESS_SECRET!,
                { expiresIn: -60 }
            );

            const res = await request
                .execute(app)
                .get("/api/notes")
                .set("Authorization", `Bearer ${token}`);

            expect(res.status).to.equal(401);
            expect(res.body.error.message).to.equal("Token expired.");
        });
    });

    describe("POST /api/notes", () => {
        it("should create a note and return it", async () => {
            const res = await createNote({ title: "My first note", content: "Hello world" });

            expect(res.status).to.equal(201);
            expect(res.body.success).to.be.true;
            expect(res.body.message).to.equal("Note created");
            expect(res.body.note).to.deep.include({
                title: "My first note",
                content: "Hello world",
            });
            expect(res.body.note.id).to.be.a("number");
            expect(res.body.note.userId).to.equal(user.id);
        });

        it("should return 400 when title is missing", async () => {
            const res = await createNote({ content: "Only content" });

            expect(res.status).to.equal(400);
            expect(res.body.error.message).to.equal("Validation failed");
        });

        it("should return 400 when title is empty or whitespace only", async () => {
            const res = await createNote({ title: "   ", content: "Body" });

            expect(res.status).to.equal(400);
        });

        it("should return 400 when title exceeds 255 characters", async () => {
            const res = await createNote({ title: "a".repeat(256), content: "Body" });

            expect(res.status).to.equal(400);
        });

        it("should return 400 when content is missing", async () => {
            const res = await createNote({ title: "No content" });

            expect(res.status).to.equal(400);
        });

        it("should return 400 when content is not a string", async () => {
            const res = await createNote({ title: "Bad content", content: 42 });

            expect(res.status).to.equal(400);
        });
    });

    describe("GET /api/notes", () => {
        it("should return an empty list when the user has no notes", async () => {
            const res = await request
                .execute(app)
                .get("/api/notes")
                .set("Authorization", authHeader);

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
            expect(res.body.notes).to.be.an("array").that.is.empty;
        });

        it("should return all notes belonging to the user", async () => {
            await createNote({ title: "Note A", content: "A" });
            await createNote({ title: "Note B", content: "B" });

            const res = await request
                .execute(app)
                .get("/api/notes")
                .set("Authorization", authHeader);

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
            expect(res.body.notes).to.have.lengthOf(2);
            for (const note of res.body.notes) {
                expect(note.userId).to.equal(user.id);
            }
        });
    });

    describe("GET /api/notes/:id", () => {
        let noteId: number;

        beforeEach(async () => {
            const res = await createNote({ title: "Fetch me", content: "Content" });
            noteId = res.body.note.id;
        });

        it("should return the requested note", async () => {
            const res = await request
                .execute(app)
                .get(`/api/notes/${noteId}`)
                .set("Authorization", authHeader);

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
            expect(res.body.note).to.deep.include({
                id: noteId,
                title: "Fetch me",
                content: "Content",
            });
        });

        it("should return 404 when the note does not exist", async () => {
            const res = await request
                .execute(app)
                .get("/api/notes/999999999")
                .set("Authorization", authHeader);

            expect(res.status).to.equal(404);
            expect(res.body.success).to.be.false;
            expect(res.body.error.message).to.equal("Note not found");
        });

        it("should return 404 when accessing another user's note", async () => {
            const other = await registerTestUser("other");
            const otherNote = await request
                .execute(app)
                .post("/api/notes")
                .set("Authorization", `Bearer ${other.accessToken}`)
                .send({ title: "Private", content: "Secret", lastSeenUpdatedAt: new Date().toISOString() });

            const res = await request
                .execute(app)
                .get(`/api/notes/${otherNote.body.note.id}`)
                .set("Authorization", authHeader);

            expect(res.status).to.equal(404);
        });

        it("should return 400 for a non-numeric id", async () => {
            const res = await request
                .execute(app)
                .get("/api/notes/abc")
                .set("Authorization", authHeader);

            expect(res.status).to.equal(400);
            expect(res.body.error.message).to.equal("Validation failed");
        });

        it("should return 400 for a negative id", async () => {
            const res = await request
                .execute(app)
                .get("/api/notes/-1")
                .set("Authorization", authHeader);

            expect(res.status).to.equal(400);
        });

        it("should return 400 for a non-integer id", async () => {
            const res = await request
                .execute(app)
                .get("/api/notes/1.5")
                .set("Authorization", authHeader);

            expect(res.status).to.equal(400);
        });
    });

    describe("PUT /api/notes/:id", () => {
        let noteId: number;
        let lastSeenUpdatedAt: string;

        beforeEach(async () => {
            try {
                const res = await createNote({ title: "Original title", content: "Original content", lastSeenUpdatedAt });
                noteId = res.body.note.id;
                lastSeenUpdatedAt = res.body.note.updatedAt;
            } catch (err) {
                console.log("Failed to create note");
                throw err;
            }
        });

        it("should update both title and content", async () => {
            const res = await request
                .execute(app)
                .put(`/api/notes/${noteId}`)
                .set("Authorization", authHeader)
                .send({ title: "Updated title", content: "Updated content", lastSeenUpdatedAt: lastSeenUpdatedAt });

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
            expect(res.body.message).to.equal("Note updated");
            expect(res.body.note).to.deep.include({
                title: "Updated title",
                content: "Updated content",
            });
        });

        it("should support partial updates", async () => {
            const res = await request
                .execute(app)
                .put(`/api/notes/${noteId}`)
                .set("Authorization", authHeader)
                .send({ content: "Only content changed", lastSeenUpdatedAt});

            expect(res.status).to.equal(200);
            expect(res.body.note.content).to.equal("Only content changed");
            expect(res.body.note.title).to.equal("Original title");
        });

        it("should return 400 when the body is empty", async () => {
            const res = await request
                .execute(app)
                .put(`/api/notes/${noteId}`)
                .set("Authorization", authHeader)
                .send({});

            expect(res.status).to.equal(400);
            expect(res.body.error.message).to.equal("Validation failed");
        });

        it("should return 400 when title is empty or whitespace only", async () => {
            const res = await request
                .execute(app)
                .put(`/api/notes/${noteId}`)
                .set("Authorization", authHeader)
                .send({ title: "   ", lastSeenUpdatedAt: new Date().toISOString() });

            expect(res.status).to.equal(400);
        });

        it("should return 404 when the note does not exist", async () => {
            const res = await request
                .execute(app)
                .put("/api/notes/999999999")
                .set("Authorization", authHeader)
                .send({ title: "Anything", lastSeenUpdatedAt: new Date().toISOString() });

            expect(res.status).to.equal(404);
            expect(res.body.error.message).to.equal("Note not found");
        });

        it("should return 404 when updating another user's note", async () => {
            const other = await registerTestUser("other");
            const otherNote = await request
                .execute(app)
                .post("/api/notes")
                .set("Authorization", `Bearer ${other.accessToken}`)
                .send({ title: "Private", content: "Secret", lastSeenUpdatedAt: new Date().toISOString() });

            const res = await request
                .execute(app)
                .put(`/api/notes/${otherNote.body.note.id}`)
                .set("Authorization", authHeader)
                .send({ title: "Hacked", lastSeenUpdatedAt: new Date().toISOString() });

            expect(res.status).to.equal(404);
        });

        it("should return 400 for a non-numeric id", async () => {
            const res = await request
                .execute(app)
                .put("/api/notes/abc")
                .set("Authorization", authHeader)
                .send({ title: "Anything", lastSeenUpdatedAt: new Date().toISOString() });

            expect(res.status).to.equal(400);
        });
    });

    describe("DELETE /api/notes/:id", () => {
        let noteId: number;

        beforeEach(async () => {
            const res = await createNote({ title: "Delete me", content: "Content" });
            noteId = res.body.note.id;
        });

        it("should delete the note", async () => {
            const res = await request
                .execute(app)
                .delete(`/api/notes/${noteId}`)
                .set("Authorization", authHeader);

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
            expect(res.body.message).to.equal("Note deleted successfully");

            const after = await request
                .execute(app)
                .get(`/api/notes/${noteId}`)
                .set("Authorization", authHeader);
            expect(after.status).to.equal(404);
        });

        it("should return 404 when the note does not exist", async () => {
            const res = await request
                .execute(app)
                .delete("/api/notes/999999999")
                .set("Authorization", authHeader);

            expect(res.status).to.equal(404);
            expect(res.body.error.message).to.equal("Note not found");
        });

        it("should return 404 when deleting another user's note", async () => {
            const other = await registerTestUser("other");
            const otherNote = await request
                .execute(app)
                .post("/api/notes")
                .set("Authorization", `Bearer ${other.accessToken}`)
                .send({ title: "Private", content: "Secret" });

            const res = await request
                .execute(app)
                .delete(`/api/notes/${otherNote.body.note.id}`)
                .set("Authorization", authHeader);

            expect(res.status).to.equal(404);
        });

        it("should return 400 for a non-numeric id", async () => {
            const res = await request
                .execute(app)
                .delete("/api/notes/abc")
                .set("Authorization", authHeader);

            expect(res.status).to.equal(400);
        });
    });
});
